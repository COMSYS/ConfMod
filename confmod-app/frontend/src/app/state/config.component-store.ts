import { inject, Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { tapResponse } from "@ngrx/operators";
import { ConfigGetOne, ConfigService } from "../openapi";
import { RawConfmodConfigInput } from "../openapi/model/rawConfmodConfigInput";
import { EMPTY, Observable, switchMap, tap } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";

interface LoadingConfigPageState {
    isLoading: true
}

interface AvailableConfigPageState {
    isLoading: false,
    config: {
        name: string,
        config: RawConfmodConfigInput,
    }
}

export type ConfigPageState = LoadingConfigPageState | AvailableConfigPageState;

const initialState: ConfigPageState = {
    isLoading: true,
}

@Injectable()
export class ConfigComponentStore extends ComponentStore<ConfigPageState> {
    private configApi = inject(ConfigService);

    constructor() {
        super(initialState);
    }

    readonly getConfig = this.effect(
        (slug$: Observable<string>) => slug$.pipe(
            tap(() => { this.setState({ isLoading: true })}),
            switchMap((slug) => this.configApi.getConfigConfigSlugGet(slug).pipe(
                tapResponse({
                    next: (config) => {
                        this.setState({
                            isLoading: false,
                            config: {
                                name: config.name,
                                config: config.config
                            }
                        })
                    },
                    error: (e: HttpErrorResponse) => {
                        console.error(e);
                    }
                })
            ))
        )
    );

    readonly isLoading$ = this.select(state => state.isLoading);
    readonly config$ = this.select(state => state.isLoading ? null : state.config.config)
    readonly scope$ = ((scope: string) => this.select(
        this.config$,
        (config) => {
            if (!config || !(scope in config.scopes)) {
                return null;
            }
            return config.scopes[scope]
        }
    ));

}
