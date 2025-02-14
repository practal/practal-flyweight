import { configureDebugging, runTests } from "things";
import "./kernel/test.js";

configureDebugging(console.log);
runTests();

