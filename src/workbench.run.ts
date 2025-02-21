import { declare, assume, endTheory, beginTheory, importTheory, define } from "./workbench.js";

beginTheory();
declare("implies A B")
assume("Modus-ponens", "B", ["implies A B", "A"])
assume("Implication_1", "implies B A", "A")
assume("Implication_2", "implies A C", ["implies A (implies B C)", "implies A B"])
endTheory("Implication");

beginTheory();
declare("equals x y");
assume("Equality_1", "equals x x");
assume("Equality_2", "A[y]", ["equals x y", "A[x]"]);
endTheory("Equality");

beginTheory();
importTheory("Implication");
importTheory("Equality");
declare("false");
assume("ex-falso-quodlibet", "P", "false");
define("not", "not A", "implies A false");
endTheory("Negation");

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
assume("Nat-equals-zero", [], ["Nat n", "equals zero (succ n)"]);
assume("Nat-induct", "A[n]", ["Nat n", "A[zero]", "n. implies (Nat n) (implies A[n] A[succ n])"]);
endTheory("PeanoSC");

