export * from './config.service';
import { ConfigService } from './config.service';
export * from './default.service';
import { DefaultService } from './default.service';
export * from './model.service';
import { ModelService } from './model.service';
export * from './validators.service';
import { ValidatorsService } from './validators.service';
export const APIS = [ConfigService, DefaultService, ModelService, ValidatorsService];
