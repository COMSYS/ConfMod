import { PipelineFunction, StringPipelineFunctionParameter } from "./common";


const PF_Condition: PipelineFunction = {
  name: "condition",
  label: "Boolean Condition",
  description: "Turns the feature value into a boolean, depending on whether the condition is met",
  supportedDataTypes: ["float", "int", "string", "timestamp"],
  params: [
    new StringPipelineFunctionParameter(
      "Description",
      "The Condition in free text form, as this functionality is not actually implemented.",
      true
    )
  ]
};

export default PF_Condition;
