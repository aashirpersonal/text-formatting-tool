'use client';

import type { ExecutionResult } from '@tft/transformation-engine';
import type { TransformationPlan } from '@tft/transformation-schema';
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileUp,
  Loader2,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  EXAMPLE_PROMPTS,
  LocalPrototypeRecipeGenerator,
} from '@/generation/local-prototype-generator';
import { summarizeExecution } from '@/generation/friendly-report';
import type { RecipeGenerationSuccess } from '@/generation/types';
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
import {
  TransformationWorkerClient,
  isWorkerCancellation,
} from '@/worker/transformation-worker-client';

type Phase = 'compose' | 'ready' | 'preview' | 'result';
type MobileTab = 'text' | 'preview' | 'result';
type ProcessStatus = 'idle' | 'generating' | 'processing' | 'completed' | 'cancelled' | 'failed';
type FileMeta = { name: string; size: number };
type PreviewState = {
  sampleText: string;
  truncated: boolean;
  result: Extract<ExecutionResult, { ok: true }>;
};

const generator = new LocalPrototypeRecipeGenerator();

export function SimpleAppShell() {
  const workerRef = useRef<TransformationWorkerClient | null>(null);
  const runIdRef = useRef(0);
  const instructionRef = useRef<HTMLTextAreaElement | null>(null);
  const [phase, setPhase] = useState<Phase>('compose');
  const [mobileTab, setMobileTab] = useState<MobileTab>('text');
  const [text, setText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [originalLocked, setOriginalLocked] = useState(false);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState('');
  const [examplesOpen, setExamplesOpen] = useState(true);
  const [generation, setGeneration] = useState<RecipeGenerationSuccess | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [previewTab, setPreviewTab] = useState<'before' | 'after'>('after');
  const [fullResult, setFullResult] = useState<Extract<ExecutionResult, { ok: true }> | null>(null);
  const [status, setStatus] = useState<ProcessStatus>('idle');
  const [statusMessage, setStatusMessage] = useState(
    'Paste text, then describe what should change.',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    workerRef.current = new TransformationWorkerClient();
    return () => {
      runIdRef.current += 1;
      workerRef.current?.dispose();
      workerRef.current = null;
    };
  }, []);

  const characters = useMemo(() => countCharacters(text), [text]);
  const lines = useMemo(() => countLines(text), [text]);
  const bytes = useMemo(() => countUtf8Bytes(text), [text]);
  const busy = status === 'generating' || status === 'processing';
  const canGenerate = text.trim().length > 0 && instruction.trim().length > 0 && !busy;
  const canPreview = Boolean(generation) && text.trim().length > 0 && !busy;
  const canApply = Boolean(preview) && !busy;
  const previewEnabled = Boolean(generation || preview);
  const resultEnabled = Boolean(fullResult) || phase === 'result';

  function invalidateDownstream(message: string) {
    setGeneration(null);
    setGenerationError(null);
    setPreview(null);
    setFullResult(null);
    setErrorMessage(null);
    setCopyMessage(null);
    if (status === 'completed' || status === 'failed' || status === 'cancelled') {
      setStatus('idle');
    }
    setStatusMessage(message);
    setPhase('compose');
    setMobileTab('text');
  }

  function updateText(next: string, options?: { asOriginal?: boolean; file?: FileMeta | null }) {
    setText(next);
    if (options?.asOriginal) {
      setOriginalText(next);
      setOriginalLocked(true);
    } else if (!originalLocked) {
      setOriginalText(next);
    }
    if (options && 'file' in options) {
      setFileMeta(options.file ?? null);
    }
    invalidateDownstream('Text updated. Generate again when ready.');
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
        'Replace the current text with this file? Your previous original is kept until you reset.',
      );
      if (!confirmed) {
        return;
      }
    }
    const contents = await file.text();
    if (countUtf8Bytes(contents) > MAX_INPUT_BYTES) {
      setFileError('File contents exceed the local size limit.');
      return;
    }
    updateText(contents, {
      asOriginal: true,
      file: { name: file.name, size: file.size },
    });
    setStatusMessage(`Loaded ${file.name} locally.`);
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void onFileSelected(event.dataTransfer.files);
  }

  function loadExample(exampleInstruction: string) {
    setInstruction(exampleInstruction);
    setGeneration(null);
    setGenerationError(null);
    setPreview(null);
    setFullResult(null);
    setPhase('compose');
    setMobileTab('text');
    setExamplesOpen(false);
    setStatusMessage('Example loaded. Generate the transformation when ready.');
    instructionRef.current?.focus();
  }

  async function generateTransformation() {
    if (!canGenerate) {
      return;
    }
    setOriginalLocked(true);
    setOriginalText(text);
    setStatus('generating');
    setStatusMessage('Building a prototype transformation…');
    setGenerationError(null);
    setErrorMessage(null);
    setPreview(null);
    setFullResult(null);
    try {
      const result = await generator.generate({ instruction });
      if (!result.ok) {
        setGeneration(null);
        setGenerationError(result.message);
        setStatus('idle');
        setStatusMessage('Choose an example transformation to continue.');
        setPhase('compose');
        setMobileTab('text');
        return;
      }
      setGeneration(result);
      setStatus('idle');
      setStatusMessage('Transformation ready. Preview the changes before applying.');
      setPhase('ready');
      setMobileTab('preview');
    } catch (error) {
      setGeneration(null);
      setGenerationError(
        error instanceof Error ? error.message : 'Could not build a transformation.',
      );
      setStatus('failed');
      setStatusMessage('Generation failed.');
    }
  }

  async function runPreview() {
    if (!generation) {
      return;
    }
    const runId = ++runIdRef.current;
    const sample = buildPreviewSample(text);
    setStatus('processing');
    setStatusMessage('Preparing a local preview…');
    setErrorMessage(null);
    setPhase('preview');
    setMobileTab('preview');
    try {
      const result = await workerRef.current!.execute({
        mode: 'preview',
        input: sample.text,
        plan: generation.plan,
      });
      if (runId !== runIdRef.current) {
        return;
      }
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
      setPreviewTab('after');
      setStatus('completed');
      setStatusMessage(
        sample.truncated
          ? 'Preview ready on a sample from the start of your text.'
          : 'Preview ready.',
      );
    } catch (error) {
      if (runId !== runIdRef.current) {
        return;
      }
      if (isWorkerCancellation(error)) {
        setStatus('cancelled');
        setStatusMessage('Cancelled. Previous successful results were kept.');
        return;
      }
      setStatus('failed');
      setPreview(null);
      setErrorMessage(error instanceof Error ? error.message : 'Preview failed.');
      setStatusMessage('Preview failed.');
    }
  }

  async function runFull() {
    if (!generation || !preview) {
      return;
    }
    const runId = ++runIdRef.current;
    setStatus('processing');
    setStatusMessage('Processing the full text locally…');
    setErrorMessage(null);
    setPhase('result');
    setMobileTab('result');
    try {
      const result = await workerRef.current!.execute({
        mode: 'full',
        input: text,
        plan: generation.plan,
      });
      if (runId !== runIdRef.current) {
        return;
      }
      if (!result.ok) {
        setStatus('failed');
        setFullResult(null);
        setErrorMessage(result.error.message);
        setStatusMessage('Processing failed.');
        return;
      }
      setFullResult(result);
      setStatus('completed');
      setStatusMessage('Transformation complete — processed locally.');
    } catch (error) {
      if (runId !== runIdRef.current) {
        return;
      }
      if (isWorkerCancellation(error)) {
        setStatus('cancelled');
        setStatusMessage('Cancelled. Previous successful results were kept.');
        return;
      }
      setStatus('failed');
      setFullResult(null);
      setErrorMessage(error instanceof Error ? error.message : 'Processing failed.');
      setStatusMessage('Processing failed.');
    }
  }

  function cancelProcessing() {
    runIdRef.current += 1;
    workerRef.current?.cancel();
    setStatus('cancelled');
    setErrorMessage(null);
    setStatusMessage('Cancelled. Previous successful results were kept.');
  }

  async function copyResult() {
    if (!fullResult) {
      return;
    }
    try {
      await navigator.clipboard.writeText(fullResult.output);
      setCopyMessage('Copied to the clipboard.');
    } catch {
      setCopyMessage('Copy failed. You can still download the result.');
    }
  }

  function downloadResult() {
    if (!fullResult) {
      return;
    }
    downloadTextFile(buildDownloadFilename(fileMeta?.name ?? null), fullResult.output);
    setCopyMessage('Download started in your browser.');
  }

  function restoreOriginal() {
    setText(originalText);
    setPhase('compose');
    setMobileTab('text');
    if (originalText === text) {
      setStatusMessage('Text already matches the preserved original.');
      return;
    }
    invalidateDownstream('Restored the preserved original text.');
  }

  function startOver() {
    const confirmed = window.confirm('Clear this session and start again?');
    if (!confirmed) {
      return;
    }
    workerRef.current?.cancel();
    setText('');
    setOriginalText('');
    setOriginalLocked(false);
    setFileMeta(null);
    setFileError(null);
    setInstruction('');
    setGeneration(null);
    setGenerationError(null);
    setPreview(null);
    setFullResult(null);
    setStatus('idle');
    setStatusMessage('Paste text, then describe what should change.');
    setErrorMessage(null);
    setCopyMessage(null);
    setPhase('compose');
    setMobileTab('text');
  }

  const friendlyPreview = preview ? summarizeExecution(preview.result) : [];
  const friendlyResult = fullResult ? summarizeExecution(fullResult) : [];

  const composer = (
    <div className="composer" data-testid="instruction-composer">
      <div className="composer-header">
        <label htmlFor="instruction-input">What should change?</label>
        <span className="composer-hint muted">Prototype examples only · ⌘/Ctrl+Enter</span>
      </div>
      <textarea
        id="instruction-input"
        ref={instructionRef}
        className="textarea composer-input"
        rows={2}
        value={instruction}
        onChange={(event) => {
          setInstruction(event.target.value);
          setGeneration(null);
          setGenerationError(null);
          setPreview(null);
          setFullResult(null);
          setPhase('compose');
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            void generateTransformation();
          }
        }}
        placeholder="Example: Remove duplicate lines, trim extra spaces and sort the list alphabetically."
        data-testid="instruction-input"
      />
      <div className="composer-actions">
        <button
          type="button"
          className="button button-secondary button-compact"
          aria-expanded={examplesOpen}
          onClick={() => setExamplesOpen((value) => !value)}
          data-testid="examples-toggle"
        >
          Examples
          <ChevronDown size={16} aria-hidden />
        </button>
        <button
          type="button"
          className="button button-primary"
          disabled={!canGenerate}
          aria-disabled={!canGenerate}
          onClick={() => void generateTransformation()}
          data-testid="generate-transformation"
        >
          {busy && status === 'generating' ? (
            <Loader2 className="spin-icon" size={16} aria-hidden />
          ) : (
            <Sparkles size={16} aria-hidden />
          )}
          Generate transformation
        </button>
      </div>
      <div
        id="examples"
        className={examplesOpen ? 'example-chips is-open' : 'example-chips'}
        role="group"
        aria-label="Example transformations"
      >
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example.id}
            type="button"
            className="chip"
            data-testid={`example-${example.id}`}
            onClick={() => loadExample(example.instruction)}
          >
            {example.label}
          </button>
        ))}
      </div>
      {generationError ? (
        <p className="error-text" role="alert" data-testid="generation-error">
          {generationError}
        </p>
      ) : null}
    </div>
  );

  const sourcePane = (
    <section
      className="workspace-pane source-pane"
      aria-labelledby="your-text-heading"
      data-testid="source-pane"
    >
      <div className="pane-header">
        <h2 id="your-text-heading">Your text</h2>
        <div className="pane-meta" aria-live="polite">
          <span className="stat">{characters} chars</span>
          <span className="stat">{lines} lines</span>
          {fileMeta ? (
            <span className="stat filename-stat" data-testid="file-meta" title={fileMeta.name}>
              {fileMeta.name}
            </span>
          ) : (
            <span className="stat">{formatBytes(bytes)}</span>
          )}
        </div>
      </div>
      <div
        className={dragging ? 'editor-frame is-dragging' : 'editor-frame'}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        data-testid="dropzone"
      >
        <label htmlFor="document-input" className="sr-only">
          Paste text here, or choose a file
        </label>
        <textarea
          id="document-input"
          className="textarea editor-textarea"
          value={text}
          onChange={(event) => updateText(event.target.value)}
          placeholder="Paste text here, or choose a file"
          data-testid="document-input"
        />
      </div>
      <div className="pane-toolbar">
        <label className="button button-secondary button-compact" htmlFor="file-input">
          <FileUp size={16} aria-hidden />
          Choose a file
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
        <button
          type="button"
          className="button button-secondary button-compact"
          onClick={() => {
            if (text.length > 0 && !window.confirm('Clear the current text?')) {
              return;
            }
            updateText('', { asOriginal: true, file: null });
            setFileError(null);
          }}
          data-testid="clear-input"
        >
          Clear
        </button>
        <button
          type="button"
          className="button button-secondary button-compact"
          onClick={restoreOriginal}
          disabled={originalText.length === 0}
          data-testid="restore-original"
        >
          Restore original
        </button>
        <span className="muted file-hint desktop-only">
          .txt · .md · .csv · .tsv · .log · up to {formatBytes(MAX_INPUT_BYTES)} · stays on device
        </span>
      </div>
      {fileError ? (
        <p className="error-text" role="alert" data-testid="file-error">
          {fileError}
        </p>
      ) : null}
    </section>
  );

  const rightPane = (
    <section
      className="workspace-pane result-pane"
      aria-labelledby="intelligence-heading"
      data-testid="result-pane"
    >
      <div className="pane-header">
        <h2 id="intelligence-heading">
          {phase === 'result'
            ? 'Result'
            : phase === 'preview' || preview
              ? 'Preview'
              : generation
                ? 'Transformation'
                : 'Preview'}
        </h2>
        <p className="status-line" aria-live="polite" data-testid="simple-status">
          {busy ? <Loader2 className="spin-icon" aria-hidden size={16} /> : null}
          {statusMessage}
          {busy ? (
            <button
              type="button"
              className="button button-secondary button-compact"
              onClick={cancelProcessing}
              data-testid="cancel-processing"
            >
              Cancel
            </button>
          ) : null}
        </p>
      </div>

      {errorMessage ? (
        <p className="error-text" role="alert" data-testid="simple-error">
          {errorMessage}
        </p>
      ) : null}

      {!generation && !preview && !fullResult ? (
        <div className="empty-intelligence" data-testid="intelligence-empty">
          <p>Generate a transformation to preview changes here.</p>
          <p className="muted">Pick an example below the instruction field, then generate.</p>
        </div>
      ) : null}

      {generation && (phase === 'ready' || phase === 'preview' || phase === 'result') ? (
        <div className="stack intelligence-block" data-testid="generation-summary">
          <div className="meta-row">
            <strong>{generation.title}</strong>
            <span className="badge badge-soft">Prototype</span>
          </div>
          <p style={{ margin: 0 }}>{generation.explanation}</p>
          {generation.assumptions.length > 0 || generation.warnings.length > 0 ? (
            <ul className="muted compact-list">
              {generation.assumptions.map((item) => (
                <li key={item}>Assumption: {item}</li>
              ))}
              {generation.warnings.map((item) => (
                <li key={item}>Warning: {item}</li>
              ))}
            </ul>
          ) : null}
          <AdvancedDetails plan={generation.plan} />
          {phase === 'ready' ? (
            <button
              type="button"
              className="button button-primary"
              disabled={!canPreview}
              aria-disabled={!canPreview}
              onClick={() => void runPreview()}
              data-testid="run-preview"
            >
              Preview
            </button>
          ) : null}
        </div>
      ) : null}

      {(phase === 'preview' || preview) && preview ? (
        <div className="stack intelligence-block" data-testid="preview-stage">
          <p className="muted" data-testid="preview-truncation">
            {preview.truncated
              ? 'Showing a sample from the start of your text.'
              : 'Preview covers your full text.'}
          </p>
          <div className="segmented" role="tablist" aria-label="Preview view">
            <button
              type="button"
              role="tab"
              className={previewTab === 'before' ? 'segment is-active' : 'segment'}
              aria-selected={previewTab === 'before'}
              onClick={() => setPreviewTab('before')}
            >
              Before
            </button>
            <button
              type="button"
              role="tab"
              className={previewTab === 'after' ? 'segment is-active' : 'segment'}
              aria-selected={previewTab === 'after'}
              onClick={() => setPreviewTab('after')}
            >
              After
            </button>
          </div>
          <div className="preview-grid">
            <div className={previewTab === 'before' ? 'preview-pane is-active' : 'preview-pane'}>
              <h3>Before</h3>
              <pre className="code-block" data-testid="preview-before">
                {preview.sampleText}
              </pre>
            </div>
            <div className={previewTab === 'after' ? 'preview-pane is-active' : 'preview-pane'}>
              <h3>After</h3>
              <pre className="code-block" data-testid="preview-after">
                {preview.result.output}
              </pre>
            </div>
          </div>
          <ul className="friendly-report" data-testid="friendly-preview-report">
            {friendlyPreview.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button
            type="button"
            className="button button-primary"
            disabled={!canApply}
            aria-disabled={!canApply}
            onClick={() => void runFull()}
            data-testid="run-full"
          >
            Apply locally
          </button>
        </div>
      ) : null}

      {phase === 'result' ? (
        <div className="stack intelligence-block" data-testid="result-stage">
          {fullResult ? (
            <>
              <span className="success-pill" data-testid="success-pill">
                <CheckCircle2 size={16} aria-hidden />
                Transformation complete — processed locally
              </span>
              <ul className="friendly-report" data-testid="friendly-result-report">
                {friendlyResult.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <label htmlFor="result-output">Transformed text</label>
              <textarea
                id="result-output"
                className="textarea result-textarea"
                readOnly
                value={fullResult.output}
                data-testid="result-output"
              />
              <div className="actions wrap-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => void copyResult()}
                  data-testid="copy-result"
                >
                  <Copy size={16} aria-hidden />
                  Copy
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={downloadResult}
                  data-testid="download-result"
                >
                  <Download size={16} aria-hidden />
                  Download
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={restoreOriginal}
                  data-testid="restore-original-from-result"
                >
                  <RotateCcw size={16} aria-hidden />
                  Restore original
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setPhase('compose');
                    setMobileTab('text');
                    setStatusMessage('Edit your instruction and generate again.');
                  }}
                  data-testid="edit-instruction"
                >
                  Edit instruction
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={startOver}
                  data-testid="start-over"
                >
                  <X size={16} aria-hidden />
                  Start again
                </button>
              </div>
              {copyMessage ? (
                <p className="muted" aria-live="polite" data-testid="copy-message">
                  {copyMessage}
                </p>
              ) : null}
            </>
          ) : (
            <p className="muted">Apply the transformation to see the full result.</p>
          )}
        </div>
      ) : null}
    </section>
  );

  return (
    <div className="app-workspace" data-testid="simple-app-shell">
      <div className="mobile-tabs" role="tablist" aria-label="Workspace" data-testid="mobile-tabs">
        <button
          type="button"
          role="tab"
          className={mobileTab === 'text' ? 'mobile-tab is-active' : 'mobile-tab'}
          aria-selected={mobileTab === 'text'}
          data-testid="mobile-tab-text"
          onClick={() => setMobileTab('text')}
        >
          Text
        </button>
        <button
          type="button"
          role="tab"
          className={mobileTab === 'preview' ? 'mobile-tab is-active' : 'mobile-tab'}
          aria-selected={mobileTab === 'preview'}
          aria-disabled={!previewEnabled}
          disabled={!previewEnabled}
          data-testid="mobile-tab-preview"
          onClick={() => previewEnabled && setMobileTab('preview')}
        >
          Preview
        </button>
        <button
          type="button"
          role="tab"
          className={mobileTab === 'result' ? 'mobile-tab is-active' : 'mobile-tab'}
          aria-selected={mobileTab === 'result'}
          aria-disabled={!resultEnabled}
          disabled={!resultEnabled}
          data-testid="mobile-tab-result"
          onClick={() => resultEnabled && setMobileTab('result')}
        >
          Result
        </button>
      </div>

      <div className="workspace-split">
        <div
          className={mobileTab === 'text' ? 'mobile-surface is-active' : 'mobile-surface'}
          data-mobile-surface="text"
        >
          {sourcePane}
        </div>
        <div
          className={
            mobileTab === 'preview' || mobileTab === 'result'
              ? 'mobile-surface is-active'
              : 'mobile-surface'
          }
          data-mobile-surface="intelligence"
        >
          {rightPane}
        </div>
        <div className="composer-slot" data-testid="mobile-composer">
          {composer}
        </div>
      </div>
    </div>
  );
}

function AdvancedDetails({ plan }: { plan: TransformationPlan }) {
  return (
    <details className="advanced-details" data-testid="advanced-details">
      <summary>Advanced details</summary>
      <div className="stack">
        <p className="muted" style={{ margin: 0 }}>
          Trusted operations run locally in your browser. Generated code is never executed.
        </p>
        <ul className="compact-list">
          {plan.operations.map((operation) => (
            <li key={operation.id}>
              {operation.description || operation.type}
              {!operation.enabled ? ' (disabled)' : ''}
            </li>
          ))}
        </ul>
        <details data-testid="technical-recipe">
          <summary>View technical recipe (JSON)</summary>
          <pre className="code-block">{JSON.stringify(plan, null, 2)}</pre>
        </details>
      </div>
    </details>
  );
}
