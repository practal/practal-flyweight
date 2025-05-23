import { nat, RedBlackMap } from "things";
import { addSubst, Binder, displayAbsSigSpec, emptyTheory, equalSequents, newSubst, parseDeclaration, parseTerm, Sequent, Subst, Terms, Theorem, Theory, validateTerm } from "./kernel/index.js";
import { displayTermAsTeX } from "./kernel/tex.js";

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

    parse(term : string | Term) : Term | undefined {
        if (typeof term === "string")
            return parseTerm(this.currentTheory.sig, this.currentTheory.terms, term);
        else
            return term;
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
    
    importTheory(theoryName : string, allowAxioms : boolean) {
        const theoryId = this.currentTheory.terms.mkId(theoryName);
        const thy = this.theories.get(theoryId);
        if (thy === undefined) 
            this.reportError("There is no theory '" + this.displayId(theoryId) + "' to import.");
        this.currentTheory = this.currentTheory.importTheory(thy, allowAxioms);
        const job = allowAxioms ? "Assumed" : "Imported";
        console.log(job + " theory '" + this.displayId(theoryId) + "'.");        
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
    
    define(head : string, definiens : string)
    {
        const decl = parseDeclaration(this.currentTheory.sig, this.currentTheory.terms, head);
        if (decl === undefined) this.reportError("Cannot parse head '" + head + "' of definition.");
        const label = this.currentTheory.terms.ids.display(decl[0][0]) + "_def";
        this.defineAs(label, head, definiens);
    }
    
    defineAs(label : string, head : string, definiens : string)
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
    
    lemma(label : string, thm : Theorem<Id, Term>) {
        const labelId = this.currentTheory.terms.mkId(label);
        this.currentTheory = this.currentTheory.note(labelId, thm);    
        this.printSequent("Theorem " + label + ":", thm.proof.sequent);    
    }
    
    print(term : string) {
        const t = this.parse(term);
        if (t === undefined) this.reportError("Cannot parse term: '" + term + "'.");
        validateTerm(this.currentTheory.sig, this.currentTheory.terms, t);
        console.log("| " + this.currentTheory.terms.display(t));
    }
    
    printTeX(term : string) {
        const t = this.parse(term);
        if (t === undefined) this.reportError("Cannot parse term: '" + term + "'.");
        validateTerm(this.currentTheory.sig, this.currentTheory.terms, t);
        console.log("| " + displayTermAsTeX(this.currentTheory.terms, t));
    }
    
    theorem(label : string) : Theorem<Id, Term> {
        return this.currentTheory.theorem(this.currentTheory.terms.mkId(label));
    }
    
    assume(prop : string) : Theorem<Id, Term> {
        const t = this.parse(prop);
        if (t === undefined) this.reportError("Could not parse assumption '" + prop + "'.");
        return this.currentTheory.assume(t);
    }
    
    S(...varsAndTerms : (string | Term)[]) : Subst<Id, Term> {
        if (varsAndTerms.length % 2 !== 0) 
            throw new Error("Even number of arguments required to make substitution.");
        let subst : Subst<Id, Term> = newSubst(this.currentTheory.terms.ids);
        for (let i = 0; i < varsAndTerms.length; i += 2) {
            const idStr = varsAndTerms[i];
            if (typeof idStr !== "string") throw new Error("variable must be a string");
            const id = this.currentTheory.terms.mkId(idStr);
            const termArg = varsAndTerms[i+1];
            const template = typeof termArg === "string" ? this.parse(termArg) : termArg;
            if (template === undefined) 
                throw new Error("S: cannot parse template '" + varsAndTerms[i+1] + "'.");
            const arity = this.currentTheory.terms.arityOfTemplate(template);
            //console.log("template = " + this.currentTheory.terms.display(template));
            subst = addSubst(subst, id, arity, template);
        }
        return subst;
    }
    
    subst(subst : Subst<Id, Term>, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        return this.currentTheory.subst(subst, theorem);
    }
    
    addAnte(term : string, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        const t = this.parse(term);
        if (t === undefined) throw new Error("addAnte: Cannot parse term.");
        return this.currentTheory.addAnte(t, theorem);
    }
    
    addSucc(term : string, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        const t = this.parse(term);
        if (t === undefined) throw new Error("addSucc: Cannot parse term.");
        return this.currentTheory.addSucc(t, theorem);
    }
    
    #computeBinders(template : Term, target : Term) : Binder<Id>[] {
        const terms = this.currentTheory.terms;
        const [templateBinders, templateBody] = terms.destTemplate(template);
        const [targetBinders, _] = terms.destTemplate(target);
        const binders : Binder<Id>[] = [];
        for (const x of targetBinders) {
            const i = templateBinders.findIndex(y => terms.ids.equal(x, y));
            if (i < 0) binders.push({var: x}); else binders.push({index: i});
        }
        return binders;
    }
    
    bindAnte(template : string, target : string, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        const templateT = this.parse(template);
        if (templateT === undefined) this.reportError("bindAnte: Cannot parse template.");
        const targetT = this.parse(target);
        if (targetT === undefined) this.reportError("bindAnte: Cannot parse target binders.");
        const binders = this.#computeBinders(templateT, targetT);
        return this.currentTheory.bindAnte(templateT, binders, theorem);
    }

    bindSucc(template : string, target : string, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        const templateT = this.parse(template);
        if (templateT === undefined) this.reportError("bindSucc: Cannot parse template.");
        const targetT = this.parse(target);
        if (targetT === undefined) this.reportError("bindSucc: Cannot parse target binders.");
        const binders = this.#computeBinders(templateT, targetT);
        return this.currentTheory.bindSucc(templateT, binders, theorem);
    }
    
    freeAnte(id : string, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        return this.currentTheory.freeAnte(this.currentTheory.terms.mkId(id),
            theorem);
    }

    freeSucc(id : string, theorem : Theorem<Id, Term>) : Theorem<Id, Term> {
        return this.currentTheory.freeSucc(this.currentTheory.terms.mkId(id),
            theorem);
    }
    
    cutAnte(template : string | Term, general : Theorem<Id, Term>, 
        specific : Theorem<Id, Term>) : Theorem<Id, Term>
    {
        const templateT = this.parse(template);
        if (templateT === undefined) 
            this.reportError("cutAnte: Cannot parse template.");
        return this.currentTheory.cutAnte(templateT, general, specific);
    }
    
    cutSucc(template : string | Term, general : Theorem<Id, Term>, 
        specific : Theorem<Id, Term>) : Theorem<Id, Term>
    {
        const templateT = this.parse(template);
        if (templateT === undefined) 
            this.reportError("cutSucc: Cannot parse template.");
        return this.currentTheory.cutSucc(templateT, general, specific);
    }
    
}