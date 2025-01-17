import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExtraMetadata } from '../../../types/config';

@Injectable()
export class ExtraMetadataService {

  protected readonly _extraMeta$: BehaviorSubject<ExtraMetadata[]> = new BehaviorSubject([] as ExtraMetadata[]);
  public get extraMeta$() {
    return this._extraMeta$.asObservable();
  }
  protected get currentValue() {
    return this._extraMeta$.getValue();
  }

  add(key: string, value: string) {
    if (this.hasKey(key)) {
      throw new Error(`Key ${key} already exists`);
    }
    this._extraMeta$.next([...this.currentValue, { key, value }]);
  }

  delete(key: string) {
    const filtered = this.currentValue.filter(meta => meta.key !== key);
    this._extraMeta$.next(filtered);
  }

  rename(oldKey: string, newKey: string, newValue?: string) {
    if (this.hasKey(newKey)) {
      throw new Error(`Key ${newKey} already exists`);
    }
    const idx = this.findKeyIndex(oldKey);
    if (idx < 0) {
      throw new Error(`Key ${oldKey} does not exist`);
    }
    if (!newValue) {
      newValue = this.currentValue[idx].value;
    }

    this._extraMeta$.next([...this.currentValue.slice(0, idx), { key: newKey, value: newValue }, ...this.currentValue.slice(idx + 1)]);
  }

  private findKeyIndex(key: string): number {
    return this.currentValue.findIndex((meta) => meta.key === key);
  }

  public hasKey(key: string): boolean {
    return this.findKeyIndex(key) >= 0;
  }
}
