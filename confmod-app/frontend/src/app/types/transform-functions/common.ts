import { FAILSAFE_SCHEMA } from "js-yaml";
import { FeatureDataType } from "../model-header";

export interface PipelineFunction {
    name: string;
    label: string;
    description?: string;
    supportedDataTypes: FeatureDataType[];
    params: PipelineFunctionParameter[];
}

export type PipelineFunctionParameterType = "int" | "float" | "enum" | "string" | "boolean"

export type PipelineFunctionParameter = IntPipelineFunctionParameter | EnumPipelineFunctionParameter | FloatPipelineFunctionParameter | StringPipelineFunctionParameter | BooleanPipelineFunctionParameter;


export abstract class BasePipelineFunctionParam<T, PFPT extends PipelineFunctionParameterType = PipelineFunctionParameterType> {
    public abstract readonly type: PFPT;

    constructor(
        public readonly name: string,
        public readonly description: string,
        public readonly optional: boolean,
        public readonly defaultValue?: T,
        protected readonly validateFn?: (value: T) => boolean | string,
    ) {}

    public validate(value: T): boolean | string {
        if (this.validateFn) {
            return this.validateFn(value);
        }
        return true;
    }
}

export class IntPipelineFunctionParameter extends BasePipelineFunctionParam<number, "int"> {
    public override readonly type = "int";

    constructor(
        name: string,
        description: string,
        optional: boolean,
        defaultValue?: number,
        validateFn?: (value: number) => boolean | string,
    ) {
        super(name, description, optional, defaultValue, validateFn)
    }

    override validate(value: number): string | boolean {
        if(!Number.isInteger(value)) {
            return "Argument must be of type int"
        }
        return super.validate(value);
    }
}

export class FloatPipelineFunctionParameter extends BasePipelineFunctionParam<number, "float"> {
    public override readonly type = "float";

    constructor(
        name: string,
        description: string,
        optional: boolean,
        defaultValue?: number,
        validateFn?: (value: number) => boolean | string,
    ) {
        super(name, description, optional, defaultValue, validateFn)
    }
}

export class EnumPipelineFunctionParameter extends BasePipelineFunctionParam<string, "enum"> {
    public override readonly type = "enum";

    constructor(
        name: string,
        description: string,
        public readonly values: string[],
        optional: boolean,
        defaultValue?: string,
        validateFn?: (value: string) => boolean | string,
    ) {
        super(name, description, optional, defaultValue, validateFn)
    }

    override validate(value: string): string | boolean {
        const isContained = this.values.indexOf(value) >= 0;
        if (!isContained) {
            return `${value} is not a valid value.`
        }
        return super.validate(value)
    }
}

export class BooleanPipelineFunctionParameter extends BasePipelineFunctionParam<boolean, "boolean"> {
    public override readonly type = "boolean"

    constructor(
        name: string,
        description: string,
        optional: boolean,
        defaultValue?: boolean,
        validateFn?: (value: boolean) => boolean | string,
    ) {
        super(name, description, optional, defaultValue, validateFn)
    }
}

export class StringPipelineFunctionParameter extends BasePipelineFunctionParam<string, "string"> {
    public override readonly type = "string";

    constructor(
        name: string,
        description: string,
        optional: boolean,
        public readonly isFreeText: boolean = false,
        defaultValue?: string,
        validateFn?: (value: string) => boolean | string,
    ) {
        super(name, description, optional, defaultValue, validateFn)
    }
}


