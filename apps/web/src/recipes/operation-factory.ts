import type { OperationType, TransformationOperation } from '@tft/transformation-schema';

let operationIdCounter = 0;

/** Deterministic session-local IDs (not used as execution entropy). */
export function nextOperationId(prefix = 'op'): string {
  operationIdCounter += 1;
  return `${prefix}${operationIdCounter}`;
}

/** Test/helper reset only. */
export function resetOperationIdCounter(value = 0): void {
  operationIdCounter = value;
}

export type OperationPickerItem = {
  readonly type: OperationType;
  readonly label: string;
  readonly explanation: string;
};

export const OPERATION_PICKER_ITEMS: readonly OperationPickerItem[] = Object.freeze([
  {
    type: 'replace.literal',
    label: 'Replace text',
    explanation: 'Find literal text and replace the first or every match.',
  },
  {
    type: 'lines.trim',
    label: 'Trim each line',
    explanation: 'Remove leading and/or trailing whitespace on every line.',
  },
  {
    type: 'lines.removeEmpty',
    label: 'Remove empty lines',
    explanation: 'Drop blank lines, optionally treating whitespace-only lines as empty.',
  },
  {
    type: 'lines.dedupe',
    label: 'Remove duplicate lines',
    explanation: 'Keep the first occurrence of each line.',
  },
  {
    type: 'lines.filterContains',
    label: 'Keep or remove matching lines',
    explanation: 'Filter lines that literally contain a piece of text.',
  },
  {
    type: 'lines.affix',
    label: 'Add prefix or suffix',
    explanation: 'Add text before and/or after every line.',
  },
  {
    type: 'lineEndings.normalize',
    label: 'Normalise line endings',
    explanation: 'Convert line endings to LF or CRLF.',
  },
  {
    type: 'unicode.normalize',
    label: 'Normalise Unicode',
    explanation: 'Apply Unicode normalisation (NFC/NFD/NFKC/NFKD).',
  },
]);

export function createDefaultOperation(type: OperationType): TransformationOperation {
  const id = nextOperationId();
  switch (type) {
    case 'replace.literal':
      return {
        id,
        type,
        enabled: true,
        description: 'Replace literal text',
        find: '',
        replacement: '',
        occurrence: 'all',
        caseSensitive: true,
      };
    case 'lines.trim':
      return {
        id,
        type,
        enabled: true,
        description: 'Trim each line',
        mode: 'both',
      };
    case 'lines.removeEmpty':
      return {
        id,
        type,
        enabled: true,
        description: 'Remove empty lines',
        whitespaceOnly: true,
      };
    case 'lines.dedupe':
      return {
        id,
        type,
        enabled: true,
        description: 'Remove duplicate lines',
        caseSensitive: true,
        trimBeforeCompare: false,
      };
    case 'lines.filterContains':
      return {
        id,
        type,
        enabled: true,
        description: 'Filter matching lines',
        needle: '',
        caseSensitive: true,
        keep: 'matching',
      };
    case 'lines.affix':
      return {
        id,
        type,
        enabled: true,
        description: 'Add prefix or suffix',
        prefix: '',
        suffix: '',
      };
    case 'lineEndings.normalize':
      return {
        id,
        type,
        enabled: true,
        description: 'Normalise line endings',
        style: 'lf',
      };
    case 'unicode.normalize':
      return {
        id,
        type,
        enabled: true,
        description: 'Normalise Unicode',
        form: 'NFC',
      };
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

export function humanTitleForOperation(type: OperationType): string {
  return OPERATION_PICKER_ITEMS.find((item) => item.type === type)?.label ?? type;
}

export function humanExplanationForOperation(type: OperationType): string {
  return OPERATION_PICKER_ITEMS.find((item) => item.type === type)?.explanation ?? '';
}
