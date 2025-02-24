import { arrayEqual, HashSet } from "things"
import { Terms } from "./terms.js"
import { Binder, Sequent } from "./theory.js"
import { Subst } from "./subst.js"

export enum ProofKind {
    Theorem = "Theorem",
    Assume = "Assume",
    Subst = "Subst",
    AddAnte = "AddAnte",
    AddSucc = "AddSucc",
    BindAnte = "BindAnte",
    BindSucc = "BindSucc",
    FreeAnte = "FreeAnte",
    FreeSucc = "FreeSucc",
    InferAnte = "InferAnte",
    InferSucc = "InferSucc",
    CutAnte = "CutAnte",
    CutSucc = "CutSucc"
}

export type Proof<Id, Term> = 
      PTheorem<Id, Term> 
    | PAssume<Term> 
    | PSubst<Id, Term>
    | PAddAnte<Id, Term>
    | PAddSucc<Id, Term>
    | PBindAnte<Id, Term>
    | PBindSucc<Id, Term>

export type PTheorem<Id, Term> = {
    kind : ProofKind.Theorem,
    sequent : Sequent<Term>,
    label : Id
}

export type PAssume<Term> = {
    kind : ProofKind.Assume,
    sequent : Sequent<Term>,
    term : Term
}

export type PSubst<Id, Term> = {
    kind : ProofKind.Subst,
    sequent : Sequent<Term>,
    subst : Subst<Id, Term>,
    proof : Proof<Id, Term>
}

export type PAddAnte<Id, Term> = {
    kind : ProofKind.AddAnte,
    sequent : Sequent<Term>,
    term : Term,
    proof : Proof<Id, Term>
}

export type PAddSucc<Id, Term> = {
    kind : ProofKind.AddSucc,
    sequent : Sequent<Term>,
    term : Term,
    proof : Proof<Id, Term>
}

export type PBindAnte<Id, Term> = {
    kind : ProofKind.BindAnte,
    sequent : Sequent<Term>,
    term : Term,
    binders : Binder<Id>[],
    proof : Proof<Id, Term>
}

export type PBindSucc<Id, Term> = {
    kind : ProofKind.BindSucc,
    sequent : Sequent<Term>,
    term : Term,
    binders : Binder<Id>[],
    proof : Proof<Id, Term>
}

export function sequentOfProof<Id, Term>(proof : Proof<Id, Term>) : Sequent<Term> {
    return proof.sequent;
}

export function removeDuplicatesInTermList<Id, Term>(terms : Terms<Id, Term>, termlist : Term[]) : Term[] {
    const collected = new HashSet(terms);
    const result : Term[] = [];
    for (const t of termlist) {
        if (collected.insert(t) === undefined) result.push(t);
    }
    return result;
}

export function removeDuplicatesInSequent<Id, Term>(terms : Terms<Id, Term>, sequent : Sequent<Term>) : 
    Sequent<Term>
{
    return { 
        antecedents : removeDuplicatesInTermList(terms, sequent.antecedents),
        succedents : removeDuplicatesInTermList(terms, sequent.succedents)
    }
}

export function equalSequents<Id, Term>(terms : Terms<Id, Term>,
    seq1 : Sequent<Term>, seq2 : Sequent<Term>) : boolean 
{
    return arrayEqual(terms, seq1.antecedents, seq2.antecedents) &&
        arrayEqual(terms, seq1.succedents, seq2.succedents); 
}