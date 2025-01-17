import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { ModelMetadata } from '../../../types/model-header';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { provideValueEquality } from '../../../util/providers/object-equality';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-model-metadata',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        CheckboxModule,
        ConfirmDialogModule,
        ContextMenuModule
    ],
    templateUrl: './model-metadata.component.html',
    styleUrl: './model-metadata.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        { directive: NgxControlValueAccessor, inputs: ['value'], outputs: ['valueChange']}
    ],
    providers: [ ConfirmationService, provideValueEquality() ]
})
export class ModelMetadataComponent implements OnInit {
    private destroyRef = inject(DestroyRef);
    private confirmationService = inject(ConfirmationService);

    @Input({ required: true })
    metadata!: ModelMetadata;

    @Input({ required: true })
    set metadataConfig(config: string[] | undefined) {
        if (config === undefined) {
            return;
        }
        this._metadataConfig = [...config];
        this.metadataFormControl.setValue(this._metadataConfig, { emitEvent: false });
    }
    private _metadataConfig: string[] = [];

    @Input({ required: true })
    scopeName!: string;

    @Output()
    deleteMetadata = new EventEmitter<string>();

    @Output()
    metadataConfigChange = new EventEmitter<string[]>();

    protected cva: NgxControlValueAccessor<string[]> = inject(NgxControlValueAccessor);

    protected metadataFormControl = new FormControl<string[]>([], { nonNullable: true })

    @ViewChild('ctx')
    protected contextMenu!: ContextMenu;
    private selectedMetadata: { key: string, value: string } | null = null;
    protected ctxMenuItems: MenuItem[] = [
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => this.confirmMetadataDeletion()
        }
    ]

    ngOnInit(): void {
        this.metadataFormControl.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((metadata) => {
            this.metadataConfigChange.emit(metadata);
        })
    }

    public selectAll(): void {
        const metadata = Object.keys(this.metadata);
        const value = { ...this.cva.value, metadata: metadata };
        this.cva.writeValue(value);   
    }

    public deselectAll() {
        const value = { ...this.cva.value, metadata: [] };
        this.cva.writeValue(value);
    }

    openContextMenu(metadataKey: string, metadataValue: string, event: Event) {
        this.selectedMetadata = { key: metadataKey, value: metadataValue };
        this.contextMenu.show(event);
    }

    protected confirmMetadataDeletion() {
        this.confirmationService.confirm({
            header: `Delete Metadata \"${this.selectedMetadata!.key}\" from Model?`,
            message: "This will delete this metadata item from the model for all scopes.<br>This action can not be undone!",
            accept: () => {
                this.deleteMetadata.emit(this.selectedMetadata!.key);
                this.selectedMetadata = null;
            },
            reject: () => {
                this.selectedMetadata = null;
            }
        })
    }
}
