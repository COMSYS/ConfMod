import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from "@angular/router";
import { RawConfmodModelInput } from "../openapi/model/rawConfmodModelInput";
import { ModelService } from "../openapi";
import { map } from "rxjs";

/*
export const resolveModel: ResolveFn<ConfmodModel> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const idb = inject(NgxIndexedDBService);
    const configName = route.paramMap.get('configName')!;

    return idb.getByID<ConfmodModel>("models", configName);
}
*/
export function resolveModel(slugParam: string): ResolveFn<RawConfmodModelInput> {
    return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const modelApi = inject(ModelService);
        if (!route.paramMap.has(slugParam)) {
            throw new Error(`[resolveModel()]: Expected URL parameter ${slugParam}, but none was found.`)
        }
        const slug = route.paramMap.get(slugParam)!;
        return modelApi.getModelModelSlugGet(slug).pipe(
            map(result => result.model)
        );
    }
}
