import { inject, Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { tapResponse } from "@ngrx/operators";
import { AddObservaionOutput, ConfigService, ModelService, ConfmodModelAddMetadata, ConfmodModelFeatureMetadataCreate, ConfmodModelObservationCreate, RawFeatureConfig, RawFeatureSpec } from "../../openapi";
import { RawConfmodModelInput } from "../../openapi/model/rawConfmodModelInput";
import { concatMap, debounceTime, EMPTY, exhaustMap, filter, first, forkJoin, groupBy, map, mergeMap, Observable, of, switchMap, tap } from "rxjs";
import { RawConfmodConfigInput } from "../../openapi/model/rawConfmodConfigInput";
import { MenuItem } from "primeng/api";
import { AddMetadataComponent } from "../../components/metadata-config/extra-metadata/add-metadata/add-metadata.component";
import { cloneDeep, concat } from "lodash";
import { RawConfmodHeaderInput } from "../../openapi/model/rawConfmodHeaderInput";
import { RawScopeConfigInput } from "../../openapi/model/rawScopeConfigInput";
import { RawObservationConfigInput } from "../../openapi/model/rawObservationConfigInput";

export interface IActiveTab {
    type: "scope" | "compare" | "new";
    id: string;
}

interface LoadingConfigEditorState {
    isLoading: true;
}

interface LoadedConfigEditorState {
    isLoading: false;
    slug: string;
    name: string;
    selectedScope: string;
    activeTab: IActiveTab;
    config: RawConfmodConfigInput;
    model: RawConfmodModelInput;
    modelCategories: string[];
    changesSaved: boolean;
    isSaving: boolean;
}

export interface AddMetadataProps {
    /**
     * The label of the Feature where the metadata should be added
     */
    observation: string;
    feature: string;
    metadata: {
        label: string;
        description?: string;
        type: "descriptive" | "value";
        value: any;
    }
}

export interface AddFeatureMetadataProps {
    slug: string;
    observation: string;
    feature: string;
    body: ConfmodModelFeatureMetadataCreate;
}

export interface DeleteFeatureMetadataProps {
    slug: string;
    observation: string;
    feature: string;
    metadata: string;
}

export interface AddObservationProps {
    slug: string;
    body: ConfmodModelObservationCreate
}

export interface DeleteObservationProps {
    slug: string;
    label: string;
}

export interface AddModelMetadataProps {
    slug: string;
    body: ConfmodModelAddMetadata
}

export interface DeleteModelMetadataProps {
    slug: string;
    key: string;
}

interface AddObservationUpdaterProps {
    label: string;
    observationConfig: RawObservationConfigInput;
}

interface SaveConfigProps {
    slug: string;
    config: RawConfmodConfigInput;
}

interface SetScopeConfigProps {
    scopeName: string;
    scopeConfig: RawScopeConfigInput;
}

interface SaveScopeConfigProps {
    slug: string;
    scopeName: string;
    scopeConfig: RawScopeConfigInput;
}

interface UpdateSelectedModelCategoriesProps {
    slug: string;
    categories: string[]
}

export type ConfigEditorState = LoadingConfigEditorState | LoadedConfigEditorState;

@Injectable()
export class ConfigEditorComponentStore extends ComponentStore<ConfigEditorState> {
    private configApi = inject(ConfigService);
    private modelApi = inject(ModelService);

    constructor() {
        super({ isLoading: true });
    }

    readonly load = this.effect(
        (slug$: Observable<string>) => slug$.pipe(
            tap(() => { this.setState({ isLoading: true }) }),
            switchMap((slug) =>
                forkJoin({
                    config: this.loadConfig(slug),
                    model: this.loadModel(slug),
                    categories: this.loadCategories(slug)
                }).pipe(
                    tapResponse({
                        next: ({ config: configResp, model: modelResp, categories: categoriesResp }) => {
                            const scopeNames = Object.keys(configResp.config.scopes)
                            this.setState({
                                isLoading: false,
                                slug: slug,
                                name: configResp.name,
                                config: configResp.config,
                                selectedScope: scopeNames[0],
                                model: modelResp.model,
                                modelCategories: categoriesResp,
                                activeTab: {
                                    type: "scope",
                                    id: scopeNames[0]
                                },
                                changesSaved: true,
                                isSaving: false,
                            })
                        },
                        error: (err: any) => {
                            console.error("[ConfigEditorComponentStore] error during 'load' effect", err);
                        }
                    })
                )
            )
        )
    );

    readonly isLoading$ = this.select(state => state.isLoading);
    readonly config$ = this.select(state => state.isLoading ? null : state.config)
        .pipe(filter((config): config is RawConfmodConfigInput => config !== null));
    private readonly selectedScopeName$ = this.select(state => state.isLoading ? null : state.selectedScope)
        .pipe(filter((scopeName): scopeName is string => scopeName !== null));

    readonly configName$ = this.select(state => state.isLoading ? null : state.name)
        .pipe(filter((configName): configName is string => configName !== null));

    readonly selectedScope$ = this.select(
        this.config$,
        this.selectedScopeName$,
        (config, scopeName) => config.scopes[scopeName]
    );

    readonly scopeConfigs$ = this.select(
        this.config$,
        (config) => Object.entries(config.scopes).map(([key, scopeConfig]) => ({
            scopeName: key,
            scope: scopeConfig,
        }))
    );

    readonly changesSaved$ = this.select(state => state.isLoading ? null : state.changesSaved)
        .pipe(filter((changesSaved): changesSaved is boolean => changesSaved !== null));

    readonly isSaving$ = this.select(state => state.isLoading ? null : state.isSaving)
        .pipe(filter((isSaving): isSaving is boolean => isSaving !== null));


    readonly modelHeader$ = this.select(state => state.isLoading ? null : state.model)
        .pipe(filter((model): model is RawConfmodModelInput => model !== null), map((model) => model.head));

    readonly activeTabInfo$ = this.select(state => state.isLoading ? null : state.activeTab)
        .pipe(filter((activeTab): activeTab is IActiveTab => activeTab !== null))

    readonly modelCategories$ = this.select(state => state.isLoading ? null : state.modelCategories)
        .pipe(filter((modelCategories): modelCategories is string[] => modelCategories !== null))

    private readonly tabs$: Observable<MenuItem[]> = this.select(
        this.scopeConfigs$,
        (scopeConfigs) => scopeConfigs.map((scope): MenuItem => (
            {
                label: scope.scopeName,
                menuItemInfo: {
                    type: "scope",
                    id: scope.scopeName
                }
            }
        ))
            //.concat([
            //    { separator: true, },
            //    {
            //        label: 'Add scope',
            //        icon: 'pi pi-plus',
            //        menuItemInfo: {
            //            type: "new",
            //            id: "add-scope"
            //        }
            //    }
            //])
    );

    public getCurrentSlug(): string | null {
        return this.get(state => !state.isLoading ? state.slug : null)
    }

    public getCurrentConfig(): RawConfmodConfigInput | null {
        return this.get(state => !state.isLoading ? state.config : null);
    }

    public getChangesSaved(): boolean {
        return this.get(state => state.isLoading ? true : state.changesSaved);
    }

    readonly viewModel$ = this.select({
        isLoading: this.isLoading$,
        isSaving: this.isSaving$,
        changesSaved: this.changesSaved$,
        config: this.config$,
        configName: this.configName$,
        modelHeader: this.modelHeader$,
        tabs: this.tabs$,
        selectedScopeName: this.selectedScopeName$,
        selectedScope: this.selectedScope$,
        activeTabInfo: this.activeTabInfo$,
        activeTab: this.select(
            this.tabs$,
            this.activeTabInfo$,
            (tabs, selected) => tabs.find(tab => {
                const info: any = tab["menuItemInfo"];
                if (!info) {
                    return false;
                }
                return info.type === selected.type && info.id === selected.id;
            })!
        )
    });

    public setChangesSaved = this.updater((state, isSaved: boolean) => {
        return {
            ...state,
            changesSaved: isSaved,
            isSaving: false,
        };
    })

    public setModel = this.updater((state, model: RawConfmodModelInput) => {
        return {
            ...state,
            model: model
        }
    });

    public setConfig = this.updater((state, config: RawConfmodConfigInput) => {
        return {
            ...state,
            config: config,
            changesSaved: false,
        }
    });

    readonly setSaving = this.updater((state, isSaving: boolean) => {
        return {
            ...state,
            isSaving: isSaving
        };
    })

    public setScopeConfig = this.updater((state, { scopeName, scopeConfig }: SetScopeConfigProps ) => {
        if (state.isLoading) {
            return { ...state };
        }
        const config = {
            scopes: {
                ...state.config.scopes,
                [scopeName]: scopeConfig
            }
        };

        return {
            ...state,
            config,
            changesSaved: false,
        };
    })

    public readonly addObservationToConfig = this.updater((state, { label, observationConfig }: AddObservationUpdaterProps) => {
        if (state.isLoading) {
            return {...state};
        }
        const scopes = Object.entries(state.config.scopes)
            .reduce((scopes, [currentLabel, scopeCfg]) => {
                const observations = Object.assign(scopeCfg.observations, { [label]: {...observationConfig} });

                return {
                    ...scopes,
                    [currentLabel]: {
                        ...scopeCfg,
                        observations
                    }
                }
            }, {} as { [key: string]: RawScopeConfigInput });

        const config = {
            ...state.config,
            scopes: scopes
        };

        return {
            ...state,
            config: config
        };
    })

    public setActiveTab = this.updater((state, activeTab: IActiveTab) => {
        return {
            ...state,
            activeTab: activeTab
        };
    })

    public setSelectedCategories = this.updater((state, categories: string[]) => {
        return {
            ...state,
            categories: [...categories]
        };
    })


    private loadConfig(slug: string) {
        return this.configApi.getConfigConfigSlugGet(slug).pipe(
            first()
        );
    }

    private loadModel(slug: string) {
        return this.modelApi.getModelModelSlugGet(slug).pipe(
            first()
        );
    }

    private loadCategories(slug: string) {
        return this.modelApi.getModelCategoriesModelSlugCategoriesGet(slug).pipe(
            first()
        );
    }

    // Effects

    readonly addFeatureMetadata = this.effect((props$: Observable<AddFeatureMetadataProps>) => props$.pipe(
        switchMap(({ slug, observation, feature, body }) =>
            this.modelApi.addFeatureMetadataModelSlugObservationsObsLabelFeaturesFeatLabelMetadataPost(slug, observation, feature, body).pipe(
                map(response => response.model),
                tapResponse({
                    next: (result) => this.setModel(result),
                    error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during addFeatureMetadata()", err)
                })
            )
        )
    ));

    readonly deleteFeatureMetadata = this.effect((props$: Observable<DeleteFeatureMetadataProps>) => props$.pipe(
        switchMap(({ slug, observation, feature, metadata }) =>
            this.modelApi.deleteFeatureMetadataModelSlugObservationsObsLabelFeaturesFeatLabelMetadataMetaLabelDelete(slug, observation, feature, metadata).pipe(
                map(resp => resp.model),
                tapResponse({
                    next: (result) => this.setModel(result),
                    error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during removeFeatureMetadata()", err)
                })
            )
        )
    ));

    readonly addObservation = this.effect((props$: Observable<AddObservationProps>) => props$.pipe(
        switchMap(({ slug, body }) =>
            this.modelApi.addObserverationModelSlugObservationsPost(slug, body).pipe(
                tapResponse({
                    next: (result) => {
                        this.setModel(result.model_update);
                        this.addObservationToConfig({ label: result.observation_label, observationConfig: result.observation_config })
                    },
                    error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during addObservation()", err)
                })
            )
        )
    ));

    readonly deleteObservation = this.effect((props$: Observable<DeleteObservationProps>) => props$.pipe(
        switchMap(({ slug, label }) =>
            this.modelApi.deleteObservationModelSlugObservationsLabelDelete(slug, label).pipe(
                map(resp => resp.model),
                tapResponse({
                    next: (result) => this.setModel(result),
                    error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during deleteObservation()", err)
                })
            )
        )
    ));

    readonly addModelMetadata = this.effect((props$: Observable<AddModelMetadataProps>) => props$.pipe(
        switchMap(({ slug, body }) =>
            this.modelApi.addModelMetadataModelSlugMetadataPost(slug, body).pipe(
                map(resp => resp.model),
                tapResponse({
                    next: (result) => this.setModel(result),
                    error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during addModelMetadata()", err)
                })
            )
        )
    ));

    readonly deleteModelMetadata = this.effect((props$: Observable<DeleteModelMetadataProps>) => props$.pipe(
        switchMap(({ slug, key }) =>
            this.modelApi.deleteModelMetadataModelSlugMetadataMetaKeyDelete(slug, key).pipe(
                map(resp => resp.model),
                tapResponse({
                    next: (result) => this.setModel(result),
                    error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during deleteModelMetadata()", err)
                })
            )
        )
    ));

    readonly saveConfig = this.effect((slug$: Observable<string>) => {
        const result$ = slug$.pipe(
            tap(() => { this.setSaving(true) }),
            map((slug) => {
                const config = this.getCurrentConfig();
                if (config === null) {
                    return null;
                }
                return {
                    slug: slug,
                    config: config
                };
            }),
            filter((value): value is { slug: string, config: RawConfmodConfigInput } => value !== null),
            groupBy((props) => props.slug),
            mergeMap(group$ => group$.pipe(
                switchMap(({ slug, config }) => this.configApi.updateConfigConfigSlugPut(slug, { config: config }).pipe(
                    tapResponse({
                        next: () => {
                            console.log(`Saved config ${slug} on server side`, config);
                            this.setChangesSaved(true);
                        },
                        error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during deleteModelMetadata()", err)
                    })
                ))
            ))
        );
        return result$;
    });

    readonly saveScopeConfig = this.effect((props$: Observable<SaveScopeConfigProps>) => {
        const result$ = props$.pipe(
            map(({ scopeName, scopeConfig, slug }) => {
                const config = this.getCurrentConfig();
                if (!config) {
                    return null;
                }
                return {
                    slug: slug,
                    config: {
                        scopes: {
                            ...config.scopes,
                            [scopeName]: scopeConfig,
                        },
                    }
                };
            }),
            filter((result): result is { slug: string; config: RawConfmodConfigInput } => result !== null),
            tap(({ config }) => {
                console.debug("Setting config", config);
                this.setConfig({...config})
            }),
            groupBy(({ slug }) => slug),
            tap((props) => console.debug("Before debounde", props)),
            mergeMap(group$ => group$.pipe(
                debounceTime(2 * 1000),
                tap((group) => console.debug("After debounce", group.slug)),
                    switchMap(({ slug, config }) => this.configApi.updateConfigConfigSlugPut(slug, { config: config }).pipe(
                    tapResponse({
                        next: () => {
                            console.debug(`Saved config ${slug} on server side`, config);
                            this.setChangesSaved(true);
                        },
                        error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during deleteModelMetadata()", err)
                    })
                ))
            ))
        );
        return result$;
    })

    readonly updateSelectedModelCategories = this.effect((props$: Observable<UpdateSelectedModelCategoriesProps>) => {
        const result$ = props$.pipe((
            debounceTime(1000),
            switchMap(({ slug, categories }) =>
                this.modelApi.updateModelCategoriesModelSlugCategoriesPut(slug, { categories: categories }).pipe(
                    tapResponse({
                        next: (selCategs: string[]) => this.setSelectedCategories(selCategs),
                        error: (err: any) => console.error("[ConfigEditorComponentStore]: Error during updateSelectedModelCategories()", err)
                    })
                )
            )
        ));

        return result$;
    })


}
