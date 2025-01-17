import { Pipe, type PipeTransform } from '@angular/core';

interface KeyValue<T> {
  readonly key: string;
  readonly value: T
}

@Pipe({
  name: 'appEntries',
  standalone: true,
  pure: true
})
/**
 * Transforms objects into an array of key-value pairs.
 * Does NOT sort the output, in contrast to the builtin keyvalue pipe.
 */
export class EntriesPipe implements PipeTransform {

  transform<T>(value: Record<string, T>): Array<KeyValue<T>> {
    const entries = Object.entries(value).map(([key, value]) => (
      {
        key: key,
        value: value
      }
    ));
    return entries;
  }

}
