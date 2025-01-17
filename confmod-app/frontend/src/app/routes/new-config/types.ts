import { HTTPValidationError, JsonDecodeError, YamlDecodeError } from "../../openapi";

export interface ValidationError {
    statusCode: 422
    error: HTTPValidationError
};

export interface DecodeError {
    statusCode: 400;
    error: JsonDecodeError | YamlDecodeError
}

export interface GenericFileUploadError {
    statusCode: number;
    error: any;
}

export type FileUploadError = ValidationError | DecodeError | GenericFileUploadError;

export interface EmptyFileState {
    state: "empty";
}

export interface ErrorFileState {
    state: "error",
    error: FileUploadError,
    fileName: string;
    fileSize: number;
}

export interface UploadingFileState {
    state: "uploading",
    fileName: string;
    fileSize: number;
    progress: number;
}

export interface ValidatedFileState<T> {
    state: "validated",
    fileName: string;
    fileSize: number;
    result: T
}

export type FileState<T> = EmptyFileState | ErrorFileState | UploadingFileState | ValidatedFileState<T>;