import { Hash, Order, Relation, addHash, assertNever, int, mkOrderAndHash, nat, string } from "things";
import {isTermKind, TermKind, Terms} from "./terms.js";

type Id = string
type Term = VarApp | AbsApp | Bound | Template

type VarApp = {
    kind : TermKind.varapp,
    name : Id,
    args : Term[] // args can never be templates
}

type AbsApp = {
    kind : TermKind.absapp,
    nameAndArgs : [Id, Term[]][] // this is never empty
} 

type Bound = {
    kind : TermKind.bound,
    index : nat
}

type Template = {
    kind : TermKind.template,
    binders : Id[], // terms are normalized so that this is never empty
    body : Term // this will never be a template
}

function checkTerm(term : any) : term is Term {
    return isTermKind(term?.kind);
}

function compareTerm(term1 : Term, term2 : Term) : Relation {
    const kind = term1.kind;
    let cmp = string.compare(kind, term2.kind);
    if (cmp !== Relation.EQUAL) return cmp;
    switch (kind) {
        case TermKind.absapp:
            term2 = term2 as AbsApp;
            cmp = int.compare(term1.nameAndArgs.length, term2.nameAndArgs.length);
            if (cmp !== Relation.EQUAL) return cmp;
            for (let i = 0; i < term1.nameAndArgs.length; i++) {
                const [name1, args1] = term1.nameAndArgs[i];
                const [name2, args2] = term2.nameAndArgs[i];
                cmp = string.compare(name1, name2);
                if (cmp !== Relation.EQUAL) return cmp;
                cmp = int.compare(args1.length, args2.length);
                if (cmp !== Relation.EQUAL) return cmp;
                for (let j = 0; j < args1.length; j++) {
                    cmp = compareTerm(args1[j], args2[j]);
                    if (cmp !== Relation.EQUAL) return cmp;
                }
            }
            return Relation.EQUAL;
        case TermKind.bound:
            term2 = term2 as Bound;
            return int.compare(term1.index, term2.index);
        case TermKind.varapp:
            term2 = term2 as VarApp;
            cmp = string.compare(term1.name, term2.name);
            if (cmp !== Relation.EQUAL) return cmp;
            cmp = int.compare(term1.args.length, term2.args.length);
            for (let i = 0; i < term1.args.length; i++) {
                cmp = compareTerm(term1.args[i], term2.args[i]);
                if (cmp !== Relation.EQUAL) return cmp;
            }
            return Relation.EQUAL;
        case TermKind.template:
            term2 = term2 as Template;
            cmp = int.compare(term1.binders.length, term2.binders.length);
            if (cmp !== Relation.EQUAL) return cmp;
            return compareTerm(term1.body, term2.body);
        default: assertNever(kind);
    }
}

const termH = string.hash("Term");
const absAppH = string.hash("AbsApp");
const varAppH = string.hash("VarApp");
const templateH = string.hash("Template");
const boundH = string.hash("Bound");

function hashTerm(term : Term) : int {
    let code : int = termH;
    function add(h : int) {
        code = addHash(code, h);
    }
    function hash(term : Term) {
        const kind = term.kind;
        switch (kind) {
            case TermKind.absapp: 
                add(absAppH);
                for (const [name, args] of term.nameAndArgs) {
                    add(string.hash(name));
                    for (const arg of args) hash(arg);
                }
                break;
            case TermKind.varapp:
                add(varAppH);
                add(string.hash(term.name));
                for (const arg of term.args) hash(arg);
                break;
            case TermKind.bound:
                add(boundH);
                add(int.hash(term.index));
                break;
            case TermKind.template:
                add(templateH);
                add(int.hash(term.binders.length));
                hash(term.body);
                break;
            default: assertNever(kind);
        }
    }
    hash(term);
    return code;
}

function displayTerm(term : Term) : string {
    const names : Id[] = [];
    function display(term : Term, needsBrackets : boolean) : string {
        const kind = term.kind;
        switch(kind) {
            case TermKind.bound: 
                if (term.index < names.length)
                    return names[term.index];
                else 
                    return "↑" + (term.index - names.length);
            case TermKind.template: {
                names.push(...term.binders.toReversed());
                let result = term.binders.join(" ") + ". " + display(term.body, false);
                if (needsBrackets) result = "(" + result + ")";
                for (const _ of term.binders) names.pop();
                return result;
            }
            case TermKind.varapp:
                if (term.args.length === 0) {
                    if (names.findIndex(id => id === term.name) >= 0) 
                        return term.name + "[]";
                    else
                        return term.name;
                } else 
                    return term.name + "[" + term.args.map(t => display(t, false)) + "]";
            case TermKind.absapp: {
                let result = "";
                let brackets = false;
                for (let i = 0; i < term.nameAndArgs.length; i++) {
                    const [name, args] = term.nameAndArgs[0];
                    if (i > 0) {
                        brackets = true;
                        result += " ";
                        result += name;
                        result += ":";
                    } else {
                        result = name;
                    }
                    for (const arg of args) {
                        brackets = true;
                        result += " ";
                        result += display(arg, true);
                    }
                }
                if (needsBrackets && brackets) return "(" + result + ")";
                else return result;
            }   
            default: assertNever(kind);
        }
    }
    return display(term, false);
}

const termT = mkOrderAndHash("Term",
    checkTerm,
    compareTerm,
    hashTerm, 
    displayTerm);
    
class DefaultTerms implements Terms<Id, Term> {
    
    ids: Hash<string> & Order<string>;
    terms: Hash<Term> & Order<Term>;
    
    constructor() {
        this.ids = string;
        this.terms = termT;
    }
    
    mkId(id: string): Id {
        return id;
    }
    
    incrementId(id: Id): Id {
        return id + "'";
    }
    
    termKindOf(term: Term): TermKind {
        return term.kind;
    }
    
    destVarApp(term: Term): [Id, Term[]] {
        if (term.kind === TermKind.varapp) {
            return [term.name, term.args];
        }
        throw new Error("Wrong term kind '" + term.kind + "' for destVarApp");
    }
    
    destAbsApp(term: Term): [Id, Term[]][] {
        if (term.kind === TermKind.absapp) {
            return term.nameAndArgs;
        } 
        throw new Error("Wrong term kind '" + term.kind + "' for destAbsApp.");
    }
    
    destBoundVar(term: Term): nat {
        if (term.kind === TermKind.bound) {
            return term.index;
        } 
        throw new Error("Wrong term kind '" + term.kind + "' for destBoundVar.");
    }
    
    destTemplate(term: Term): [Id[], Term] {
        if (term.kind === TermKind.template) {
            return [term.binders, term.body];
        } else {
            // a term is a nullary template
            return [[], term];
        }
    }
    
    mkVarApp(varname: Id, args: Term[]): Term {
        for (const arg of args) {
            if (arg.kind === TermKind.template) throw new Error("Variable cannot be applied to templates.");
        }
        return {
            kind: TermKind.varapp,
            name: varname,
            args: args
        };
    }
    
    mkAbsApp(absapp: [Id, Term[]][]): Term {
        if (absapp.length === 0) throw new Error("Abstraction application cannot be empty.");
        return {
            kind: TermKind.absapp,
            nameAndArgs: absapp
        };
    }
    
    mkBoundVar(index: nat): Term {
        return {
            kind: TermKind.bound,
            index: index
        };
    }
    
    mkTemplate(binders: string[], body: Term): Term {
        if (body.kind === TermKind.template) throw new Error("Body of template cannot be a template.");
        if (binders.length === 0) return body;
        return {
            kind: TermKind.template,
            binders: binders,
            body: body
        };
    }

}

export const defaultTerms : Terms<unknown, unknown> = new DefaultTerms();
