import { DBConfig } from "ngx-indexed-db";

export const idbConfig: DBConfig = {
    name: "Confmod DB",
    version: 1,
    isDefault: true,
    objectStoresMeta: [
        {
            store: "models",
            storeConfig: { keyPath: 'name', autoIncrement: false },
            storeSchema: [
                { name: "name", keypath: "name", options: { unique: true } },
            ]
        },
        {
            store: "configs",
            storeConfig: { keyPath: "name", autoIncrement: false },
            storeSchema: [
                { name: "name", keypath: "name", options: { unique: true }},
            ]
        }
    ]
}
