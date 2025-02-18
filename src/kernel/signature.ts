import { Data, force, nat, RedBlackMap, Thing } from "things"

export type AritySpec<Id> = { name? : Id, binders : (Id | null)[], variadic? : boolean | Id }
export type ShapeSpec<Id> = { shape : AritySpec<Id>[], variadic? : AritySpec<Id> }
export type AbsSigSpec<Id> = [Id, ShapeSpec<Id>][]

export type Shape = nat[]
export type AbsSig<Id> = [Id, Shape][]

function arityOfSpec<Id>(spec : AritySpec<Id>) : nat {
    return spec.binders.length;
}

export function specOfArity<Id>(arity : nat) : AritySpec<Id> {
    const binders : null[] = [];
    for (let i = 0; i < arity; i++) binders.push(null);
    return { binders: binders };
}

export function specOfShape<Id>(shape : Shape) : ShapeSpec<Id> {
    return { shape : shape.map(specOfArity<Id>) };
}

export function specOfAbsSig<Id>(absSig : AbsSig<Id>) : AbsSigSpec<Id> {
    return absSig.map(([id, spec]) => [id, specOfShape(spec)]);
}

function isVariadic<Id>(spec : AritySpec<Id>) : boolean {
    return spec?.variadic !== undefined && spec?.variadic !== false;
}

function aritySpecsOverlap<Id>(spec1 : AritySpec<Id>, spec2 : AritySpec<Id>) : boolean {
    const variadic1 = isVariadic(spec1);
    const variadic2 = isVariadic(spec2);
    if (variadic1 && variadic1) return true;
    const arity1 = arityOfSpec(spec1);
    const arity2 = arityOfSpec(spec2);    
    if (!variadic1 && !variadic2) return arity1 === arity2;
    if (variadic1) {
        // !variadic2
        return arity2 >= arity1;
    } else { 
        // variadic2
        return arity1 >= arity2;
    }
}

function shapeSpecsOverlap<Id>(spec1 : ShapeSpec<Id>, spec2 : ShapeSpec<Id>) : boolean {
    const min = Math.min(spec1.shape.length, spec2.shape.length);
    const max = Math.max(spec1.shape.length, spec2.shape.length);
    for (let i = 0; i < min; i++) {
        if (!aritySpecsOverlap(spec1.shape[i], spec2.shape[i])) return false;
    }
    if (spec1.shape.length < spec2.shape.length) {
        if (!spec1.variadic) return false;
        const variadic = force(spec1.variadic);
        for (let i = min; i < max; i++) {
            if (!aritySpecsOverlap(spec2.shape[i], variadic)) return false;
        }
        return true;
    }
    if (spec2.shape.length < spec1.shape.length) {
        if (!spec2.variadic) return false;
        const variadic = force(spec2.variadic);
        for (let i = min; i < max; i++) {
            if (!aritySpecsOverlap(spec1.shape[i], variadic)) return false;
        }
        return true;
    }
    return true;
}

function absSigSpecsOverlap<Id>(ids : Data<Id>, abs1 : AbsSigSpec<Id>, abs2 : AbsSigSpec<Id>) : boolean {
    if (abs1.length !== abs2.length) return false;
    for (let i = 0; i < abs1.length; i++) {
        const [id1, spec1] = abs1[i];
        const [id2, spec2] = abs2[i];
        if (!ids.equal(id1, id2)) return false;
        if (!shapeSpecsOverlap(spec1, spec2)) return false;
    }
    return true;
}

// declare forall (... . _)

function displayAritySpec<Id>(ids : Thing<Id>, spec : AritySpec<Id>) : string {
    const arity = arityOfSpec(spec);
    const variadic = isVariadic(spec);
    const name = spec?.name === undefined ? "_" : ids.display(spec.name);
    const dots = ids.is(spec.variadic) ? "..." + ids.display(spec.variadic) : "...";
    if (arity === 0) {
        if (variadic) return "(" + dots + " => " + name + ")"; else return name;
    }
    function binder(i : nat) : string {
        const b = spec.binders[i];
        if (b === null) return "_"; else return ids.display(b);
    }
    let result = "(" + binder(0);
    for (let i = 1; i < arity; i++) {
        result += " " + binder(i);
    } 
    if (variadic) result += " " + dots;
    return result + " => " + name + ")";
}

function displayShapeSpec<Id>(ids : Thing<Id>, shapeSpec : ShapeSpec<Id>) : string {
    let result = shapeSpec.shape.map(spec => displayAritySpec(ids, spec)).join(" ");
    if (shapeSpec.variadic) {
        if (result !== "") result += " ";
        result += "...";
        const v = displayAritySpec(ids, shapeSpec.variadic)
        if (v !== "_") result += v;
    }
    return result;
}

function displayAbsSigSpec<Id>(ids : Thing<Id>, absSigSpec : AbsSigSpec<Id>) : string {
    const [id, spec] = absSigSpec[0];
    let result = ids.display(id);
    const args = displayShapeSpec(ids, spec);
    if (args !== "") result += " " + args;
    for (let i = 1; i < absSigSpec.length; i++) {
        const [id, spec] = absSigSpec[i];
        result += " " + ids.display(id) + ":";
        const args = displayShapeSpec(ids, spec);
        if (args !== "") result += " " + args;
    }
    return result;
}

export interface Signature<Id> {
    
    ids : Data<Id>

    declare(absSigSpec : AbsSigSpec<Id>) : Signature<Id>

    display(absSigSpec : AbsSigSpec<Id>) : string
    
    overlapsWith(absSigSpec : AbsSigSpec<Id>) : boolean
    
    isDeclared(absSig : AbsSig<Id>) : boolean

    allAbsSigSpecs() : [Id, AbsSigSpec<Id>[]][]
    
}

type AbsSigs<Id> = RedBlackMap<Id, AbsSigSpec<Id>[]>

class Sig<Id> implements Signature<Id> {
    
    #ids : Data<Id>
    #absSigs : AbsSigs<Id>
    
    constructor(ids : Data<Id>, absSigs : AbsSigs<Id>) {
        this.#ids = ids;
        this.#absSigs = absSigs;
    }
    
    get ids() : Data<Id> {
        return this.#ids;
    }
    
    display(absSigSpec : AbsSigSpec<Id>) : string {
        return displayAbsSigSpec(this.#ids, absSigSpec);
    }
    
    declare(absSigSpec : AbsSigSpec<Id>) : Sig<Id> {
        const [id, _] = absSigSpec[0];
        let specs = this.#absSigs.get(id) ?? [];
        for (const spec of specs) {
            if (absSigSpecsOverlap(this.#ids, absSigSpec, spec)) {
                const newDisplay = this.display(absSigSpec);
                const oldDisplay = this.display(spec);
                throw new Error("Cannot declare '" + newDisplay + 
                    "', overlaps with '" + oldDisplay + "'."); 
            }
        }
        const newSpecs = [...specs, absSigSpec];
        return new Sig(this.#ids, this.#absSigs.set(id, newSpecs));
    }
    
    overlapsWith(absSigSpec : AbsSigSpec<Id>) : boolean {
        const [id, _] = absSigSpec[0];
        let specs = this.#absSigs.get(id) ?? [];
        for (const spec of specs) {
            if (absSigSpecsOverlap(this.#ids, absSigSpec, spec)) return true;
        }
        return false;
    }
    
    isDeclared(absSig : AbsSig<Id>) : boolean {
        const spec = specOfAbsSig(absSig);
        return this.overlapsWith(spec);
    }
    
    allAbsSigSpecs() : [Id, AbsSigSpec<Id>[]][] {
        return [...this.#absSigs];
    }

}

export function emptySignature<Id>(ids : Data<Id>) : Signature<Id> {
    const absSigs : AbsSigs<Id> = RedBlackMap(ids);
    return new Sig(ids, absSigs);
}