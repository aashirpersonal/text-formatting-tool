'use client';

import type { TransformationOperation } from '@tft/transformation-schema';
import { humanExplanationForOperation, humanTitleForOperation } from '@/recipes/operation-factory';

type Props = {
  operation: TransformationOperation;
  index: number;
  total: number;
  fieldErrors: readonly string[];
  onChange: (next: TransformationOperation) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export function OperationCard({
  operation,
  index,
  total,
  fieldErrors,
  onChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: Props) {
  const title = humanTitleForOperation(operation.type);
  const explanation = humanExplanationForOperation(operation.type);

  return (
    <article
      className="panel stack operation-card"
      data-testid={`operation-card-${operation.id}`}
      aria-labelledby={`op-title-${operation.id}`}
    >
      <div className="meta-row">
        <div>
          <h3 id={`op-title-${operation.id}`} style={{ margin: 0 }}>
            {title}
          </h3>
          <p className="muted" style={{ margin: '0.25rem 0 0' }}>
            {explanation}
          </p>
        </div>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={operation.enabled}
            onChange={(event) => onChange({ ...operation, enabled: event.target.checked })}
            data-testid={`operation-enabled-${operation.id}`}
          />
          Enabled
        </label>
      </div>

      <div className="field-grid">{renderFields(operation, onChange)}</div>

      {fieldErrors.length > 0 ? (
        <ul className="error-list" role="alert">
          {fieldErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}

      <div className="actions">
        <button
          type="button"
          className="button button-secondary"
          onClick={onMoveUp}
          disabled={index === 0}
          aria-label={`Move ${title} up`}
          data-testid={`operation-up-${operation.id}`}
        >
          Move up
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={onMoveDown}
          disabled={index >= total - 1}
          aria-label={`Move ${title} down`}
          data-testid={`operation-down-${operation.id}`}
        >
          Move down
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          data-testid={`operation-remove-${operation.id}`}
        >
          Remove
        </button>
      </div>

      <details>
        <summary>Advanced details</summary>
        <p className="muted" style={{ marginBottom: 0 }}>
          Internal type: <code>{operation.type}</code>
          <br />
          Operation ID: <code>{operation.id}</code>
        </p>
        <label htmlFor={`desc-${operation.id}`}>Description</label>
        <input
          id={`desc-${operation.id}`}
          className="input"
          value={operation.description}
          onChange={(event) => onChange({ ...operation, description: event.target.value })}
        />
      </details>
    </article>
  );
}

function renderFields(
  operation: TransformationOperation,
  onChange: (next: TransformationOperation) => void,
) {
  switch (operation.type) {
    case 'replace.literal':
      return (
        <>
          <label>
            Text to find
            <input
              className="input"
              value={operation.find}
              onChange={(event) => onChange({ ...operation, find: event.target.value })}
              data-testid={`field-find-${operation.id}`}
            />
          </label>
          <label>
            Replacement
            <input
              className="input"
              value={operation.replacement}
              onChange={(event) => onChange({ ...operation, replacement: event.target.value })}
              data-testid={`field-replacement-${operation.id}`}
            />
          </label>
          <label>
            Occurrences
            <select
              className="input"
              value={operation.occurrence}
              onChange={(event) =>
                onChange({
                  ...operation,
                  occurrence: event.target.value as 'first' | 'all',
                })
              }
            >
              <option value="first">First only</option>
              <option value="all">All</option>
            </select>
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={operation.caseSensitive}
              onChange={(event) => onChange({ ...operation, caseSensitive: event.target.checked })}
            />
            Case-sensitive
          </label>
        </>
      );
    case 'lines.trim':
      return (
        <label>
          Trim mode
          <select
            className="input"
            value={operation.mode}
            onChange={(event) =>
              onChange({
                ...operation,
                mode: event.target.value as 'start' | 'end' | 'both',
              })
            }
            data-testid={`field-trim-mode-${operation.id}`}
          >
            <option value="both">Start and end</option>
            <option value="start">Start only</option>
            <option value="end">End only</option>
          </select>
        </label>
      );
    case 'lines.removeEmpty':
      return (
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={operation.whitespaceOnly}
            onChange={(event) => onChange({ ...operation, whitespaceOnly: event.target.checked })}
          />
          Treat whitespace-only lines as empty
        </label>
      );
    case 'lines.dedupe':
      return (
        <>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={operation.caseSensitive}
              onChange={(event) => onChange({ ...operation, caseSensitive: event.target.checked })}
            />
            Case-sensitive comparison
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={operation.trimBeforeCompare}
              onChange={(event) =>
                onChange({ ...operation, trimBeforeCompare: event.target.checked })
              }
            />
            Trim before comparison
          </label>
        </>
      );
    case 'lines.filterContains':
      return (
        <>
          <label>
            Literal text
            <input
              className="input"
              value={operation.needle}
              onChange={(event) => onChange({ ...operation, needle: event.target.value })}
              data-testid={`field-needle-${operation.id}`}
            />
          </label>
          <label>
            Action
            <select
              className="input"
              value={operation.keep}
              onChange={(event) =>
                onChange({
                  ...operation,
                  keep: event.target.value as 'matching' | 'nonMatching',
                })
              }
            >
              <option value="matching">Keep matching lines</option>
              <option value="nonMatching">Remove matching lines</option>
            </select>
          </label>
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={operation.caseSensitive}
              onChange={(event) => onChange({ ...operation, caseSensitive: event.target.checked })}
            />
            Case-sensitive
          </label>
        </>
      );
    case 'lines.affix':
      return (
        <>
          <label>
            Prefix
            <input
              className="input"
              value={operation.prefix}
              onChange={(event) => onChange({ ...operation, prefix: event.target.value })}
              data-testid={`field-prefix-${operation.id}`}
            />
          </label>
          <label>
            Suffix
            <input
              className="input"
              value={operation.suffix}
              onChange={(event) => onChange({ ...operation, suffix: event.target.value })}
              data-testid={`field-suffix-${operation.id}`}
            />
          </label>
        </>
      );
    case 'lineEndings.normalize':
      return (
        <label>
          Line ending style
          <select
            className="input"
            value={operation.style}
            onChange={(event) =>
              onChange({
                ...operation,
                style: event.target.value as 'lf' | 'crlf',
              })
            }
          >
            <option value="lf">LF (\\n)</option>
            <option value="crlf">CRLF (\\r\\n)</option>
          </select>
        </label>
      );
    case 'unicode.normalize':
      return (
        <>
          <label>
            Unicode form
            <select
              className="input"
              value={operation.form}
              onChange={(event) =>
                onChange({
                  ...operation,
                  form: event.target.value as 'NFC' | 'NFD' | 'NFKC' | 'NFKD',
                })
              }
              data-testid={`field-unicode-form-${operation.id}`}
            >
              <option value="NFC">NFC (canonical composition)</option>
              <option value="NFD">NFD (canonical decomposition)</option>
              <option value="NFKC">NFKC (compatibility composition)</option>
              <option value="NFKD">NFKD (compatibility decomposition)</option>
            </select>
          </label>
          {operation.form === 'NFKC' || operation.form === 'NFKD' ? (
            <p className="warning-text" role="note">
              Compatibility forms may fold characters (for example ligatures). This is not spelling
              correction.
            </p>
          ) : null}
        </>
      );
    default: {
      const _exhaustive: never = operation;
      return _exhaustive;
    }
  }
}
