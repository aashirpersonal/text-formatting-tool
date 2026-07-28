'use client';

import type { ExecutionResult } from '@tft/transformation-engine';
import type { OperationType, TransformationOperation } from '@tft/transformation-schema';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildPreviewSample } from '@/lib/preview-sample';
import {
  MAX_INPUT_BYTES,
  buildDownloadFilename,
  countCharacters,
  countLines,
  countUtf8Bytes,
  downloadTextFile,
  formatBytes,
  validatePlainTextFile,
} from '@/lib/text-utils';
import { createDefaultOperation } from '@/recipes/operation-factory';
import {
  createEmptyRecipeDraft,
  planToDraft,
  validateRecipeDraft,
  type RecipeDraft,
} from '@/recipes/recipe-draft';
import { RECIPE_TEMPLATES, loadTemplatePlan } from '@/recipes/templates';
import { TransformationWorkerClient } from '@/worker/transformation-worker-client';
import { OperationCard } from './OperationCard';

type Stage = 'input' | 'recipe' | 'preview' | 'result';
type ProcessStatus = 'idle' | 'preparing' | 'processing' | 'completed' | 'cancelled' | 'failed';

type FileMeta = {
  name: string;
  size: number;
};

type PreviewState = {
  sampleText: string;
  truncated: boolean;
  result: Extract<ExecutionResult, { ok: true }>;
};

export function WorkspaceShell() {
  const workerRef = useRef<TransformationWorkerClient | null>(null);
  const [stage, setStage] = useState<Stage>('input');
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<RecipeDraft>(() => createEmptyRecipeDraft());
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [fullResult, setFullResult] = useState<Extract<ExecutionResult, { ok: true }> | null>(null);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('Ready for local text work.');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    workerRef.current = new TransformationWorkerClient();
    return () => {
      workerRef.current?.dispose();
      workerRef.current = null;
    };
  }, []);

  const characters = useMemo(() => countCharacters(text), [text]);
  const lines = useMemo(() => countLines(text), [text]);
  const bytes = useMemo(() => countUtf8Bytes(text), [text]);
  const validation = useMemo(() => validateRecipeDraft(recipe), [recipe]);
  const hasText = text.length > 0;
  const recipeReady = validation.ok;
  const busy = status === 'processing' || status === 'preparing';
  const canPreview = hasText && recipeReady && !busy;
  const canProcess = canPreview && preview !== null && !busy;

  function invalidateDownstream(message: string) {
    setPreview(null);
    setFullResult(null);
    setErrorMessage(null);
    setCopyMessage(null);
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      setStatus('idle');
    }
    setStatusMessage(message);
  }

  function updateText(next: string, options?: { asOriginal?: boolean; file?: FileMeta | null }) {
    setText(next);
    if (options?.asOriginal) {
      setOriginalText(next);
    }
    if (options && 'file' in options) {
      setFileMeta(options.file ?? null);
    }
    invalidateDownstream('Input changed. Preview and result were cleared.');
  }

  function updateRecipe(updater: (current: RecipeDraft) => RecipeDraft) {
    setRecipe((current) => updater(current));
    invalidateDownstream('Recipe changed. Preview and result were cleared.');
  }

  function updateOperation(index: number, next: TransformationOperation) {
    updateRecipe((current) => {
      const operations = current.operations.slice();
      operations[index] = next;
      return { ...current, operations };
    });
  }

  function moveOperation(index: number, direction: -1 | 1) {
    updateRecipe((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.operations.length) {
        return current;
      }
      const operations = current.operations.slice();
      const [item] = operations.splice(index, 1);
      operations.splice(target, 0, item!);
      return { ...current, operations };
    });
  }

  function addOperation(type: OperationType) {
    updateRecipe((current) => ({
      ...current,
      operations: [...current.operations, createDefaultOperation(type)],
    }));
  }

  function removeOperation(index: number) {
    updateRecipe((current) => ({
      ...current,
      operations: current.operations.filter((_, i) => i !== index),
    }));
  }

  async function onFileSelected(fileList: FileList | null) {
    setFileError(null);
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    const validationResult = validatePlainTextFile(file, MAX_INPUT_BYTES);
    if (!validationResult.ok) {
      setFileError(validationResult.reason);
      return;
    }
    if (text.length > 0) {
      const confirmed = window.confirm(
        'Replace the current document text with this file? The previous original is kept until you reset the session.',
      );
      if (!confirmed) {
        return;
      }
    }
    const contents = await file.text();
    if (countUtf8Bytes(contents) > MAX_INPUT_BYTES) {
      setFileError('File contents exceed the local UTF-8 input limit.');
      return;
    }
    updateText(contents, {
      asOriginal: true,
      file: { name: file.name, size: file.size },
    });
    setStatusMessage(`Loaded ${file.name} locally.`);
  }

  function clearInput() {
    if (text.length > 0 || originalText.length > 0) {
      const confirmed = window.confirm('Clear the current document text?');
      if (!confirmed) {
        return;
      }
    }
    updateText('', { asOriginal: true, file: null });
    setFileError(null);
    setStage('input');
    setStatusMessage('Input cleared.');
  }

  function restoreOriginal() {
    if (originalText === text) {
      setStatusMessage('Document already matches the preserved original.');
      return;
    }
    setText(originalText);
    invalidateDownstream('Restored the preserved original input.');
    setStage('recipe');
  }

  function loadTemplate(templateId: string) {
    if (recipe.operations.length > 0) {
      const confirmed = window.confirm(
        'Replace the current recipe with this template? Nothing will be processed automatically.',
      );
      if (!confirmed) {
        return;
      }
    }
    const plan = loadTemplatePlan(templateId);
    setRecipe(planToDraft(plan));
    invalidateDownstream('Template loaded. Preview and result were cleared.');
    setStage('recipe');
    setStatusMessage('Template loaded. Review and edit before previewing.');
  }

  async function runPreview() {
    if (!validation.ok) {
      return;
    }
    const sample = buildPreviewSample(text);
    setStatus('preparing');
    setStatusMessage('Preparing local preview…');
    setErrorMessage(null);
    setStage('preview');
    try {
      setStatus('processing');
      setStatusMessage('Processing preview locally in a Web Worker…');
      const result = await workerRef.current!.execute({
        mode: 'preview',
        input: sample.text,
        plan: validation.plan,
      });
      if (!result.ok) {
        setStatus('failed');
        setPreview(null);
        setErrorMessage(result.error.message);
        setStatusMessage('Preview failed.');
        return;
      }
      setPreview({
        sampleText: sample.text,
        truncated: sample.truncated,
        result,
      });
      setStatus('completed');
      setStatusMessage(
        sample.truncated
          ? 'Preview completed on a truncated sample. Full processing may find more changes.'
          : 'Preview completed on the full input.',
      );
    } catch (error) {
      setStatus('failed');
      setPreview(null);
      setErrorMessage(error instanceof Error ? error.message : 'Preview failed unexpectedly.');
      setStatusMessage('Preview failed.');
    }
  }

  async function runFull() {
    if (!validation.ok || !preview) {
      return;
    }
    setStatus('preparing');
    setStatusMessage('Preparing full local processing…');
    setErrorMessage(null);
    setStage('result');
    try {
      setStatus('processing');
      setStatusMessage('Processing the complete document locally in a Web Worker…');
      const result = await workerRef.current!.execute({
        mode: 'full',
        input: text,
        plan: validation.plan,
      });
      if (!result.ok) {
        setStatus('failed');
        setFullResult(null);
        setErrorMessage(result.error.message);
        setStatusMessage('Full processing failed.');
        return;
      }
      setFullResult(result);
      setStatus('completed');
      setStatusMessage('Full local processing completed.');
    } catch (error) {
      setStatus('failed');
      setFullResult(null);
      setErrorMessage(
        error instanceof Error ? error.message : 'Full processing failed unexpectedly.',
      );
      setStatusMessage('Full processing failed.');
    }
  }

  function cancelProcessing() {
    workerRef.current?.cancel();
    setStatus('cancelled');
    setStatusMessage('Processing cancelled. Previous successful preview/result were kept.');
  }

  async function copyResult() {
    if (!fullResult) {
      return;
    }
    try {
      await navigator.clipboard.writeText(fullResult.output);
      setCopyMessage('Result copied to the clipboard.');
    } catch {
      setCopyMessage('Clipboard copy failed. You can still download the result.');
    }
  }

  function downloadResult() {
    if (!fullResult) {
      return;
    }
    downloadTextFile(buildDownloadFilename(fileMeta?.name ?? null), fullResult.output);
    setCopyMessage('Download started in your browser.');
  }

  function resetSession() {
    const confirmed = window.confirm(
      'Reset the whole workspace session? Input, recipe, preview, and result will be cleared.',
    );
    if (!confirmed) {
      return;
    }
    workerRef.current?.cancel();
    setText('');
    setOriginalText('');
    setFileMeta(null);
    setFileError(null);
    setRecipe(createEmptyRecipeDraft());
    setPreview(null);
    setFullResult(null);
    setStatus('idle');
    setStatusMessage('Session reset. Refreshing the page also clears this local session.');
    setErrorMessage(null);
    setCopyMessage(null);
    setStage('input');
  }

  const issuesByOperation = useMemo(() => {
    const map = new Map<string, string[]>();
    if (validation.ok) {
      return map;
    }
    for (const issue of validation.issues) {
      const match = /^operations\.(\d+)/.exec(issue.path);
      if (!match) {
        continue;
      }
      const op = recipe.operations[Number(match[1])];
      if (!op) {
        continue;
      }
      const list = map.get(op.id) ?? [];
      list.push(issue.message);
      map.set(op.id, list);
    }
    return map;
  }, [validation, recipe.operations]);

  return (
    <div className="stack workspace" data-testid="workspace-shell">
      <div className="callout" role="status" data-testid="privacy-status">
        Privacy status: this workspace runs entirely in your browser. Text stays local. No AI
        requests are made from this page.
      </div>

      <div className="stage-tabs" role="tablist" aria-label="Workspace stages">
        {(
          [
            ['input', '1. Input', true],
            ['recipe', '2. Recipe', hasText],
            ['preview', '3. Preview', hasText && recipeReady],
            ['result', '4. Result', fullResult !== null || stage === 'result'],
          ] as const
        ).map(([id, label, enabled]) => (
          <button
            key={id}
            type="button"
            role="tab"
            className={stage === id ? 'stage-tab is-active' : 'stage-tab'}
            aria-selected={stage === id}
            disabled={!enabled}
            onClick={() => setStage(id)}
            data-testid={`stage-${id}`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="status-line" aria-live="polite" data-testid="workspace-status">
        {statusMessage}
        {status === 'processing' || status === 'preparing' ? (
          <>
            {' '}
            <button
              type="button"
              className="button button-secondary"
              onClick={cancelProcessing}
              data-testid="cancel-processing"
            >
              Cancel
            </button>
          </>
        ) : null}
      </p>
      {errorMessage ? (
        <p className="error-text" role="alert" data-testid="workspace-error">
          {errorMessage}
        </p>
      ) : null}

      {stage === 'input' ? (
        <section className="panel stack" aria-labelledby="input-heading">
          <div className="meta-row">
            <h2 id="input-heading" style={{ margin: 0 }}>
              Input
            </h2>
            <div aria-live="polite" className="meta-row">
              <span className="stat" data-testid="char-count">
                {characters} characters
              </span>
              <span className="stat" data-testid="line-count">
                {lines} lines
              </span>
              <span className="stat" data-testid="byte-count">
                {formatBytes(bytes)}
              </span>
            </div>
          </div>
          {fileMeta ? (
            <p className="muted" data-testid="file-meta">
              Loaded file: {fileMeta.name} ({formatBytes(fileMeta.size)})
            </p>
          ) : null}
          <label htmlFor="document-input">Document text</label>
          <textarea
            id="document-input"
            className="textarea"
            value={text}
            onChange={(event) => {
              const next = event.target.value;
              if (originalText.length === 0 && next.length > 0) {
                updateText(next, { asOriginal: true });
              } else {
                updateText(next);
              }
            }}
            placeholder="Paste or type plain text here…"
            data-testid="document-input"
          />
          <div className="actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={clearInput}
              data-testid="clear-input"
            >
              Clear input
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={restoreOriginal}
              data-testid="restore-original"
              disabled={originalText.length === 0}
            >
              Restore original
            </button>
            <label
              className="button button-secondary"
              htmlFor="file-input"
              style={{ cursor: 'pointer' }}
            >
              Load text file
            </label>
            <input
              id="file-input"
              type="file"
              accept=".txt,.md,.csv,.tsv,.log,text/plain,text/markdown,text/csv,text/tab-separated-values"
              hidden
              onChange={(event) => {
                void onFileSelected(event.target.files);
                event.target.value = '';
              }}
              data-testid="file-input"
            />
            {hasText ? (
              <button
                type="button"
                className="button button-primary"
                onClick={() => setStage('recipe')}
                data-testid="goto-recipe"
              >
                Continue to recipe
              </button>
            ) : null}
          </div>
          {fileError ? (
            <p className="error-text" role="alert" data-testid="file-error">
              {fileError}
            </p>
          ) : null}
          <p className="muted" style={{ margin: 0 }}>
            Local limit: {formatBytes(MAX_INPUT_BYTES)}. Files are read in the browser and never
            uploaded. This session resets if you refresh the page.
          </p>
        </section>
      ) : null}

      {stage === 'recipe' ? (
        <section
          className="panel stack"
          aria-labelledby="recipe-heading"
          data-testid="recipe-stage"
        >
          <h2 id="recipe-heading" style={{ margin: 0 }}>
            Recipe
          </h2>
          {!hasText ? (
            <p className="muted">Add document text before editing a recipe.</p>
          ) : (
            <>
              <div className="field-grid">
                <label>
                  Recipe title
                  <input
                    className="input"
                    value={recipe.title}
                    onChange={(event) =>
                      updateRecipe((current) => ({ ...current, title: event.target.value }))
                    }
                    data-testid="recipe-title"
                  />
                </label>
                <label>
                  Short summary
                  <input
                    className="input"
                    value={recipe.summary}
                    onChange={(event) =>
                      updateRecipe((current) => ({ ...current, summary: event.target.value }))
                    }
                    data-testid="recipe-summary"
                  />
                </label>
              </div>

              <div className="stack">
                <h3 style={{ margin: 0 }}>Templates</h3>
                <p className="muted" style={{ margin: 0 }}>
                  Built-in local templates. They are not AI-generated.
                </p>
                <div className="actions">
                  {RECIPE_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className="button button-secondary"
                      onClick={() => loadTemplate(template.id)}
                      data-testid={`template-${template.id}`}
                      title={template.description}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="stack">
                <label htmlFor="add-operation">Add operation</label>
                <select
                  id="add-operation"
                  className="input"
                  defaultValue=""
                  data-testid="add-operation"
                  onChange={(event) => {
                    const value = event.target.value as OperationType | '';
                    if (!value) {
                      return;
                    }
                    addOperation(value);
                    event.target.value = '';
                  }}
                >
                  <option value="" disabled>
                    Choose an operation…
                  </option>
                  <option value="replace.literal">Replace text</option>
                  <option value="lines.trim">Trim each line</option>
                  <option value="lines.removeEmpty">Remove empty lines</option>
                  <option value="lines.dedupe">Remove duplicate lines</option>
                  <option value="lines.filterContains">Keep or remove matching lines</option>
                  <option value="lines.affix">Add prefix or suffix</option>
                  <option value="lineEndings.normalize">Normalise line endings</option>
                  <option value="unicode.normalize">Normalise Unicode</option>
                </select>
              </div>

              {recipe.operations.length === 0 ? (
                <p className="muted" data-testid="recipe-empty">
                  No operations yet. Add one or load a template.
                </p>
              ) : (
                recipe.operations.map((operation, index) => (
                  <OperationCard
                    key={operation.id}
                    operation={operation}
                    index={index}
                    total={recipe.operations.length}
                    fieldErrors={issuesByOperation.get(operation.id) ?? []}
                    onChange={(next) => updateOperation(index, next)}
                    onMoveUp={() => moveOperation(index, -1)}
                    onMoveDown={() => moveOperation(index, 1)}
                    onRemove={() => removeOperation(index)}
                  />
                ))
              )}

              {!validation.ok ? (
                <div className="error-panel" role="alert" data-testid="recipe-errors">
                  <strong>Recipe needs attention</strong>
                  <ul className="error-list">
                    {validation.issues.map((issue) => (
                      <li key={`${issue.path}:${issue.message}`}>
                        {issue.path}: {issue.message}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="success-text" data-testid="recipe-valid">
                  Recipe is valid for Transformation Plan v1.
                </p>
              )}

              <details data-testid="technical-recipe">
                <summary>View technical recipe (JSON)</summary>
                <pre className="code-block">
                  {JSON.stringify(
                    {
                      schemaVersion: '1.0',
                      title: recipe.title,
                      summary: recipe.summary,
                      assumptions: recipe.assumptions,
                      warnings: recipe.warnings,
                      operations: recipe.operations,
                    },
                    null,
                    2,
                  )}
                </pre>
              </details>

              <div className="actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setStage('input')}
                >
                  Back to input
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={!canPreview}
                  aria-disabled={!canPreview}
                  onClick={() => void runPreview()}
                  data-testid="run-preview"
                >
                  Preview locally
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}

      {stage === 'preview' ? (
        <section
          className="panel stack"
          aria-labelledby="preview-heading"
          data-testid="preview-stage"
        >
          <h2 id="preview-heading" style={{ margin: 0 }}>
            Preview
          </h2>
          {!preview ? (
            <p className="muted">
              {canPreview
                ? 'Run a local preview to inspect before/after on a start-of-document sample.'
                : 'A valid recipe and document text are required before preview.'}
            </p>
          ) : (
            <>
              <p className="muted" data-testid="preview-truncation">
                Preview sample: {formatBytes(countUtf8Bytes(preview.sampleText))}
                {preview.truncated
                  ? ' (truncated from the start of the document; full execution may differ).'
                  : ' (covers the full document).'}{' '}
                No text is sent remotely.
              </p>
              <div className="preview-grid">
                <div>
                  <h3>Before</h3>
                  <pre className="code-block" data-testid="preview-before">
                    {preview.sampleText}
                  </pre>
                </div>
                <div>
                  <h3>After</h3>
                  <pre className="code-block" data-testid="preview-after">
                    {preview.result.output}
                  </pre>
                </div>
              </div>
              <OperationReportList result={preview.result} />
            </>
          )}
          <div className="actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setStage('recipe')}
            >
              Back to recipe
            </button>
            {!preview && canPreview ? (
              <button
                type="button"
                className="button button-primary"
                onClick={() => void runPreview()}
                data-testid="run-preview-again"
              >
                Preview locally
              </button>
            ) : null}
            <button
              type="button"
              className="button button-primary"
              disabled={!canProcess}
              aria-disabled={!canProcess}
              onClick={() => void runFull()}
              data-testid="run-full"
            >
              Process full document locally
            </button>
          </div>
        </section>
      ) : null}

      {stage === 'result' ? (
        <section
          className="panel stack"
          aria-labelledby="result-heading"
          data-testid="result-stage"
        >
          <h2 id="result-heading" style={{ margin: 0 }}>
            Result
          </h2>
          {!fullResult ? (
            <p className="muted">
              Full processing has not completed yet. Preview first, then process the complete
              document locally.
            </p>
          ) : (
            <>
              <div className="meta-row" aria-live="polite">
                <span className="stat">
                  In {fullResult.report.inputCharacters} chars /{' '}
                  {formatBytes(fullResult.report.inputBytes)}
                </span>
                <span className="stat">
                  Out {fullResult.report.outputCharacters} chars /{' '}
                  {formatBytes(fullResult.report.outputBytes)}
                </span>
                <span className="stat" data-testid="result-applied-count">
                  {fullResult.report.operations.filter((item) => item.status === 'applied').length}{' '}
                  applied
                </span>
                <span className="stat">
                  {
                    fullResult.report.operations.filter((item) => item.status === 'no_change')
                      .length
                  }{' '}
                  no change
                </span>
                <span className="stat">
                  {fullResult.report.operations.filter((item) => item.status === 'skipped').length}{' '}
                  skipped
                </span>
              </div>
              <label htmlFor="result-output">Transformed output</label>
              <textarea
                id="result-output"
                className="textarea"
                readOnly
                value={fullResult.output}
                data-testid="result-output"
              />
              <OperationReportList result={fullResult} />
              <div className="actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void copyResult()}
                  data-testid="copy-result"
                >
                  Copy result
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={downloadResult}
                  data-testid="download-result"
                >
                  Download result
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={restoreOriginal}
                  data-testid="restore-original-from-result"
                >
                  Restore original input
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setStage('recipe')}
                >
                  Return to recipe
                </button>
              </div>
              {copyMessage ? (
                <p className="muted" aria-live="polite" data-testid="copy-message">
                  {copyMessage}
                </p>
              ) : null}
            </>
          )}
        </section>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={resetSession}
          data-testid="reset-session"
        >
          Reset session
        </button>
      </div>
    </div>
  );
}

function OperationReportList({ result }: { result: Extract<ExecutionResult, { ok: true }> }) {
  return (
    <div className="stack" data-testid="operation-report">
      <h3 style={{ margin: 0 }}>Operation report</h3>
      <ul className="report-list">
        {result.report.operations.map((item) => (
          <li key={item.operationId}>
            <strong>{item.operationId}</strong> ({item.operationType}): {item.status}
            {item.changed ? ` · changes ${item.changeCount}` : ''}
            {item.warnings.length > 0 ? ` · ${item.warnings.join('; ')}` : ''}
          </li>
        ))}
      </ul>
      {result.report.warnings.length > 0 ? (
        <p className="warning-text">Warnings: {result.report.warnings.join('; ')}</p>
      ) : null}
    </div>
  );
}
