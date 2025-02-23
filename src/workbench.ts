import { RedBlackMap } from "things";
import { defaultTerms, Id, Sequent, Term, Theory } from "./kernel/index.js";
import { Context } from "./context.js";

export const context = new Context(defaultTerms, RedBlackMap(defaultTerms.ids));

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

export function axiom(label : string, 
    succedents : string | string[], antecedents : string | string[] = []) 
{
    context.axiom(label, succedents, antecedents);
}

export function define(label : string, head : string, definiens : string) 
{
    context.define(label, head, definiens);
}

console.log("");
console.log("Practal Flyweight — Workbench");
console.log("=============================");
console.log("");