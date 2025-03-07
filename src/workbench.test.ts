import { assertCrashT, Test } from "things";
import { declare, axiom, endTheory, beginTheory, includeTheory, define } from "./workbench.js";

beginTheory();
declare("implies A B")
axiom("Modus-ponens", "B", ["implies A B", "A"])
axiom("Implication_1", "implies B A", "A")
axiom("Implication_2", "implies A C", ["implies A (implies B C)", "implies A B"])
endTheory("Implication");

beginTheory();
declare("equals x y");
axiom("Equality_1", "equals x x");
axiom("Equality_2", "A[y]", ["equals x y", "A[x]"]);
endTheory("Equality");

beginTheory();
includeTheory("Implication");
includeTheory("Equality");
declare("false");
axiom("ex-falso-quodlibet", "P", "false");
define("not", "not A", "implies A false");
endTheory("Negation");

beginTheory();
includeTheory("Implication");
includeTheory("Equality");
declare("Nat n");
declare("zero");
declare("succ n");
axiom("Nat-zero", "Nat zero");
axiom("Nat-succ", "Nat (succ n)");
axiom("Nat-equals-succ", "equals m n", ["Nat m", "Nat n", "equals (succ m) (succ n)"]);
axiom("Nat-equals-zero", [], ["Nat n", "equals zero (succ n)"]);
axiom("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("PeanoSC");

Test(() => {
    beginTheory();
    includeTheory("PeanoSC");
    define("u1", "u x", "succ x");
    endTheory("u1");

    beginTheory();
    includeTheory("PeanoSC");
    define("u2", "u y", "succ y");
    endTheory("u2");
    
    beginTheory();
    includeTheory("PeanoSC");
    define("u3", "u x", "succ x");
    endTheory("u3");

    assertCrashT(() => {
        beginTheory();
        includeTheory("u1");
        includeTheory("u2");
        endTheory("u12");
    });
    
    beginTheory();
    includeTheory("u1");
    includeTheory("u3");
    endTheory("u13");

});



