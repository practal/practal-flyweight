import { beginTheory, includeTheory, endTheory, declare, axiom, define } from "../workbench.js";
import "./Peano.theory.js";
import "./Minimal-Logic.theory.js";

beginTheory();
includeTheory("Peano");
declare("primrec n g (i u. h[i, u]) ");
axiom("primrec-zero", "equals (primrec zero g (i u. h[i, u])) g");
axiom("primrec-succ", 
    "equals (primrec (succ n) g (i u. h[i, u])) h[n, primrec n g (i u. h[i, u])]",
    "Nat n");
define("add n m", "primrec n m (i u. succ u)");
define("mul n m", "primrec n zero (i u. add u m)");
define("power n m", "primrec m one (i u. mul u n)");
define("factorial n", "primrec n one (i u. mul (succ i) u)");
includeTheory("Minimal-Logic");
define("less n m", "primrec m false (i u. or u (equals n i))");
define("leq n m", "or (less n m) (equals n m)");
endTheory("Peano-Primitive-Recursion");

beginTheory();
includeTheory("Peano-Primitive-Recursion");
declare("μ (n. P[n])");
axiom("μ", "equals (μ (n. P[n])) n", 
    ["Nat n", "P[n]", "m. implies (and (Nat m) (less m n)) (not P[m])"]);
endTheory("Peano-Recursion");
