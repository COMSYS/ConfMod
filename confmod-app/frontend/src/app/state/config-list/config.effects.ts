import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ConfigService, DefaultService } from "../../openapi";
import { ActivatedRoute, Router } from "@angular/router";
import { ConfigActions } from "./configs.actions";
import { concatMap, switchMap, tap } from "rxjs";

export const deleteConfigFromServer = createEffect(
    (actions$ = inject(Actions), apiService = inject(ConfigService), activeRoute = inject(ActivatedRoute), router = inject(Router)) =>
        actions$.pipe(
            ofType(ConfigActions.removeConfig),
            concatMap(({ slug }) => apiService.deleteModelAndConfigDeleteSlugDelete(slug).pipe(
                tap(() => {
                    const path = window.location.pathname;
                    if (path === `/editor/${slug}`) {
                        router.navigateByUrl("/");
                    }
                }),
            ))
        ),
    { functional: true, dispatch: false }
)