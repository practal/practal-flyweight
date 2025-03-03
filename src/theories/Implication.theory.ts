import { beginTheory, declare, axiom, endTheory } from "../workbench.js";

// This logic is also called "Minimal Implicative Logic", or "Positive Implicative Logic"

beginTheory();
declare("implies A B")
axiom("modus-ponens", "B", ["implies A B", "A"])
axiom("implies_1", "implies A (implies B A)")
axiom("implies_2", "implies (implies A (implies B C)) (implies (implies A B) (implies B C))")
endTheory("Implication");