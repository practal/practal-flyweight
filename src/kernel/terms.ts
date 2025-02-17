import { Hash, nat, Order } from "things"

export enum TermKind {
    varapp = "varapp",
    absapp = "absapp",
    bound = "bound",
    template = "template"
}

export function isTermKind(kind : any) : kind is TermKind {
    return kind === TermKind.absapp || kind === TermKind.varapp 
        || kind === TermKind.bound || kind === TermKind.template;
}

export interface Terms<Id, Term> {
    
    ids : Hash<Id> & Order<Id>
    
    terms : Hash<Term> & Order<Term>
        
    mkId(id : string) : Id
    
    incrementId(id : Id) : Id
    
    termKindOf(term : Term) : TermKind
    
    destVarApp(term : Term) : [Id, Term[]]
    
    destAbsApp(term : Term) : [Id, Term[]][]
    
    destBoundVar(term : Term) : nat
    
    destTemplate(term : Term) : [Id[], Term]

    mkVarApp(varname : Id, args : Term[]) : Term
    
    mkAbsApp(absapp : [Id, Term[]][]) : Term
    
    mkBoundVar(index : nat) : Term
    
    mkTemplate(binders : Id[], body : Term) : Term

}
