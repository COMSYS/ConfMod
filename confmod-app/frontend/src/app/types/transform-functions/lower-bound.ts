import { PipelineFunction, FloatPipelineFunctionParameter, BooleanPipelineFunctionParameter } from "./common";


const PF_LowerBound: PipelineFunction = {
  name: "lower_bound",
  label: "Lower Bound",
  description: "Set a lower bound on the values",
  supportedDataTypes: ["int", "float"],
  params: [
    new FloatPipelineFunctionParameter(
      "Bound",
      "The lower bound.",
      false
    ),
    new BooleanPipelineFunctionParameter(
      "Filter",
      "If checked, values smaller than the lower bound will be filtered out. If not checked, smaller values will be set equal to the lower bound.",
      false,
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

export default PF_LowerBound;
