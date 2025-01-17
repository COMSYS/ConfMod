import { PipelineFunction, StringPipelineFunctionParameter, BooleanPipelineFunctionParameter } from "./common";


const PF_Regex: PipelineFunction = {
  name: "match_re",
  label: "Match RegEx",
  description: "Matches the value against a regex pattern",
  supportedDataTypes: ["string"],
  params: [
    new StringPipelineFunctionParameter(
      "Pattern",
      "A Regular Expression Pattern",
      false
    ),
    new BooleanPipelineFunctionParameter(
      "Filter",
      "Check, if the values for non matching strings should be filtered out",
      false,
      true
    ),
    new BooleanPipelineFunctionParameter(
      "ToBool",
      "Transform strings that match to `true` and strings that don't match to `false`",
      true,
      false
    )
  ]
};

export default PF_Regex;
