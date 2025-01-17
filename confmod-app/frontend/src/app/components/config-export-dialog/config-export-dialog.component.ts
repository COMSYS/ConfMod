import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxControlError } from 'ngxtension/control-error';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';

export interface ConfigExportDialogInputData {
  slug: string;
  scopes: string[];
}

export interface ConfigExportDialogOutput {
  filename: string;
  exportedScopes: string[];
}

@Component({
  selector: 'app-config-export-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    NgxControlError,
  ],
  templateUrl: './config-export-dialog.component.html',
  styleUrl: './config-export-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigExportDialogComponent {
  protected dialogRef = inject(DynamicDialogRef);
  protected dialogConfig: DynamicDialogConfig<ConfigExportDialogInputData> = inject(DynamicDialogConfig);
  protected dialogData: ConfigExportDialogInputData;

  constructor() {
    if (!this.dialogConfig.data) {
      throw new Error("ConfigExportDialogComponent needs data of type ConfigExportDialogData.")
    }
    this.dialogData = this.dialogConfig.data;
  }

  protected form = new FormGroup({
    filename: new FormControl<string>("", { nonNullable: true, validators: [Validators.required]}),
    exportedScopes: new FormControl<string[]>([], { nonNullable: true, validators: [Validators.required] }),
  });

  protected handleSubmit() {
    const formValue = this.form.value;
    let filename = formValue.filename?.trim() ?? 'unnamed';
    if (!filename.endsWith(".yaml")) {
      filename += ".yaml";
    }
    const outputData: ConfigExportDialogOutput = {
      filename: filename,
      exportedScopes: [...formValue.exportedScopes!],
    };
    this.dialogRef.close(outputData);
  }

  protected cancel() {
    this.dialogRef.close();
  }
}
