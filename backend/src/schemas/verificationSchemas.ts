import { Rules, type SchemaDefinition } from "../middleware/validator.js";

export const createVerificationRequestSchema: SchemaDefinition = {
  templateId: [Rules.required, Rules.isString],
  callbackUrl: [Rules.isString],
};

export const submitProofSchema: SchemaDefinition = {
  proofBytes: [Rules.required, Rules.isString],
  publicInputs: [Rules.required],
};

export const registerUserSchema: SchemaDefinition = {
  email: [Rules.required, Rules.isEmail],
  password: [Rules.required, Rules.minLength(8)],
  name: [Rules.isString],
};

export const issueCredentialSchema: SchemaDefinition = {
  subjectAddress: [Rules.required, Rules.isString, Rules.isHex],
  schemaType: [Rules.required, Rules.isString],
  claims: [Rules.required],
};
