import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ParameterInputWrapperComponent } from './parameter-input-wrapper.component';
import { BooleanPipelineFunctionParameter } from '../../../types/transform-functions';

let uniqueId = 0;

@Component({
  selector: 'app-boolean-parameter',
  standalone: true,
  imports: [
    CommonModule,
    CheckboxModule,
    ReactiveFormsModule,
    ParameterInputWrapperComponent,
  ],
  template: `
    <app-parameter-input-wrapper [for]="id" [description]="param.description" [label]="param.name">
      <p-checkbox [inputId]="id" [binary]="true" [formControl]="value" />
    </app-parameter-input-wrapper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanParameterComponent {
  @Input()
  param!: BooleanPipelineFunctionParameter;

  protected value = new FormControl<boolean | null>(null);

  @Output()
  argumentChange = this.value.valueChanges

  get id() {
    return `pfp-${this.param.name}-${this._id}`;
  }
  private _id = uniqueId++;
}
