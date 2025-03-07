import { beginTheory, includeTheory, axiom, endTheory } from "../workbench.js";
import "./Intuitionistic-Predicate-Logic.theory.js";

beginTheory();
includeTheory("Intuitionistic-Predicate-Logic");
axiom("double-negation-elim", "implies (not (not A)) A");
endTheory("Classical-Predicate-Logic");