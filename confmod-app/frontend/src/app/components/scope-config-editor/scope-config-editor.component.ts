import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, InjectionToken, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, Observable, filter } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { TreeModule } from 'primeng/tree';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { ObservationConfigAddMetadataEvent, ObservationConfigComponent, ObservationConfigDeleteMetadataEvent } from '../observation-config/observation-config.component';
import { NgxControlValueAccessor, NgxControlValueAccessorCompareTo, provideCvaCompareTo } from 'ngxtension/control-value-accessor';
import { ModelMetadataComponent } from '../metadata-config/model-metadata/model-metadata.component';
import { ExtraMetadataComponent } from '../metadata-config/extra-metadata/extra-metadata.component';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { AddObservationDialogComponent } from '../observation-config/add-observation-dialog/add-observation-dialog.component';
import { RawConfmodHeaderInput } from '../../openapi/model/rawConfmodHeaderInput';
import { RawScopeConfigInput } from '../../openapi/model/rawScopeConfigInput';
import { AddMetadataComponent } from '../metadata-config/extra-metadata/add-metadata/add-metadata.component';
import { ConfmodModelAddMetadata, ConfmodModelObservationCreate } from '../../openapi';
import { isEqual } from "lodash";
import { provideValueEquality } from '../../util/providers/object-equality';
import { RawObservationConfigInput } from '../../openapi/model/rawObservationConfigInput';


const scopeConfigComparator: NgxControlValueAccessorCompareTo<RawScopeConfigInput> = (a, b) => {
    console.debug("compare", a, b);
    return isEqual(a, b);
}


@Component({
    selector: 'app-scope-config-editor',
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule,
        CheckboxModule,
        ButtonModule,
        MultiSelectModule,
        TreeModule,
        TooltipModule,
        TagModule,
        ObservationConfigComponent,
        ReactiveFormsModule,
        ModelMetadataComponent,
        ExtraMetadataComponent,
        DynamicDialogModule,
        AddMetadataComponent
    ],
    templateUrl: './scope-config-editor.component.html',
    styleUrl: './scope-config-editor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        { directive: NgxControlValueAccessor, inputs: ['value'], outputs: ['valueChange'] }
    ],
    providers: [
        DialogService,
        provideValueEquality(),

    ]
})
export class ScopeConfigEditorComponent implements OnInit {
    @Input({ required: true })
    set modelHeader(value: RawConfmodHeaderInput | null | undefined) {
        if (!value) {
            return;
        }
        this._modelHeader = value;
    }
    get modelHeader(): RawConfmodHeaderInput {
        return this._modelHeader;
    }
    protected _modelHeader!: RawConfmodHeaderInput;

    @Input()
    scopeConfig!: RawScopeConfigInput

    @Output()
    addObservation = new EventEmitter<ConfmodModelObservationCreate>();

    @Output()
    deleteObservation = new EventEmitter<string>();

    @Output()
    addFeatureMetadata = new EventEmitter<ObservationConfigAddMetadataEvent>();

    @Output()
    deleteFeatureMetadata = new EventEmitter<ObservationConfigDeleteMetadataEvent>();

    @Output()
    addModelMetadata = new EventEmitter<ConfmodModelAddMetadata>();

    @Output()
    deleteModelMetadata = new EventEmitter<string>();

    @Output()
    scopeConfigChange = new EventEmitter<RawScopeConfigInput>();

    private _destroyRef = inject(DestroyRef);
    private dialog = inject(DialogService);

    protected allMetaSelected$: Observable<boolean> = EMPTY;
    protected allMetaDeselected$: Observable<boolean> = EMPTY;

    ngOnInit(): void {
    }

    protected openAddObservationDialog() {
        const dialogRef = this.dialog.open(AddObservationDialogComponent, {
            closable: true,
            header: "Define a new Observation",
            width: '30vw',
        });

        dialogRef.onClose.pipe(
            filter(result => result !== null)
        ).subscribe({
            next: (result: ConfmodModelObservationCreate) => {
                console.log("Dialog Result:", result);
                this.addObservation.emit(result);
            },
        });
    }

    protected handleAddFeatureMetadata(event: ObservationConfigAddMetadataEvent) {
        this.addFeatureMetadata.emit(event);
    }

    protected handleDeleteFeatureMetadata(event: ObservationConfigDeleteMetadataEvent) {
        this.deleteFeatureMetadata.emit(event);
    }

    protected handleAddModelMetadata(event: ConfmodModelAddMetadata) {
        this.addModelMetadata.emit(event);
    }

    protected handleDeleteModelMetadata(event: string) {
        this.deleteModelMetadata.emit(event);
    }

    protected handleDeleteObservation(label: string) {
        this.deleteObservation.emit(label);
    }

    handleMetadataChange(metadata: string[] | undefined) {
        this.scopeConfigChange.emit({
            ...this.scopeConfig,
            metadata: metadata === undefined ? [] : [...metadata],
        });
    }

    protected handleObservationConfigChange(observationConfig: { [key: string]: RawObservationConfigInput }) {
        this.scopeConfigChange.emit({
            ...this.scopeConfig,
            observations: { ...observationConfig }
        });
    }
}
