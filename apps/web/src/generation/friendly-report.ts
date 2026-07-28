import type { ExecutionResult } from '@tft/transformation-engine';

type OperationReport = Extract<ExecutionResult, { ok: true }>['report']['operations'][number];

function friendlyLabel(operationType: string): string {
  switch (operationType) {
    case 'replace.literal':
      return 'text replacements';
    case 'lines.trim':
      return 'lines trimmed';
    case 'lines.removeEmpty':
      return 'empty lines removed';
    case 'lines.dedupe':
      return 'duplicates removed';
    case 'lines.filterContains':
      return 'lines filtered';
    case 'lines.affix':
      return 'lines updated with a prefix or suffix';
    case 'lineEndings.normalize':
      return 'line endings normalised';
    case 'unicode.normalize':
      return 'Unicode normalised';
    default:
      return 'changes applied';
  }
}

export function summarizeOperation(item: OperationReport): string {
  if (item.status === 'skipped') {
    return `${friendlyLabel(item.operationType)} — skipped`;
  }
  if (item.status === 'no_change' || !item.changed) {
    if (item.operationType === 'lines.removeEmpty') {
      return 'No empty lines found';
    }
    if (item.operationType === 'lines.dedupe') {
      return 'No duplicates found';
    }
    return `No ${friendlyLabel(item.operationType)} needed`;
  }
  const count = item.changeCount;
  if (item.operationType === 'lines.trim') {
    return `${count} line${count === 1 ? '' : 's'} trimmed`;
  }
  if (item.operationType === 'lines.dedupe') {
    return `${count} duplicate${count === 1 ? '' : 's'} removed`;
  }
  if (item.operationType === 'lines.removeEmpty') {
    return `${count} empty line${count === 1 ? '' : 's'} removed`;
  }
  if (item.operationType === 'replace.literal') {
    return `${count} replacement${count === 1 ? '' : 's'} made`;
  }
  return `${count} ${friendlyLabel(item.operationType)}`;
}

export function summarizeExecution(result: Extract<ExecutionResult, { ok: true }>): string[] {
  return result.report.operations.map(summarizeOperation);
}
