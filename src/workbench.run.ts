import { declare, axiom, endTheory, beginTheory, importTheory, define, assume, note, subst, S } from "./workbench.js";

import "./theories/Base.theory.js";
import "./theories/Peano.theory.js";

beginTheory();
note("refl", subst(S("x", "x. A[x]"), assume("x[y]")));
endTheory("Test");



