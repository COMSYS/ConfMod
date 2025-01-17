import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from "@angular/router";
import { NewConfigComponent } from "./new-config.component";
import { Observable } from "rxjs";
import { inject } from "@angular/core";
import { ConfirmationService } from "primeng/api";

export const canDeactivateNewConfigRouteGuard: CanDeactivateFn<NewConfigComponent> = (
    component: NewConfigComponent,
    router: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Observable<boolean> | boolean => {
    if (component.model === null && component.config === null) {
        return true;
    }
    return component.confirmLeave();
}