import { PipelineFunction, StringPipelineFunctionParameter } from "./common";


const PF_Aggregate: PipelineFunction = {
  name: "aggregate",
  label: "Aggregate",
  description: "Aggregates the feature values.",
  supportedDataTypes: ["float", "int"],
  params: [
    new StringPipelineFunctionParameter(
      "Description",
      "The aggregation method in free text form, as this functionality is not actually implemented.",
      true
    )
  ]
};

export default PF_Aggregate;
