import { Directive, Input, TemplateRef, booleanAttribute, inject } from '@angular/core';

@Directive({
  selector: '[appTemplate]',
  standalone: true,
})
export class TemplateDirective {
  @Input()
  type: string | undefined;

  @Input({ alias: 'appTemplate', required: true })
  name!: string;

  public template: TemplateRef<any> = inject(TemplateRef);

  getType(): string {
    return this.name!
  }
}
