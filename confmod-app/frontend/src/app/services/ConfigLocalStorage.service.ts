import { Injectable, inject } from '@angular/core';
import { STORAGE_EVENT } from '@ng-web-apis/storage';

@Injectable({
  providedIn: 'root'
})
export class ConfigLocalStorageService {
  private storage = inject(STORAGE_EVENT)
  constructor() { }

}
