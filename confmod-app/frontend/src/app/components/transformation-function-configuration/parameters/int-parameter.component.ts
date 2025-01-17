import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, Output, inject } from '@angular/core';
import { IntPipelineFunctionParameter } from '../../../types/transform-functions';
import { InputNumberModule } from 'primeng/inputnumber';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { LineBreakDirective } from '../../../directives/line-break.directive';
import { ParameterInputWrapperComponent } from './parameter-input-wrapper.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

let uniqueId = 0;

@Component({
  selector: 'app-pfp-int-int-parameter',
  standalone: true,
  imports: [
    CommonModule,
    InputNumberModule,
    LineBreakDirective,
    ParameterInputWrapperComponent,
    ReactiveFormsModule,
  ],
  template: `
    <app-parameter-input-wrapper [for]="id" [description]="param.description" [label]="param.name">
      <p-inputNumber [inputId]="id" [placeholder]="param.name" [formControl]="value" />
    </app-parameter-input-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    NgxControlValueAccessor
  ]
})
export class IntParameterComponent {
  valueAccessor: NgxControlValueAccessor<number> = inject(NgxControlValueAccessor);
  @Input({ required: true })
  param!: IntPipelineFunctionParameter

  protected value = new FormControl<number | null>(null);

  @Output()
  argumentChange = this.value.valueChanges;

  protected get id() {
    return `pfp-${this.param.name}-${this._id}`;
  }
  private _id = uniqueId++;
}
