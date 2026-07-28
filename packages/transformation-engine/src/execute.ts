import {
  TRANSFORMATION_PLAN_SCHEMA_VERSION,
  safeParseTransformationPlan,
  type TransformationPlan,
} from '@tft/transformation-schema';
import { characterCount, resolveExecutionLimits, utf8ByteLength } from './limits';
import { applyOperation } from './operation-executors/index';
import type { ExecutionOptions, ExecutionResult, OperationExecutionReport } from './types';

function fail(
  code: Extract<ExecutionResult, { ok: false }>['error']['code'],
  message: string,
  extra?: {
    operationId?: string;
    operationType?: string;
    validationIssues?: unknown;
  },
): ExecutionResult {
  return {
    ok: false,
    error: {
      code,
      message,
      ...extra,
    },
  };
}

/**
 * Validate an unknown plan, then apply allowlisted operations deterministically.
 * Expected validation/limit failures return structured results (no throw).
 * Does not mutate input, plan, or options. Does not return partial output on failure.
 */
export function executeTransformationPlan(
  input: string,
  plan: unknown,
  options?: ExecutionOptions,
): ExecutionResult {
  const limits = resolveExecutionLimits(options);
  const parsed = safeParseTransformationPlan(plan);

  if (!parsed.success) {
    return fail('PLAN_INVALID', 'Transformation plan failed schema validation.', {
      validationIssues: parsed.error.issues,
    });
  }

  const validPlan: TransformationPlan = parsed.data;

  if (validPlan.operations.length > limits.maxOperations) {
    return fail(
      'OPERATION_LIMIT_EXCEEDED',
      `Plan has ${validPlan.operations.length} operations; limit is ${limits.maxOperations}.`,
    );
  }

  const inputBytes = utf8ByteLength(input);
  if (inputBytes > limits.maxInputBytes) {
    return fail(
      'INPUT_LIMIT_EXCEEDED',
      `Input is ${inputBytes} UTF-8 bytes; limit is ${limits.maxInputBytes}.`,
    );
  }

  let current = input;
  const operationReports: OperationExecutionReport[] = [];
  const aggregateWarnings: string[] = [...validPlan.warnings];

  for (const operation of validPlan.operations) {
    if (!operation.enabled) {
      operationReports.push({
        operationId: operation.id,
        operationType: operation.type,
        status: 'skipped',
        changed: false,
        changeCount: 0,
        warnings: [],
      });
      continue;
    }

    let applied;
    try {
      applied = applyOperation(current, operation);
    } catch (error) {
      return fail('OPERATION_FAILED', 'An unexpected error occurred while applying an operation.', {
        operationId: operation.id,
        operationType: operation.type,
        validationIssues:
          error instanceof Error ? { name: error.name, message: error.message } : undefined,
      });
    }

    const outputBytes = utf8ByteLength(applied.output);
    if (outputBytes > limits.maxOutputBytes) {
      return fail(
        'OUTPUT_LIMIT_EXCEEDED',
        `Output reached ${outputBytes} UTF-8 bytes after operation "${operation.id}"; limit is ${limits.maxOutputBytes}.`,
        {
          operationId: operation.id,
          operationType: operation.type,
        },
      );
    }

    const changed = applied.output !== current;
    operationReports.push({
      operationId: operation.id,
      operationType: operation.type,
      status: changed ? 'applied' : 'no_change',
      changed,
      changeCount: changed ? applied.changeCount : 0,
      warnings: applied.warnings,
    });
    for (const warning of applied.warnings) {
      aggregateWarnings.push(warning);
    }
    current = applied.output;
  }

  return {
    ok: true,
    output: current,
    report: {
      schemaVersion: TRANSFORMATION_PLAN_SCHEMA_VERSION,
      inputCharacters: characterCount(input),
      outputCharacters: characterCount(current),
      inputBytes,
      outputBytes: utf8ByteLength(current),
      operations: operationReports,
      warnings: aggregateWarnings,
    },
  };
}
