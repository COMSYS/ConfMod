import { CanDeactivateFn } from "@angular/router";
import { ConfigEditorComponent } from "../config-editor.component";
import { ConfigEditorComponentStore } from "../config-editor.store";
import { inject } from "@angular/core";
import { Subject } from "rxjs";

export function confirmDiscardUnsavedChanged(): CanDeactivateFn<ConfigEditorComponent> {
    return (component: ConfigEditorComponent) => {
        const configEditorComponentStore = inject(ConfigEditorComponentStore);

        const changesSaved = configEditorComponentStore.getChangesSaved();

        console.log("Changes saved?", changesSaved);

        if(changesSaved) {
            return true;
        }

        const confirmNavigation = new Subject<boolean>();

        component.confirmationService.confirm({
            header: "Unsaved changes will be lost!",
            message: "You have made changes that were not saved. If you leave, changes made to that config will be lost.",
            acceptLabel: "Discard Changes",
            acceptIcon: "pi",
            acceptButtonStyleClass: "p-button-danger",
            rejectLabel: "Cancel",
            rejectIcon: "pi",
            rejectButtonStyleClass: "p-button-secondary",
            accept: () => {
                confirmNavigation.next(true);
                confirmNavigation.complete();
            },
            reject: () => {
                confirmNavigation.next(false);
                confirmNavigation.complete();
            },
        });
    
        return confirmNavigation.asObservable();
    }
}