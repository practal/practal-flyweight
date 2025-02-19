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

export function normalizeSequent<Id, Term>(terms : Terms<Id, Term>, sequent : Sequent<Term>) : 
    Sequent<Term>
{
    throw new Error();
}