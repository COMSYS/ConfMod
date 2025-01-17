import { PipelineFunction } from "./common";


const PF_RelativeTimeseries: PipelineFunction = {
  name: "timeseries_to_relative",
  label: "Relative Timeseries",
  description: "Transforms an absolute timeseries to a relative timeseries.",
  supportedDataTypes: ["timestamp"],
  params: []
};

export default PF_RelativeTimeseries;
