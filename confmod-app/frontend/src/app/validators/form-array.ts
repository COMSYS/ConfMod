import { AbstractControl, FormArray, ValidatorFn } from "@angular/forms";

function controlIsFormArray(control: AbstractControl): control is FormArray {
    return typeof (<FormArray> control).length === "number";
}

interface ValidateArrayUniqueOptions<T> {
    path?: string | null;
    hashFn?: (obj: T) => string;
}

export function validateArrayUnique<T = any>({ path = null, hashFn }: ValidateArrayUniqueOptions<T>): ValidatorFn {
  return (formArray: AbstractControl) => {
    if (!controlIsFormArray(formArray)) {
        throw new Error("validateArrayUnique must be applied to a FormArray instance")
    }
    const valuesSoFar = new Set<T>();

    for (let i = 0; i < formArray.length; i++) {
      const control = typeof path === "string" ? formArray.at(i).get(path) : formArray.at(i);
      if (control === null) {
        console.error(`FormArray instance has no child element reachable with path "${path}}"`)
        continue;
      }
      const value = hashFn ? hashFn(control.value) : control.value;
      if (valuesSoFar.has(value)) {
        return {
            arrayUnique: control.value,
        };
      }
      valuesSoFar.add(value);
    }

    return null;
  }
}
