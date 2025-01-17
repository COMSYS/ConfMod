import { ApplicationConfig, EnvironmentProviders, importProvidersFrom, Provider } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { routes } from './app.routes';
import { provideHashEquality } from './util/providers/object-equality';
import { DEFAULT_CONFIG, provideDefaultScopeConfigs } from './util/providers/config-defaults';
import { provideApiBaseUrl, provideApiBaseUrlInitializer } from './util/providers/base-url';
import { NgxIndexedDBModule } from 'ngx-indexed-db';
import { idbConfig } from './db.config';
import { provideStore } from '@ngrx/store';
import { BASE_PATH } from './openapi';
import { configsReducer } from './state/config-list/configs.reducer';
import { provideHttpClient } from '@angular/common/http';
import { provideEffects } from '@ngrx/effects';
import * as configListEffects from './state/config-list/config.effects';

export const appProviders: Array<Provider | EnvironmentProviders> = [
    provideHttpClient(),
    provideRouter(routes, withComponentInputBinding()),
    provideAnimationsAsync(),
    provideHashEquality(),
    provideDefaultScopeConfigs(DEFAULT_CONFIG),
    provideStore({ configs: configsReducer }),
    provideEffects(configListEffects),
];
