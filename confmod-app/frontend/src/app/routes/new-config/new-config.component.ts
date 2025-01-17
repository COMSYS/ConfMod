import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Injector, OnInit, runInInjectionContext, SecurityContext, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessagesModule } from "primeng/messages";
import { StepsModule } from 'primeng/steps';
import { first, map, Observable, Subject, switchMap, throttle } from 'rxjs';
import { FileUploadErrorEvent, FileUploadSuccess } from '../../components/file-upload/event.interface';
import { FileUploadComponent } from '../../components/file-upload/upload.component';
import { BASE_PATH, ConfigService, CreateModelAndConfig, ModelService, RawConfmodConfigOutput, RawConfmodModelOutput } from '../../openapi';
import { NewConfigPageComponentStore } from './new-config-page.component-store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ErrorFileState } from './types';
import { ToastModule } from 'primeng/toast';
import { ConfigAsyncValidators } from '../../validators/config-validators';
import { Store } from '@ngrx/store';
import { ConfigActions } from '../../state/config-list/configs.actions';

@Component({
  selector: 'app-new-config',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    StepsModule,
    FileUploadComponent,
    MessagesModule,
    ToastModule,
    ConfirmDialogModule,
    InputTextModule,
    ReactiveFormsModule
  ],
  templateUrl: './new-config.component.html',
  styleUrl: './new-config.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [MessageService, ConfirmationService, NewConfigPageComponentStore]
})
export class NewConfigComponent implements OnInit {
  protected injector = inject(Injector);
  private cdRef = inject(ChangeDetectorRef);
  protected baseUrl = inject(BASE_PATH);
  protected messages = inject(MessageService);
  protected sanitizer = inject(DomSanitizer);
  protected confirmationService = inject(ConfirmationService);
  protected router = inject(Router);
  protected globalState = inject(Store);
  protected componentStore = inject(NewConfigPageComponentStore);
  protected modelApi = inject(ModelService);
  protected configApi = inject(ConfigService);
  protected configValidators = inject(ConfigAsyncValidators);

  protected vm$ = this.componentStore.viewModel$;
  protected modelError$ = this.componentStore.modelError$;
  protected configError$ = this.componentStore.configError$;

  protected configName = new FormControl<string>("",
    {
      nonNullable: true,
      validators: [Validators.required],
      asyncValidators: [this.configValidators.uniqueName]
    }
  );

  ngOnInit(): void {
    console.log("NewConfigRoute initialiozed")
    this.initErrorHandler(this.componentStore.modelError$, "model");
    this.initErrorHandler(this.componentStore.configError$, "config");
  }

  stepNext(): void {
    this.componentStore.nextTab();
  }

  stepBack(): void {
    this.componentStore.prevTab();
  }

  public confirmLeave(): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      const emitResult = (result: boolean) => {
        subscriber.next(result);
        subscriber.complete();
      }

      this.confirmationService.confirm({
        header: 'Leave this page?',
        message: 'The config has not been saved yet. If you leave this page you need to reimport the files.',
        acceptLabel: 'Leave',
        acceptButtonStyleClass: 'p-button-danger p-button-outlined',
        acceptIcon: 'pi',
        rejectLabel: 'Stay on Page',
        rejectButtonStyleClass: 'p-button-outlined',
        rejectIcon: 'pi',
        accept: () => emitResult(true),
        reject: () => emitResult(false),
      })
    })
  }

  protected createConfig() {
    if (this.componentStore.isCurrentlySubmitting()) {
      return;
    }
    this.componentStore.setState(state => ({...state, submitting: true}));

    const body: CreateModelAndConfig = {
      name: this.configName.value,
      config: this.componentStore.getCurrentConfig(),
      model: this.componentStore.getCurrentModel(),
    }
    this.configApi.createModelAndConfigCreatePost(body).pipe(first()).subscribe({
      next: (result) => {
        // Add the new entry to the app bar
        this.globalState.dispatch(ConfigActions.createConfig({ name: result.name, slug: result.slug }));
        this.router.navigate(["editor", result.slug]);
      },
      complete: () => {
        console.log("Completed");
        this.componentStore.patchState({ submitting: false });
      }
    })
  }

  protected handleModelVerification(event: FileUploadSuccess) {
    const file = event.file;
    const parsedModel: RawConfmodModelOutput = JSON.parse(event.response);
    this.componentStore.setState((state) => ({
      ...state,
      model: {
        state: "validated",
        fileName: file.name,
        fileSize: file.size,
        result: parsedModel,
      }
    }));

    this.showSuccessToast("The model file is valid.")
  }

  handleModelUploadError(event: FileUploadErrorEvent) {
    this.componentStore.setModelErrorStateFromUploadError(event);
  }

  protected handleConfigVerification(event: FileUploadSuccess) {
    const file = event.file;
    const parsedModel: RawConfmodConfigOutput = JSON.parse(event.response);
    this.componentStore.setState((state) => ({
      ...state,
      config: {
        state: "validated",
        fileName: file.name,
        fileSize: file.size,
        result: parsedModel,
      }
    }));

    this.showSuccessToast("The config file is valid.");
  }

  protected handleConfigUploadError(event: FileUploadErrorEvent) {
    this.componentStore.setConfigErrorStateFromUploadError(event);
  }

  protected initErrorHandler(errorFileState$: Observable<ErrorFileState>, messageKey: string) {
    runInInjectionContext(this.injector, () => {
      errorFileState$.pipe(takeUntilDestroyed())
        .subscribe(error => {
          this.messages.clear(messageKey);
          this.messages.add({
            key: messageKey
          })
        });
    })
  }


  protected handleModelVerifiedError(err: any) {
    this.messages.clear("model");

    this.messages.add({
      key: "model",
      severity: "danger",
      icon: "pi pi-exclamation-triangle",
      summary: "Error while verifying model",
      detail: `
        <div>${err.error}</div>
        <pre>${err.message}</pre>
      `
    })
  }

  protected getObservationTableColspan(model: RawConfmodModelOutput) {
    const featureLengths = Object.values(model.head.observations).map(spec => spec.features.length)
    return Math.max(...featureLengths);
  }

  private showSuccessToast(message: string): void {
    this.messages.add({
      key: "toast",
      severity: "success",
      summary: "Success",
      detail: message,
      life: 5000,
    });
  }
}
