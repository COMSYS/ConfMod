import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FeatureConfigImplAddMetadataEvent, FeatureConfigImplComponent, FeatureConfigImplDeleteMetadataEvent } from './feature-config-impl.component';
import { DialogService } from 'primeng/dynamicdialog';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { RawFeatureConfig, RawFeatureSpec } from '../../openapi';
import { AddFeatureMetadataProps, AddMetadataProps } from '../../routes/config-editor/config-editor.store';
import { provideValueEquality } from '../../util/providers/object-equality';
import { FormControl } from '@angular/forms';

type AddMetadataEvent = Pick<AddFeatureMetadataProps, 'body' | 'feature'>

@Component({
    selector: 'app-feature-config',
    standalone: true,
    imports: [
        CommonModule,
        FeatureConfigImplComponent,
    ],
    hostDirectives: [
        { directive: NgxControlValueAccessor, inputs: ['value'], outputs: ['valueChange'] }
    ],
    template: `
        @for (feat of spec; track feat.label; let i = $index) {
            <app-feature-config-impl [feat]="feat"
                [featureConfig]="featureConfig[feat.label]"
                (featureConfigChange)="handleFeatureConfigChange(feat.label, $event)"
                (addMetadata)="handleAddMetadata($event)"
                (deleteMetadata)="handleDeleteMetadata($event)"
            />
        }
    `,
    styleUrl: './feature-config.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        DialogService,
        provideValueEquality(),
    ]
})
export class FeatureConfigComponent {
    @Input({ required: true })
    spec!: RawFeatureSpec[]

    @Input()
    featureConfig: { [key: string]: RawFeatureConfig } = {}

    @Output()
    addMetadata = new EventEmitter<FeatureConfigImplAddMetadataEvent>();

    @Output()
    deleteMetadata = new EventEmitter<FeatureConfigImplDeleteMetadataEvent>();

    @Output()
    featureConfigChange = new EventEmitter<{ [key: string]: RawFeatureConfig }>();


    handleAddMetadata(value: FeatureConfigImplAddMetadataEvent) {
        console.log("handleAddMetadata", value);
        this.addMetadata.emit(value);
    }

    handleDeleteMetadata(value: FeatureConfigImplDeleteMetadataEvent) {
        this.deleteMetadata.emit(value);
    }

    handleFeatureConfigChange(featureLabel: string, featureConfig: RawFeatureConfig) {
        const newFeatureConfig = {
            ...this.featureConfig,
            [featureLabel]: featureConfig
        };
        this.featureConfigChange.emit(newFeatureConfig);
    }
}
