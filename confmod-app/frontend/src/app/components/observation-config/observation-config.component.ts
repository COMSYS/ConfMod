import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { ObservationSpecs } from '../../types/model-header';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { FeatureConfigComponent } from '../feature-config/feature-config.component';
import { TooltipModule } from 'primeng/tooltip';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { provideValueEquality } from '../../util/providers/object-equality';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CollapsibleComponent } from '../collapsible/collapsible.component';
import { TemplateDirective } from '../common/template.directive';
import { SkeletonModule } from 'primeng/skeleton';
import { AddFeatureMetadataProps, ConfigEditorComponentStore, DeleteFeatureMetadataProps } from '../../routes/config-editor/config-editor.store';
import { FeatureConfigImplAddMetadataEvent, FeatureConfigImplDeleteMetadataEvent } from '../feature-config/feature-config-impl.component';
import { SingleObservationConfigComponent } from './single-observation-config/single-observation-config.component';
import { RawObservationConfigInput } from '../../openapi/model/rawObservationConfigInput';

type TForm = FormGroup<{
    meta: FormControl<boolean>;
    payload: FormControl<boolean>;
    all: FormControl<boolean | null>;
}>

export type ObservationConfigAddMetadataEvent = Pick<AddFeatureMetadataProps, 'body' | 'feature' | 'observation'>
export type ObservationConfigDeleteMetadataEvent = Pick<DeleteFeatureMetadataProps, 'feature' | 'observation' | 'metadata'>

@Component({
    selector: 'app-observation-config',
    standalone: true,
    imports: [
        CommonModule,
        SingleObservationConfigComponent
    ],
    templateUrl: './observation-config.component.html',
    styleUrl: './observation-config.component.scss',
    //changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        { directive: NgxControlValueAccessor, inputs: ['value'], outputs: ['valueChange'] },
    ],
    providers: [ provideValueEquality() ]
})
export class ObservationConfigComponent implements OnInit {
    private _cdRef = inject(ChangeDetectorRef);
    private _destroyRef = inject(DestroyRef);
    private configEditorState = inject(ConfigEditorComponentStore);

    @Input({ required: true })
    spec!: ObservationSpecs

    @Input({ required: true })
    observationConfig!: { [key: string]: RawObservationConfigInput };

    @Output()
    addMetadata = new EventEmitter<ObservationConfigAddMetadataEvent>();

    @Output()
    deleteMetadata = new EventEmitter<ObservationConfigDeleteMetadataEvent>();

    @Output()
    deleteObservation = new EventEmitter<string>();

    @Output()
    observationConfigChange = new EventEmitter<{ [key: string]: RawObservationConfigInput }>();

    controls: FormGroup<Record<string, FormControl>> = new FormGroup({});

    protected expanded: boolean = false;

    ngOnInit(): void {
        /*
        console.log("Config Value", this.cva.value);

        this.cva.valueChange.pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
                next: (value) => console.log("Observation Config Change", value),
            })
        */

      console.log(this.spec);
    }

    toggle(): void {
        this.expanded = !this.expanded;
        this._cdRef.markForCheck();
    }

    expand(): void {
        if (!this.expanded) {
            this.toggle();
        }
    }

    collapse(): void {
        if (this.expanded) {
            this.toggle;
        }
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

    protected handleAddMetadata(observation: string, event: FeatureConfigImplAddMetadataEvent) {
        this.addMetadata.emit({
            ...event,
            observation: observation
        });
    }

    protected handleDeleteMetadata(observation: string, event: FeatureConfigImplDeleteMetadataEvent) {
        this.deleteMetadata.emit({
            ...event,
            observation: observation
        })
    }

    protected handleDeleteObservation(label: string) {
        this.deleteObservation.emit(label);
    }

    handleObservationConfigChange(label: string, changedObservationConfig: RawObservationConfigInput) {
        this.observationConfigChange.emit({
            ...this.observationConfig,
            [label]: changedObservationConfig
        });
    }
}
