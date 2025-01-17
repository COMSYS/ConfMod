import { inject, InjectionToken, Provider } from "@angular/core";

export const MODEL_CATEGORIES = new InjectionToken<string[]>("Injection Token for available model categories");

export const provideModelCategories = (categories: string[]): Provider => (
    {
        provide: MODEL_CATEGORIES,
        useValue: [...categories],
    }
);

export const injectModelCategories = () => inject(MODEL_CATEGORIES);