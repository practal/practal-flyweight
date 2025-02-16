import { Hash, nat, Order } from "things"

export enum TermKind {
    varapp = "varapp",
    absapp = "absapp",
    bound = "bound",
    template = "template"
}

export interface Terms<Id, Term> {
    
    ids : Hash<Id> & Order<Id>
    terms : Hash<Term> & Order<Term>
        
    mkId(id : string) : Id
    
    incrementId(id : Id) : Id
    
    kindOf(term : Term) : TermKind
    
    destVarApp(term : Term) : [Id, Term[]] | undefined
    
    destAbsApp(term : Term) : [Id, Term[]][] | undefined
    
    destBoundVar(term : Term) : nat | undefined
    
    destTemplate(term : Term) : [Id[], Term]

    mkVarApp(varname : Id, args : Term[]) : Term
    
    mkAbsApp(absapp : [Id, Term[]][]) : Term
    
    mkBoundVar(index : nat) : Term
    
    mkTemplate(binders : Id[], body : Term) : Term

}