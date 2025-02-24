import { assertNever, nat } from "things";
import { AbsSig, displayAbsSigSpec, Shape, Signature, specOfAbsSig } from "./signature.js";
import { TermKind, Terms } from "./terms.js";
import { Sequent } from "./theory.js";

export function absSigOfAbsApp<Id, Term>(terms : Terms<Id, Term>, absapp : [Id, Term[]][]) : AbsSig<Id>{
    const absSig : AbsSig<Id> = [];
    for (const [id, args] of absapp) {
        const shape : Shape = args.map(t => terms.arityOfTemplate(t));
        absSig.push([id, shape]);
    }
    return absSig;
}

export function validateTerm<Id, Term>(sig : Signature<Id>, terms : Terms<Id, Term>, 
    term : Term, level : nat = 0) 
{
    
    function validate(level : nat, term : Term) {
        const kind = terms.termKindOf(term);
        switch (kind) {
            case TermKind.bound: {
                const index = terms.destBoundVar(term);
                if (index >= level) 
                    throw new Error("Dangling de Bruijn index ↑" + index + 
                        " at level " + level + ".");
                break;
            }
            case TermKind.varapp: {
                const [_, args] = terms.destVarApp(term);
                for (const arg of args) {
                    if (terms.arityOfTemplate(arg) !== 0) {
                        throw new Error("Arity of variable argument is not zero but " + 
                            terms.arityOfTemplate(arg));
                    }
                    validate(level, arg);
                }
                break;
            }
            case TermKind.template: {
                const [binders, body] = terms.destTemplate(term);
                if (terms.arityOfTemplate(body) !== 0) {
                    throw new Error("Arity of template body is not zero but " + 
                        terms.arityOfTemplate(body));
                }
                validate(level + binders.length, body);
                break;
            }
            case TermKind.absapp: {
                const absapp = terms.destAbsApp(term);
                const absSig = absSigOfAbsApp(terms, absapp);
                if (!sig.isDeclared(absSig)) {
                    throw new Error("No declaration for: " + 
                        displayAbsSigSpec(sig.ids, specOfAbsSig(absSig)));
                }
                for (const [_, args] of absapp) {
                    for (const arg of args) validate(level, arg);
                }
                break;
            }
            default: assertNever(kind);
        }
        
    }
    
    validate(level, term);
}

export function validateSequent<Id, Term>(sig : Signature<Id>, terms : Terms<Id, Term>, 
    sequent : Sequent<Term>)
{
    for (const t of sequent.antecedents) validateTerm(sig, terms, t);
    for (const t of sequent.succedents) validateTerm(sig, terms, t);
} 
