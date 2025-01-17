import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'fn-call',
  standalone: true,
})
export class CallPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return value;
  }

}
