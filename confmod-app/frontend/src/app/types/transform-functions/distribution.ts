import { BooleanPipelineFunctionParameter, PipelineFunction } from "./common";

const PF_Distribution: PipelineFunction = {
  name: "distribution",
  label: "Distribution",
  description: "Calculates certain characteristics of the distribution of the data points",
  supportedDataTypes: ["int", "float"],
  params: ["Mean", "Scale", "Variance", "Median", "0.25 Quartile", "0.75 Quartile", "Quartile range"].map(quant =>
    new BooleanPipelineFunctionParameter(quant, `Calculate the ${quant} and
    include it in the output`, false, true)
  )
}

export default PF_Distribution;
