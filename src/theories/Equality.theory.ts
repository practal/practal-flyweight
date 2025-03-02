import { beginTheory, declare, axiom, endTheory } from "../workbench.js";

beginTheory();
declare("equals x y");
axiom("equals_refl", "equals x x");
axiom("equals_subst", "A[y]", ["equals x y", "A[x]"]);
endTheory("Equality");