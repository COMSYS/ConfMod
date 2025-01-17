import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, inject } from '@angular/core';
import { NgxControlValueAccessor } from 'ngxtension/control-value-accessor';
import { ExtraMetadataService } from './extra-metadata.service';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AddMetadataComponent } from './add-metadata/add-metadata.component';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { filter } from 'rxjs';
import { ExtraMetadata } from '../../../types/config';


@Component({
    selector: 'app-extra-metadata',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        FormsModule,
        AddMetadataComponent,
        ContextMenuModule,
        ConfirmDialogModule,
    ],
    templateUrl: './extra-metadata.component.html',
    styleUrl: './extra-metadata.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        { directive: NgxControlValueAccessor, inputs: ['value'], outputs: ['valueChange'] }
    ],
    providers: [ConfirmationService]
})
export class ExtraMetadataComponent {
    protected cva: NgxControlValueAccessor<ExtraMetadata[]> = inject(NgxControlValueAccessor);
    
    protected extraMetadataService = inject(ExtraMetadataService);
    protected extraMetadata$ = this.extraMetadataService.extraMeta$;
    protected confirmationService = inject(ConfirmationService);

    @ViewChild('cm')
    protected ctxMenu!: ContextMenu;
    protected selectedItem: string | null = null;
    protected ctxMenuItems: MenuItem[] = [
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => {
                if (!this.selectedItem) return;
                this.extraMetadataService.rename(this.selectedItem, "Object", "object");
            }
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => {
                if (this.selectedItem) {
                    this.requestDeletion(this.selectedItem);
                }
            },
        }
    ]

    handleAddMetadata({ key, value }: { key: string, value: string }) {
        console.log(key, value);
        this.extraMetadataService.add(key, value);
    }

    onContextMenu(event: Event, metadataKey: string) {
        this.selectedItem = metadataKey;
        this.ctxMenu.show(event);
    }

    onHide() {
        this.selectedItem = null;
    }

    requestDeletion(metadataKey: string) {
        this.confirmationService.confirm({
            header: `Confirm Deletion`,
            message: `Do you want to delete the following record: "${metadataKey}"?`,
            acceptButtonStyleClass: "p-button-danger p-button-text",
            rejectButtonStyleClass: "p-button-text",
            acceptIcon: "none",
            rejectIcon: "none",
            accept: () => {
                this.extraMetadataService.delete(metadataKey)
            }
        })
    }
}
