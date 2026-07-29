import { describe, expect, it } from 'vitest';
import { getRecipeGenerationResultJsonSchema } from '@tft/transformation-schema';
import { prepareJsonSchemaForOpenAI } from './openai-json-schema';

function collectStrictnessIssues(node: unknown, path = '$'): string[] {
  if (!node || typeof node !== 'object') {
    return [];
  }
  if (Array.isArray(node)) {
    return node.flatMap((item, index) => collectStrictnessIssues(item, `${path}[${index}]`));
  }
  const record = node as Record<string, unknown>;
  const issues: string[] = [];
  const type = record.type;
  const isObjectType = type === 'object' || (Array.isArray(type) && type.includes('object'));
  if (isObjectType && record.additionalProperties !== false) {
    issues.push(`${path}: missing additionalProperties:false`);
  }
  if ('oneOf' in record) {
    issues.push(`${path}: oneOf is not permitted`);
  }
  for (const [key, value] of Object.entries(record)) {
    if (key === 'additionalProperties') {
      continue;
    }
    issues.push(...collectStrictnessIssues(value, `${path}.${key}`));
  }
  return issues;
}

describe('prepareJsonSchemaForOpenAI', () => {
  it('sets additionalProperties false and converts oneOf to anyOf for OpenAI strict mode', () => {
    const prepared = prepareJsonSchemaForOpenAI(getRecipeGenerationResultJsonSchema());
    expect(prepared).not.toHaveProperty('$schema');
    expect(collectStrictnessIssues(prepared)).toEqual([]);

    const plan = (prepared.properties as Record<string, unknown>).plan as Record<string, unknown>;
    expect(plan).toHaveProperty('anyOf');
    const planObject = (plan.anyOf as Array<Record<string, unknown>>)[0];
    const operations = (planObject.properties as Record<string, unknown>).operations as Record<
      string,
      unknown
    >;
    const items = operations.items as Record<string, unknown>;
    expect(items).toHaveProperty('anyOf');
    expect(items).not.toHaveProperty('oneOf');
    expect(Array.isArray(items.anyOf)).toBe(true);
    expect((items.anyOf as unknown[]).length).toBeGreaterThan(1);
  });

  it('does not mutate the source schema export', () => {
    const source = getRecipeGenerationResultJsonSchema();
    const before = JSON.stringify(source);
    prepareJsonSchemaForOpenAI(source);
    expect(JSON.stringify(source)).toBe(before);
    expect(source).toHaveProperty('$schema');
  });
});
