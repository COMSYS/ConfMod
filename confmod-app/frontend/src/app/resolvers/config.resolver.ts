import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { inject } from "@angular/core";
import { ConfigGetOne, ConfigService } from "../openapi";


export function resolveConfig(configSlugParam: string): ResolveFn<ConfigGetOne> {
    return (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        const configApi = inject(ConfigService);
        if (!route.paramMap.has(configSlugParam)) {
            throw new Error(`[resolveConfig()]: Expected URL parameter ${configSlugParam}, but none was found.`)
        }
        const slug = route.paramMap.get(configSlugParam)!;
        return configApi.getConfigConfigSlugGet(slug);
    }
}
/*
export const resolveConfig: ResolveFn<ConfmodConfig> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const idb = inject(NgxIndexedDBService);
    const configName = route.paramMap.get('configName')!;

    return idb.getByID("configs", configName)
}
    */
