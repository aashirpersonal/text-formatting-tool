# Transformation Plan v1

**Status:** Implemented in `@tft/transformation-schema` and `@tft/transformation-engine`  
**Schema version:** `1.0`  
**Date:** 2026-07-28

## Why the plan exists

A transformation plan is an inspectable, serialisable description of deterministic text work. AI systems (future) and humans author plans; a trusted engine executes them. Plans never contain executable JavaScript.

## Schema versioning

- Field: `schemaVersion` (required literal `"1.0"`).
- Future incompatible shapes will use a new version string and parallel schemas.
- Unknown versions are rejected.

## Strict validation

- Runtime validation uses **Zod 4** (`z.strictObject` / discriminated unions).
- Unknown properties are rejected at plan and operation level.
- Invalid input is never silently truncated; parsers return validation errors.
- Shared package: `@tft/transformation-schema`.

Helpers:

- `parseTransformationPlan(unknown)` — throws on failure
- `safeParseTransformationPlan(unknown)` — result object
- `getTransformationPlanJsonSchema()` — JSON Schema draft 2020-12 via `z.toJSONSchema`

## Plan-level fields

| Field           | Rules                                    |
| --------------- | ---------------------------------------- |
| `schemaVersion` | `"1.0"`                                  |
| `title`         | non-empty, ≤ 80 chars                    |
| `summary`       | non-empty, ≤ 500 chars                   |
| `assumptions`   | ≤ 10 strings; each non-empty ≤ 300 chars |
| `warnings`      | ≤ 10 strings; each non-empty ≤ 300 chars |
| `operations`    | 1–25 operations; unique `id` values      |

## Operation common fields

Every operation includes:

- `id` — matches `^[A-Za-z][A-Za-z0-9_-]{0,63}$`
- `type` — discriminated union member
- `enabled` — when `false`, engine skips and reports `skipped`
- `description` — non-empty, ≤ 240 chars

No callbacks, code strings, or arbitrary function names are accepted.

## Operation types

### `replace.literal`

Literal find/replace. `occurrence`: `first` | `all`. `caseSensitive`: boolean.

- `find` non-empty (≤ 10 000); `replacement` ≤ 10 000.
- Replacement is inserted verbatim (`$&`, `$1`, regex metacharacters are literal text).
- Case-insensitive matching uses locale-fixed string compare (`en-US`), **not** a RegExp built from plan data.

### `lines.trim`

`mode`: `start` | `end` | `both`. Trims whitespace per logical line; does not trim the whole document as one string.

### `lines.removeEmpty`

`whitespaceOnly`: when true, whitespace-only lines count as empty. Preserves order and final-newline presence.

### `lines.dedupe`

`caseSensitive`, `trimBeforeCompare`. Keeps the **first** occurrence; retained line content is unchanged. Comparison normalisation does not rewrite kept lines.

### `lines.filterContains`

Literal `needle` (non-empty). `keep`: `matching` | `nonMatching`. Preserves order and final-newline semantics.

### `lines.affix`

`prefix` / `suffix` (at least one non-empty). Applied to every logical line. Empty documents are treated as one empty logical line with no terminator.

### `lineEndings.normalize`

`style`: `lf` | `crlf`. Converts each existing terminator; preserves whether the document had a trailing terminator. Handles LF, CRLF, lone CR, and mixed endings.

### `unicode.normalize`

`form`: `NFC` | `NFD` | `NFKC` | `NFKD` via `String.prototype.normalize`.

- NFC/NFD are canonical forms.
- **NFKC/NFKD** are compatibility forms and may fold characters (for example ligatures). This is **not** spelling correction or translation. The engine attaches a warning when these forms are used.

## Line-ending rules

The engine uses an internal line-document model:

- Terminators: `\n`, `\r\n`, `\r`
- Empty input ↔ zero lines ↔ `""`
- Final line without terminator is represented with `ending: null`
- Line-removing ops restore the original presence/absence of a final terminator
- Mixed endings are retained where possible; only `lineEndings.normalize` rewrites styles
- If a trailing ending must be synthesised, the preferred ending is the last non-null original ending, else LF

## Execution API

```ts
executeTransformationPlan(input: string, plan: unknown, options?: ExecutionOptions): ExecutionResult
```

1. Validate plan with the schema package.
2. Enforce operation / input byte limits.
3. Dispatch each enabled operation through a **closed allowlist** `switch`.
4. Enforce output byte limits after every operation.
5. On failure, return a structured error **without** partial output.

### Default limits

| Limit            | Default |
| ---------------- | ------- |
| `maxInputBytes`  | 10 MiB  |
| `maxOutputBytes` | 12 MiB  |
| `maxOperations`  | 25      |

UTF-8 sizes use `TextEncoder` (browser / Worker safe; no Node `Buffer` in the core).

### Success / failure shapes

Success includes `output` plus a report (`schemaVersion`, character/byte counts, per-operation reports, warnings).  
Failure codes: `PLAN_INVALID` | `INPUT_LIMIT_EXCEEDED` | `OUTPUT_LIMIT_EXCEEDED` | `OPERATION_LIMIT_EXCEEDED` | `OPERATION_FAILED`.

Operation report status: `applied` | `no_change` | `skipped`. No timing fields.

## Determinism guarantees

Same input + validated plan + limits + JS/Unicode runtime ⇒ same output and report. No Date/random/locale sorting/network/DOM/storage/mutable globals. Caller input, plan, and options are not mutated.

## Security properties

- No `eval` / `Function` / `new Function`
- No plan-selected dynamic imports or generated scripts
- No network, DOM, or storage access in the engine
- No arbitrary regex operations in v1
- Unknown fields and unknown operation types rejected
- Dispatch is an exhaustive allowlist over schema types

## Explicit non-goals (this milestone)

- AI / OpenAI integration
- Web UI wiring
- Web Worker packaging
- Regex operations (see ADR-011 for future high-risk allowlisting)
- CLI / npm publish
- Benchmarks

## Worked example

```json
{
  "schemaVersion": "1.0",
  "title": "Clean copied list",
  "summary": "Trim, drop blanks, dedupe, and normalise to LF.",
  "assumptions": ["One item per line"],
  "warnings": [],
  "operations": [
    {
      "id": "trim1",
      "type": "lines.trim",
      "enabled": true,
      "description": "Trim whitespace on each line",
      "mode": "both"
    },
    {
      "id": "empty1",
      "type": "lines.removeEmpty",
      "enabled": true,
      "description": "Remove blank lines",
      "whitespaceOnly": true
    },
    {
      "id": "dedupe1",
      "type": "lines.dedupe",
      "enabled": true,
      "description": "Keep first unique lines",
      "caseSensitive": true,
      "trimBeforeCompare": false
    },
    {
      "id": "lf1",
      "type": "lineEndings.normalize",
      "enabled": true,
      "description": "Normalise endings to LF",
      "style": "lf"
    }
  ]
}
```

## Future extension rules

1. Add new operation types only via schema versioning or additive discriminated-union members with tests.
2. Never add fields that accept code, callbacks, or unconstrained patterns.
3. Prefer new allowlisted ops over “escape hatch” execution.
4. Keep engine free of React/Next/DOM dependencies.
