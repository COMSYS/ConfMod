import { PipelineFunction } from "./common";


const PF_HomomorphEncrypt: PipelineFunction = {
  name: "homomorph_encrypt",
  label: "Homomorphic Encryption",
  description: "Apply homomorphic encryption to the feature, allowing computations of cyphertext.\nHint: This is just a placeholder, so no parameters can be configured.",
  supportedDataTypes: ["int"],
  params: []
};

export default PF_HomomorphEncrypt;
