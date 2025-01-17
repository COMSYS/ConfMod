import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { NgxControlValueAccessor } from "ngxtension/control-value-accessor";
import { ConfirmationService, MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ContextMenu, ContextMenuModule } from "primeng/contextmenu";
import { DropdownModule } from "primeng/dropdown";
import { DialogService } from "primeng/dynamicdialog";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { filter, first, map, tap } from "rxjs";
import { RawFeatureConfig, RawFeatureSpec } from "../../openapi";
import { AddFeatureMetadataProps, DeleteFeatureMetadataProps } from "../../routes/config-editor/config-editor.store";
import { PipelineFunction, TRANSFORM_PIPELINE_FUNCTIONS } from "../../types/transform-functions";
import { provideValueEquality } from "../../util/providers/object-equality";
import { CollapsibleComponent } from "../collapsible/collapsible.component";
import { TemplateDirective } from "../common/template.directive";
import { TransformationFunctionConfigDialogComponent } from "../transformation-function-config-dialog/pp-function-config-dialog.component";
import { TransformationFunctionConfigurationComponent } from "../transformation-function-configuration/transformation-function-configuration.component";
import { AddFeatureMetadataDialogComponent } from "./add-feature-metadata-dialog/add-feature-metadata-dialog.component";

const DEFAULT_PIPELINE_FUNCTIONS = [...TRANSFORM_PIPELINE_FUNCTIONS].sort();

export type FeatureConfigImplAddMetadataEvent = Pick<AddFeatureMetadataProps, 'body' | 'feature'>;

export type FeatureConfigImplDeleteMetadataEvent = Pick<DeleteFeatureMetadataProps, 'feature' | 'metadata'>;

@Component({
    selector: 'app-feature-config-impl',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CollapsibleComponent,
        ContextMenuModule,
        ConfirmDialogModule,
        TemplateDirective,
        TagModule,
        CheckboxModule,
        DropdownModule,
        ReactiveFormsModule,
        TransformationFunctionConfigDialogComponent,
        TooltipModule
    ],
    hostDirectives: [{
        directive: NgxControlValueAccessor,
        inputs: ['value'],
        outputs: ['valueChange'],
    }],
    templateUrl: './feature-config.component.html',
    styleUrl: './feature-config.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ConfirmationService, provideValueEquality() ]
})
export class FeatureConfigImplComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    protected confirmService = inject(ConfirmationService);

    @Input({ required: true })
    feat!: RawFeatureSpec;

    @Input({ required: true })
    set featureConfig(featureConfig: RawFeatureConfig | undefined) {
        console.debug("feature config", featureConfig);
        if (!featureConfig) {
          featureConfig = {};
        }
        this._featureConfig = featureConfig;
        this.metadataFormControl.setValue(featureConfig.metadata ?? [], { emitEvent: false });
        this.includeDataTypeCtrl.setValue(featureConfig.includeDataType ?? false, { emitEvent: false });
        this.includePayloadCtrl.setValue(featureConfig.includePayload ?? false, { emitEvent: false  });
    }

    get featureConfig(): RawFeatureConfig {
        return this._featureConfig;
    }
    private _featureConfig!: RawFeatureConfig;

    @Output()
    addMetadata = new EventEmitter<FeatureConfigImplAddMetadataEvent>();

    @Output()
    deleteMetadata = new EventEmitter<FeatureConfigImplDeleteMetadataEvent>();

    @Output()
    featureConfigChange = new EventEmitter<RawFeatureConfig>();

    protected configCtrl = new FormGroup({
        metadata: new FormControl<string[]>([], { nonNullable: true }),
        includeDataType: new FormControl<boolean>(false, { nonNullable: true }),
        includePayload: new FormControl<boolean>(false, { nonNullable: true }),
    })
    protected get metadataFormControl() {
        return this.configCtrl.controls.metadata;
    }
    protected get includeDataTypeCtrl() {
        return this.configCtrl.controls.includeDataType;
    }
    protected get includePayloadCtrl() {
        return this.configCtrl.controls.includePayload;
    }

/*     @Input({ required: true })
    value!: FeatureConfig; */

    /*
    protected isNumbericFeature(feature: RawFeatureSpec) {
        return !!["float", "int"].find((type) => type === feature.metadata?.type)
    }
    */

    protected get pipelineFunctions(): PipelineFunction[] {
        return DEFAULT_PIPELINE_FUNCTIONS;
    }

    protected dialog = inject(DialogService);

    protected selectedFnCtrl = new FormControl<PipelineFunction | null>(null);

    @ViewChild('featureMetaCtx')
    protected featureMetaCtx!: ContextMenu;
    protected featureMetaCtxItems: MenuItem[] = [
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => this.confirmFeatureMetaDeletion()
        }
    ]
    protected selectedFeatureMetadata: string | null = null;

    ngOnInit() {
        this.configCtrl.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((formValue) => {
                const {
                    metadata = this.featureConfig.metadata,
                    includeDataType = this.featureConfig.includeDataType,
                    includePayload = this.featureConfig.includePayload,
                } = formValue;
                const configUpdate: RawFeatureConfig = {
                    ...this.featureConfig,
                    includeDataType: includeDataType,
                    includePayload: includePayload,
                    metadata: metadata ? [...metadata] : undefined
                }
                return configUpdate;
            }),
            tap((configUpdate) => console.debug("Feature Config Update", configUpdate)),
        ).subscribe(this.featureConfigChange);
    }

    protected openFunctionDialog(): void {
        const selectedFn = this.selectedFnCtrl.value;
        if (!selectedFn) {
            return;
        }
        const ref = this.dialog.open(TransformationFunctionConfigurationComponent, {
            header: `Configure Function "${selectedFn.label}"`,
            data: {
                funcDef: selectedFn
            }
        });

        ref.onClose.pipe(
            filter(result => result !== null),
            first(),
        ).subscribe((transformFunc: { name: string, args: Record<string, any> }) => {
            const featureConfig: RawFeatureConfig = {
                ...this.featureConfig,
                transform: [...this.featureConfig.transform || [], transformFunc]
            }
            this.featureConfigChange.emit(featureConfig);
        })
    }

    protected openAddMetadataDialog() {
        const ref = this.dialog.open(AddFeatureMetadataDialogComponent, {
            header: "Add additional Metadata",
            data: {
                existingMetadata: this.getExistingMetadataLabels(),
            }
        });

        ref.onClose.pipe(
            filter((result) => result !== null)
        ).subscribe((result) => {
            console.log("Add Feature Metadata submitted", result);
            this.addMetadata.emit({
                feature: this.feat.label,
                body: {
                     label: result.label,
                     type: result.type,
                     description: result.description ?? null,
                     value: result.value,
                }
            });
        })
    }

    private getExistingMetadataLabels(): string[] {
        const descriptiveMetadata = this.feat.metadata ?? [];
        //const valueMetadata = this.feat.value_metadata ?? [];

        return descriptiveMetadata.map(value => value.label);
    }

    protected onFeatureMetaCtxMenu(metaLabel: string, event: Event) {
        this.selectedFeatureMetadata = metaLabel;
        this.featureMetaCtx.show(event);
    }

    private confirmFeatureMetaDeletion() {
        this.confirmService.confirm({
            header: `Delete Feature Metadata "${this.selectedFeatureMetadata}"?`,
            message: "This action can not be undone! Do you want to continue?",
            accept: () => {
                this.deleteMetadata.emit({ feature: this.feat.label, metadata: this.selectedFeatureMetadata! });
                this.selectedFeatureMetadata = null;
            },
            reject: () => {
                this.selectedFeatureMetadata = null;
            }
        })
    }
}
