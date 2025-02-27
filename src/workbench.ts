import { RedBlackMap } from "things";
import { defaultTerms, Id, newSubst, Sequent, Subst, Term, Theorem, Theory } from "./kernel/index.js";
import { Context } from "./context.js";

export const context = new Context(defaultTerms, RedBlackMap(defaultTerms.ids));
export type Thm = Theorem<Id, Term>
export type S = Subst<Id, Term>

let TeXMode : boolean = false;

export function setTeXMode(on : boolean) {
    TeXMode = on;
}

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

export function assume(prop : string) : Thm 
{
    return context.assume(prop);
}

export function note(label : string, thm : Thm) 
{
    context.note(label, thm);
}

export function S(...varsAndTerms : string[]) : S {
    return context.S(...varsAndTerms);
}

export function subst(s : S, thm : Thm) : Thm {
    return context.subst(s, thm);
}

export function addAnte(term : string, thm : Thm) : Thm {
    return context.addAnte(term, thm);
}

export function addSucc(term : string, thm : Thm) : Thm {
    return context.addSucc(term, thm);
}

export function bindAnte(template : string, target : string, thm : Thm) : Thm {
    return context.bindAnte(template, target, thm);
}

export function bindSucc(template : string, target : string, thm : Thm) : Thm {
    return context.bindSucc(template, target, thm);
}

export function freeAnte(id : string, theorem : Thm) : Thm {
    return context.freeAnte(id, theorem);
}

export function freeSucc(id : string, theorem : Thm) : Thm {
    return context.freeSucc(id, theorem);
}

export function cutAnte(template : string, general : Thm, specific : Thm) : Thm {
    return context.cutAnte(template, general, specific);
}

export function cutSucc(template : string, general : Thm, specific : Thm) : Thm {
    return context.cutSucc(template, general, specific);
}

export function print(term : string) {
    if (TeXMode)
        context.printTeX(term);
    else 
        context.print(term);
}

console.log("");
console.log("Practal Flyweight — Workbench");
console.log("=============================");
console.log("");