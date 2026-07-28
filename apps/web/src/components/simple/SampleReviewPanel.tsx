'use client';

import type { DocumentSample } from '@/generation/select-document-samples';

type SampleReviewPanelProps = {
  readonly instruction: string;
  readonly samples: readonly DocumentSample[];
  readonly documentCharacters: number;
  readonly busy: boolean;
  readonly onChangeSample: (id: string, text: string) => void;
  readonly onRemoveSample: (id: string) => void;
  readonly onRestoreSamples: () => void;
  readonly onCancel: () => void;
  readonly onApprove: () => void;
};

function formatCount(value: number): string {
  return value.toLocaleString('en-GB');
}

export function SampleReviewPanel({
  instruction,
  samples,
  documentCharacters,
  busy,
  onChangeSample,
  onRemoveSample,
  onRestoreSamples,
  onCancel,
  onApprove,
}: SampleReviewPanelProps) {
  const selectedCharacters = samples.reduce((sum, sample) => sum + sample.text.length, 0);
  const canApprove = samples.length > 0 && samples.every((sample) => sample.text.trim().length > 0);

  return (
    <div className="stack intelligence-block sample-review" data-testid="sample-review">
      <div className="meta-row">
        <strong>Review what will be sent</strong>
      </div>
      <p className="muted" style={{ margin: 0 }}>
        Your instruction and the excerpts below will be sent to the AI service. The complete
        document stays in your browser.
      </p>
      <div className="sample-review-summary" data-testid="sample-review-summary">
        <span>
          {formatCount(selectedCharacters)} of {formatCount(documentCharacters)} characters selected
        </span>
      </div>
      <div className="sample-review-instruction">
        <h3>Instruction</h3>
        <pre className="code-block" data-testid="sample-review-instruction">
          {instruction}
        </pre>
      </div>
      <div className="stack" data-testid="sample-review-list">
        {samples.map((sample) => (
          <div key={sample.id} className="sample-review-item" data-testid={`sample-${sample.id}`}>
            <div className="meta-row">
              <strong>{sample.label}</strong>
              <span className="muted">{formatCount(sample.text.length)} characters</span>
            </div>
            <textarea
              className="textarea"
              rows={5}
              value={sample.text}
              aria-label={`Excerpt ${sample.label}`}
              data-testid={`sample-text-${sample.id}`}
              onChange={(event) => onChangeSample(sample.id, event.target.value)}
            />
            <button
              type="button"
              className="button button-tertiary button-compact"
              disabled={samples.length <= 1 || busy}
              onClick={() => onRemoveSample(sample.id)}
              data-testid={`sample-remove-${sample.id}`}
            >
              Remove excerpt
            </button>
          </div>
        ))}
      </div>
      {samples.length === 0 ? (
        <p className="error-text" role="alert">
          Keep at least one excerpt to generate safely.
        </p>
      ) : null}
      <div className="actions wrap-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={!canApprove || busy}
          aria-disabled={!canApprove || busy}
          onClick={onApprove}
          data-testid="generate-safely"
        >
          Generate safely
        </button>
        <button
          type="button"
          className="button button-secondary"
          disabled={busy}
          onClick={onCancel}
          data-testid="cancel-sample-review"
        >
          Cancel
        </button>
        <button
          type="button"
          className="button button-tertiary"
          disabled={busy}
          onClick={onRestoreSamples}
          data-testid="restore-samples"
        >
          Restore selected excerpts
        </button>
      </div>
    </div>
  );
}
