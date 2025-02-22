import { force, freeze, RedBlackMap } from "things";
import { AbsSig, AbsSigSpec, absSigSpecsOverlap, emptySignature, equalAbsSig, Signature, specOfAbsSig } from "./signature.js";
import { Terms } from "./terms.js";
import { absSigOfAbsApp, validateSequent, validateTerm } from "./validate.js";
import { removeDuplicatesInSequent, PAxiom, Proof, ProofKind, PDefinition, equalSequents } from "./proof.js";
import { isNormalHead } from "./term-utils.js";
import { displayFreeVar, freeVarsOf, listFreeVars, subtractFreeVars } from "./free-vars.js";

export type Sequent<Term> = { antecedents : Term[], succedents : Term[] }

// Obviously not safe, but will do (for now).
export type Theorem<Id, Term> = { theory : Theory<Id, Term>, proof : Proof<Id, Term>, sequent : Sequent<Term>}

export interface Theory<Id, Term> {

    terms : Terms<Id, Term>

    sig : Signature<Id>
        
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term>
    
    assume(label : Id, axiom : Sequent<Term>) : Theory<Id, Term>
    
    define(label : Id, head : Term, definiens : Term) : Theory<Id, Term>
    
    note(label : Id, thm : Theorem<Id, Term>) : Theory<Id, Term>
    
    axiom(label : Id) : Theorem<Id, Term>
    
    definition(label : Id) : Theorem<Id, Term>
    
    theorem(label : Id) : Theorem<Id, Term>
    
    hasAxiom(label : Id) : boolean 
    
    hasDefinition(label : Id) : boolean
    
    hasTheorem(label : Id) : boolean
    
    listAxioms() : Id[]
    
    listDefinitions() : Id[]
    
    listTheorems() : Id[]
    
    importTheory(thy : Theory<Id, Term>) : Theory<Id, Term> 
    
}

type Axioms<Id, Term> = RedBlackMap<Id, Sequent<Term>>
type Definition<Term> = { head : Term, definiens : Term }
type Definitions<Id, Term> = RedBlackMap<Id, Definition<Term>>

function mkEquals<Id, Term>(terms : Terms<Id, Term>, lhs : Term, rhs : Term) : Term {
    const eq = terms.mkId("equals");
    return terms.mkAbsApp([[eq, [lhs, rhs]]])
}

class Thy<Id, Term> implements Theory<Id, Term> {
    
    terms : Terms<Id, Term>
    sig : Signature<Id>
    #axioms : Axioms<Id, Term>
    #definitions : Definitions<Id, Term>
    #theorems : Axioms<Id, Term>
    
    constructor(terms : Terms<Id, Term>, sig : Signature<Id>, axioms : Axioms<Id, Term>, 
        definitions : Definitions<Id, Term>, theorems : Axioms<Id, Term>) 
    {
        this.terms = terms;
        this.sig = sig;
        this.#axioms = axioms;
        this.#definitions = definitions;
        this.#theorems = theorems;
        freeze(this);
    }
    
    listAxioms() : Id[] {
        return [...this.#axioms].map(r => r[0]);
    }

    listDefinitions() : Id[] {
        return [...this.#definitions].map(r => r[0]);
    }

    listTheorems() : Id[] {
        return [...this.#theorems].map(r => r[0]);
    }

    axiom(label : Id) : Theorem<Id, Term> {
        const s = this.#axioms.get(label);
        if (s === undefined) throw new Error("No such axiom: " + this.terms.ids.display(label));
        const proof : PAxiom<Id> = { kind : ProofKind.Axiom, label: label };
        return { theory : this, proof : proof, sequent : s };
    }
    
    definition(label : Id) : Theorem<Id, Term> {
        const d = this.#definitions.get(label);
        if (d === undefined) throw new Error("No such definition: " + this.terms.ids.display(label));
        const proof : PDefinition<Id> = { kind : ProofKind.Definition, label : label };
        const eq = mkEquals(this.terms, d.head, d.definiens);
        validateTerm(this.sig, this.terms, eq);
        const sequent : Sequent<Term> = { 
            antecedents : [], 
            succedents : [ mkEquals(this.terms, d.head, d.definiens) ]
        };
        return { theory : this, proof : proof, sequent : sequent };
    }
        
    theorem(label : Id) : Theorem<Id, Term> {
        throw new Error();
    }
    
    hasAxiom(label : Id) : boolean {
        return this.#axioms.has(label);
    }

    hasTheorem(label : Id) : boolean {
        return this.#theorems.has(label);
    }
    
    hasDefinition(label: Id): boolean {
        return this.#definitions.has(label);
    }
    
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term> {
        const newSig = this.sig.declare(absSigSpec);
        return new Thy(this.terms, newSig, this.#axioms, this.#definitions, this.#theorems);
    }
    
    assume(label : Id, sequent : Sequent<Term>) : Theory<Id, Term> {
        validateSequent(this.sig, this.terms, sequent);
        if (this.hasAxiom(label)) 
            throw new Error("There is already an axiom named '" + label + "'.");
        const newAxioms = this.#axioms.set(label, removeDuplicatesInSequent(this.terms, sequent));
        return new Thy(this.terms, this.sig, newAxioms, this.#definitions, this.#theorems);
    }
    
    define(label : Id, head : Term, definiens : Term) : Theory<Id, Term> {
        if (this.hasDefinition(label)) 
            throw new Error("There is already a definition named '" + 
                this.terms.ids.display(label) + "'.");
        if (!isNormalHead(this.terms, head)) 
            throw new Error("Left hand side of definition is not a head: '" + 
                this.terms.display(head) + "'.");
        validateTerm(this.sig, this.terms, definiens);
        const absSig = absSigOfAbsApp(this.terms, this.terms.destAbsApp(head));
        const newSig = this.sig.declare(specOfAbsSig(absSig));
        const freeVarsH = freeVarsOf(this.terms, head);
        const freeVarsD = freeVarsOf(this.terms, definiens);
        subtractFreeVars(freeVarsD, freeVarsH);
        if (freeVarsD.size > 0) {
            const dangling = listFreeVars(freeVarsD).
                map(fv => displayFreeVar(this.terms.ids, fv)).join(", ");
            throw new Error("Dangling free variables in definiens: " + dangling);
        }
        const newDefs = this.#definitions.set(label, { head: head, definiens: definiens });
        return new Thy(this.terms, newSig, this.#axioms, newDefs, this.#theorems);
    }
    
    findDefinition(absSig : AbsSig<Id>) : Id | undefined {
        for (const [id, d] of this.#definitions) {
            const absSig2 = absSigOfAbsApp(this.terms, this.terms.destAbsApp(d.head));
            if (equalAbsSig(this.terms.ids, absSig, absSig2)) return id;
        }
        return undefined;
    }
    
    #defineViaImport(label : Id, d : Definition<Term>) : Thy<Id, Term> {
        const absSig = absSigOfAbsApp(this.terms, this.terms.destAbsApp(d.head));
        const previousDefLabel = this.findDefinition(absSig);
        if (previousDefLabel !== undefined) {
            const previousD = force(this.#definitions.get(previousDefLabel));
            if (!this.terms.equal(d.head, previousD.head) || 
                !this.terms.equal(d.definiens, previousD.definiens))
                throw new Error("Cannot import theory, imported definition '" +
                    this.terms.ids.display(label) + "' clashes with definition '"+
                    this.terms.ids.display(previousDefLabel) + "'.");
        }
        const newDefs = this.#definitions.set(label, d); 
        return new Thy(this.terms, this.sig, this.#axioms, newDefs, this.#theorems);
    }
    
    checkTheory(theorem : Theorem<Id, Term>) {
        if (theorem.theory !== this) throw new Error("Theorem is not compatible with this theory.");
    }
    
    note(label : Id, thm : Theorem<Id, Term>) : Theory<Id, Term> {
        this.checkTheory(thm);
        if (this.hasTheorem(label)) 
            throw new Error("There is already a theorem named '" + 
                this.terms.ids.display(label) + "'.");
        const newTheorems = this.#theorems.set(label, thm.sequent);
        return new Thy(this.terms, this.sig, this.#axioms, this.#definitions, newTheorems);
    }
    
    #noteViaImport(label : Id, sequent : Sequent<Term>) : Thy<Id, Term> {
        if (this.hasTheorem(label)) 
            throw new Error("There is already a theorem named '" + 
                this.terms.ids.display(label) + "'.");
        const newTheorems = this.#theorems.set(label, sequent);
        return new Thy(this.terms, this.sig, this.#axioms, this.#definitions, newTheorems);
    }

    importTheory(thy : Theory<Id, Term>) : Theory<Id, Term> {
        let currentTheory : Thy<Id, Term> = this;
        for (const [_, absSigSpecs] of thy.sig.allAbsSigSpecs()) {
            for (const absSigSpec of absSigSpecs) {
                if (!currentTheory.sig.specIsDeclared(absSigSpec)) {
                    currentTheory = currentTheory.declare(absSigSpec) as Thy<Id, Term>;
                    break;
                }
            }
        }
        for (const label of thy.listAxioms()) {
            const axiom = thy.axiom(label).sequent;
            if (currentTheory.hasAxiom(label)) {
                const currentAxiom = currentTheory.axiom(label);
                if (!equalSequents(currentTheory.terms, currentAxiom.sequent, axiom)) 
                    throw new Error("Cannot import theory, imported axiom '" + 
                        this.terms.ids.display(label) + "' differs.");
            } else {
                currentTheory = currentTheory.assume(label, axiom) as Thy<Id, Term>;
            }
        }
        for (const label of thy.listTheorems()) {
            const th = thy.theorem(label).sequent;
            if (currentTheory.hasTheorem(label)) {
                const currentTh = currentTheory.theorem(label);
                if (!equalSequents(currentTheory.terms, currentTh.sequent, th)) 
                    throw new Error("Cannot import theory, imported theorem '" + 
                        this.terms.ids.display(label) + "' differs.");
            } else {
                currentTheory = currentTheory.#noteViaImport(label, th);
            }
        }
        for (const label of thy.listDefinitions()) {
            if (currentTheory.hasDefinition(label)) {
                if (!equalSequents(currentTheory.terms, 
                    currentTheory.definition(label).sequent, thy.definition(label).sequent))
                { 
                    throw new Error("Cannot import theory, imported definition '" + 
                        this.terms.ids.display(label) + "' differs.");
                }
            } else {
                const thySource = thy as Thy<Id, Term>;
                const d = force(thySource.#definitions.get(label));
                currentTheory = currentTheory.#defineViaImport(label, d);
            }
        }
        return currentTheory;
    }
        
}
freeze(Thy);

export function emptyTheory<Id, Term>(terms : Terms<Id, Term>) : Theory<Id, Term> {
    return new Thy(terms, emptySignature(terms.ids), RedBlackMap(terms.ids), 
        RedBlackMap(terms.ids),  RedBlackMap(terms.ids)); 
}