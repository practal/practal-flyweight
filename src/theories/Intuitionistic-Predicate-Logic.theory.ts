import { axiom, beginTheory, declare, define, endTheory, includeTheory } from "../workbench.js";
import "./Minimal-Logic.theory.js";
import "./Equality.theory.js";

beginTheory();
includeTheory("Minimal-Logic");
includeTheory("Equality");
declare("for-all (x. A[x])");
axiom("for-all-intro", "for-all (x. A[x])", "x. A[x]");
axiom("for-all_1", "implies (for-all (x. A[x])) A[x]");
axiom("for-all_2", "implies (for-all (x. implies A B[x])) (implies A (for-all (x. B[x])))");
define("false", "for-all (x. x)");
define("not A", "implies A false");
endTheory("Intuitionistic-Predicate-Logic");

