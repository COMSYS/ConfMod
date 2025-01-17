import { Routes } from '@angular/router';
import { ConfigEditorComponent } from './routes/config-editor/config-editor.component';
import { DashboardComponent } from './routes/dashboard/dashboard.component';
import { ConfigEditorComponentStore } from './routes/config-editor/config-editor.store';
import { NewConfigComponent } from './routes/new-config/new-config.component';
import { NewConfigPageComponentStore } from './routes/new-config/new-config-page.component-store';
import { confirmDiscardUnsavedChanged } from './routes/config-editor/guards/confirm-discard-unsaved.guard';
import { resolveConfig } from './resolvers/config.resolver';
import { resolveModel } from './resolvers/model.resolver';
import { ScopeCompareComponent } from './routes/scope-compare/scope-compare.component';

export const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
    },
    {
        path: 'editor/:configName',
        component: ConfigEditorComponent,
        providers: [ConfigEditorComponentStore],
        canDeactivate: [ confirmDiscardUnsavedChanged() ]
    },
    {
        path: 'scope-compare/:slug',
        component: ScopeCompareComponent,
        resolve: {
            config: resolveConfig('slug'),
            model: resolveModel('slug'),
        },
    },
    {
        path: 'new-config',
        component: NewConfigComponent,
        //providers: [NewConfigPageComponentStore]
    }
];
