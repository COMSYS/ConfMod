import { PipelineFunction, BooleanPipelineFunctionParameter, FloatPipelineFunctionParameter } from "./common";


const PF_Clamp: PipelineFunction = {
  name: "clamp",
  label: "Clamp",
  description: "Clamp a value between a minimum and a maximum value",
  supportedDataTypes: ["int", "float"],
  params: [
    new BooleanPipelineFunctionParameter(
      "Filter",
      "If checked, values outside the interval will be filtered out. If unchecked, values outside of the interval will be rounded to the nearest boundary.",
      false,
      false
    ),
    new FloatPipelineFunctionParameter(
      "Min",
      "The lower bound of the clamp interval.",
      false
    ),
    new FloatPipelineFunctionParameter(
      "Max",
      "The upper bound of the clamp interval.",
      false
    ),
    new BooleanPipelineFunctionParameter(
      "ToBool",
      "Transform strings that match to `true` and strings that don't match to `false`",
      true,
      false
    )
  ]
};

export default PF_Clamp;
