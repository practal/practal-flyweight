import { seqP } from "@practal/parsing";
import { blockCloseP, blockOpenP, debugParser, firstLongestP, owsP, R, runDeterministicRXParser, textOfRXLine } from "@practal/rx";
import { templateP, OWSP, templateLongestP, TermTag } from "./parser.js";
import { emptySignature, Signature } from "./signature.js";
import { Terms } from "./terms.js";
import { defaultTerms } from "./default-terms.js";
import { parse } from "path";

const parser = templateP;
//const parser = templateP;
//const parser = templateLongestP;

function parseTerm<Id, Term>(sig : Signature<Id>, terms : Terms<Id, Term>, termCode : string) : Term | undefined {
    const parseResult = runDeterministicRXParser(termCode, seqP(blockOpenP, owsP, templateP, owsP, blockCloseP));
    if (parseResult === undefined) return undefined;
    if (parseResult.pruned.length !== 1) return undefined;
    const env = parseResult.env;
    const pruned = parseResult.pruned[0];
    
    function childrenOf(result : R) : R[] {
        if (result.children.length !== 1) 
            throw new Error("Ambiguity in '" + result.type + "' detected.");
        return result.children[0];
    }
    
    function select(result : R, tag : TermTag) : R[] {
        const children = childrenOf(result);
        const selected : R[] = [];
        for (const child of children) {
            if (child.type === tag) selected.push(child);
        }
        return selected;
    }
    
    function select1(result : R, tag : TermTag) : R {
        const children = select(result, tag);
        if (children.length !== 1) 
            throw new Error("select1 " + tag + " failed, found " + children.length + " candidates");
        return children[0];
    }
    
    function selectUniqueChild(result : R) : R {
        const children = childrenOf(result);
        if (children.length !== 1) 
            throw new Error("Unique child expected, found " + children.length + " children in '" + result.type);
        return children[0];
    }
    
    function expect(result : R, tag : TermTag) {
        if (result.type !== tag) 
            throw new Error("Eexpected tag '" + tag + "', found tag '" + result.type + "'");
    }
    
    function convertId(result : R) : Id {
        expect(result, TermTag.id);
        const name = textOfRXLine(env.document, result.start, result.end);
        return terms.mkId(name);
    }
    
    const localVariables : Id[] = [];
    function pushBinders(binders : Id[]) {
        localVariables.push(...binders.toReversed());
    }
    function popBinders(binders : Id[]) {
        for (const binder of binders) localVariables.pop();
    }
    
    function convertTemplate(result : R) : Term {
        expect(result, TermTag.template);
        const binders = select1(result, TermTag.binders);
        const ids = select(binders, TermTag.id).map(convertId);
        const term = select1(result, TermTag.term);
        pushBinders(ids);
        const body = convert(term);
        popBinders(ids);
        return terms.mkTemplate(ids, body);
    }
    
    function convertAbsApp(result : R) : Term {
        expect(result, TermTag.absapp);
        const absId = select1(result, TermTag.absid);
        const id = convertId(selectUniqueChild(absId));
        const absArgs = childrenOf(select1(result, TermTag.absargs)).map(convert);
        return terms.mkAbsApp([[id, absArgs]]);
    }
    
    function convertVarApp(result : R) : Term {
        expect(result, TermTag.varapp);
        const varid = convertId(selectUniqueChild(select1(result, TermTag.varid)));
        const args = select(result, TermTag.term).map(convertTerm);
        return terms.mkVarApp(varid, args);
    }
    
    function convertTerm(result : R) : Term {
        expect(result, TermTag.term);
        const child = selectUniqueChild(result);
        return convert(child);
    }
    
    function resolveId(id : Id) : Term {
        for (let i = 0; i < localVariables.length; i++) {
            if (terms.ids.equal(id, localVariables[localVariables.length - i - 1]))
                return terms.mkBoundVar(i);
        }
        if (sig.isDeclared([[id, []]]))
            return terms.mkAbsApp([[id, []]]);
        else
            return terms.mkVarApp(id, []);
    }
    
    function convert(result : R) : Term {
        switch (result.type) {
            case TermTag.template: return convertTemplate(result);
            case TermTag.term: return convertTerm(result);
            case TermTag.absapp: return convertAbsApp(result);
            case TermTag.varapp: return convertVarApp(result);
            case TermTag.id: return resolveId(convertId(result));
            default: throw new Error("convert not implemented: " + result.type);
        }
    }
    
    try {
        return convert(pruned);
    } catch (error) {
        env.displayResult(pruned, s => console.log(s));
        console.log(error);
        return undefined;
    }
}


const example3 = "x, y => f cool: x[x, y] y[x, y]";

const terms = defaultTerms;
const sig = emptySignature(terms.ids);

console.log("Example: ", example3);
const result = parseTerm(sig, terms, example3);

if (result === undefined) console.log("Could not parse term.");
else console.log("Result: ", terms.display(result));

/*debugParser(example3, seqP(blockOpenP, owsP, parser, owsP, blockCloseP));

const parseResult = runDeterministicRXParser(example3, seqP(blockOpenP, owsP, parser, owsP, blockCloseP));
if (parseResult === undefined) {
    console.log("oops, cannot parse template");
} else {
    console.log("parsing successful");
}*/