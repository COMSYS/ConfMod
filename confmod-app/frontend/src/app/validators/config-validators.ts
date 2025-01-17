import { inject } from "@angular/core";
import { createInjectable } from "ngxtension/create-injectable";
import { ConfigService, ValidatorsService } from "../openapi";
import { AbstractControl, AsyncValidatorFn } from "@angular/forms";
import { catchError, EMPTY, map } from "rxjs";

export const ConfigAsyncValidators = createInjectable(() => {
    const validatorApi = inject(ValidatorsService);

    const uniqueName: AsyncValidatorFn = (control: AbstractControl<string>) => {
        const configName = control.value;
        return validatorApi.validateNameDoesNotExistValidateConfigUniqueNameGet(configName, "response").pipe(
            map(response => {
                // A successful validation returns 204 with no content
                if (response.status === 204) {
                    return null;
                }
                const body = response.body!;
                return {
                    [body.error_type!]: body.message
                }
            }),
            catchError((err: any) => {
                console.log(err);
                return EMPTY;
            })
        )
    }

    return {
        uniqueName,
    }
})