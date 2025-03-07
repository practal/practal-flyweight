import { beginTheory, includeTheory, declare, axiom, define, endTheory } from "../workbench.js";
import "./Implication.theory.js";
import "./Equality.theory.js";

beginTheory();
includeTheory("Implication");
includeTheory("Equality");
declare("false");
axiom("ex-falso-quodlibet", "P", "false");
define("not A", "implies A false");
define("true", "not false");
define("not-equals x y", "not (equals x y)");
endTheory("Negation");