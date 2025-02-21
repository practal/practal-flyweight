import { nat } from "things";
import { TermKind, Terms } from "./terms.js";

export function destNormalVariableTemplate<Id, Term>(terms : Terms<Id, Term>, term : Term) : 
    [Id, nat] | undefined 
{
    const [binders, body] = terms.destTemplate(term);
    const termKind = terms.termKindOf(body);
    if (termKind  !== TermKind.varapp) return undefined;
    const [id, args] = terms.destVarApp(body);
    if (args.length !== binders.length) return undefined;
    for (const [i, arg] of args.entries()) {
        if (terms.termKindOf(arg) !== TermKind.bound) return undefined;
        const index = terms.destBoundVar(arg);
        if (i !== index) return undefined;
    }
    return [id, args.length];
}

export function isNormalHead<Id, Term>(terms : Terms<Id, Term>, term : Term) : boolean 
{
    if (terms.termKindOf(term) !== TermKind.absapp) return false;
    const absapp = terms.destAbsApp(term);
    const vars : [Id, nat][] = []
    for (const [_, args] of absapp) {
        for (const arg of args) {
            const v = destNormalVariableTemplate(terms, arg);
            if (v === undefined) return false;
            if (vars.findIndex(w => terms.ids.equal(v[0], w[0]) && v[1] === w[1]) >= 0) 
                return false;
            vars.push(v);
        }
    }
    return true;
}

