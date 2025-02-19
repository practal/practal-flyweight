import { freeze, RedBlackMap } from "things";
import { AbsSigSpec, emptySignature, Signature } from "./signature.js";
import { Terms } from "./terms.js";
import { validateTerm } from "./validate.js";

export interface Theory<Id, Term> {

    terms : Terms<Id, Term>
    sig : Signature<Id>
        
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term>
    
    assume(label : Id, term : Term) : Theory<Id, Term>
    
    axiom(id : Id) : Term
    
    listAxioms() : [Id, Term][]
    
}

type Axioms<Id, Term> = RedBlackMap<Id, Term>

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
    
    listAxioms() : [Id, Term][] {
        return [...this.#axioms];
    }
    
    axiom(label : Id) : Term {
        const t = this.#axioms.get(label);
        if (t === undefined) throw new Error("No such error: " + this.terms.ids.display(label));
        return t;
    }
    
    declare(absSigSpec : AbsSigSpec<Id>) : Theory<Id, Term> {
        const newSig = this.sig.declare(absSigSpec);
        return new Thy(this.terms, newSig, this.#axioms);
    }
    
    assume(label : Id, term : Term) : Theory<Id, Term> {
        validateTerm(this.sig, this.terms, term);
        if (this.#axioms.has(label)) 
            throw new Error("There is already an axiom named '" + label + "'.");
        const newAxioms = this.#axioms.set(label, term);
        return new Thy(this.terms, this.sig, newAxioms);
    }
    
}
freeze(Thy);

export function emptyTheory<Id, Term>(terms : Terms<Id, Term>) : Theory<Id, Term> {
    return new Thy(terms, emptySignature(terms.ids), RedBlackMap(terms.ids)); 
}