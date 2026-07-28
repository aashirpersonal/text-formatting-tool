'use client';

import { useId, useMemo, useState } from 'react';
import { countCharacters, countLines, validatePlainTextFile } from '@/lib/text-utils';

const EXAMPLE_RECIPE = `{
  "planVersion": "example-only",
  "operations": [
    { "op": "trimLines" },
    { "op": "dedupeExactLines" }
  ]
}`;

const EXAMPLE_PREVIEW = `before:  apple\\napple\\n banana
after:   apple\\nbanana`;

export function WorkspaceShell() {
  const [text, setText] = useState('');
  const [instruction, setInstruction] = useState('');
  const [fileError, setFileError] = useState<string | null>(null);
  const textId = useId();
  const instructionId = useId();
  const fileId = useId();

  const characters = useMemo(() => countCharacters(text), [text]);
  const lines = useMemo(() => countLines(text), [text]);

  async function onFileSelected(fileList: FileList | null) {
    setFileError(null);
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    const validation = validatePlainTextFile(file);
    if (!validation.ok) {
      setFileError(validation.reason);
      return;
    }
    const contents = await file.text();
    setText(contents);
  }

  return (
    <div className="grid-2">
      <section className="panel stack" aria-labelledby="input-heading">
        <div className="meta-row">
          <h2 id="input-heading" style={{ margin: 0 }}>
            1. Add text or file
          </h2>
          <div aria-live="polite" className="meta-row">
            <span className="stat" data-testid="char-count">
              {characters} characters
            </span>
            <span className="stat" data-testid="line-count">
              {lines} lines
            </span>
          </div>
        </div>

        <div className="callout" role="status" data-testid="privacy-status">
          Privacy status: this scaffold does not send entered text to an AI service. No recipe
          generation request is made from this page.
        </div>

        <label htmlFor={textId}>Document text</label>
        <textarea
          id={textId}
          className="textarea"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste or type plain text here…"
          data-testid="document-input"
        />

        <div className="actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => {
              setText('');
              setFileError(null);
            }}
            data-testid="clear-input"
          >
            Clear input
          </button>
          <label className="button button-secondary" htmlFor={fileId} style={{ cursor: 'pointer' }}>
            Load plain-text file
          </label>
          <input
            id={fileId}
            type="file"
            accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
            hidden
            onChange={(event) => {
              void onFileSelected(event.target.files);
              event.target.value = '';
            }}
            data-testid="file-input"
          />
        </div>
        {fileError ? (
          <p className="error-text" role="alert">
            {fileError}
          </p>
        ) : null}
      </section>

      <div className="stack">
        <section className="panel stack" aria-labelledby="instruction-heading">
          <h2 id="instruction-heading" style={{ margin: 0 }}>
            2–4. Describe, sample, recipe
          </h2>
          <label htmlFor={instructionId}>Transformation instruction</label>
          <input
            id={instructionId}
            className="input"
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Example: remove duplicate lines and trim whitespace"
            data-testid="instruction-input"
          />
          <button
            type="button"
            className="button button-primary"
            disabled
            aria-disabled="true"
            title="Unavailable until the recipe engine is implemented"
            data-testid="generate-recipe"
          >
            Generate recipe (unavailable)
          </button>
          <p className="muted" style={{ margin: 0 }} data-testid="recipe-unavailable-note">
            Recipe generation, sample review, and AI calls are not implemented in this milestone.
            Entering an instruction does not process your document.
          </p>
        </section>

        <section className="panel stack" aria-labelledby="example-recipe-heading">
          <div>
            <span className="example-label">Example only</span>
            <h2 id="example-recipe-heading" style={{ margin: 0 }}>
              Illustrative recipe
            </h2>
          </div>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            {EXAMPLE_RECIPE}
          </pre>
        </section>

        <section className="panel stack" aria-labelledby="example-preview-heading">
          <div>
            <span className="example-label">Example only</span>
            <h2 id="example-preview-heading" style={{ margin: 0 }}>
              Illustrative preview
            </h2>
          </div>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
            }}
          >
            {EXAMPLE_PREVIEW}
          </pre>
          <p className="muted" style={{ margin: 0 }}>
            5–7. Preview, process locally, and export will use a trusted engine in a later
            milestone. Nothing on this page has been transformed by AI.
          </p>
        </section>
      </div>
    </div>
  );
}
