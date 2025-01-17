import { bootstrapApplication } from '@angular/platform-browser';
import { appProviders } from './app/app.config';
import { AppComponent } from './app/app.component';
import { load as loadYaml } from "js-yaml";
import { merge } from 'lodash';
import { AppConfig, AppConfigSchema } from './app/util/config/app-config';
import { BASE_PATH } from './app/openapi';
import { ApplicationConfig } from '@angular/core';
import { provideModelCategories } from './app/util/providers/model-categories.provider';


const loadConfig = (path: string): Promise<AppConfig> =>
  fetch(path)
    .then(res => res.text())
    .then(config => loadYaml(config))
    .then(config => AppConfigSchema.parseAsync(config))

Promise.all([
  loadConfig('assets/config/app-config-default.yaml'),
  loadConfig('assets/config/app-config.yaml').catch(() => ({})),
]).then(([defaultConfig, overriddenConfig]) => merge(defaultConfig, overriddenConfig))
  .then(appConfig => {
    const providers = appProviders.concat([
      { provide: BASE_PATH, useValue: appConfig.apiUrl },
      provideModelCategories(appConfig.availableCategories),
    ]);

    const angularApplicationConfig: ApplicationConfig = {
      providers: providers
    };
    return angularApplicationConfig
  })
  .then(ngAppCfg => bootstrapApplication(AppComponent, ngAppCfg))
  .catch((err) => console.error(err));
