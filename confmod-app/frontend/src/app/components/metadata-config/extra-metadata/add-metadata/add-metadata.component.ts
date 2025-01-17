import { CommonModule, isPlatformWorkerApp } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { snakeCase } from "lodash";
import { ConfmodModelAddMetadata } from '../../../../openapi';

@Component({
    selector: 'app-add-metadata',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        ReactiveFormsModule,
        InputTextModule
    ],
    templateUrl: './add-metadata.component.html',
    styleUrl: './add-metadata.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMetadataComponent implements OnInit {
    @Output()
    addMetadata = new EventEmitter<ConfmodModelAddMetadata>();

    protected destroyRef = inject(DestroyRef);

    protected key = new FormControl<string>('', { nonNullable: true });
    protected value = new FormControl<string>('', { nonNullable: true, });

    ngOnInit(): void {
        this.key.valueChanges.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((key => {
            if (key.match(/\s$/)) {
                return;
            }
            this.key.setValue(snakeCase(key), { emitEvent: false });
        }));
    }

    handleSubmit(event: Event) {
        event.preventDefault();
        console.log(event);

        this.addMetadata.emit({
            key: snakeCase(this.key.value),
            value: this.value.value,
        });

        this.key.reset('');
        this.value.reset('');
    }
}
