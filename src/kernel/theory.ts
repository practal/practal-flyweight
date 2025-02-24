import { force, freeze, RedBlackMap } from "things";
import { AbsSig, AbsSigSpec, emptySignature, equalAbsSig, Signature, specOfAbsSig } from "./signature.js";
import { Terms } from "./terms.js";
import { absSigOfAbsApp, validateSequent, validateTerm } from "./validate.js";
import { removeDuplicatesInSequent, Proof, ProofKind, equalSequents, PTheorem, PAssume, PAddAnte, PAddSucc } from "./proof.js";
import { isNormalHead } from "./term-utils.js";
import { displayFreeVar, freeVarsOf, listFreeVars, subtractFreeVars } from "./free-vars.js";
import { applyRegularSubst, Subst, validateSubst } from "./subst.js";

export type Sequent<Term> = { antecedents : Term[], succedents : Term[] }

// Obviously not safe, but will do (for now).
export type Theorem<Id, Term> = { theory : Theory<Id, Term>, proof : Proof<Id, Term> }

export interface Theory<Id, Term> {

    terms : Terms<Id, Term>

    sig : Signature<Id>
        
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term>
    
    axiom(label : Id, axiom : Sequent<Term>) : Theory<Id, Term>
    
    define(label : Id, head : Term, definiens : Term) : Theory<Id, Term>
    
    note(label : Id, thm : Theorem<Id, Term>) : Theory<Id, Term>
        
    theorem(label : Id) : Theorem<Id, Term>
    
    isAxiom(label : Id) : boolean 
    
    isDefinition(label : Id) : boolean
    
    hasTheorem(label : Id) : boolean
    
    listAxioms() : Id[]
    
    listDefinitions() : Id[]
    
    listTheorems() : Id[]
    
    importTheory(thy : Theory<Id, Term>) : Theory<Id, Term> 
    
    /**
     * Proof rules
     */
    
    assume(template : Term) : Theorem<Id, Term>
    
    subst(substitution : Subst<Id, Term>, theorem : Theorem<Id, Term>) : Theorem<Id, Term>
    
    addAnte(term : Term, theorem : Theorem<Id, Term>) : Theorem<Id, Term> 

    addSucc(term : Term, theorem : Theorem<Id, Term>) : Theorem<Id, Term>

    
}

type Axioms<Id, Term> = RedBlackMap<Id, Sequent<Term>>
type Definition<Term> = { head : Term, definiens : Term }
type Definitions<Id, Term> = RedBlackMap<Id, Definition<Term>>
type Theorems<Id, Term> = RedBlackMap<Id, Proof<Id, Term>>

function mkEquals<Id, Term>(terms : Terms<Id, Term>, lhs : Term, rhs : Term) : Term {
    const eq = terms.mkId("equals");
    return terms.mkAbsApp([[eq, [lhs, rhs]]])
}

class Thy<Id, Term> implements Theory<Id, Term> {
    
    terms : Terms<Id, Term>
    sig : Signature<Id>
    #axioms : Axioms<Id, Term>
    #definitions : Definitions<Id, Term>
    #theorems : Theorems<Id, Term>
    
    constructor(terms : Terms<Id, Term>, sig : Signature<Id>, axioms : Axioms<Id, Term>, 
        definitions : Definitions<Id, Term>, theorems : Theorems<Id, Term>) 
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

    #axiom(label : Id) : Theorem<Id, Term> {
        const s = this.#axioms.get(label);
        if (s === undefined) throw new Error("No such axiom: " + this.terms.ids.display(label));
        const proof : PTheorem<Id, Term> = { kind : ProofKind.Theorem, label: label, sequent : s };
        return { theory : this, proof : proof };
    }
    
    #definition(label : Id) : Theorem<Id, Term> {
        const d = this.#definitions.get(label);
        if (d === undefined) throw new Error("No such definition: " + this.terms.ids.display(label));
        const eq = mkEquals(this.terms, d.head, d.definiens);
        this.#validate(eq);
        const sequent : Sequent<Term> = { 
            antecedents : [], 
            succedents : [ mkEquals(this.terms, d.head, d.definiens) ]
        };
        const proof : PTheorem<Id, Term> = { kind : ProofKind.Theorem, label : label, sequent : sequent };
        return { theory : this, proof : proof };
    }
        
    theorem(label : Id) : Theorem<Id, Term> {
        let proof = this.#theorems.get(label);
        if (proof !== undefined) return { theory : this, proof: proof };
        if (this.isAxiom(label)) return this.#axiom(label);
        if (this.isDefinition(label)) return this.#definition(label);
        throw new Error("No such theorem: " + this.terms.ids.display(label));
    }
    
    isAxiom(label : Id) : boolean {
        return this.#axioms.has(label);
    }

    hasTheorem(label : Id) : boolean {
        return this.isAxiom(label) || this.isDefinition(label) || this.#theorems.has(label);
    }
    
    isDefinition(label: Id): boolean {
        return this.#definitions.has(label);
    }
    
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term> {
        const newSig = this.sig.declare(absSigSpec);
        return new Thy(this.terms, newSig, this.#axioms, this.#definitions, this.#theorems);
    }
        
    axiom(label : Id, sequent : Sequent<Term>) : Theory<Id, Term> {
        this.#validateSeq(sequent);
        if (this.hasTheorem(label)) 
            throw new Error("There is already a theorem named '" + label + "', cannot introduce axiom.");
        const newAxioms = this.#axioms.set(label, removeDuplicatesInSequent(this.terms, sequent));
        return new Thy(this.terms, this.sig, newAxioms, this.#definitions, this.#theorems);
    }
    
    define(label : Id, head : Term, definiens : Term) : Theory<Id, Term> {
        if (this.hasTheorem(label)) 
            throw new Error("There is already a theorem named '" + 
                this.terms.ids.display(label) + "', cannot introduce definition.");
        if (!isNormalHead(this.terms, head)) 
            throw new Error("Left hand side of definition is not a head: '" + 
                this.terms.display(head) + "'.");
        this.#validate(definiens);
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
    
    #declareViaImport(absSigSpec : AbsSigSpec<Id>) : Thy<Id, Term> {
        if (!this.sig.specIsDeclared(absSigSpec)) {
            return this.declare(absSigSpec) as Thy<Id, Term>;
        } else return this;
    }
    
    #axiomViaImport(label : Id, axiom : Sequent<Term>) : Thy<Id, Term> {
        if (this.hasTheorem(label)) {
            const currentAxiom = this.theorem(label);
            if (!equalSequents(this.terms, currentAxiom.proof.sequent, axiom)) 
                throw new Error("Cannot import theory, imported axiom '" + 
                    this.terms.ids.display(label) + "' differs from present theorem.");
            return this;
        } else {
            return this.axiom(label, axiom) as Thy<Id, Term>;
        }
    }
    
    #noteViaImport(label : Id, proof : Proof<Id, Term>) : Thy<Id, Term> {
        if (this.hasTheorem(label)) {
            const currentThm = this.theorem(label);
            if (!equalSequents(this.terms, currentThm.proof.sequent, proof.sequent)) 
                throw new Error("Cannot import theory, imported theorem '" + 
                    this.terms.ids.display(label) + "' differs from present theorem.");
            return this;
        } else {
            const newTheorems = this.#theorems.set(label, proof);
            return new Thy(this.terms, this.sig, this.#axioms, this.#definitions, newTheorems);
        }
    }
    
    #defineViaImport(label : Id, d : Definition<Term>, sequent : Sequent<Term>) : Thy<Id, Term> {
        if (this.hasTheorem(label)) {
            const currentThm = this.theorem(label);
            if (!equalSequents(this.terms, currentThm.proof.sequent, sequent)) 
                throw new Error("Cannot import theory, imported definition '" + 
                    this.terms.ids.display(label) + "' differs from present theorem.");
            return this;
        }
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
        const newTheorems = this.#theorems.set(label, thm.proof);
        return new Thy(this.terms, this.sig, this.#axioms, this.#definitions, newTheorems);
    }

    importTheory(_thy : Theory<Id, Term>) : Theory<Id, Term> {
        let currentTheory : Thy<Id, Term> = this;
        const thy = _thy as Thy<Id, Term>;
        for (const [_, absSigSpecs] of thy.sig.allAbsSigSpecs()) {
            for (const absSigSpec of absSigSpecs) {
                currentTheory = currentTheory.#declareViaImport(absSigSpec);
            }
        }
        for (const label of thy.listAxioms()) {
            const axiom = thy.theorem(label).proof.sequent;
            currentTheory = currentTheory.#axiomViaImport(label, axiom);
        }
        for (const label of thy.listDefinitions()) {
            const d = force(thy.#definitions.get(label));
            const sequent = thy.theorem(label).proof.sequent;
            currentTheory = currentTheory.#defineViaImport(label, d, sequent);
        }
        for (const [label, proof] of thy.#theorems) {
            currentTheory = currentTheory.#noteViaImport(label, proof);
        }
        return currentTheory;
    }
    
    #validate(term : Term) {
        validateTerm(this.sig, this.terms, term);
    }

    #validateSeq(sequent : Sequent<Term>) {
        validateSequent(this.sig, this.terms, sequent);
    }
    
    assume(term : Term) : Theorem<Id, Term> {
        this.#validate(term);
        const proof : PAssume<Term> = { 
            kind : ProofKind.Assume, 
            sequent : { antecedents : [term], succedents : [term] },
            term : term 
        };
        return { theory : this, proof : proof };
    }
    
    subst(substitution : Subst<Id, Term>, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        this.checkTheory(theorem);
        validateSubst(this.sig, this.terms, substitution);
        const sequent : Sequent<Term> = {
            antecedents: theorem.proof.sequent.antecedents.map(t => 
                applyRegularSubst(this.terms, t, substitution)),
            succedents: theorem.proof.sequent.succedents.map(t =>
                applyRegularSubst(this.terms, t, substitution))
        };
        const proof : Proof<Id, Term> = { 
            kind: ProofKind.Subst, 
            sequent : removeDuplicatesInSequent(this.terms, sequent), 
            subst: substitution, 
            proof: theorem.proof
        }
        return { theory : this, proof : proof };
    }
    
    addAnte(term : Term, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        this.checkTheory(theorem);
        this.#validate(term);
        const antecedents = [term, ...theorem.proof.sequent.antecedents];
        const succedents = theorem.proof.sequent.succedents;
        antecedents.push(term);
        const proof : PAddAnte<Id, Term> = { 
            kind : ProofKind.AddAnte,
            sequent : removeDuplicatesInSequent(this.terms, {
                antecedents: antecedents,
                succedents : succedents}),
            term : term,
            proof : theorem.proof
        };
        return { theory : this, proof : proof };
    }
    
    addSucc(term : Term, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        this.checkTheory(theorem);
        this.#validate(term);
        const antecedents = theorem.proof.sequent.antecedents;
        const succedents = [term, ...theorem.proof.sequent.succedents];
        antecedents.push(term);
        const proof : PAddSucc<Id, Term> = { 
            kind : ProofKind.AddSucc,
            sequent : removeDuplicatesInSequent(this.terms, {
                antecedents: antecedents,
                succedents : succedents}),
            term : term,
            proof : theorem.proof
        };
        return { theory : this, proof : proof };
    }
    
    
}
freeze(Thy);

export function emptyTheory<Id, Term>(terms : Terms<Id, Term>) : Theory<Id, Term> {
    return new Thy(terms, emptySignature(terms.ids), RedBlackMap(terms.ids), 
        RedBlackMap(terms.ids),  RedBlackMap(terms.ids)); 
}