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
  createRecipeGenerator,
  fetchRecipeGeneratorStatus,
} from '@/generation/create-recipe-generator';
import { EXAMPLE_PROMPTS } from '@/generation/local-prototype-generator';
import { summarizeExecution } from '@/generation/friendly-report';
import { selectDocumentSamples, type DocumentSample } from '@/generation/select-document-samples';
import type {
  PublicRecipeGeneratorStatus,
  RecipeGenerationAdapter,
  RecipeGenerationSuccess,
} from '@/generation/types';
import { SampleReviewPanel } from '@/components/simple/SampleReviewPanel';
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

type Phase = 'compose' | 'review' | 'ready' | 'preview' | 'result';
type MobileTab = 'text' | 'preview' | 'result';
type ProcessStatus = 'idle' | 'generating' | 'processing' | 'completed' | 'cancelled' | 'failed';
type FileMeta = { name: string; size: number };
type PreviewState = {
  sampleText: string;
  truncated: boolean;
  result: Extract<ExecutionResult, { ok: true }>;
};

type SimpleAppShellProps = {
  readonly initialStatus?: PublicRecipeGeneratorStatus;
  readonly generatorOverride?: RecipeGenerationAdapter;
  readonly initialDocument?: string;
  readonly initialInstruction?: string;
};

export function SimpleAppShell({
  initialStatus,
  generatorOverride,
  initialDocument = '',
  initialInstruction = '',
}: SimpleAppShellProps = {}) {
  const workerRef = useRef<TransformationWorkerClient | null>(null);
  const runIdRef = useRef(0);
  const generateAbortRef = useRef<AbortController | null>(null);
  const instructionRef = useRef<HTMLTextAreaElement | null>(null);
  const [generatorStatus, setGeneratorStatus] = useState<PublicRecipeGeneratorStatus>(
    initialStatus ?? { mode: 'prototype', openaiReady: false },
  );
  const [generator, setGenerator] = useState<RecipeGenerationAdapter>(
    () =>
      generatorOverride ??
      createRecipeGenerator(initialStatus ?? { mode: 'prototype', openaiReady: false }),
  );
  const [phase, setPhase] = useState<Phase>('compose');
  const [mobileTab, setMobileTab] = useState<MobileTab>('text');
  const [text, setText] = useState(initialDocument);
  const [originalText, setOriginalText] = useState(initialDocument);
  const [originalLocked, setOriginalLocked] = useState(false);
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [instruction, setInstruction] = useState(initialInstruction);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [reviewSamples, setReviewSamples] = useState<DocumentSample[]>([]);
  const [autoSamples, setAutoSamples] = useState<DocumentSample[]>([]);
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
      generateAbortRef.current?.abort();
      workerRef.current?.dispose();
      workerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (generatorOverride || initialStatus) {
      return;
    }
    let cancelled = false;
    void fetchRecipeGeneratorStatus().then((next) => {
      if (cancelled) {
        return;
      }
      setGeneratorStatus(next);
      setGenerator(createRecipeGenerator(next));
    });
    return () => {
      cancelled = true;
    };
  }, [generatorOverride, initialStatus]);

  useEffect(() => {
    const openExamples = () => {
      setExamplesOpen(true);
      instructionRef.current?.focus();
    };
    window.addEventListener('tft:open-examples', openExamples);
    return () => window.removeEventListener('tft:open-examples', openExamples);
  }, []);

  const characters = useMemo(() => countCharacters(text), [text]);
  const lines = useMemo(() => countLines(text), [text]);
  const bytes = useMemo(() => countUtf8Bytes(text), [text]);
  const busy = status === 'generating' || status === 'processing';
  const canGenerate = text.trim().length > 0 && instruction.trim().length > 0 && !busy;
  const canPreview = Boolean(generation) && text.trim().length > 0 && !busy;
  const canApply = Boolean(preview) && !busy;
  const resultEnabled = Boolean(fullResult) || phase === 'result';

  function invalidateDownstream(message: string) {
    generateAbortRef.current?.abort();
    generateAbortRef.current = null;
    setGeneration(null);
    setGenerationError(null);
    setPreview(null);
    setFullResult(null);
    setReviewSamples([]);
    setAutoSamples([]);
    setErrorMessage(null);
    setCopyMessage(null);
    if (
      status === 'completed' ||
      status === 'failed' ||
      status === 'cancelled' ||
      status === 'generating'
    ) {
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
    setReviewSamples([]);
    setAutoSamples([]);
    setPhase('compose');
    setMobileTab('text');
    setExamplesOpen(false);
    setStatusMessage('Example loaded. Generate the transformation when ready.');
    instructionRef.current?.focus();
  }

  function openSampleReview() {
    const selected = selectDocumentSamples(text);
    setAutoSamples(selected);
    setReviewSamples(selected);
    setGeneration(null);
    setGenerationError(null);
    setPreview(null);
    setFullResult(null);
    setPhase('review');
    setMobileTab('preview');
    setStatus('idle');
    setStatusMessage('Review the excerpts that will be sent, then generate safely.');
  }

  async function runGeneration(samples?: readonly DocumentSample[]) {
    setOriginalLocked(true);
    setOriginalText(text);
    setStatus('generating');
    setStatusMessage(
      generator.requiresSampleReview
        ? 'Creating a safe transformation…'
        : 'Building a prototype transformation…',
    );
    setGenerationError(null);
    setErrorMessage(null);
    setPreview(null);
    setFullResult(null);

    const abort = new AbortController();
    generateAbortRef.current?.abort();
    generateAbortRef.current = abort;

    try {
      const result = await generator.generate({
        instruction,
        samples,
        documentMetadata: samples
          ? {
              characters,
              lines,
              bytes,
              ...(fileMeta?.name.includes('.')
                ? { fileExtension: fileMeta.name.split('.').pop()?.slice(0, 16) }
                : {}),
            }
          : undefined,
        signal: abort.signal,
      });
      if (abort.signal.aborted) {
        setStatus('cancelled');
        setStatusMessage('Generation cancelled.');
        return;
      }
      if (!result.ok) {
        setGeneration(null);
        setGenerationError(result.message);
        setStatus(result.code === 'CANCELLED' ? 'cancelled' : 'idle');
        if (result.code === 'UNSUPPORTED_INSTRUCTION') {
          setStatusMessage('This request is outside the local transformation engine.');
        } else if (result.code === 'RATE_LIMITED') {
          setStatusMessage('Rate limited. Wait a moment and try again.');
        } else if (result.code === 'CONFIGURATION_UNAVAILABLE') {
          setStatusMessage('AI recipe generation is not configured yet.');
        } else if (result.code === 'CANCELLED') {
          setStatusMessage('Generation cancelled.');
        } else {
          setStatusMessage('Generation did not succeed.');
        }
        setPhase('compose');
        setMobileTab('text');
        return;
      }
      setReviewSamples([]);
      setGeneration(result);
      setStatus('idle');
      setStatusMessage('Transformation ready. Preview the changes before applying.');
      setPhase('ready');
      setMobileTab('preview');
    } catch (error) {
      if (abort.signal.aborted) {
        setStatus('cancelled');
        setStatusMessage('Generation cancelled.');
        return;
      }
      setGeneration(null);
      setGenerationError(
        error instanceof Error ? error.message : 'Could not build a transformation.',
      );
      setStatus('failed');
      setStatusMessage('Generation failed.');
    } finally {
      if (generateAbortRef.current === abort) {
        generateAbortRef.current = null;
      }
    }
  }

  async function generateTransformation() {
    if (!canGenerate) {
      return;
    }
    if (generator.requiresSampleReview) {
      openSampleReview();
      return;
    }
    await runGeneration();
  }

  async function approveSampleReview() {
    if (reviewSamples.length === 0) {
      setGenerationError('Keep at least one excerpt to generate safely.');
      return;
    }
    await runGeneration(reviewSamples);
  }

  function cancelSampleReview() {
    setReviewSamples([]);
    setAutoSamples([]);
    setPhase('compose');
    setMobileTab('text');
    setStatus('idle');
    setStatusMessage('Sample review cancelled. Nothing was sent.');
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
    generateAbortRef.current?.abort();
    generateAbortRef.current = null;
    workerRef.current?.cancel();
    if (status === 'generating') {
      setStatus('cancelled');
      setStatusMessage('Generation cancelled.');
      return;
    }
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
    setReviewSamples([]);
    setAutoSamples([]);
    setStatus('idle');
    setStatusMessage('Paste text, then describe what should change.');
    setErrorMessage(null);
    setCopyMessage(null);
    setPhase('compose');
    setMobileTab('text');
  }

  const friendlyPreview = preview ? summarizeExecution(preview.result) : [];
  const friendlyResult = fullResult ? summarizeExecution(fullResult) : [];
  const featuredExamples = EXAMPLE_PROMPTS.slice(0, 2);
  const moreExamples = EXAMPLE_PROMPTS.slice(2);
  const canRestore = originalText.length > 0 && text !== originalText;
  const fileLimitLabel = formatBytes(MAX_INPUT_BYTES);
  const openaiMode = generatorStatus.mode === 'openai';
  const previewEnabled = Boolean(generation || preview || phase === 'review');
  const modeHint = openaiMode
    ? 'AI recipes · local execution · ⌘/Ctrl+Enter'
    : 'Prototype mode · ⌘/Ctrl+Enter';
  const modeBadge = generation
    ? generation.prototype
      ? 'Prototype'
      : 'AI recipes · local execution'
    : openaiMode
      ? 'AI recipes · local execution'
      : 'Prototype';

  const composer = (
    <div className="composer composer-card" data-testid="instruction-composer">
      <div className="composer-header">
        <label htmlFor="instruction-input">What should change?</label>
      </div>
      <textarea
        id="instruction-input"
        ref={instructionRef}
        className="textarea composer-input"
        rows={3}
        value={instruction}
        onChange={(event) => {
          setInstruction(event.target.value);
          setGeneration(null);
          setGenerationError(null);
          setPreview(null);
          setFullResult(null);
          setReviewSamples([]);
          setAutoSamples([]);
          setPhase('compose');
        }}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            event.preventDefault();
            void generateTransformation();
          }
        }}
        placeholder="Remove duplicate lines, trim extra spaces, and sort the list alphabetically…"
        data-testid="instruction-input"
      />
      <div
        id="examples"
        className="example-featured"
        data-testid="example-featured"
        role="group"
        aria-label="Suggested examples"
      >
        {featuredExamples.map((example) => (
          <button
            key={example.id}
            type="button"
            className="example-suggestion"
            data-testid={`example-${example.id}`}
            onClick={() => loadExample(example.instruction)}
          >
            {example.label}
          </button>
        ))}
      </div>
      <div className="composer-footer">
        <div className="composer-footer-left">
          <button
            type="button"
            className="button button-secondary button-compact"
            aria-expanded={examplesOpen}
            aria-controls="examples-menu"
            onClick={() => setExamplesOpen((value) => !value)}
            data-testid="examples-toggle"
          >
            Examples
            <ChevronDown size={16} aria-hidden />
          </button>
          <span
            className="composer-proto muted"
            data-testid="composer-prototype-hint"
            title={
              openaiMode
                ? 'Only approved excerpts are sent. The complete document stays in your browser.'
                : generator.modeLabel
            }
          >
            {modeHint}
          </span>
        </div>
        <button
          type="button"
          className={
            busy && status === 'generating'
              ? 'button button-primary is-loading'
              : 'button button-primary'
          }
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
        id="examples-menu"
        className={examplesOpen ? 'example-menu is-open' : 'example-menu'}
        role="menu"
        aria-label="More example transformations"
        hidden={!examplesOpen}
        data-testid="examples-menu"
      >
        {moreExamples.map((example) => (
          <button
            key={example.id}
            type="button"
            role="menuitem"
            className="example-menu-item"
            data-testid={`example-${example.id}`}
            onClick={() => loadExample(example.instruction)}
          >
            {example.label}
          </button>
        ))}
      </div>
      {generationError ? (
        <div className="stack" data-testid="generation-error-block">
          <p className="error-text" role="alert" data-testid="generation-error">
            {generationError}
          </p>
          {/open-ended writing|outside the local transformation|prototype currently supports/i.test(
            generationError,
          ) ? (
            <div className="actions wrap-actions">
              <button
                type="button"
                className="button button-secondary button-compact"
                onClick={() => instructionRef.current?.focus()}
                data-testid="edit-instruction-from-unsupported"
              >
                Edit instruction
              </button>
              <button
                type="button"
                className="button button-tertiary button-compact"
                onClick={() => setExamplesOpen(true)}
                data-testid="try-example-from-unsupported"
              >
                Try an example
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const sourcePane = (
    <section
      className="workspace-pane source-pane"
      aria-labelledby="your-text-heading"
      data-testid="source-pane"
    >
      <div className="pane-header source-header">
        <div className="source-heading-group">
          <h2 id="your-text-heading">Your text</h2>
          {fileMeta ? (
            <span className="filename-stat" data-testid="file-meta" title={fileMeta.name}>
              {fileMeta.name}
            </span>
          ) : null}
        </div>
        <div className="pane-meta" aria-live="polite">
          <span className="stat">{characters} chars</span>
          <span className="stat">{lines} lines</span>
          <span className="stat">{formatBytes(bytes)}</span>
          <label className="button button-secondary button-compact" htmlFor="file-input">
            <FileUp size={16} aria-hidden />
            Choose file
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
        </div>
      </div>
      <div
        className={dragging ? 'editor-frame is-dragging' : 'editor-frame'}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={onDrop}
        data-testid="dropzone"
      >
        <div className="editor-document">
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
          {dragging ? (
            <div className="editor-drop-overlay" role="status" data-testid="drop-overlay">
              Drop the file to open it locally
            </div>
          ) : null}
        </div>
      </div>
      <div className="pane-toolbar">
        <button
          type="button"
          className="button button-tertiary button-compact"
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
        {canRestore ? (
          <button
            type="button"
            className="button button-secondary button-compact"
            onClick={restoreOriginal}
            data-testid="restore-original"
          >
            Restore original
          </button>
        ) : null}
        <span
          className="muted file-hint"
          title=".txt, .md, .csv, .tsv, and .log files up to the local size limit. Files stay on this device and are never uploaded."
        >
          Plain-text files · up to {fileLimitLabel}
        </span>
        <span className="local-status" title="Your text is processed in this browser only.">
          Stays on this device
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
            : phase === 'review'
              ? 'Review'
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

      {!generation && !preview && !fullResult && phase !== 'review' ? (
        <div className="empty-intelligence" data-testid="intelligence-empty">
          <div className="preview-empty-visual" aria-hidden="true">
            <div className="preview-empty-card is-messy">
              <span> apple </span>
              <span> apple </span>
              <span> banana </span>
            </div>
            <div className="preview-empty-arrow">
              <Sparkles size={16} />
            </div>
            <div className="preview-empty-card is-clean">
              <span>apple</span>
              <span>banana</span>
            </div>
          </div>
          <h3>Your preview will appear here</h3>
          <p className="muted">
            Describe a change to compare the original and transformed text before applying it.
          </p>
          <p className="muted empty-intelligence-note">
            The full document is processed only after you approve the preview.
          </p>
        </div>
      ) : null}

      {phase === 'review' ? (
        <SampleReviewPanel
          instruction={instruction}
          samples={reviewSamples}
          documentCharacters={characters}
          busy={busy}
          onChangeSample={(id, nextText) => {
            setReviewSamples((current) =>
              current.map((sample) => (sample.id === id ? { ...sample, text: nextText } : sample)),
            );
          }}
          onRemoveSample={(id) => {
            setReviewSamples((current) => current.filter((sample) => sample.id !== id));
          }}
          onRestoreSamples={() => setReviewSamples(autoSamples)}
          onCancel={cancelSampleReview}
          onApprove={() => void approveSampleReview()}
        />
      ) : null}

      {status === 'generating' ? (
        <div className="stack intelligence-block" data-testid="generating-state">
          <p style={{ margin: 0 }}>Creating a safe transformation…</p>
          <div className="progress-pulse" aria-hidden="true" />
        </div>
      ) : null}

      {generation && (phase === 'ready' || phase === 'preview' || phase === 'result') ? (
        <div className="stack intelligence-block" data-testid="generation-summary">
          <div className="meta-row">
            <strong>{generation.title}</strong>
            <span className="badge badge-soft" data-testid="generation-mode-badge">
              {modeBadge}
            </span>
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
              <div className="actions wrap-actions result-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => void copyResult()}
                  data-testid="copy-result"
                >
                  <Copy size={16} aria-hidden />
                  Copy
                </button>
                <button
                  type="button"
                  className="button button-primary"
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
                  className="button button-tertiary"
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
                  className="button button-tertiary"
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
