import { RedBlackSet, string } from "things";
import { assume, declare, info } from "./workbench.js";

declare("zero");
declare("zero super:");
declare("succ n");

assume("zero-intro", "zero", ["x", "y", "x"]);


info();
