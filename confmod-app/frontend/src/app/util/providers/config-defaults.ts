import { createInjectionToken } from "ngxtension/create-injection-token";
import { FeatureConfig, ObservationConfig, ScopeConfig } from "../../types/config";
import { cloneDeep } from "lodash";
import { InjectionToken, Provider, inject } from "@angular/core";

export interface ConfigScopeDefaults {
    [scope: string]: ConfigDefaults;
    default: ConfigDefaults;
}

export interface ConfigDefaults {
    observation: Omit<ObservationConfig, 'features'>,
    feature: FeatureConfig,
}

const DEFAULT_SCOPE_CONFIGS = new InjectionToken<ConfigScopeDefaults>("Default configs for scope");

export const provideDefaultScopeConfigs = (cfg: ConfigScopeDefaults): Provider => ({
    provide: DEFAULT_SCOPE_CONFIGS,
    useValue: cfg
});

export const injectDefaultScopeConfigs = () => inject(DEFAULT_SCOPE_CONFIGS);
export const injectDefaultScopeConfig = (scope: string) => {
    const cfgs = injectDefaultScopeConfigs();
    if (scope in cfgs) {
        return cfgs[scope];
    } else {
        return cfgs['default']
    }
}

export const DEFAULT_CONFIG: ConfigScopeDefaults = {
    "Internal": {
        observation: {
            includePayload: true,
            includeMetadata: true,
        },
        feature: {
            includePayload: true,
            metadata: {
                dataType: true,
                valueRange: true,
            }
        }
    },
    "Direct Partners": {
        observation: {
            includeMetadata: true,
            includePayload: false,
        },
        feature: {
            includePayload: false,
            metadata: {
                dataType: true,
                valueRange: true,
            }
        }
    },
    "Supply Chain": {
        observation: {
            includeMetadata: true,
            includePayload: false,
        },
        feature: {
            includePayload: false,
            metadata: {
                dataType: true,
                valueRange: true,
            }
        }
    },
    "External": {
        observation: {
            includeMetadata: false,
            includePayload: false,
        },
        feature: {
            includePayload: false,
            metadata: {
                dataType: false,
                valueRange: false,
            }
        }
    },
    default: {
        observation: {
            includeMetadata: false,
            includePayload: false
        },
        feature: {
            includePayload: false,
            metadata: {
                dataType: false,
                valueRange: false,
            }
        }
    }
}