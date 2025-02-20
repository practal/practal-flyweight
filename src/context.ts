import { RedBlackMap } from "things";
import { displayAbsSigSpec, emptyTheory, parseDeclaration, parseTerm, Sequent, Terms, Theory, validateTerm } from "./kernel/index.js";

export class Context<Id, Term> {
    
    empty : Theory<Id, Term>
    currentTheory : Theory<Id, Term>
    theories : RedBlackMap<Id, Theory<Id, Term>>
    
    constructor(terms : Terms<Id, Term>, 
        theories : RedBlackMap<Id, Theory<Id, Term>> = RedBlackMap(terms.ids)) 
    {
        this.empty = emptyTheory(terms);
        this.currentTheory = this.empty;
        this.theories = theories;
    }
    
    info() {
        console.log("");
        console.log("Theory has " + this.currentTheory.sig.size + " declarations and " + 
            this.currentTheory.listAxioms().length + " axioms.");
        console.log("");
    }

    parse(term : string) : Term | undefined {
        return parseTerm(this.currentTheory.sig, this.currentTheory.terms, term)
    }

    theory() : Theory<Id, Term> {
        return this.currentTheory;
    }

    beginTheory() {
        this.currentTheory = this.empty;
    }
    
    importTheory(theoryName : string) {
        const theoryId = this.currentTheory.terms.mkId(theoryName);
        const thy = this.theories.get(theoryId);
        if (thy === undefined) 
            throw new Error("There is no theory '" + this.displayId(theoryId) + "' to import.");
        console.log("Imported theory '" + this.displayId(theoryId) + "'.");
          
    }

    displayId(id : Id) : string {
        return this.currentTheory.terms.ids.display(id);
    }

    endTheory(theoryName : string) {
        const theoryId = this.currentTheory.terms.mkId(theoryName);
        if (this.theories.has(theoryId)) 
            throw new Error("There exists already a theory '" + this.displayId(theoryId) + "'.");
        this.theories = this.theories.set(theoryId, this.currentTheory);
        console.log("Stored current theory as '" + this.displayId(theoryId) + "' (" +
            this.currentTheory.sig.size + " declarations and " + 
            this.currentTheory.listAxioms().length + " axioms)");
        console.log("");
    }

    restore(theoryName : string) {
        const theoryId = this.currentTheory.terms.mkId(theoryName);
        const thy = this.theories.get(theoryId);
        if (thy === undefined) throw new Error("There is no theory '" + this.displayId(theoryId) + "'.");
        this.currentTheory = thy;
    }

    declare(declaration : string) {
        const spec = parseDeclaration(this.currentTheory.sig, this.currentTheory.terms, declaration);
        if (spec === undefined) {
            console.log("Could not parse declaration '" + declaration + "'.");
        } else {
            this.currentTheory = this.currentTheory.declare(spec);
            console.log("Declared '" + displayAbsSigSpec(this.currentTheory.terms.ids, spec) + "'.");
        }
    }

    validate(term : string) {
        const t = this.parse(term);
        if (t === undefined) {
            console.log("Could not parse '" + term + "' for validation.");
        } else {
            validateTerm(this.currentTheory.sig, this.currentTheory.terms, t);
            console.log("Successfully validated '" + this.currentTheory.terms.display(t) + "'."); 
        }
    }

    parseItems(error : (item : string) => string, items : string | string[]) : Term[] | undefined {
        const list = (typeof items === "string") ? [items] : items;
        const termList : Term[] = [];
        for (const item of list) {
            const t = this.parse(item);
            if (t === undefined) { 
                console.log(error(item));
                return undefined;
            }
            termList.push(t);
        }
        return termList;
    }

    display(term : Term) : string {
        return this.currentTheory.terms.display(term);
    }

    printSequent(label : string, sequent : Sequent<Term>) {
        let len = 0;
        for (const ante of sequent.antecedents) {
            len = Math.max(len, this.display(ante).length);
        }
        for (const succ of sequent.succedents) {
            len = Math.max(len, this.display(succ).length);
        }
        let sep = "";
        for (let i = 0; i < len + 4; i++) sep += "-";
        console.log(label);
        for (const ante of sequent.antecedents) {
            console.log("  |  " + this.display(ante));
        }
        console.log("  |" + sep);
        for (const succ of sequent.succedents) {
            console.log("  |  " + this.display(succ));
        }
    }

    assume(label : string, 
        succedents : string | string[], antecedents : string | string[] = []) 
    {
        const tSuccedents = 
            this.parseItems(s => "Could not parse succedent '" + s + "' of axiom.", succedents);
        const tAntecedents = 
            this.parseItems(s => "Could not parse antecedent '" + s + "' of axiom.", antecedents);
        if (tSuccedents === undefined || tAntecedents === undefined) return;
        for (const succedent of tSuccedents) {
            validateTerm(this.currentTheory.sig, this.currentTheory.terms, succedent);
        }
        for (const antecedent of tAntecedents) {
            validateTerm(this.currentTheory.sig, this.currentTheory.terms, antecedent);
        }    
        const axiom = { antecedents : tAntecedents, succedents : tSuccedents };
        const labelId = this.currentTheory.terms.mkId(label);
        this.currentTheory = this.currentTheory.assume(labelId, axiom);
        this.printSequent("Axiom " + label + ":", this.currentTheory.axiom(labelId).sequent);
    }    
    
}