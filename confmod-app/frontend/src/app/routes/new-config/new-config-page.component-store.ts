import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { HTTPValidationError, JsonDecodeError, RawConfmodConfigOutput, RawConfmodModelOutput, YamlDecodeError } from "../../openapi";
import { MenuItem } from "primeng/api";
import { filter, map } from "rxjs";
import { DecodeError, ErrorFileState, FileState, FileUploadError, GenericFileUploadError, ValidationError } from "./types";
import { FileUploadErrorEvent } from "../../components/file-upload/event.interface";
import { RawConfmodModelInput } from "../../openapi/model/rawConfmodModelInput";
import { RawConfmodConfigInput } from "../../openapi/model/rawConfmodConfigInput";





interface NewConfigPageState {
    activeTab: number;
    /**
     * Indicates if the page has unsaved changes
     */
    dirty: boolean;
    submitting: boolean;
    name: string;
    config: FileState<RawConfmodConfigOutput>,
    model: FileState<RawConfmodModelOutput>,
    steps: MenuItem[],
}

@Injectable()
export class NewConfigPageComponentStore extends ComponentStore<NewConfigPageState> {

    constructor() {
        super({
            activeTab: 0,
            dirty: false,
            submitting: false,
            name: "",
            config: { state: "empty" },
            model: { state: "empty" },
            steps: [
                { label: 'Choose Model' },
                { label: 'Import Config' },
                { label: 'Summary' }
            ]
        });
    }

    readonly hasConfig$ = this.select(state => state.config.state === "validated");
    readonly hasModel$ = this.select(state => state.model.state === "validated");
    readonly model$ = this.select(state => state.model);
    readonly modelError$ = this.model$.pipe(filter((model): model is ErrorFileState => model.state === "error"));
    readonly config$ = this.select(state => state.config);
    readonly configError$ = this.config$.pipe(filter((config): config is ErrorFileState => config.state === "error"));

    readonly viewModel$ = this.select({
        activeTab: this.select(state => state.activeTab),
        steps: this.select(state => state.steps),
        hasModel: this.hasModel$,
        hasConfig: this.hasConfig$,
        model: this.model$,
        config: this.config$,
        submitting: this.select(state => state.submitting),
    });

    public readonly setActiveTab = this.updater((state, idx: number) => {
        const { steps } = state;
        const nextTab = Math.max(0, Math.min(idx, steps.length - 1));
        return {
            ...state,
            activeTab: nextTab,
        };
    });

    public readonly nextTab = this.updater((state) => {
        const { steps, activeTab } = state;
        const nextTab = Math.min(activeTab + 1, steps.length - 1);

        return {
            ...state,
            activeTab: nextTab
        }
    });

    public readonly prevTab = this.updater((state) => {
        const { steps, activeTab } = state;
        const nextTab = Math.max(0, activeTab - 1);

        return {
            ...state,
            activeTab: nextTab
        }
    });

    public setModelErrorStateFromUploadError(event: FileUploadErrorEvent) {
        const file = event.file;
        const errBody: unknown = JSON.parse(event.response);
        let error: FileUploadError;
        switch (event.status) {
        case 400:
            error = {
            statusCode: 400,
            error: errBody as JsonDecodeError,

            } as DecodeError;
            break;
        case 422:
            error = {
                statusCode: 422,
                error: errBody as HTTPValidationError,
            } as ValidationError;
            break;
        default:
            error = {
            statusCode: event.status,
            error: errBody
            } as GenericFileUploadError;
            break;
        }
        this.setState((state) => ({
        ...state,
        model: {
            state: "error",
            fileName: file.name,
            fileSize: file.size,
            error: error,
        }
        }));
    }

    public setConfigErrorStateFromUploadError(event: FileUploadErrorEvent) {
        const file = event.file;
        const errBody: unknown = JSON.parse(event.response);
        let error: FileUploadError;
        switch (event.status) {
        case 400:
            error = {
            statusCode: 400,
            error: errBody as YamlDecodeError,

            } as DecodeError;
            break;
        case 422:
            error = {
                statusCode: 422,
                error: errBody as HTTPValidationError,
            } as ValidationError;
            break;
        default:
            error = {
            statusCode: event.status,
            error: errBody
            } as GenericFileUploadError;
            break;
        }
        this.setState((state) => ({
        ...state,
        config: {
            state: "error",
            fileName: file.name,
            fileSize: file.size,
            error: error,
        }
        }));
    }

    public isCurrentlySubmitting(): boolean {
        return this.get().submitting;
    }

    public getCurrentModel(): RawConfmodModelInput | null {
        const state = this.get();
        if (state.model.state !== "validated") {
            return null;
        }
        const model = state.model.result;
        return model;
    }

    public getCurrentConfig(): RawConfmodConfigInput | null {
        const state = this.get();
        if (state.config.state !== "validated") {
            return null;
        }
        const config = state.config.result;
        return config;
    }
}
