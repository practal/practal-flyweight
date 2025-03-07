import { assume, axiom, beginTheory, declare, define, endTheory, includeTheory, note, Thm } from "../workbench.js";
import "./Equality.theory.js";

beginTheory();
includeTheory("Equality");
declare("lam (x. M[x])");
declare("app M N");
axiom("beta", "equals (app (lam (x. M[x])) N) M[N]");

// This should actually lead to inconsistency, 
// as we are saying that each unary operator corresponds to a lambda object

//define("implies_def", "implies A B", "app (lam (x. B)) A")
//note("modus-ponens", proveModusPonens());
define("true", "equals (lam (x. x)) (lam (x. x))");
//define("false_def", "false", "equals (lam (x. T)) (lam (x. x))");
define("for-all (x. A[x])", "equals (lam (x. A[x])) (lam (x. true))")


function proveModusPonens(): Thm {
    const AB = assume("implies A B");
    const A = assume("A");
    return AB;
}

endTheory("Lambda-Calculus");