import { RawObservationSpecInput } from "../openapi/model/rawObservationSpecInput";

export interface ConfmodModel {
    name: string;
    header: ModelHeader;
    payload?: any[][];
}

export interface ModelMetadata {
    [key: string]: string;
}

export interface ModelHeader {
    metadata: ModelMetadata;
    observations: ObservationSpecs;
}

export interface ObservationSpecs {
    [label: string]: RawObservationSpecInput;
}

export interface ObservationSpec {
    type: 'M' | 'E';
    features: FeatureSpec[];
}

export interface FeatureSpec {
    label: string;
    type: FeatureDataType;
    unit?: string;
    valueRange?: [number, number];
}

export type FeatureDataType = 'float' | 'int' | 'boolean' | 'timestamp' | 'string' | 'bool' | 'enum' | 'binary' | 'file';

export enum ObservationType {
    Event = "E",
    Measurement = "M",
}

export function EMPTY_HEADER(): ModelHeader {
    return {
        metadata: {},
        observations: {}
    };
}

export function EMPTY_MODEL(name: string): ConfmodModel {
    return {
        name,
        header: EMPTY_HEADER(),
        payload: [],
    }
}

/* export function modelFromRaw(name: string, rawModel: RawConfmodModelInput): ConfmodModel {
    return {
        name,
        header: {
            metadata: rawModel.head.metadata,
            observations: rawModel.head.observations as any,
        },
        payload: rawModel?.payload || []
    }
} */
