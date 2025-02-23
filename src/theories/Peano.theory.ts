import { beginTheory, importTheory, declare, assume, endTheory } from "../workbench.js";

beginTheory();
importTheory("Implication");
importTheory("Equality");
declare("Nat n");
declare("zero");
declare("succ n");
assume("Nat-zero", "Nat zero");
assume("Nat-succ", "Nat (succ n)");
assume("Nat-equals-succ", "equals m n", ["Nat m", "Nat n", "equals (succ m) (succ n)"]);
assume("Nat-equals-zero", [], ["Nat n", "equals zero (succ n)"]);
assume("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("PeanoSC");

beginTheory();
importTheory("Implication");
importTheory("Equality");
importTheory("Negation");
declare("Nat n");
declare("zero");
declare("succ n");
assume("Nat-zero", "Nat zero");
assume("Nat-succ", "Nat (succ n)");
assume("Nat-equals-succ", "equals m n", ["Nat m", "Nat n", "equals (succ m) (succ n)"]);
assume("Nat-equals-zero", ["not-equals zero (succ n)"]);
assume("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("Peano");
