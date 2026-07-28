import { DEFAULT_EXECUTION_LIMITS, utf8ByteLength } from '@tft/transformation-engine';

export function countCharacters(text: string): number {
  return [...text].length;
}

export function countLines(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  return text.split(/\r\n|\r|\n/).length;
}

export function countUtf8Bytes(text: string): number {
  return utf8ByteLength(text);
}

export type PlainTextValidation =
  { readonly ok: true } | { readonly ok: false; readonly reason: string };

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.csv', '.tsv', '.log'] as const;

export const MAX_INPUT_BYTES = DEFAULT_EXECUTION_LIMITS.maxInputBytes;

export function validatePlainTextFile(
  file: File,
  maxBytes: number = MAX_INPUT_BYTES,
): PlainTextValidation {
  const name = file.name.toLowerCase();
  const allowedExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const allowedType =
    file.type === '' ||
    file.type.startsWith('text/') ||
    file.type === 'application/csv' ||
    file.type === 'text/csv' ||
    file.type === 'text/tab-separated-values';

  if (!allowedExtension && !allowedType) {
    return {
      ok: false,
      reason:
        'Only plain-text files (.txt, .md, .csv, .tsv, .log) or text/plain uploads are supported.',
    };
  }

  if (file.size > maxBytes) {
    return {
      ok: false,
      reason: `File is larger than the ${Math.round(maxBytes / (1024 * 1024))} MiB local input limit.`,
    };
  }

  return { ok: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

export function downloadTextFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildDownloadFilename(originalName: string | null): string {
  if (!originalName) {
    return 'transformed-text.txt';
  }
  const lastDot = originalName.lastIndexOf('.');
  if (lastDot <= 0) {
    return `${originalName}-transformed.txt`;
  }
  const base = originalName.slice(0, lastDot);
  const ext = originalName.slice(lastDot);
  return `${base}-transformed${ext}`;
}
