import { axiom, beginTheory, declare, define, endTheory, includeTheory } from "../workbench.js";
import "./Intuitionistic-Predicate-Logic.theory.js";

beginTheory();
includeTheory("Intuitionistic-Predicate-Logic");
declare("Lam f");
declare("lam (x. M[x])");
declare("app M N");

define("Lam (x. M[x])", "for-all (x. implies (Lam x) (Lam M[x]))");

axiom("Lam-wf-lam", "Lam (lam (x. M[x]))", "Lam (x. M[x])");
axiom("Lam-wf-app", "Lam (app M N)", ["Lam M", "Lam N"]);
axiom("Lam-beta", "equals (app (lam (x. M[x])) N) M[N]", ["Lam (x. M[x])", "Lam N"]);
axiom("Lam-ext", "equals f g", ["Lam f", "Lam g", "x. implies (Lam x) (equals (app f x) (app g x))"])

endTheory("Lambda-Calculus");