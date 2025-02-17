import { Data, force, nat, RedBlackMap, Thing } from "things"

export type AritySpec = { arity : nat, variadic : boolean }
export type ShapeSpec = { shape : AritySpec[], variadic? : AritySpec }
export type AbsSigSpec<Id> = [Id, ShapeSpec][]

export type Shape = nat[]
export type AbsSig<Id> = [Id, Shape][]

function aritySpecsOverlap(spec1 : AritySpec, spec2 : AritySpec) : boolean {
    if (spec1.variadic && spec2.variadic) return true;
    if (!spec1.variadic && !spec2.variadic) return spec1.arity === spec2.arity;
    if (spec1.variadic) {
        // !spec2.variadic
        return spec2.arity >= spec1.arity;
    } else { 
        // spec2.variadic
        return spec1.arity >= spec2.arity;
    }
}

function shapeSpecsOverlap(spec1 : ShapeSpec, spec2 : ShapeSpec) : boolean {
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

function displayAritySpec(spec : AritySpec) : string {
    if (spec.arity === 0) {
        if (spec.variadic) return "(... . _)"; else return "_";
    }
    let result = "(_";
    for (let i = 1; i < spec.arity; i++) {
        result += " _";
    } 
    if (spec.variadic) result += " ...";
    return result + " . _)";
}

function displayShapeSpec(shapeSpec : ShapeSpec) : string {
    let result = shapeSpec.shape.map(displayAritySpec).join(" ");
    if (shapeSpec.variadic) {
        if (result !== "") result += " ";
        result += "...";
        result += displayAritySpec(shapeSpec.variadic);
    }
    return result;
}

function displayAbsSigSpec<Id>(ids : Thing<Id>, absSigSpec : AbsSigSpec<Id>) : string {
    const [id, spec] = absSigSpec[0];
    let result = ids.display(id);
    const args = displayShapeSpec(spec);
    if (args !== "") result += " " + args;
    for (let i = 1; i < absSigSpec.length; i++) {
        const [id, spec] = absSigSpec[i];
        result += " " + ids.display(id) + ":";
        const args = displayShapeSpec(spec);
        if (args !== "") result += " " + args;
    }
    return result;
}

export interface Signature<Id> {

    declare(absSigSpec : AbsSigSpec<Id>) : Signature<Id>

    display(absSigSpec : AbsSigSpec<Id>) : string
    
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
    
    allAbsSigSpecs() : [Id, AbsSigSpec<Id>[]][] {
        return [...this.#absSigs];
    }

}

export function emptySignature<Id>(ids : Data<Id>) : Signature<Id> {
    const absSigs : AbsSigs<Id> = RedBlackMap(ids);
    return new Sig(ids, absSigs);
}