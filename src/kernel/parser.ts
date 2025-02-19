import { ExprGrammar, SHOW_CONFLICTS, altP, charP, flatListResults, literalP, lookaheadP, lrP,  mkTerminalParsers,  optP,  orP,  recursiveP,  rep1P,  repP,  rule, seqP, showLRConflicts, tagP } from "@practal/parsing";
import { anyCharP, bobP, createRXParseEnvironment, E, runDeterministicRXParser, RXDocument, startOfRXDocument } from "@practal/rx";
import { P, R, RXPos, TAG, anyBlockP, anyLineP, blockCloseP, blockOpenP, bolP, charTestP, debugP, firstLongestP, longestP, newlineP,  unicodeLetterP, wsP } from "@practal/rx";
import { isDigit } from "things";
//import { debug } from "things";

//showLRConflicts(SHOW_CONFLICTS.full);

export enum TermTag {
    id = "id",
    defaultId = "defaultId",
    absid = "absid",
    varid = "varid",
    bound = "bound",
    varapp = "varapp",
    invalid = "invalid",
    unparsed = "unparsed",
    binders = "binders",
    label = "label",
    term = "term",
    terms = "terms",
    template = "template",
    templates = "templates",
    absapp = "absapp",
    absargs = "absargs",
    plus = "plus",
    app = "app",
    block = "block",
    blocks = "blocks",
    line = "line",
    comment = "comment"
}

const identifierP : P = tagP(TermTag.id, rep1P(unicodeLetterP));
const defaultIdP : P = tagP(TermTag.defaultId, literalP("$"));

const boundP : P = tagP(TermTag.bound, seqP(literalP("↑"), rep1P(charTestP(isDigit))));

const ows = "ows";
const ws = "ws";

function grammarFor(start : "Template") : ExprGrammar {
    const g : ExprGrammar = { 
        start : "Start",
        
        rules : [
            rule("Start", start),

            rule("Term", "Expr"),

            rule("Expr", "PlusExprLevel"),

            rule("PlusExprLevel", "PreApp"),
            //rule("PlusExprLevel", "PlusExpr"),
            //rule("PlusExpr", "PlusExprLevel", ows, "plus", ws, "PreApp"),

            rule("PreApp", "AppLevel"),
            rule("PreApp", "AbsApp"),

            rule("AppLevel", "Atomic"),
            rule("AppLevel", "AppExpr"),
            rule("AppExpr", "AppLevel",  "TemplateInBrackets"),

            rule("Atomic", "id"),
            rule("Atomic", "bound"),
            rule("Atomic", "VarApp"),
            rule("Atomic", "TemplateInBrackets"),
            rule("Atomic", "blocks"),

            rule("AbsApp", "AbsId", "AbsArgs"),
            rule("AbsId", "id", ws),
            rule("AbsId", "defaultId", ws),

            rule("Arg", "AppLevel"),
            rule("Arg", "label"),
            
            rule("AbsArgsList", "Arg"),
            rule("AbsArgsList", "AbsArgsList", ws, "Arg"),

            rule("AbsArgs", "AbsArgsList"),

            rule("VarApp", "varappOpen", ows, "Terms", ows, "squareClose"),
            rule("VarApp", "varappOpen", ows, "squareClose"),

            rule("Terms", "Term"),
            rule("Terms", "Terms", ows, "comma", ws, "Term"),

            rule("TemplateOnly", "binders", ws, "Term"),

            rule("Template", "Term"),
            rule("Template", "TemplateOnly"),

            rule("TemplateInBrackets", "open", ows, "Template", ows, "close"),
            //rule("TemplatesInBrackets", "open", ows, "close"),

            //rule("Templates", "Template"),
            //rule("Templates", "Templates", ows, "comma", ows, "Template"),

        ],

        distinct : [
            [
                "id",
                "defaultId",
                "varappOpen",
                "squareClose",
                "comma",
                //"plus",
                "label",
                "binders",
                "open",
                "close",
                "bound",
                "blocks",
                ws
            ],
        ],

        empty : [[ows, ws]]

    };
    return g;
}

const template_grammar = grammarFor("Template");

const dotP : P = orP(literalP("."), literalP("=>"));

const commaP : P = literalP(",");

//const plusP : P = literalP("+");

const roundOpenP : P = literalP("(");
const roundCloseP : P = literalP(")");

const squareCloseP : P = literalP("]");
const squareOpenP : P = literalP("[");

const varappOpenP : P = seqP(tagP(TermTag.varid, identifierP), squareOpenP);

const blockP : P = anyBlockP(TermTag.block, TermTag.line);
const blocksP : P = tagP(TermTag.blocks, rep1P(blockP));

const commentP : P = tagP(TermTag.comment, seqP(literalP("//"), repP(anyCharP)));

const WSP : P = orP(rep1P(orP(wsP, commentP)), bolP(), bobP());
export const OWSP : P = optP(WSP);

const binderP : P = identifierP;
const bindersCommaSeparated : P = seqP(binderP, repP(OWSP, commaP, OWSP, binderP), OWSP, dotP);
const bindersWsSeparated : P = seqP(binderP, repP(OWSP, binderP), OWSP, dotP);
const bindersP : P = tagP(TermTag.binders, orP(bindersCommaSeparated, bindersWsSeparated));

const labelP : P = tagP(TermTag.label, seqP(identifierP, literalP(":")));

function terminalParsers()  {
    return mkTerminalParsers([
        ["binders", bindersP],
        ["label", labelP],
        ["varappOpen", varappOpenP],
        ["id", identifierP],
        ["bound", boundP],
        ["defaultId", defaultIdP],
        ["squareClose", squareCloseP],
        ["open", roundOpenP],
        ["close", roundCloseP],
        //["plus", plusP],
        ["comma", commaP],
        ["blocks", blocksP],
        ["ws", WSP],
        ["ows", OWSP], // This one must be last, as it could parse the empty string
    ]); 
}

const nonterminalTags : [string, string][] = [
    ["Term", TermTag.term],
    ["AbsApp", TermTag.absapp],
    ["AbsArgs", TermTag.absargs],
    ["AbsId", TermTag.absid],
    ["VarApp", TermTag.varapp],
    ["TemplateOnly", TermTag.template],
    ["TemplatesInBrackets", TermTag.templates],
    ["PlusExpr", TermTag.plus],
    ["AppExpr", TermTag.app]
];

const template_lr = 
    lrP(template_grammar, nonterminalTags, terminalParsers(), TermTag.invalid);

export const templateP : P = template_lr.longest_valid_prefix;
export const templateLongestP : P = template_lr.longest_prefix;

function log(s : string) {
    console.log(s);
}

if (template_lr.conflicts.size > 0) {
    log("There are " + template_lr.conflicts.size + " conflicts in template grammar.");
    for (const conflict of template_lr.conflicts) {
        log("Conflict symbol: " + conflict);
    }
} else {
    log("No grammar conflicts found.");
}

/*export function parseTemplate(doc : RXDocument | string, parser : P) : [E, R] | undefined {
    runDeterministicRXParser(doc, parser);
    const env = createRXParseEnvironment(doc);
    const results = parser(env, startOfRXDocument());
    const flatrs = [...flatListResults(env, results)];
    if (flatrs.length === 1) return [env, flatrs[0][1]];
    else return undefined;
}*/



