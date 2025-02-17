import { Test } from "things";
import { defaultTerms } from "./default-terms.js";
import { displayTerm } from "./display.js";

Test(() => {
    const terms = defaultTerms;
    const x = terms.mkId("x");
    const y = terms.mkVarApp(terms.mkId("y"), []);
    const t = terms.mkVarApp(x, [y, y]);
    console.log(terms.display(t));
    //displayTerm(terms, t));
}, "terms");