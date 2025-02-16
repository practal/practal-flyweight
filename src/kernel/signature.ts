import { Hash, nat, Order } from "things"

export type AritySpec = { at_least : nat, at_most? : nat }
export type ShapeSpec = { initial : AritySpec[], repeat? : AritySpec }

export interface Signature<Id, Term> {
    
    ids : Hash<Id> & Order<Id>
    terms : Hash<Term> & Order<Term>
        
    mkId(id : string) : Id
    
    destVarApp(term : Term) : [Id, Term[]] | undefined
    
    destAbsApp(term : Term) : [Id, Term[]][] | undefined
    
    destBoundVar(term : Term) : nat | undefined
    
    destTemplate(term : Term) : [Id[], Term]

    mkVarApp(varname : Id, args : Term[]) : Term
    
    mkAbsApp(absapp : [Id, Term[]][]) : Term
    
    mkBoundVar(index : nat) : Term
    
    mkTemplate(binders : Id[], body : Term) : Term
    
    declare(abstraction : [Id, ShapeSpec][]) : Signature<Id, Term>

}