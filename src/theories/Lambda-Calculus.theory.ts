import { axiom, beginTheory, declare, endTheory, includeTheory } from "../workbench.js";
import "./Equality.theory.js";

beginTheory();
includeTheory("Equality");
declare("λ (x. M[x])");
declare("app M N");
axiom("beta", "equals (app (λ (x. M[x])) N) M[N]");

// This should actually lead to inconsistency, 
// as we are saying that each unary operator corresponds to a lambda object

endTheory("Lambda-Calculus");