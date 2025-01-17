import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'concat',
  standalone: true,
  pure: true,
})
export class ConcatPipe implements PipeTransform {

  transform<T = any>(value: T[], other: T[] | undefined): T[] {
    if (!other) {
      other = [];
    }
    return value.concat(other);
  }

}
