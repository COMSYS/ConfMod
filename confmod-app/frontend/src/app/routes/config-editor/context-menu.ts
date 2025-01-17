import { MenuItem } from "primeng/api";
import { ConfigEditorComponent } from "./config-editor.component";

export const TAB_PANEL_CONTEXT_MENU = (self: ConfigEditorComponent): MenuItem[] => [
    {
        label: 'Rename',
        icon: 'pi pi-pencil',
        
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
    }
]