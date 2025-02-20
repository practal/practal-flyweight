import { RedBlackMap } from "things";
import { defaultTerms, displayAbsSigSpec, emptyTheory, Id, parseDeclaration, parseTerm, 
    Sequent, Term, Theory, validateTerm } from "./kernel/index.js";
import { Context } from "./context.js";

const terms = defaultTerms;
const empty = emptyTheory(terms);
let currentTheory = empty;

let theories : RedBlackMap<Id, Theory<Id, Term>> = RedBlackMap(terms.ids);

export const context = new Context(defaultTerms, RedBlackMap(terms.ids));

export function info() {
    context.info();
}

export function parse(term : string) : Term | undefined {
    return context.parse(term);
}

export function theory() : Theory<Id, Term> {
    return context.theory();
}

export function beginTheory() {
    context.beginTheory();
}

export function importTheory(theoryName : string) {
    context.importTheory(theoryName);
}

export function displayId(id : Id) : string {
    return context.displayId(id);
}

export function endTheory(theoryName : string) {
    context.endTheory(theoryName);
}

export function restore(theoryName : string) {
    context.restore(theoryName);
}

export function declare(declaration : string) {
    context.declare(declaration);
}

export function validate(term : string) {
    context.validate(term);
}

export function display(term : Term) : string {
    return context.display(term);
}

export function printSequent(label : string, sequent : Sequent<Term>) {
    context.printSequent(label, sequent);
}

export function assume(label : string, 
    succedents : string | string[], antecedents : string | string[] = []) 
{
    context.assume(label, succedents, antecedents);
}

console.log("");
console.log("Practal Flyweight — Workbench");
console.log("=============================");
console.log("");