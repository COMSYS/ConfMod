import { createActionGroup, props } from "@ngrx/store";
import { ConfigGetAll } from "../../openapi";

export interface CreateConfigProps {
    name: string,
    slug: string,
}

export const ConfigActions = createActionGroup({
    source: "Configs",
    events: {
        "Retrieve Configs": props<{ configs: Array<ConfigGetAll> }>(),
        "Create Config": props<CreateConfigProps>(),
        "Remove Config": props<{ slug: string }>(),
    }
})