import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ParameterInputWrapperComponent } from './parameter-input-wrapper.component';
import { StringPipelineFunctionParameter } from '../../../types/transform-functions';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';

let uniqueId = 0;

@Component({
  selector: 'app-boolean-parameter',
  standalone: true,
  imports: [
    CommonModule,
    InputTextModule,
    InputTextareaModule,
    ReactiveFormsModule,
    ParameterInputWrapperComponent,
  ],
  template: `
    <app-parameter-input-wrapper [for]="id" [description]="param.description" [label]="param.name">
      @if (param.isFreeText) {
        <textarea pInputTextArea [id]="id" [placeholder]="param.name" [formControl]="value" >
        </textarea>
      } @else {
        <input type="text" pInputText [id]="id" [placeholder]="param.name" [formControl]="value" />
      }
    </app-parameter-input-wrapper>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringParameterComponent {
  @Input()
  param!: StringPipelineFunctionParameter;

  protected value = new FormControl<string>('');

  @Output()
  argumentChange = this.value.valueChanges

  get id() {
    return `pfp-${this.param.name}-${this._id}`;
  }
  private _id = uniqueId++;
}
