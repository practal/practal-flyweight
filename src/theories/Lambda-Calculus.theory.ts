import { axiom, beginTheory, declare, endTheory, importTheory } from "../workbench.js";
import "./Equality.theory.js";

beginTheory();
importTheory("Equality");
declare("lambda (x. M[x])");
declare("app M N");
axiom("beta", "equals (app (lambda (x. M[x])) N) M[N]");

// This should actually lead to inconsistency, 
// as we are saying that each unary operator corresponds to a lambda object

endTheory("Lambda-Calculus");