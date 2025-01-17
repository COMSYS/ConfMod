import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
/**
 * An injectable collection of functions that allow downloading using the OS native file explorer.
 */
export class FileDownloadService {

  /**
   * Download a string as a "txt"-file.
   * 
   * @param data A string to download.
   * @param filename An optional filename.
   *
   * @see {@link downloadBlob}
   */
  public downloadString(data: string, filename?: string) {
    const blob = new Blob([data], { type: "text/plain" });
    
    this.downloadBlob(blob, filename);
  }

  /**
   * Download a json-serializable value as a ".json"-file.
   * 
   * @param data Any value that is accepted by {@linkcode JSON.stringify}.
   * @param filename An optional filename.
   * 
   * @see {@link downloadBlob}
   */
  public downloadJson(data: any, filename?: string) {
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    this.downloadBlob(blob, filename);
  }

  /**
   * Open the file explorer of the OS, allowing the download of a blob of data.
   * 
   * A filename can be provided to pre-fill the respective input field on the file-explorer dialog.
   * The blob's `type` property will determine the file-extension.
   * 
   * @param blob An arbitrary blob of data. The blob's `type`-attribute will determine the file extension.
   * @param [filename] an optional file name *without* the file extension.
   */
  public downloadBlob(blob: Blob, filename?: string) {
    const a = document.createElement("a");
    a.download = filename ?? "";
    a.href = URL.createObjectURL(blob);
    a.click();
  }

}
