import { beginTheory, assumeTheory, axiom, endTheory } from "../workbench.js";
import "./Intuitionistic-Predicate-Logic.theory.js";

beginTheory();
assumeTheory("Intuitionistic-Predicate-Logic");
axiom("double-negation-elim", "implies (not (not A)) A");
endTheory("Classical-Predicate-Logic");