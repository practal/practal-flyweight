import { beginTheory, lemma, bindAnte, assume, freeSucc, freeAnte, bindSucc, print, endTheory } from "../workbench.js";

beginTheory();
lemma("geht-doch-Ante", freeSucc("x", bindAnte("x", "x. P", assume("x"))));
lemma("geht-doch-Succ", freeAnte("x", bindSucc("x", "x. P", assume("x"))));
endTheory("Example-8");