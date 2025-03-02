import { beginTheory, note, bindAnte, assume, freeSucc, freeAnte, bindSucc, print, endTheory } from "../workbench.js";

beginTheory();
note("geht-doch-Ante", freeSucc("x", bindAnte("x", "x. P", assume("x"))));
note("geht-doch-Succ", freeAnte("x", bindSucc("x", "x. P", assume("x"))));
endTheory("Example-8");