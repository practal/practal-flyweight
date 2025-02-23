import { axiom, beginTheory, declare, define, endTheory, importTheory } from "../workbench.js";

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
importTheory("Implication");
importTheory("Equality");
declare("false");
axiom("ex-falso-quodlibet", "P", "false");
define("not", "not A", "implies A false");
define("not-equals", "not-equals x y", "not (equals x y)");
endTheory("Negation");

beginTheory();
importTheory("Implication");
importTheory("Equality");
declare("forall (x. A[x])");
axiom("Universal_1", "forall (x. A[x])", "x. A[x]");
axiom("Universal_2", "forall (x. A[x])", ["B", "forall (x. implies B A[x])"]);
define("false", "false", "forall (x. x)");
endTheory("Universal");

beginTheory();
importTheory("Universal");
axiom("Universal_Ext", "equals (forall (x. A[x])) (forall (x. B[x]))", "x. equals A[x] B[x]");
endTheory("Universal_Ext");