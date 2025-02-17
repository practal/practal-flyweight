import { Hash, nat, Order } from "things"

export type AritySpec = { at_least : nat, at_most? : nat }
export type ShapeSpec = { initial : AritySpec[], repeat? : AritySpec }

export interface Signature<Id> {
    
    ids : Hash<Id> & Order<Id>
    
    declare(abstraction : [Id, ShapeSpec][]) : Signature<Id>

}