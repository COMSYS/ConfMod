import { PipelineFunction, FloatPipelineFunctionParameter } from "./common";


const PF_Normalize: PipelineFunction = {
  name: "normalize",
  label: "Normalize",
  description: "Normalizes the values into the interval [0, 1]",
  supportedDataTypes: ["float", "int"],
  params: [
    new FloatPipelineFunctionParameter(
      "Min Value",
      "The minimal value. Represents 0 in the normalized interval. By default this will be the minimal value present in the dataset for this feature.",
      true
    ),
    new FloatPipelineFunctionParameter(
      "Max Value",
      "The maximum value. Represents 1 in the normalized interval. By default this will be the maximum value present in the dataset for this feature.",
      true
    )
  ]
};

export default PF_Normalize;
