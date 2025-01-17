import { PipelineFunction, IntPipelineFunctionParameter } from "./common";


const PF_Sample: PipelineFunction = {
  name: "sample_subset",
  label: "Sample",
  description: "Sample a subset of the feature data points.",
  supportedDataTypes: ["float", "int", "string"],
  params: [
    new IntPipelineFunctionParameter(
      "Interval",
      "Determines how often points are samples. If this parameter is k, every k-th datapoint will be sampled.",
      false
    ),
    new IntPipelineFunctionParameter(
      "Offset",
      "Determines where to start sampling. If this parameter is k, start with the (k+1)-th datapoint,",
      true,
      0
    )
  ]
};

export default PF_Sample;
