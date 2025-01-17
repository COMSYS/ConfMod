import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { ParameterInputWrapperComponent } from './parameter-input-wrapper.component';
import { EnumPipelineFunctionParameter } from '../../../types/transform-functions';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-enum-parameter',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ParameterInputWrapperComponent,
    ReactiveFormsModule,
  ],
  template: `
    <app-parameter-input-wrapper [for]="id" [description]="param.description" [label]="param.name">
      <p-dropdown [options]="param.values" [formControl]="value" />
    </app-parameter-input-wrapper>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnumParameterComponent implements OnChanges {
  @Input()
  param!: EnumPipelineFunctionParameter;

  protected value = new FormControl<string>('');

  @Output()
  argumentChange = this.value.valueChanges;

  get id() {
    return `pfp-${this.param.name}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ("param" in changes) {
    }
  }
}
