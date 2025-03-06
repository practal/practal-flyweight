import { declare, axiom, endTheory, beginTheory, assumeTheory, define, assume, note, subst, S, addAnte, bindAnte, freeSucc, freeAnte, bindSucc, setTeXMode, print } from "./workbench.js";

import "./theories/Base.theory.js";
import "./theories/Peano.theory.js";

beginTheory();
setTeXMode(true);
note("test", bindAnte("u. u[u]", "v w. P", addAnte("u. u[u]", subst(S("x", "x. A[x]"), assume("x[y]")))));
note("geht-doch-Ante", freeSucc("x", bindAnte("x", "x. P", assume("x"))));
note("geht-doch-Succ", freeAnte("x", bindSucc("x", "x. P", assume("x"))));
print("x. x");
endTheory("Test");



