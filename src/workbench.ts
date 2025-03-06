import { RedBlackMap } from "things";
import { defaultTerms, Id, newSubst, Sequent, Subst, Term, Terms, Theorem, Theory } from "./kernel/index.js";
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

export function terms() : Terms<Id, Term> {
    return context.currentTheory.terms;
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

export function assumeTheory(theoryName : string) {
    context.importTheory(theoryName, true);
}

export function importTheory(theoryName : string) {
    context.importTheory(theoryName, true);
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

export function thm(label : string) : Thm {
    return context.theorem(label);
}

export function assume(prop : string) : Thm 
{
    return context.assume(prop);
}

export function note(label : string, thm : Thm) 
{
    context.note(label, thm);
}

export function S(...varsAndTerms : (string | Term)[]) : S {
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

export function cutAnte(template : string | Term, general : Thm, specific : Thm) : Thm {
    return context.cutAnte(template, general, specific);
}

export function cutSucc(template : string | Term, general : Thm, specific : Thm) : Thm {
    return context.cutSucc(template, general, specific);
}

export function infer(general : Thm, specific : Thm) : Thm {
    const c = conclOf(specific);
    for (const p of premsOf(general)) {
        const [_, body] = terms().destTemplate(p);
        if (terms().equal(body, c)) {
            return context.cutAnte(p, general, specific);
        }
    }
    throw new Error("infer: cannot find premise");
}

export function conclOf(thm : Thm) : Term {
    const succs = thm.proof.sequent.succedents;
    if (succs.length !== 1) throw new Error("conclOf: single succedent expected.");
    return succs[0];
}

export function premsOf(thm : Thm) : Term[] {
    return thm.proof.sequent.antecedents;
}

export function print(t : string | Thm) {
    if (typeof t === "string") {
        if (TeXMode)
            context.printTeX(t);
        else 
            context.print(t);
    } else {
        printSequent("Theorem", t.proof.sequent);
    }
}

console.log("");
console.log("Practal Flyweight — Workbench");
console.log("=============================");
console.log("");