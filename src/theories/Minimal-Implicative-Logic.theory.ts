import { beginTheory, declare, axiom, endTheory } from "../workbench.js";

beginTheory();
declare("implies A B")
axiom("Modus-ponens", "B", ["implies A B", "A"])
axiom("Implication_1", "implies A (implies B A)")
axiom("Implication_2", "implies (implies A (implies B C)) (implies (implies A B) (implies B C))")
endTheory("Minimal-Implicative-Logic");