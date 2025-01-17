import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, booleanAttribute, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-collapse-button',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
    ],
    templateUrl: './collapse-button.component.html',
    styleUrl: './collapse-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapseButtonComponent {
    @Input({ transform: booleanAttribute })
    expanded = false;

    @Input()
    className!: string;

    @Output()
    expandedChange = new EventEmitter<boolean>();

    private _cdRef = inject(ChangeDetectorRef);

    public toggle(): void {
        this.expanded = !this.expanded;
        this.expandedChange.emit(this.expanded);
        this._cdRef.markForCheck();
    }
}
