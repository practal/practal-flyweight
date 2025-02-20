import { HashSet } from "things"
import { Terms } from "./terms.js"
import { Sequent } from "./theory.js"

export enum ProofKind {
    Axiom = "Axiom",
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

export type Proof<Id, Term> = PAxiom<Id, Term>

export type PAxiom<Id, Term> = {
    axiomLabel : Id
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