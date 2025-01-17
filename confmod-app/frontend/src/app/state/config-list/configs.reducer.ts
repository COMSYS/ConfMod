import { createReducer, on } from "@ngrx/store";
import { RawConfmodConfigInput } from "../../openapi/model/rawConfmodConfigInput";
import { ConfigActions } from "./configs.actions";

export interface ConfmodConfig {
    name: string,
    slug: string,
}

export const configsReducer = createReducer(
    new Array<ConfmodConfig>(),
    on(ConfigActions.retrieveConfigs, (_, { configs }) =>
        configs.map(config => ({
            name: config.name,
            slug: config.slug,
        })
    )),
    on(ConfigActions.createConfig, (configs, { name, slug }) => [...configs, { name, slug }]),
    on(ConfigActions.removeConfig, (configs, { slug }) => configs.filter(config => config.slug !== slug)),
)
