import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PipelineFunction } from '../../types/transform-functions';
import { TransformationFunctionParamComponent } from './transformation-function-param/transformation-function-param.component';
import { ButtonModule } from 'primeng/button';
import { LineBreakDirective } from '../../directives/line-break.directive';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';

export interface TransformationFunctionDialogData {
  funcDef: PipelineFunction
}

@Component({
  selector: 'app-transformation-function-configuration',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TransformationFunctionParamComponent,
    LineBreakDirective,
  ],
  templateUrl: './transformation-function-configuration.component.html',
  styleUrl: './transformation-function-configuration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    NgxControlValueAccessor
  ]
})
export class TransformationFunctionConfigurationComponent {
    protected dialogConfig: DynamicDialogConfig<TransformationFunctionDialogData> = inject(DynamicDialogConfig);
    protected dialogRef = inject(DynamicDialogRef);
    valueAccessor: NgxControlValueAccessor<any[]> = inject(NgxControlValueAccessor);

    protected funcDef!: PipelineFunction;

    protected args: Record<string, any> = {};

    constructor() {
      if (!this.dialogConfig.data) {
        throw new Error("The dialog needs to get passed data of type TransformationFunctionDialogData");
      }

      this.funcDef = this.dialogConfig.data.funcDef;
    }

    confirm(): void {
      this.dialogRef.close({
        name: this.funcDef.name,
        args: { ...this.args }
      });
    }

    cancel(): void {
      this.dialogRef.close(null);
    }

    handleArgumentChange(paramName: string, value: any) {
      this.args[paramName] = value;
    }

}
