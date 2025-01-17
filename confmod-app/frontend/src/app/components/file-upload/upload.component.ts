import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, booleanAttribute, inject } from '@angular/core';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { ModelHeader } from '../../types/model-header';
import { FileItem, FileUploadModule, FileUploader, ParsedResponseHeaders } from "ng2-file-upload";
import { ButtonModule } from 'primeng/button';
import { injectApiBaseUrl } from '../../util/providers/base-url';
import { ProgressBarModule } from "primeng/progressbar";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { FileUploadErrorEvent, FileUploadSuccess } from './event.interface';


@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    ButtonModule,
    ProgressBarModule,
    ProgressSpinnerModule
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    NgxControlValueAccessor,
  ],
  host: {
  }
})
export class FileUploadComponent implements OnInit { 
  protected cva: NgxControlValueAccessor<ModelHeader> = inject(NgxControlValueAccessor);
  protected _cdRef = inject(ChangeDetectorRef);
  protected uploader!: FileUploader;

  @Input({
    required: true,
  })
  url!: string;

  @Input({ transform: booleanAttribute })
  autoUpload: boolean = false;

  @Input({ transform: booleanAttribute })
  disableMultipart: boolean = false;

  @Output()
  onFileUploaded = new EventEmitter<FileUploadSuccess>();

  @Output()
  onUploadError = new EventEmitter<FileUploadErrorEvent>();

  protected hasFileOver = false;
  protected selectedFile: File | null = null;

  protected uploadStarted: boolean = false;
  protected uploadInProgress: boolean = false;
  protected uploadSucceeded: boolean = false;
  protected uploadError: boolean = false;
  
  protected get uploadProgressBarColor(): string {
    if (this.uploadError) {
      return "var(--red-600)";
    }
    if (this.uploadSucceeded) {
      return "var(--green-600)";
    }
    return "var(--blue-500)";
  }

  @ViewChild('fileSelect')
  protected fileSelect!: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    this.uploader = this.createFileUploader();


    this.uploader.onBeforeUploadItem = () => {
      this.uploadStarted = true;
      this._cdRef.markForCheck();
    }

    this.uploader.onProgressAll = () => {
      this.uploadInProgress = true;
      this._cdRef.markForCheck();
    }

    this.uploader.onCompleteAll = () => {
      this.uploadSucceeded = true;
      this.uploadInProgress = false;
      this._cdRef.markForCheck();
    }

    this.uploader.onErrorItem = (item: FileItem, response: string, status: number, header: ParsedResponseHeaders) => {
      this.onUploadError.emit({
        file: item._file,
        response,
        status,
        header
      });
    }

    this.uploader.onSuccessItem = (item: FileItem, response: string, status: number, header: ParsedResponseHeaders) => {
      this.onFileUploaded.emit({
        file: item._file,
        response,
        status,
        header,
      });
    }
  }

  public openFileExporer(): void {
    this.fileSelect.nativeElement.click();
  }

  protected handleFileOver(hasFileOver: boolean) {
    if (hasFileOver !== this.hasFileOver) {
      this.hasFileOver = hasFileOver;
      this._cdRef.markForCheck();
    }
  }

  protected handleFileDrop(files: File[]) {
    const file = files[0];
    this.selectedFile = file;
    this._cdRef.markForCheck();
  }

  protected handleFileSelect(files: File[]) {
    this.addFileToQueue(files);
  }

  private addFileToQueue(files: File[]) {
    const file = files[0];
    this.selectedFile = file;
    this.uploader.addToQueue([file]);
    this._cdRef.markForCheck();
  }

  protected removeFile(): void {
    this.selectedFile = null;
    this.fileSelect.nativeElement.files = null;
    this.uploader.clearQueue();
    this._cdRef.markForCheck();
  }

  protected upload(): void {
    this.uploadStarted = true;
    this.uploader.uploadAll();
    this._cdRef.markForCheck();
  }

  private createFileUploader() {
    return new FileUploader({
      url: this.url,
      autoUpload: this.autoUpload, 
      disableMultipart: this.disableMultipart,
    })
  }

}
