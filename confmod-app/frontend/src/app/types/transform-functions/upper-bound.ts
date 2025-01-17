import { PipelineFunction, BooleanPipelineFunctionParameter, FloatPipelineFunctionParameter } from "./common";


const PF_UpperBound: PipelineFunction = {
  name: "upper_bound",
  label: "Upper Bound",
  description: "Set an upper bound on the values",
  supportedDataTypes: ["int", "float"],
  params: [
    new BooleanPipelineFunctionParameter(
      "Filter",
      "If checked, values greater than the lower bound will be filtered out. If not checked, greater values will be set equal to the upper bound.",
      false,
      false
    ) as any,
    new FloatPipelineFunctionParameter(
      "Bound",
      "The upper bound.",
      false
    ),
  ]
};

export default PF_UpperBound;
