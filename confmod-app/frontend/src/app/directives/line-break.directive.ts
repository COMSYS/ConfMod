import { Directive, ElementRef, HostAttributeToken, HostBinding, Input, inject } from '@angular/core';

@Directive({
  selector: '[appLineBreak]',
  standalone: true,
})
export class LineBreakDirective {
  @Input()
  set text(value: string) {
    this.textWithBrs = value.replaceAll("\n", "<br>");
  }
  
  @HostBinding('innerHtml')
  protected textWithBrs: string = '';
}
