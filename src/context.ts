import { nat, RedBlackMap } from "things";
import { displayAbsSigSpec, emptyTheory, equalSequents, parseDeclaration, parseTerm, Sequent, Terms, Theorem, Theory, validateTerm } from "./kernel/index.js";

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
        console.log("Begin theory.");
    }
    
    reportError(error : string) : never {
        throw new Error(error);
    }
    
    importTheory(theoryName : string) {
        const theoryId = this.currentTheory.terms.mkId(theoryName);
        const thy = this.theories.get(theoryId);
        if (thy === undefined) 
            this.reportError("There is no theory '" + this.displayId(theoryId) + "' to import.");
        this.currentTheory = this.currentTheory.importTheory(thy);
        console.log("Imported theory '" + this.displayId(theoryId) + "'.");        
    }

    displayId(id : Id) : string {
        return this.currentTheory.terms.ids.display(id);
    }

    endTheory(theoryName : string) {
        const theoryId = this.currentTheory.terms.mkId(theoryName);
        if (this.theories.has(theoryId)) 
            this.reportError("There exists already a theory '" + this.displayId(theoryId) + "'.");
        this.theories = this.theories.set(theoryId, this.currentTheory);
        function howMany(n : nat, what : string) : string {
            if (n === 1) return "1 " + what;
            else return n + " " + what + "s";
        }
        console.log("End theory as '" + this.displayId(theoryId) + "' (" +
            howMany(this.currentTheory.sig.size, "declaration") + ", " + 
            howMany(this.currentTheory.listAxioms().length, "axiom") + ", " + 
            howMany(this.currentTheory.listDefinitions().length, "definition") + ", " + 
            howMany(this.currentTheory.listTheorems().length, "theorem") + ").");
        console.log("");
    }

    restore(theoryName : string) {
        const theoryId = this.currentTheory.terms.mkId(theoryName);
        const thy = this.theories.get(theoryId);
        if (thy === undefined) 
            this.reportError("There is no theory '" + this.displayId(theoryId) + "'.");
        this.currentTheory = thy;
    }

    declare(declaration : string) {
        const spec = parseDeclaration(this.currentTheory.sig, this.currentTheory.terms, declaration);
        if (spec === undefined) {
            this.reportError("Could not parse declaration '" + declaration + "'.");
        } else {
            this.currentTheory = this.currentTheory.declare(spec);
            console.log("Declared '" + displayAbsSigSpec(this.currentTheory.terms.ids, spec) + "'.");
        }
    }

    validate(term : string) {
        const t = this.parse(term);
        if (t === undefined) {
            this.reportError("Could not parse '" + term + "' for validation.");
        } else {
            validateTerm(this.currentTheory.sig, this.currentTheory.terms, t);
            console.log("Successfully validated '" + this.currentTheory.terms.display(t) + "'."); 
        }
    }

    parseItems(error : (item : string) => string, items : string | string[]) : Term[] {
        const list = (typeof items === "string") ? [items] : items;
        const termList : Term[] = [];
        for (const item of list) {
            const t = this.parse(item);
            if (t === undefined) { 
                this.reportError(error(item));
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

    axiom(label : string, 
        succedents : string | string[], antecedents : string | string[] = []) 
    {
        const tSuccedents = 
            this.parseItems(s => "Could not parse succedent '" + s + "' of axiom.", succedents);
        const tAntecedents = 
            this.parseItems(s => "Could not parse antecedent '" + s + "' of axiom.", antecedents);
        for (const succedent of tSuccedents) {
            validateTerm(this.currentTheory.sig, this.currentTheory.terms, succedent);
        }
        for (const antecedent of tAntecedents) {
            validateTerm(this.currentTheory.sig, this.currentTheory.terms, antecedent);
        }    
        const axiom = { antecedents : tAntecedents, succedents : tSuccedents };
        const labelId = this.currentTheory.terms.mkId(label);
        this.currentTheory = this.currentTheory.axiom(labelId, axiom);
        this.printSequent("Axiom " + label + ":", this.currentTheory.theorem(labelId).proof.sequent);
    }  
    
    define(label : string, head : string, definiens : string)
    {
        const decl = parseDeclaration(this.currentTheory.sig, this.currentTheory.terms, head);
        if (decl === undefined) this.reportError("Cannot parse head '" + head + "' of definition.");
        const labelId = this.currentTheory.terms.mkId(label);
        let currentTheory = this.currentTheory.declare(decl);
        const headT = parseTerm(currentTheory.sig, currentTheory.terms, head);
        if (headT === undefined) this.reportError("Cannot parse head '" + head + "' of definition.");
        const definiensT = parseTerm(this.currentTheory.sig, this.currentTheory.terms, definiens);
        if (definiensT === undefined) this.reportError("Cannot parse definiens '" + definiens + "' of definition.");
        currentTheory = this.currentTheory.define(labelId, headT, definiensT);
        this.printSequent("Definition " + label + ":", currentTheory.theorem(labelId).proof.sequent);
        this.currentTheory = currentTheory;
    }
    
    note(label : string, thm : Theorem<Id, Term>) {
        const labelId = this.currentTheory.terms.mkId(label);
        this.currentTheory = this.currentTheory.note(labelId, thm);    
        this.printSequent("Theorem " + label + ":", thm.proof.sequent);    
    }
    
}