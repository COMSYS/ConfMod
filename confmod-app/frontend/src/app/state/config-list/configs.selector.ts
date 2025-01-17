import { createFeatureSelector } from "@ngrx/store";
import { ConfmodConfig } from "./configs.reducer";

export const selectConfigs = createFeatureSelector<ReadonlyArray<ConfmodConfig>>('configs');
