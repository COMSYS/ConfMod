import { PipelineFunction, IntPipelineFunctionParameter, EnumPipelineFunctionParameter } from "./common";


const PF_RoundFloat: PipelineFunction = {
  name: "round_float",
  label: "Round",
  description: "Round a floating point number.\n To round to an int, set a precision of 0",
  supportedDataTypes: ["float"],
  params: [
    new IntPipelineFunctionParameter(
      "Precision",
      "Number of decimal places to round to.\nSet to 0 to round a float to an int.",
      false,
      0
    ),
    new EnumPipelineFunctionParameter(
      "Method",
      "The rounding meethod to use.\nNearest: round to the nearest number.\nUp: always round up.\nDown: always round down\nSymmetrical: Use symmetrical rounding.",
      ["Round to Nearest", "Round Up", "Round Down", "Symmetrical"],
      false,
      "Nearest"
    )
  ]
};

export default PF_RoundFloat;

