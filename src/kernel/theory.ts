import { freeze, RedBlackMap } from "things";
import { AbsSigSpec, emptySignature, Signature } from "./signature.js";
import { Terms } from "./terms.js";
import { validateSequent, validateTerm } from "./validate.js";
import { normalizeSequent, PAxiom, Proof } from "./proof.js";

export type Sequent<Term> = { antecedents : Term[], succedents : Term[] }

// Obviously not safe, but will do (for now).
export type Theorem<Id, Term> = { theory : Theory<Id, Term>, proof : Proof<Id, Term>, sequent : Sequent<Term>}

export interface Theory<Id, Term> {

    terms : Terms<Id, Term>

    sig : Signature<Id>
        
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term>
    
    assume(label : Id, axiom : Sequent<Term>) : Theory<Id, Term>
    
    axiom(id : Id) : Theorem<Id, Term>
    
    listAxioms() : Id[]
    
}

type Axioms<Id, Term> = RedBlackMap<Id, Sequent<Term>>

class Thy<Id, Term> implements Theory<Id, Term> {
    
    terms : Terms<Id, Term>
    sig : Signature<Id>
    #axioms : Axioms<Id, Term>
    
    constructor(terms : Terms<Id, Term>, sig : Signature<Id>, axioms : Axioms<Id, Term>) {
        this.terms = terms;
        this.sig = sig;
        this.#axioms = axioms;
        freeze(this);
    }
    
    listAxioms() : Id[] {
        return [...this.#axioms].map(r => r[0]);
    }
    
    axiom(label : Id) : Theorem<Id, Term> {
        const s = this.#axioms.get(label);
        if (s === undefined) throw new Error("No such error: " + this.terms.ids.display(label));
        const proof : PAxiom<Id, Term> = { axiomLabel: label };
        return { theory : this, proof : proof, sequent : s };
    }
    
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term> {
        const newSig = this.sig.declare(absSigSpec);
        return new Thy(this.terms, newSig, this.#axioms);
    }
    
    assume(label : Id, sequent : Sequent<Term>) : Theory<Id, Term> {
        validateSequent(this.sig, this.terms, sequent);
        if (this.#axioms.has(label)) 
            throw new Error("There is already an axiom named '" + label + "'.");
        const newAxioms = this.#axioms.set(label, normalizeSequent(this.terms, sequent));
        return new Thy(this.terms, this.sig, newAxioms);
    }
    
}
freeze(Thy);

export function emptyTheory<Id, Term>(terms : Terms<Id, Term>) : Theory<Id, Term> {
    return new Thy(terms, emptySignature(terms.ids), RedBlackMap(terms.ids)); 
}