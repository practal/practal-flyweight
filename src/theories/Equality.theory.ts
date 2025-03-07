import { Term } from "../kernel/default-terms.js";
import { beginTheory, declare, axiom, endTheory, conclOf, infer, print, S, subst, terms, Thm, thm, note, assume, setTeXMode, parse } from "../workbench.js";
import { modusPonens } from "./Implication.theory.js";

beginTheory();
declare("equals x y");
axiom("equals_refl", "equals x x");
axiom("equals_subst", "A[y]", ["equals x y", "A[x]"]);
note("equals_sym", proveSym());
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

function proveSym() : Thm {
    const xy = substEquals(assume("equals x y"));
    return infer(subst(S("A", "y. equals y x"), xy), thm("equals_refl"));
}

export function equalsSym(th : Thm) : Thm {
    const [x, y] = destEquals(conclOf(th));
    return infer(subst(S("x", x, "y", y), thm("equals_sym")), th);
}

export function equalsRefl(t : string | Term) : Thm {
    const tm = parse(t);
    if (tm === undefined) throw new Error("equalsRefl: cannot parse term");
    return subst(S("x", tm), thm("equals_refl"));
}