import { beginTheory, importTheory, endTheory, declare, axiom, define } from "../workbench.js";
import "./Peano.theory.js";
import "./Minimal-Logic.theory.js";

beginTheory();
importTheory("Peano");
declare("primrec n g (i u. h[i, u]) ");
axiom("primrec-zero", "equals (primrec zero g (i u. h[i, u])) g");
axiom("primrec-succ", 
    "equals (primrec (succ n) g (i u. h[i, u])) h[n, primrec n g (i u. h[i, u])]",
    "Nat n");
define("add-def", "add n m", "primrec n m (i u. succ u)");
define("mul-def", "mul n m", "primrec n zero (i u. add u m)");
define("power-def", "power n m", "primrec m one (i u. mul u n)");
define("factorial-def", "factorial n", "primrec n one (i u. mul (succ i) u)");
importTheory("Minimal-Logic");
define("less-def", "less n m", "primrec m false (i u. or u (equals n i))");
define("leq-def", "leq n m", "or (less n m) (equals n m)");
endTheory("Peano-Primitive-Recursion");

beginTheory();
importTheory("Peano-Primitive-Recursion");
declare("μ (n. P[n])");
axiom("μ", "equals (μ (n. P[n])) n", 
    ["Nat n", "P[n]", "m. implies (and (Nat m) (less m n)) (not P[m])"]);
endTheory("Peano-Recursion");
