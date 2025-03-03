import { axiom, beginTheory, declare, endTheory, importTheory } from "../workbench.js";
import "./Implication.theory.js";

beginTheory();
importTheory("Implication");
declare("and A B");
declare("or A B");
axiom("or-intro_1", "implies A (or A B)");
axiom("or-intro_2", "implies B (or A B)");
axiom("or-elim", "implies (implies A C) (implies (implies B C) (implies (or A B) C))"); 
axiom("and-elim_1", "implies (and A B) A");
axiom("and-elim_2", "implies (and A B) B");
axiom("and-intro", "implies A (implies B (and A B))");
endTheory("Minimal-Logic");