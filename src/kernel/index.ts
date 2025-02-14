import { Hash, Order } from "things"

export interface Kernel<Id, Template, DBTerm> {
    
    ids : Hash<Id> & Order<Id>
    templates : Hash<Template> & Order<Template>
    dbterms : Hash<DBTerm> & Order<DBTerm>
    
    /**
     * Converts a string into an Id. Returns undefined if `id` does not constitute a valid Id.
     */
    mkId(id : string) : Id | undefined
    
    /**
     * Returns the variable of a variable application, 
     * or undefined if this is not a variable application.
     */
    varOf(template : Template) : Id | undefined
    
    /**
     * Returns the abstraction of an abstraction application,
     * or undefined if this is not an abstraction application.
     * @param template 
     */
    absOf(template : Template) : Id | undefined
    
        
    
    
    
    
    
    
}