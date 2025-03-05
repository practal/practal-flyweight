import { Term } from "../kernel/default-terms.js";
import { beginTheory, declare, axiom, endTheory, conclOf, infer, print, S, subst, terms, Thm, thm } from "../workbench.js";
import { modusPonens } from "./Implication.theory.js";

beginTheory();
declare("equals x y");
axiom("equals_refl", "equals x x");
axiom("equals_subst", "A[y]", ["equals x y", "A[x]"]);
endTheory("Equality");

export function destEquals(implication : Term) : [Term, Term] {
    const absapp = terms().destAbsApp(implication);
    if (absapp.length !== 1) throw new Error("destEquals");
    const [id, args] = absapp[0];
    if (id !== "equals" || args.length !== 2) throw new Error("destEquals");
    return [args[0], args[1]];
}


export function substEquals(eq : Thm) : Thm {
    const [x, y] = destEquals(conclOf(eq));
    return infer(subst(S("x", x, "y", y), thm("equals_subst")), eq);
}