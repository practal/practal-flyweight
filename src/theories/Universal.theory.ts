import { beginTheory, importTheory, declare, axiom, define, endTheory } from "../workbench.js";
import "./Equality.theory.js";
import "./Implication.theory.js";

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