import { createInjectionToken } from "ngxtension/create-injection-token";

const [, , DEFAULT_BASE_URL] = createInjectionToken(() => "http://127.0.0.1:8000/");

function baseUrlFactory(baseUrl: string) {
    return baseUrl;
}

export const [
    injectApiBaseUrl,
    provideApiBaseUrl,
    ,
    provideApiBaseUrlInitializer
] = createInjectionToken(
    baseUrlFactory,
    {
        isRoot: false,
        deps: [DEFAULT_BASE_URL]
    }
);
