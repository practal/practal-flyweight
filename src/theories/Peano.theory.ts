import { beginTheory, importTheory, declare, axiom, endTheory } from "../workbench.js";

beginTheory();
importTheory("Implication");
importTheory("Equality");
declare("Nat n");
declare("zero");
declare("succ n");
axiom("Nat-zero", "Nat zero");
axiom("Nat-succ", "Nat (succ n)");
axiom("Nat-equals-succ", "equals m n", ["Nat m", "Nat n", "equals (succ m) (succ n)"]);
axiom("Nat-equals-zero", [], ["Nat n", "equals zero (succ n)"]);
axiom("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("PeanoSC");

beginTheory();
importTheory("Implication");
importTheory("Equality");
importTheory("Negation");
declare("Nat n");
declare("zero");
declare("succ n");
axiom("Nat-zero", "Nat zero");
axiom("Nat-succ", "Nat (succ n)");
axiom("Nat-equals-succ", "equals m n", ["Nat m", "Nat n", "equals (succ m) (succ n)"]);
axiom("Nat-equals-zero", ["not-equals zero (succ n)"]);
axiom("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("Peano");
