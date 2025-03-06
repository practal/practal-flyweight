import { beginTheory, assumeTheory, declare, axiom, endTheory, define } from "../workbench.js";
import "./Negation.theory.js";

// Peano axioms for sequent calculus
beginTheory();
assumeTheory("Implication");
assumeTheory("Equality");
declare("Nat n");
declare("zero");
declare("succ n");
define("one", "one", "succ zero");
axiom("Nat-zero", "Nat zero");
axiom("Nat-succ", "Nat (succ n)", "Nat n");
axiom("Nat-equals-succ", "equals m n", ["Nat m", "Nat n", "equals (succ m) (succ n)"]);
axiom("Nat-equals-zero", [], ["Nat n", "equals zero (succ n)"]);
axiom("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("PeanoSequentCalculus");

// Peano axioms for natural deduction
beginTheory();
assumeTheory("Implication");
assumeTheory("Equality");
assumeTheory("Negation");
declare("Nat n");
declare("zero");
declare("succ n");
define("one", "one", "succ zero");
axiom("Nat-zero", "Nat zero");
axiom("Nat-succ", "Nat (succ n)", "Nat n");
axiom("Nat-equals-succ", "equals m n", ["Nat m", "Nat n", "equals (succ m) (succ n)"]);
axiom("Nat-equals-zero", "not-equals zero (succ n)", "Nat n");
axiom("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("Peano");
