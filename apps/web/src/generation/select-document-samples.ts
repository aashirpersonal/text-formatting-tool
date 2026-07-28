import { RECIPE_GENERATION_LIMITS } from '@tft/transformation-schema';

export type DocumentSample = {
  readonly id: string;
  readonly label: string;
  readonly text: string;
};

export type SampleSelectionOptions = {
  readonly maxSamples?: number;
  readonly maxSampleCharacters?: number;
  readonly maxTotalCharacters?: number;
};

function splitLogicalLines(input: string): string[] {
  if (input.length === 0) {
    return [];
  }
  return input.split(/\r\n|\n|\r/);
}

function joinLines(lines: readonly string[], start: number, end: number): string {
  return lines.slice(start, end).join('\n');
}

function takeWindow(
  lines: readonly string[],
  startIndex: number,
  maxCharacters: number,
): { text: string; nextIndex: number } {
  if (lines.length === 0 || maxCharacters <= 0) {
    return { text: '', nextIndex: startIndex };
  }
  const parts: string[] = [];
  let used = 0;
  let index = Math.max(0, Math.min(startIndex, lines.length - 1));
  while (index < lines.length) {
    const line = lines[index] ?? '';
    const separator = parts.length > 0 ? 1 : 0;
    if (used + separator + line.length > maxCharacters) {
      if (parts.length === 0) {
        parts.push(line.slice(0, maxCharacters));
        used = maxCharacters;
        index += 1;
      }
      break;
    }
    parts.push(line);
    used += separator + line.length;
    index += 1;
  }
  return { text: parts.join('\n'), nextIndex: index };
}

function uniqueByText(samples: DocumentSample[]): DocumentSample[] {
  const seen = new Set<string>();
  const out: DocumentSample[] = [];
  for (const sample of samples) {
    if (seen.has(sample.text)) {
      continue;
    }
    seen.add(sample.text);
    out.push(sample);
  }
  return out;
}

/**
 * Deterministic start / middle / end excerpt selection for recipe generation.
 * Does not mutate input. Never uploads or fetches.
 */
export function selectDocumentSamples(
  input: string,
  options: SampleSelectionOptions = {},
): DocumentSample[] {
  const maxSamples = options.maxSamples ?? RECIPE_GENERATION_LIMITS.samples.maxItems;
  const maxSampleCharacters =
    options.maxSampleCharacters ?? RECIPE_GENERATION_LIMITS.samples.textMaxLength;
  const maxTotalCharacters =
    options.maxTotalCharacters ?? RECIPE_GENERATION_LIMITS.samples.totalTextMaxLength;

  const lines = splitLogicalLines(input);
  if (lines.length === 0 || input.trim().length === 0) {
    return [];
  }

  const totalLength = input.length;
  if (totalLength <= maxSampleCharacters) {
    return [
      {
        id: 'full',
        label: 'Full document',
        text: joinLines(lines, 0, lines.length).slice(0, maxSampleCharacters),
      },
    ].slice(0, maxSamples);
  }

  const perBudget = Math.min(
    maxSampleCharacters,
    Math.max(1, Math.floor(maxTotalCharacters / Math.min(3, maxSamples))),
  );

  const start = takeWindow(lines, 0, perBudget);
  const middleStart = Math.max(0, Math.floor((lines.length - 1) / 2));
  const middle = takeWindow(lines, middleStart, perBudget);
  const endStart = Math.max(0, lines.length - 1);
  // Walk backwards to fill an end window while preferring line boundaries.
  const endParts: string[] = [];
  let used = 0;
  for (let index = endStart; index >= 0; index -= 1) {
    const line = lines[index] ?? '';
    const separator = endParts.length > 0 ? 1 : 0;
    if (used + separator + line.length > perBudget) {
      if (endParts.length === 0) {
        endParts.unshift(line.slice(Math.max(0, line.length - perBudget)));
      }
      break;
    }
    endParts.unshift(line);
    used += separator + line.length;
  }

  const candidates: DocumentSample[] = [
    { id: 'start', label: 'Start', text: start.text },
    { id: 'middle', label: 'Middle', text: middle.text },
    { id: 'end', label: 'End', text: endParts.join('\n') },
  ].filter((sample) => sample.text.length > 0);

  const unique = uniqueByText(candidates);
  const selected: DocumentSample[] = [];
  let total = 0;
  for (const sample of unique) {
    if (selected.length >= maxSamples) {
      break;
    }
    if (total + sample.text.length > maxTotalCharacters) {
      const remaining = maxTotalCharacters - total;
      if (remaining <= 0) {
        break;
      }
      selected.push({
        ...sample,
        text: sample.text.slice(0, remaining),
      });
      break;
    }
    selected.push(sample);
    total += sample.text.length;
  }
  return selected;
}
