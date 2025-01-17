import { InjectionToken, Provider } from "@angular/core";
import { isEqual } from "lodash";
import { NgxControlValueAccessorCompareTo, provideCvaCompareTo } from "ngxtension/control-value-accessor";
import hash from "object-hash";

export const OBJECT_EQUALITY_COMPARATOR = new InjectionToken<(a: object, b: object) => boolean>("Compare object equality by value")

export const provideHashEquality = (options?: hash.NormalOption): Provider => ({
    provide: OBJECT_EQUALITY_COMPARATOR,
    useFactory: () => {
        console.log()
        const hashObj = (obj: object) => hash(obj, options);
        return (a: object, b: object) => hashObj(a) === hashObj(b)
    }
})

export const provideCvaHashCompare = <T>(options?: hash.NormalOption): Provider =>
    provideCvaCompareTo((a?: T, b?: T) => {
        const hashA = hash(a || {});
        const hashB = hash(b || {});
        console.log(a, hashA, b, hashB);
        return hashA === hashB;
    }, true);

export const provideValueEquality = () => provideCvaCompareTo((a: any, b: any) => {
    const eq = isEqual(a, b);
    console.log("Comparing", a, b, eq);
    return eq;
}, true);