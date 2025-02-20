import { declare, assume, info, store, reset } from "./workbench.js";

reset();
declare("implies A B")
assume("Modus-ponens", "B", ["implies A B", "A"])
assume("Implication_1", "implies B A", "A")
assume("Implication_2", "implies A C", ["implies A (implies B C)", "implies A B"])
store("Implication");

reset();
declare("equals x y");
assume("Equality_1", "equals x x");
assume("Equality_2", "A[y]", ["equals x y", "A[x]"]);
store("Equality");

info();
