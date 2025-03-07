import { assume, axiom, beginTheory, declare, define, endTheory, includeTheory, infer, note, S, subst, thm, Thm } from "../workbench.js";
import "./Equality.theory.js";
import { equalsRefl, equalsSym, substEquals } from "./Equality.theory.js";

beginTheory();
includeTheory("Equality");
declare("lam (x. M[x])");
declare("app M N");
axiom("beta", "equals (app (lam (x. M[x])) N) M[N]");

// This should actually lead to inconsistency, 
// as we are saying that each unary operator corresponds to a lambda object.
// Would be good to actually prove that here!

// Let's try to build up logic like Peter Andrews does for HOL, and see if
// we can invoke Curry's Paradox somehow.

define("true", "equals (lam (x. x)) (lam (x. x))");
define("for-all (x. A[x])", "equals (lam (x. A[x])) (lam (x. true))")
define("false", "for-all (x. x)");

note("true", proveTrue());

function proveTrue() : Thm {
    const refl = equalsRefl("lam (x. x)");
    return infer(subst(S("A", "x. x"), substEquals(equalsSym(thm("true_def")))), refl);
}

endTheory("Lambda-Calculus");