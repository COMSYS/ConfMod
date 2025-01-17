import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { NgxControlError } from "ngxtension/control-error";
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';

export interface AddFeatureMetadataDialogData {
  existingMetadata: string[]
}

@Component({
  selector: 'app-add-feature-metadata-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    RadioButtonModule,
    NgxControlError
  ],
  templateUrl: './add-feature-metadata-dialog.component.html',
  styleUrl: './add-feature-metadata-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFeatureMetadataDialogComponent {
  protected dialogConfig: DynamicDialogConfig<AddFeatureMetadataDialogData> = inject(DynamicDialogConfig);
  protected dialogRef = inject(DynamicDialogRef);

  protected existingMetadata = this.dialogConfig.data!.existingMetadata;

  protected form = new FormGroup({
    label: new FormControl('', { nonNullable: true , validators: [ Validators.required, validateLabelNotExisting(this.existingMetadata) ]}),
    type: new FormControl<"descriptive" | "value">("descriptive", { nonNullable: true, validators: [ Validators.required ]}),
    description: new FormControl<string | null>(null),
    value: new FormControl('', { nonNullable: true, validators: Validators.required }),
  })

  protected handleSubmit() {
    const formValue = this.form.value;
    this.dialogRef.close({
      label: formValue.label!,
      type: formValue.type!,
      description: formValue.description,
      value: formValue.value!
    });
  }

  protected handleCancel() {
    this.dialogRef.close(null);
  }
}

function validateLabelNotExisting(labels: string[]) {
  return (control: AbstractControl<string>) => {
    const value = control.value.toLowerCase();
    const idx = labels.findIndex((label) => label.toLowerCase() == value);
    if (idx < 0) {
      return null;
    }

    return {
      labelExists: true
    }
  }
}