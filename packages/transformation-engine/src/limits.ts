/**
 * Platform-neutral UTF-8 byte length (TextEncoder).
 * Avoids Node-only Buffer so the engine can run in browsers and Workers.
 */
export function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

/**
 * Unicode code-point character count (not UTF-16 code units).
 */
export function characterCount(text: string): number {
  return [...text].length;
}

export const DEFAULT_EXECUTION_LIMITS = Object.freeze({
  /** Default maximum UTF-8 input size: 10 MiB. */
  maxInputBytes: 10 * 1024 * 1024,
  /** Default maximum UTF-8 output size: 12 MiB. */
  maxOutputBytes: 12 * 1024 * 1024,
  /** Default maximum operations executed (enabled or not, counted in plan). */
  maxOperations: 25,
} as const);

export type ExecutionLimits = {
  readonly maxInputBytes: number;
  readonly maxOutputBytes: number;
  readonly maxOperations: number;
};

export type ExecutionOptions = {
  readonly limits?: Partial<ExecutionLimits>;
};

export function resolveExecutionLimits(options?: ExecutionOptions): ExecutionLimits {
  const limits = options?.limits;
  return Object.freeze({
    maxInputBytes: limits?.maxInputBytes ?? DEFAULT_EXECUTION_LIMITS.maxInputBytes,
    maxOutputBytes: limits?.maxOutputBytes ?? DEFAULT_EXECUTION_LIMITS.maxOutputBytes,
    maxOperations: limits?.maxOperations ?? DEFAULT_EXECUTION_LIMITS.maxOperations,
  });
}
