import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ConfigService } from './openapi';
import { selectAppBarMenuItems } from './state/app-bar/menu-items.selector';
import { ConfigActions } from './state/config-list/configs.actions';
import { ConfmodConfig } from './types/config';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MenubarModule,
    ContextMenuModule,
    ConfirmDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [ ConfirmationService ]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private store = inject(Store);
  private configApi = inject(ConfigService);
  private confirmationService = inject(ConfirmationService);

  @ViewChild('cm')
  protected configContextMenu!: ContextMenu;
  private selectedConfig: { name: string, slug: string } | null = null;
  protected contextMenuItems: MenuItem[] = [
    {
      label: "Delete",
      icon: 'pi pi-trash',
      command: () => { this.confirmConfigDeletion() }
    }
  ]

  constructor() {
  }

  ngOnInit(): void {
    this.configApi.getConfigsConfigGet().subscribe({
      next: (configs) => this.store.dispatch(ConfigActions.retrieveConfigs({ configs: configs }))
    })
  }

  protected menuItems$ = this.store.select(selectAppBarMenuItems);

  protected configToMenuItem(config: ConfmodConfig): MenuItem {
    return {
      label: config.name,
      icon: 'pi pi-file-edit',
      routerLink: ['editor', config.name],
    }
  }

  handleConfigContextmenu(item: MenuItem, event: Event) {
    if ("type" in item && item["type"] === "config") {
      const model: { name: string, slug: string } = item["model"]!;
      this.selectedConfig = {
        name: model.name,
        slug: model.slug
      };

      this.configContextMenu.show(event);
    }
  }

  private confirmConfigDeletion() {
    this.confirmationService.confirm({
      header: `Delete Config \"${this.selectedConfig?.name}\"`,
      message: "This will permanently remove the config file.<br>If you want to make changes to this config later on, please export it before deleting.",
      accept: () => {
        if (this.selectedConfig) {
          this.store.dispatch(ConfigActions.removeConfig({ slug: this.selectedConfig.slug }))
          this.selectedConfig = null;
          // Todo: Handle navigation if we are currently on this route
        }
      },
      reject: () => {
        this.selectedConfig = null;
      }
    })
  }
}
