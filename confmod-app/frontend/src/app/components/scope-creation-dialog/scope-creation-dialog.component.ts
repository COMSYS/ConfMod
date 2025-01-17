import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from 'primeng/inputtext';
import { ScopeConfigEditorComponent } from '../scope-config-editor/scope-config-editor.component';

@Component({
    selector: 'app-scope-creation-dialog',
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule,
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
        ScopeConfigEditorComponent
    ],
    templateUrl: './scope-creation-dialog.component.html',
    styleUrl: './scope-creation-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScopeCreationDialogComponent {
    protected dialogConfig = inject(DynamicDialogConfig);
    protected dialogRef = inject(DynamicDialogRef);

    protected name = new FormControl('', [Validators.required]);

    cancel() {
        this.dialogRef.close(null);
    }

    confirm() {
        const name = this.name.value!
        this.dialogRef.close(name);
    }
}
