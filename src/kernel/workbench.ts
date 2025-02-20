import { defaultTerms, Id, Term } from "./default-terms.js";
import { parseDeclaration, parseTerm } from "./parser.js";
import { displayAbsSigSpec } from "./signature.js";
import { emptyTheory, Sequent, Theory } from "./theory.js";
import { validateTerm } from "./validate.js";

const terms = defaultTerms;
const empty = emptyTheory(terms);
var currentTheory = empty;

export function info() {
    console.log("");
    console.log("Theory has " + currentTheory.sig.size + " declarations and " + 
        currentTheory.listAxioms().length + " axioms.");
    console.log("");
}

export function parse(term : string) : Term | undefined {
    return parseTerm(currentTheory.sig, currentTheory.terms, term)
}

export function theory() : Theory<Id, Term> {
    return currentTheory;
}

export function reset(theory? : Theory<Id, Term>) {
    if (theory === undefined) {
        currentTheory = empty;
    } else {
        currentTheory = theory;
    }
}

export function declare(declaration : string) {
    const spec = parseDeclaration(currentTheory.sig, currentTheory.terms, declaration);
    if (spec === undefined) {
        console.log("Could not parse declaration '" + declaration + "'.");
    } else {
        currentTheory = currentTheory.declare(spec);
        console.log("Declared '" + displayAbsSigSpec(terms.ids, spec) + "'.");
    }
}

export function validate(term : string) {
    const t = parse(term);
    if (t === undefined) {
        console.log("Could not parse '" + term + "' for validation.");
    } else {
        validateTerm(currentTheory.sig, currentTheory.terms, t);
        console.log("Successfully validated '" + terms.display(t) + "'."); 
    }
}

function parseItems(error : (item : string) => string, items : string | string[]) : Term[] | undefined {
    const list = (typeof items === "string") ? [items] : items;
    const termList : Term[] = [];
    for (const item of list) {
        const t = parse(item);
        if (t === undefined) { 
            console.log(error(item));
            return undefined;
        }
        termList.push(t);
    }
    return termList;
}

export function display(term : Term) : string {
    return currentTheory.terms.display(term);
}

export function printSequent(label : string, sequent : Sequent<Term>) {
    let len = 0;
    for (const ante of sequent.antecedents) {
        len = Math.max(len, display(ante).length);
    }
    for (const succ of sequent.succedents) {
        len = Math.max(len, display(succ).length);
    }
    let sep = "";
    for (let i = 0; i < len + 4; i++) sep += "-";
    console.log(label);
    //console.log("  |");    
    for (const ante of sequent.antecedents) {
        console.log("  |  " + display(ante));
    }
    console.log("  |" + sep);
    for (const succ of sequent.succedents) {
        console.log("  |  " + display(succ));
    }
    //console.log("  |");    
}

export function assume(label : string, 
    succedents : string | string[], antecedents : string | string[] = []) 
{
    const tSuccedents = 
        parseItems(s => "Could not parse succedent '" + s + "' of axiom.", succedents);
    const tAntecedents = 
        parseItems(s => "Could not parse antecedent '" + s + "' of axiom.", antecedents);
    if (tSuccedents === undefined || tAntecedents === undefined) return;
    for (const succedent of tSuccedents) {
        validateTerm(currentTheory.sig, currentTheory.terms, succedent);
    }
    for (const antecedent of tAntecedents) {
        validateTerm(currentTheory.sig, currentTheory.terms, antecedent);
    }    
    const axiom = { antecedents : tAntecedents, succedents : tSuccedents };
    currentTheory = currentTheory.assume(label, axiom);
    printSequent("Axiom " + label + ":", currentTheory.axiom(label).sequent);
}

console.log("");
console.log("Practal Flyweight — Workbench");
console.log("=============================");
console.log("");