import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { snakeCase } from '../../../util/form/transform';
import { FeatureDataType, FeatureSpec, ObservationSpec, ObservationSpecs, ObservationType } from '../../../types/model-header';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton'
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { swap as arraySwap } from '../../../util/array';
import { FormArrayValidators } from '../../../validators';
import { NgxControlError } from 'ngxtension/control-error';
import { DividerModule } from 'primeng/divider';
import { ConfmodModelObservationCreate, RawFeatureSpec } from '../../../openapi';
import { InputTextareaModule } from 'primeng/inputtextarea';


@Component({
  selector: 'app-add-observation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DividerModule,
    InputTextModule,
    InputTextareaModule,
    RadioButtonModule,
    TooltipModule,
    DropdownModule,
    NgxControlError
  ],
  templateUrl: './add-observation-dialog.component.html',
  styleUrl: './add-observation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddObservationDialogComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private _cdRef = inject(ChangeDetectorRef);
  protected dialogRef = inject(DynamicDialogRef);
  protected dialogConfig = inject(DynamicDialogConfig);

  protected form = new FormGroup({
    label: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    type: new FormControl<ObservationType | null>(null, [Validators.required]),
    description: new FormControl<string>('', { nonNullable: true }),
    features: new FormArray<ReturnType<typeof this.newFeatureFormControl>>([], { validators: FormArrayValidators.validateArrayUnique({ path: 'label' }) })
  });

  get featureForm() {
    return this.form.controls.features;
  }

  ngOnInit(): void {
    this.form.controls.label.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (value) => {
        const toUpperSnakeCase = snakeCase({ uppercase: true });
        this.form.controls.label.setValue(toUpperSnakeCase(value), { emitEvent: false })
      }
    })
  }

  public cancel() {
    this.dialogRef.close(null);
  }

  protected handleSubmit(event: SubmitEvent) {
    const formValue = this.form.value;
    let observationType: 'E' | 'M';
    switch (formValue.type) {
      case (ObservationType.Event):
        observationType = "E";
        break;
      case (ObservationType.Measurement):
        observationType = "M";
        break;
      default:
        console.error("Form value contained and unknown observation type");
        return;
    }

    const spec: ConfmodModelObservationCreate = {
      label: formValue.label!,
      observation: {
        type: observationType,
        description: formValue.description,
        features: (formValue.features ?? []).map(feature => {
          const featureSpec: RawFeatureSpec = {
            label: feature.label!,
            description: feature.description,
            data_type: feature.dataType! as any,
          }

          if (["int", "float"].includes(feature.dataType ?? '')) {
            if (feature.unit) {
              featureSpec.metadata = [
                { label: "Unit", description: "Physical Unit", value: feature.unit}
              ]
            }
          }

          if (feature.dataType === "file") {
            if (feature.fileExt) {
              featureSpec.metadata = [
                { label: "Extension", description: "File extension", value: feature.fileExt}
              ]
            }
          }
          console.log("Feature spec sent to server", featureSpec);
          return featureSpec;
        }),
      },
    };
    this.dialogRef.close(spec);
  }

  protected observationType(type: 'M' | 'E'): ObservationType {
    return type === "E" ? ObservationType.Event : ObservationType.Measurement;
  }

  protected newFeatureFormControl() {
    return new FormGroup({
      label: new FormControl('', { validators: [Validators.required], nonNullable: true }),
      description: new FormControl('', { nonNullable: true }),
      dataType: new FormControl<FeatureDataType | null>(null, { validators: [Validators.required] }),
      unit: new FormControl<string | null>(null),
      fileExt: new FormControl<string | null>(null),
    })
  }

  protected addFeatureDefinition(): void {
    const control = this.newFeatureFormControl();
    this.featureForm.push(control);
  }

  protected removeFeature(idx: number) {
    this.featureForm.removeAt(idx);
  }

  protected moveFeatureUp(idx: number) {
    if (idx > 0) {
      arraySwap(this.featureForm.controls, idx - 1, idx);
    }
  }

  protected moveFeatureDown(idx: number) {
    if (idx < this.featureForm.controls.length - 1) {
      arraySwap(this.featureForm.controls, idx, idx + 1);
    }
  }

  protected FeatureDataTypes(): FeatureDataType[] {
    return ["int", "float", "boolean", "string", "timestamp", "enum", "file"];
  }

  protected unitByFeatureDataType(): any {

  }

  protected validateUniqueInArray(control: AbstractControl) {
    const value = control.value;
  }
}
