import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PipelineFunction } from '../../types/transform-functions';
import { ButtonModule } from 'primeng/button';
import { RawTransformFunc } from '../../openapi';

@Component({
    selector: 'app-pp-function-config-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule
    ],
    templateUrl: './pp-function-config-dialog.component.html',
    styleUrl: './pp-function-config-dialog.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformationFunctionConfigDialogComponent {
    protected dialogConfig = inject(DynamicDialogConfig);
    protected dialogRef = inject(DynamicDialogRef);

    protected function: PipelineFunction = this.dialogConfig.data;

    public cancel(): void {
        this.dialogRef.close(null);
    }

    public confirm() {
        const transformFunc: RawTransformFunc = {
            name: this.function.name,
            args: {}
        }
    }
}
