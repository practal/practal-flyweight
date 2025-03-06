import { beginTheory, assumeTheory, declare, axiom, define, endTheory } from "../workbench.js";
import "./Implication.theory.js";
import "./Equality.theory.js";

beginTheory();
assumeTheory("Implication");
assumeTheory("Equality");
declare("false");
axiom("ex-falso-quodlibet", "P", "false");
define("not-def", "not A", "implies A false");
define("true-def", "true", "not false");
define("not-equals-def", "not-equals x y", "not (equals x y)");
endTheory("Negation");