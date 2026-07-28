export function countCharacters(text: string): number {
  return [...text].length;
}

export function countLines(text: string): number {
  if (text.length === 0) {
    return 0;
  }
  return text.split(/\r\n|\r|\n/).length;
}

export type PlainTextValidation =
  { readonly ok: true } | { readonly ok: false; readonly reason: string };

const MAX_BYTES = 2 * 1024 * 1024;

export function validatePlainTextFile(file: File): PlainTextValidation {
  const name = file.name.toLowerCase();
  const allowedExtension = name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.csv');
  const allowedType =
    file.type === '' ||
    file.type.startsWith('text/') ||
    file.type === 'application/csv' ||
    file.type === 'text/csv';

  if (!allowedExtension && !allowedType) {
    return {
      ok: false,
      reason: 'Only plain-text files (.txt, .md, .csv) are supported in this scaffold.',
    };
  }

  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      reason: 'File is larger than the 2 MB scaffold limit.',
    };
  }

  return { ok: true };
}
