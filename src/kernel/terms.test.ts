import { Test } from "things";
import { defaultTerms } from "./default-terms.js";
import { displayTerm } from "./display.js";
import { emptySignature } from "./signature.js";

/*Test(() => {
    const terms = defaultTerms;
    const x = terms.mkId("x");
    const y = terms.mkVarApp(terms.mkId("y"), []);
    const t = terms.mkVarApp(x, [y, y]);
    console.log(terms.display(t));
    let sig = emptySignature(terms.ids);
    sig = sig.declare([[terms.mkId("for-all"), {shape : [{arity:1, variadic:true}]}]]);
    sig = sig.declare([[terms.mkId("for-all"), {shape : [{arity:1, variadic:true}]}]]);
    console.log("--- signature begin");
    for (const [id, absSigSpecs] of sig.allAbsSigSpecs()) {
        for (const absSigSpec of absSigSpecs) {
            console.log("spec '" + sig.display(absSigSpec) + "'");
        }
    }
    console.log("--- signature end");
    //displayTerm(terms, t));
}, "terms");*/

const terms = defaultTerms;
const x = terms.mkId("x");
const y = terms.mkVarApp(terms.mkId("y"), []);
const t = terms.mkVarApp(x, [y, y]);
console.log(terms.display(t));
let sig = emptySignature(terms.ids);
sig = sig.declare([[terms.mkId("for-all"), {shape : [{arity:2, variadic:true}]}]]);
sig = sig.declare([[terms.mkId("for-all"), {shape : [{arity:1, variadic:false}]}]]);
console.log("--- signature begin");
for (const [id, absSigSpecs] of sig.allAbsSigSpecs()) {
    for (const absSigSpec of absSigSpecs) {
        console.log("spec '" + sig.display(absSigSpec) + "'");
    }
}
// declare for-all (x ... => P)
console.log("--- signature end");
