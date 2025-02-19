import { defaultTerms, Id, Term } from "./default-terms.js";
import { parseDeclaration, parseTerm } from "./parser.js";
import { displayAbsSigSpec } from "./signature.js";
import { emptyTheory, Theory } from "./theory.js";
import { validateTerm } from "./validate.js";

const terms = defaultTerms;
const empty = emptyTheory(terms);
let currentTheory = empty;

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
    const t = parseTerm(currentTheory.sig, currentTheory.terms, term);
    if (t === undefined) {
        console.log("Could not parse '" + term + "' for validation.");
    } else {
        validateTerm(currentTheory.sig, currentTheory.terms, t);
        console.log("Successfully validated '" + terms.display(t) + "'."); 
    }
}

export function assume(label : string, axiom : string) {
    const t = parseTerm(currentTheory.sig, currentTheory.terms, axiom);
    if (t === undefined) {
        console.log("Could not parse axiom '" + axiom + "'.");
    } else {
        throw new Error();
        //terms.mkId(label)
        //validateTerm(currentTheory.sig, currentTheory.terms, t);
        //console.log("Axiom '" + terms.display(t) + "'."); 
    }
}

console.log("");
console.log("Practal Flyweight — Workbench");
console.log("=============================");
console.log("");