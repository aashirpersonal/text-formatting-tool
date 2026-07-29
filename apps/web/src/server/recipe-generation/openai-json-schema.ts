/**
 * Prepare a Zod-derived JSON Schema for OpenAI Structured Outputs (strict mode).
 *
 * OpenAI requires:
 * - every object to set additionalProperties: false
 * - unions expressed as anyOf (oneOf is rejected)
 *
 * Does not mutate the input schema.
 */
export function prepareJsonSchemaForOpenAI(
  schema: Record<string, unknown>,
): Record<string, unknown> {
  const clone = structuredClone(schema) as Record<string, unknown>;
  delete clone.$schema;
  normalizeForOpenAIStrict(clone);
  return clone;
}

function normalizeForOpenAIStrict(node: unknown): void {
  if (!node || typeof node !== 'object') {
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) {
      normalizeForOpenAIStrict(item);
    }
    return;
  }

  const record = node as Record<string, unknown>;

  // OpenAI Structured Outputs rejects oneOf; anyOf is the supported union form.
  if (Array.isArray(record.oneOf) && record.anyOf === undefined) {
    record.anyOf = record.oneOf;
    delete record.oneOf;
  }

  const type = record.type;
  const isObjectType = type === 'object' || (Array.isArray(type) && type.includes('object'));

  if (isObjectType) {
    record.additionalProperties = false;
  }

  // Recurse into nested schema nodes. Property maps are not schemas themselves;
  // walk each property / definition value explicitly.
  if (
    record.properties &&
    typeof record.properties === 'object' &&
    !Array.isArray(record.properties)
  ) {
    for (const value of Object.values(record.properties as Record<string, unknown>)) {
      normalizeForOpenAIStrict(value);
    }
  }
  if (record.$defs && typeof record.$defs === 'object' && !Array.isArray(record.$defs)) {
    for (const value of Object.values(record.$defs as Record<string, unknown>)) {
      normalizeForOpenAIStrict(value);
    }
  }
  if (
    record.definitions &&
    typeof record.definitions === 'object' &&
    !Array.isArray(record.definitions)
  ) {
    for (const value of Object.values(record.definitions as Record<string, unknown>)) {
      normalizeForOpenAIStrict(value);
    }
  }
  if (record.items) {
    normalizeForOpenAIStrict(record.items);
  }
  if (record.anyOf) {
    normalizeForOpenAIStrict(record.anyOf);
  }
  if (record.oneOf) {
    normalizeForOpenAIStrict(record.oneOf);
  }
  if (record.allOf) {
    normalizeForOpenAIStrict(record.allOf);
  }
  if (record.not) {
    normalizeForOpenAIStrict(record.not);
  }
  if (record.if) {
    normalizeForOpenAIStrict(record.if);
  }
  if (record.then) {
    normalizeForOpenAIStrict(record.then);
  }
  if (record.else) {
    normalizeForOpenAIStrict(record.else);
  }
  if (record.prefixItems) {
    normalizeForOpenAIStrict(record.prefixItems);
  }
  if (record.contains) {
    normalizeForOpenAIStrict(record.contains);
  }
  if (record.propertyNames) {
    normalizeForOpenAIStrict(record.propertyNames);
  }
  if (record.dependentSchemas) {
    normalizeForOpenAIStrict(record.dependentSchemas);
  }
}
