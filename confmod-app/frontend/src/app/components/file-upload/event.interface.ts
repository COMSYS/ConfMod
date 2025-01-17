import { FileItem, ParsedResponseHeaders } from "ng2-file-upload";

export interface FileUploadSuccess {
    file: File;
    response: string,
    status: number,
    header: ParsedResponseHeaders,
}

export interface FileUploadErrorEvent {
    file: File,
    response: string,
    status: number,
    header: ParsedResponseHeaders,
}