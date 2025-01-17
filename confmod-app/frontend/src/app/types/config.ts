import { ModelHeader, ObservationSpecs } from "./model-header";

export interface ConfmodConfig {
    slug: any;
    name: string;
    author?: string;
    scopes: ScopeConfig[];
}

export interface ScopeConfig {
    scope: string;
    metadata: string[];
    observations: ObservationConfigMap;
}

export interface ExtraMetadata {
    key: string;
    value: string;
}

export interface ObservationConfigMap {
    [label: string]: ObservationConfig;
}

export interface ObservationConfig {
    includePayload: boolean;
    includeMetadata: boolean;
    features: FeatureConfigMap;
}

export interface FeatureConfigMap {
    [label: string]: FeatureConfig;
}

export interface FeatureConfig {
    includePayload: boolean;
    metadata: FeatureMetadataConfig
}

export interface FeatureMetadataConfig {
    dataType: boolean;
    valueRange?: boolean;
}

/* export const defaultConfig = (name: string, model: ModelHeader): ConfmodConfig => ({
    name,
    author: "Maximilian Sudmann",
    slug: name,
    scopes: [
        defaultScopeCfg('Internal', model),
        defaultScopeCfg('Direct Partners', model),
        defaultScopeCfg('Supply Chain', model),
        defaultScopeCfg('External', model),
    ]
});


export const defaultScopeCfg = (scopeName: string, model: ModelHeader): ScopeConfig => ({
    scope: scopeName,
    metadata: [],
    observations: generateDefaultObservationConfig(model.observations),
}) */

/* export const generateDefaultObservationConfig = (observationSpec: ObservationSpecs): ObservationConfigMap =>
    Object.entries(observationSpec).reduce((cfg, [label, spec]) => (
        {
            ...cfg,
            [label]: {
                includePayload: false,
                includeMetadata: false,
                features: spec.features.reduce((featCfg, featSpec) => (
                    {
                        ...featCfg,
                        [featSpec.label]: {
                            includePayload: false,
                            metadata: {
                                dataType: false,
                                valueRange: featSpec.valueRange ? false : undefined
                            }
                        }
                    }
                ), {})
            }
        }
    ), {}); */

/* export function configFromRaw(name: string, raw: RawConfmodConfigInput): ConfmodConfig {
    return {
        name,
        scopes: Object.entries(raw.scopes).map(([name, scope]): ScopeConfig => ({
            scope: name,
            metadata: [...scope.metadata || []],
            observations: Object.assign({}, scope.observations) as any
        }))
    }
} */
