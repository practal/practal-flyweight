import { beginTheory, importTheory, declare, axiom, define, endTheory, note, Thm, thm, S, subst, conclOf, terms, infer, print } from "../workbench.js";
import "./Equality.theory.js";
import { substEquals } from "./Equality.theory.js";
import "./Implication.theory.js";
import { modusPonens } from "./Implication.theory.js";
import "./Negation.theory.js";

beginTheory();
importTheory("Implication");
importTheory("Equality");
declare("for-all (x. A[x])");
axiom("for-all_intro", "for-all (x. A[x])", "x. A[x]");
axiom("for-all_elim", "implies (for-all (x. A[x])) A[x]");
axiom("for-all_distr", "implies (for-all (x. implies A B[x])) (implies A (for-all (x. B[x])))");
define("false-def", "false", "for-all (x. x)");
note("ex-falso-quodlibet", proveExFalsoQuodLibet());
importTheory("Negation");
endTheory("Universal");

beginTheory();
importTheory("Universal");
axiom("for-all_ext", "equals (for-all (x. A[x])) (for-all (x. B[x]))", "x. equals A[x] B[x]");
endTheory("Universal_Ext");

function proveExFalsoQuodLibet() : Thm {
    const elim = subst(S("A", "x. x", "x", "P"), thm("for-all_elim"));
    return modusPonens(elim, subst(S("A", "x. x"), substEquals(thm("false-def"))));
}