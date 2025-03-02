import { beginTheory, importTheory, axiom, endTheory } from "../workbench.js";
import "./Intuitionistic-Predicate-Calculus.theory.js";

beginTheory();
importTheory("Intuitionistic-Predicate-Calculus");
axiom("double-negation-elim", "implies (not (not A)) A");
endTheory("Classical-Predicate-Calculus");