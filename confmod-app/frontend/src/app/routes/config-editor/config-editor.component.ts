import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, InjectionToken, OnInit, ViewChild, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from "primeng/inputtext";
import { TabMenuModule } from 'primeng/tabmenu';
import { BehaviorSubject, filter, map, switchMap, take } from 'rxjs';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ScopeConfigEditorComponent } from '../../components/scope-config-editor/scope-config-editor.component';
import { TabViewModule } from 'primeng/tabview';
import { ExtraMetadataService } from '../../components/metadata-config/extra-metadata/extra-metadata.service';
import { SkeletonModule } from 'primeng/skeleton';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { TAB_PANEL_CONTEXT_MENU } from './context-menu';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfigEditorComponentStore, IActiveTab } from './config-editor.store';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ObservationConfigAddMetadataEvent, ObservationConfigDeleteMetadataEvent } from '../../components/observation-config/observation-config.component';
import { ConfigService, ModelService, ConfmodModelAddMetadata, ConfmodModelObservationCreate } from '../../openapi';
import { RawScopeConfigInput } from '../../openapi/model/rawScopeConfigInput';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfigExportDialogComponent, ConfigExportDialogInputData, ConfigExportDialogOutput } from '../../components/config-export-dialog/config-export-dialog.component';
import { FileDownloadService } from '../../services/file-download.service';
import { SplitButtonModule } from "primeng/splitbutton";
import { MultiSelectModule } from 'primeng/multiselect';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MODEL_CATEGORIES } from '../../util/providers/model-categories.provider';


const MODEL_CATEG_SELECT_OPTIONS = new InjectionToken<Array<{ label: string, value: string }>>("Options for Model Catagory Select-Dropdown")

@Component({
    selector: 'app-config-editor',
    standalone: true,
    imports: [
        CommonModule,
        InputTextModule,
        TabMenuModule,
        ButtonModule,
        DynamicDialogModule,
        ScopeConfigEditorComponent,
        TabViewModule,
        SkeletonModule,
        ContextMenuModule,
        TabMenuModule,
        ConfirmDialogModule,
        SplitButtonModule,
        MultiSelectModule,
        ReactiveFormsModule,
    ],
    templateUrl: './config-editor.component.html',
    styleUrl: './config-editor.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        DialogService,
        ExtraMetadataService,
        ConfirmationService,
        {
          provide: MODEL_CATEG_SELECT_OPTIONS,
          useFactory: (categories: string[]) =>
            categories.map(
              category => ({ label: category, value: category })
            ),
          deps: [MODEL_CATEGORIES]
        }
    ],
    host: {
        'class': 'container mx-auto'
    }
})
export class ConfigEditorComponent implements OnInit {
    private _destroyRef = inject(DestroyRef);
    protected dialog = inject(DialogService);
    private activatedRoute = inject(ActivatedRoute);
    private componentStore = inject(ConfigEditorComponentStore);
    public confirmationService = inject(ConfirmationService);
    private fileDownloadService = inject(FileDownloadService);
    private configService = inject(ConfigService);
    private modelService = inject(ModelService);

    protected activeItemIdx = 0;
    protected activeTabIndex$ = new BehaviorSubject<number>(0);

    protected slug: string = "";

    protected modelCategoriesSelectOptions = inject(MODEL_CATEG_SELECT_OPTIONS);
    protected selectedCategories = new FormControl<string[]>([]);

    protected vm$ = this.componentStore.viewModel$;

    private selectedScopeForContextMenu: string | null = null;
    @ViewChild('cm') protected tabPanelCm!: ContextMenu;
    protected tabPanelCmItems = TAB_PANEL_CONTEXT_MENU(this);

    protected exportSplitButtonMenu: MenuItem[] = [
      {
        label: 'Export Model',
        icon: "pi pi-download",
        command: () => { this.handleModelExport() }
      }
    ];


    ngOnInit(): void {
      this.activatedRoute.paramMap.pipe(
        takeUntilDestroyed(this._destroyRef),
        map(params => params.get("configName")!)
      ).subscribe((slug) => {
        this.slug = slug;
        this.componentStore.load(slug);

      });

      this.componentStore.modelCategories$
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((categories: string[]) => {
          this.selectedCategories.setValue([...categories], { emitEvent: false })
        });

      this.selectedCategories.valueChanges
        .pipe(takeUntilDestroyed(this._destroyRef), filter((selected): selected is string[] => !!selected))
        .subscribe((selectedCategories: string[]) => {
          this.handleSelectedCategoryUpdate(selectedCategories);
        })
    }

    protected handleActiveItemChange(event: MenuItem) {
      const menuItemInfo: IActiveTab = event["menuItemInfo"];
      this.componentStore.setActiveTab(menuItemInfo);
      if (menuItemInfo.type === "scope") {
        this.componentStore.patchState({
          selectedScope: menuItemInfo.id,
        })
      }
    }

    protected handleAddFeatureMetadata(event: ObservationConfigAddMetadataEvent) {
      console.log("handlingAddFeatureMetadata", event);
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) {
        return;
      }
      this.componentStore.addFeatureMetadata({
        ...event,
        slug: slug
      });
    }

    protected handleDeleteFeatureMetadata(event: ObservationConfigDeleteMetadataEvent) {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) return;
      this.componentStore.deleteFeatureMetadata({
        ...event,
        slug: slug
      });
    }

    protected handleAddModelMetadata(event: ConfmodModelAddMetadata) {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) return;
      this.componentStore.addModelMetadata({
        slug: slug,
        body: event
      });
    }

    handleDeleteModelMetadata(metadataKey: string) {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) return;
      this.componentStore.deleteModelMetadata({
        slug: slug,
        key: metadataKey,
      });
    }

    handleAddObservation(event: ConfmodModelObservationCreate) {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) return;
      this.componentStore.addObservation({
        slug: slug,
        body: event
      });
    }

    handleDeleteObservation(label: string) {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) return;
      this.componentStore.deleteObservation({
        slug: slug,
        label: label,
      });
    }

    protected handleScopeConfigChange(scopeName: string, scopeConfig: RawScopeConfigInput) {
      this.componentStore.setScopeConfig({ scopeName, scopeConfig });
    }

    protected saveConfig() {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) return;
      this.componentStore.saveConfig(slug);
    }

    protected handleConfigExport() {
      const slug = this.componentStore.getCurrentSlug();
      const config = this.componentStore.getCurrentConfig();
      if (slug === null || config === null) {
        return;
      }

      const scopes = Object.keys(config.scopes);
      const dialogData: ConfigExportDialogInputData = {
        slug: slug,
        scopes: scopes,
      };

      const dialogRef = this.dialog.open(ConfigExportDialogComponent, {
        header: `Export Config`,
        data: dialogData,
      });

      dialogRef.onClose.pipe(
        take(1),
        filter(result => !!result),
        switchMap((result: ConfigExportDialogOutput) =>
          this.configService.exportConfigConfigSlugExportGet(slug, result.exportedScopes).pipe(
            map(config => ({
              config: config,
              filename: result.filename
            }))
          )
        )
      ).subscribe(filedata => {
        console.log("Config Export Output", filedata);
        const blob = new Blob([filedata.config], { type: "application/yaml" })
        this.fileDownloadService.downloadBlob(blob, filedata.filename);
      });
    }

    protected handleModelExport() {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) {
        return;
      }
      this.modelService.exportModelModelSlugExportGet(slug)
        .subscribe((model) => {
          this.fileDownloadService.downloadJson(model.model);
        });
    }

    protected handleSelectedCategoryUpdate(selectedCategories: string[]) {
      const slug = this.componentStore.getCurrentSlug();
      if (slug === null) {
        return;
      }
      this.componentStore.updateSelectedModelCategories({ slug: slug, categories: selectedCategories });
    }
}
