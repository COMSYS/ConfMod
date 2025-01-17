import { BooleanPipelineFunctionParameter, IntPipelineFunctionParameter, PipelineFunction, StringPipelineFunctionParameter } from "./common";

const PF_K_Anomymity: PipelineFunction = {
  name: "k_anomymity",
  label: "Ensure K-Anomymity",
  description: "Only includes the feature if k-anonymity is given.\nIf an element cannot be uniquely assigned to a class the operation fails.",
  supportedDataTypes: ["enum", "int", "float"],
  params: [
    new IntPipelineFunctionParameter("k", "The number of elements each class must at least have", false),
    new BooleanPipelineFunctionParameter("Equality", "Use equality for eqivalence. Only equal values are considered equivalent", false, false),
    new BooleanPipelineFunctionParameter("Prefix", "Use prefix matching for equivalence", false, false),
    new IntPipelineFunctionParameter("Prefix length", "Length of the prefix. Numbers will be coerced to a string if this operation is used.", false, undefined),
    new BooleanPipelineFunctionParameter("Enum Variants", "Only applicable if feature type is an enum. Explicitly lists the equavalence classes", false, false),
    new StringPipelineFunctionParameter("Variants", "Comma separated list of the variants in the form \"[A, B], [C], ...\"", false),
    new BooleanPipelineFunctionParameter("Number Ranges", "Only applicable for numeric features. List intervals of numbers which should be equivalent.", false),
    new StringPipelineFunctionParameter("Intervals", "Comma separated list of intervals in the form \"(-Inf, 0), [0, 42), [42, 1337), [1337, Inf)\"", false),
  ]
};

export default PF_K_Anomymity;
