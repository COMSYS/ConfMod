import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { FeatureConfigComponent } from '../../feature-config/feature-config.component';
import { TooltipModule } from 'primeng/tooltip';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollapsibleComponent } from '../../collapsible/collapsible.component';
import { TemplateDirective } from '../../common/template.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { RawFeatureConfig, RawObservationSpecInput } from '../../../openapi';
import { ObservationConfigAddMetadataEvent, ObservationConfigDeleteMetadataEvent } from '../observation-config.component';
import { FeatureConfigImplAddMetadataEvent, FeatureConfigImplDeleteMetadataEvent } from '../../feature-config/feature-config-impl.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { RawObservationConfigInput } from '../../../openapi/model/rawObservationConfigInput';

@Component({
  selector: 'app-single-observation-config',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CheckboxModule,
    TagModule,
    TriStateCheckboxModule,
    FeatureConfigComponent,
    TooltipModule,
    ReactiveFormsModule,
    CollapsibleComponent,
    TemplateDirective,
    SkeletonModule,
    ConfirmDialogModule,
    TriStateCheckboxModule,
  ],
  templateUrl: './single-observation-config.component.html',
  styleUrl: './single-observation-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService]
})
export class SingleObservationConfigComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private confirmationService = inject(ConfirmationService);

  @Input({ required: true })
  observationLabel: string = "";

  @Input({ required: true })
  observationSpec!: RawObservationSpecInput;

  @Input({ required: true })
  set observationConfig(config: RawObservationConfigInput) {
    if (!config) {
      config = { features: {} };
    }
    this._observationConfig = config;
    this.includeInPayload.setValue(config.includePayload ?? false, { emitEvent: false });
    this.includeMetadata.setValue(config.includeMetadata ?? false, { emitEvent: false });
  }
  get observationConfig() {
    return this._observationConfig || { features: {} };
  }
  private _observationConfig: RawObservationConfigInput = { features: {}};

  @Output()
  addMetadata = new EventEmitter<ObservationConfigAddMetadataEvent>();

  @Output()
  deleteMetadata = new EventEmitter<ObservationConfigDeleteMetadataEvent>();

  @Output()
  deleteObservation = new EventEmitter<string>();

  @Output()
  observationConfigChange = new EventEmitter<RawObservationConfigInput>();

  protected observationConfigCtrl = new FormGroup({
    includeMetdata: new FormControl<boolean>(false, { nonNullable: true }),
    includeInPayload: new FormControl<boolean>(false, { nonNullable: true }),
  })

  protected get includeMetadata() {
    return this.observationConfigCtrl.controls.includeMetdata;
  }

  protected get includeInPayload() {
    return this.observationConfigCtrl.controls.includeInPayload;
  }

  ngOnInit(): void {
    this.observationConfigCtrl.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
      map((value) => {
        const newConfig: RawObservationConfigInput = {
          ...this.observationConfig,
          includeMetadata: value.includeMetdata ?? this.observationConfig.includeMetadata,
          includePayload: value.includeInPayload ?? this.observationConfig.includePayload,
        }
        return newConfig;
      })
    ).subscribe(this.observationConfigChange);

    console.log("Config", this.observationConfig, "Spec", this.observationSpec);
  }

  protected observationType(type: string): string {
      switch (type) {
          case "M":
              return "Measurement";
          case "E":
              return "Event";
          default:
              return "Unknown";
      }
  }

  protected handleAddMetadata(label: string, event: FeatureConfigImplAddMetadataEvent) {
      this.addMetadata.emit({
          ...event,
          observation: label
      });
  }

  protected handleDeleteMetadata(label: string, event: FeatureConfigImplDeleteMetadataEvent) {
      this.deleteMetadata.emit({
          ...event,
          observation: label
      })
  }

  protected handleDeleteObservation(label: string) {
    this.confirmationService.confirm({
      header: `Delete Observation "${label}"?`,
      icon: 'pi pi-exclamation-triangle',
      message: "Are you sure?\nThis will remove the observation from the model and the config.\nThis action can not be undone.",
      acceptLabel: "Confirm Deletion",
      acceptButtonStyleClass: "p-button p-button-danger",
      accept: () => this.deleteObservation.emit(label),
      rejectLabel: "Cancel",
      rejectButtonStyleClass: "p-button p-button-secondary",
    })
  }

  handleFeatureConfigChange(featureConfig: { [key: string]: RawFeatureConfig }) {
    const newConfig: RawObservationConfigInput = {
      ...this.observationConfig,
      features: featureConfig
    };
    this.observationConfigChange.emit(newConfig);
  }
}
