# Local Workspace v1

**Status:** Implemented on `v2-rebuild`
**Date:** 2026-07-28

## Current manual workflow

1. **Input** — paste text or load a supported local plain-text file.
2. **Recipe** — build a Transformation Plan v1 manually (or load a built-in template).
3. **Preview** — run a local Worker preview on a start-of-document sample.
4. **Result** — process the full document locally, then copy or download the output.

AI recipe generation is **not** implemented.

## Local-only architecture

- Document text never leaves the browser in this milestone.
- Copy and download use browser APIs only.
- No OpenAI, API routes, analytics, authentication, or remote storage.
- Session state is in-memory; refreshing the page clears the workspace (no `localStorage`).

## Worker boundary

- `@tft/transformation-engine` executes inside a dedicated module Web Worker (`transformation.worker.ts`).
- The React main thread uses `TransformationWorkerClient` for typed request/response messaging.
- The Worker imports only the schema/engine packages and does not touch DOM, storage, or network.

## Supported operations

All eight Transformation Plan v1 operations are editable as cards:

Replace text · Trim each line · Remove empty lines · Remove duplicate lines · Keep/remove matching lines · Add prefix/suffix · Normalise line endings · Normalise Unicode

## Preview rules

- Deterministic sample from the **start** of the document.
- Caps: **50 KiB** and/or **300 logical lines** (whichever truncates first).
- Truncation is disclosed in the UI.
- Preview never replaces full input or original input.

## Cancellation model

- Cancel terminates the active Worker and discards the active request ID.
- The active `execute()` Promise settles with a typed client-level cancellation error (`WORKER_CANCELLED`), not an engine failure.
- A fresh Worker is created for the next job.
- Cancelled/stale responses cannot overwrite UI state.
- Cancellation does not clear input or previous successful preview/result.

## Session-state rules

- `originalText` is preserved separately from the editable document.
- Editing input or recipe invalidates preview and result.
- Loading a template does not process anything.
- Loading a file does not auto-run a recipe.
- Clearing/resetting asks for confirmation when meaningful data would be lost.

## File-size rules

- Supported extensions: `.txt`, `.md`, `.csv`, `.tsv`, `.log` (plus safe `text/*` types).
- Size limit matches engine default input limit (**10 MiB** UTF-8).
- Validation happens before `file.text()`.

## Privacy behaviour

See `/privacy`. Current workspace processing is local-only and makes no AI requests.

## Current limitations

- No AI authoring.
- No incremental progress percentages (engine is synchronous inside the Worker).
- Preview sampling is start-of-document only (not intelligent representative sampling).
- No persistent session restore.
- No regex operations.
- No batch/folder processing.

## Explicit statement

**AI generation is not implemented in this milestone.**
