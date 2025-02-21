import { arrayEqual, HashSet } from "things"
import { Terms } from "./terms.js"
import { Sequent } from "./theory.js"

export enum ProofKind {
    Axiom = "Axiom",
    Definition = "Definition",
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

export type Proof<Id, Term> = PAxiom<Id> | PDefinition<Id>

export type PAxiom<Id> = {
    kind : ProofKind.Axiom,
    label : Id
}

export type PDefinition<Id> = {
    kind : ProofKind.Definition,
    label : Id
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