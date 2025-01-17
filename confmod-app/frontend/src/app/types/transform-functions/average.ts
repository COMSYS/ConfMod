import { PipelineFunction } from "./common";


const PF_Average: PipelineFunction = {
  name: "avg",
  label: "Average",
  description: "Returns the average of the data in the payload.\nIf applied at observation level, cuts down the number of entries to one.",
  supportedDataTypes: ["int", "float"],
  params: [],
};

export default PF_Average;
