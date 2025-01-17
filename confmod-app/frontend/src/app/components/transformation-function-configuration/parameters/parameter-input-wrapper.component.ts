import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LineBreakDirective } from '../../../directives/line-break.directive';

@Component({
  selector: 'app-parameter-input-wrapper',
  standalone: true,
  imports: [
    CommonModule,
    LineBreakDirective,
  ],
  template: `
    <div class="flex flex-col gap-1">
      <label class="font-semibold" [htmlFor]="for">{{ label }}</label>
      <small appLineBreak [text]="description"></small>
      <ng-content />
      @if (error) {
        <small class="text-red">{{error}}</small>
      }
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParameterInputWrapperComponent {
  @Input({ required: true })
  for!: string;

  @Input({ required: true })
  description!: string;

  @Input({ required: true })
  label!: string;

  @Input()
  error?: string;
}
