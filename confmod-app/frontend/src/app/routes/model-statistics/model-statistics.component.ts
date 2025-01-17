import { CommonModule } from '@angular/common';
import { Input } from "@angular/core";
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConfmodModel } from '../../types/model-header';

@Component({
  selector: 'app-model-statistics',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './model-statistics.component.html',
  styleUrl: './model-statistics.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelStatisticsComponent {
  @Input()
  model!: ConfmodModel;
}
