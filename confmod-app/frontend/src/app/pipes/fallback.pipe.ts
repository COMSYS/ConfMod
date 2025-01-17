import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appFallback',
  standalone: true,
  pure: true,
})
/**
 * Provides a fallback value should she input value be `null` or `undefined`
 */
export class FallbackPipe implements PipeTransform {

  transform<T>(value: T | undefined | null, fallbackValue: T): T {
    return value ?? fallbackValue;
  }
}
