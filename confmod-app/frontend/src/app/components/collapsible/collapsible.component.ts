import { CommonModule } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CollapseButtonComponent } from '../collapse-button/collapse-button.component';
import { TemplateDirective } from '../common/template.directive';

@Component({
    selector: 'app-collapsible',
    standalone: true,
    imports: [
        CommonModule,
        ButtonModule,
        CollapseButtonComponent,
    ],
    templateUrl: './collapsible.component.html',
    styleUrl: './collapsible.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleComponent implements AfterContentInit {
    @Input()
    expanded: boolean = false;

    @Input()
    header?: string;

    @Output()
    expandedChange = new EventEmitter<boolean>();

    @ContentChild(TemplateDirective) headerTemplate?: TemplateDirective;

    private _cdRef = inject(ChangeDetectorRef);

    ngAfterContentInit(): void {
        if (!this.header && !this.headerTemplate) {
            throw new Error("Einer 'header' prop or a template for the header must be provided")
        }
    }

    /**
     * Toggles the collapsable from collapsed to expanded or vice versa.
     * Returns the state after the toggle as result.
     */
    public toggle(): boolean {
        this.expanded = !this.expanded;
        this.expandedChange.emit(this.expanded);
        this._cdRef.markForCheck();

        return this.expanded
    }

    public expand(): void {
        if (!this.expanded) {
            this.toggle();
        }
    }

    public collapse(): void {
        if (this.expanded) {
            this.toggle();
        }
    }
}
