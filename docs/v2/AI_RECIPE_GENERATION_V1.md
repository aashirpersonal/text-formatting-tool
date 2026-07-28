# AI recipe generation v1

**Status:** Implementation on `v2-rebuild` (local). Not a deployment claim.  
**Related:** Transformation Plan v1, local Worker execution, privacy page, ADR updates.

## User flow

1. Paste or open text locally.
2. Write an instruction (or pick an example).
3. Click **Generate transformation**.
4. **Prototype mode:** local adapter returns a plan immediately (no network, no review sheet).
5. **OpenAI mode:** review instruction + start/middle/end excerpts → **Generate safely**.
6. Preview in the trusted Worker.
7. Apply the full document locally in the trusted Worker.

## Generator architecture

| Mode        | Config                                                             | Behaviour                                |
| ----------- | ------------------------------------------------------------------ | ---------------------------------------- |
| `prototype` | `RECIPE_GENERATOR_MODE=prototype` (default)                        | `LocalPrototypeRecipeGenerator` only     |
| `openai`    | `RECIPE_GENERATOR_MODE=openai` + `OPENAI_MODEL` + `OPENAI_API_KEY` | Same-origin `POST /api/recipes/generate` |

The client cannot choose an arbitrary provider or model.

## Server boundary

- Official `openai` SDK is **server-only** (`serverExternalPackages`, no Client Component imports, no `dangerouslyAllowBrowser`, no `NEXT_PUBLIC_OPENAI*`).
- Endpoint accepts JSON only: instruction, 1–3 samples, optional document metadata (counts).
- Forbidden: full document, model name, system prompt overrides, tools, URLs, uploads, code.
- Same-origin Origin/Host check when Origin is present.
- `Cache-Control: no-store`.
- Instruction/sample text are not logged.

## Request limits

Exported as `RECIPE_GENERATION_LIMITS` in `@tft/transformation-schema`:

- instruction 1–1,500 characters
- samples 1–3
- each sample ≤ 2,000 characters
- total sample characters ≤ 5,000
- bounded metadata numerics
- body size ceiling; unknown fields rejected; no silent truncation

## Sampling algorithm

`selectDocumentSamples()` (browser-local, deterministic):

- short documents → single “Full document” excerpt (still capped)
- longer documents → Start / Middle / End windows on logical lines (LF, CRLF, CR)
- dedupe identical excerpts
- never mutates input
- no network

**Limitation:** start/middle/end sampling may miss rare patterns. This is not intelligent representative sampling.

## Sample approval

OpenAI mode shows **Review what will be sent** before any network call. Users can edit/redact, remove (keeping ≥1), restore, cancel, or approve. Approval is not stored in localStorage.

## Structured Outputs

OpenAI Responses API with:

- strict JSON Schema from `getRecipeGenerationResultJsonSchema()`
- `store: false`
- no tools / web search / code interpreter / background mode / prior response id
- at most one repair retry on malformed output
- local Zod re-validation after parsing

## Generation-result schema

```json
{
  "version": "1.0",
  "outcome": "plan" | "unsupported",
  "message": "...",
  "plan": { TransformationPlan } | null
}
```

Cross-field rules: `plan` requires non-null plan; `unsupported` requires `plan: null`.

## Refusal behaviour

Semantic/creative/impossible requests should return `outcome: "unsupported"`. The UI explains that the local engine cannot safely reproduce open-ended writing/reasoning.

## Prompt-injection threat

Samples are delimited as untrusted data. Schema validation + allowlisted engine limit impact even when model behaviour is imperfect. Prompt injection is **not** claimed impossible.

## Validation layers

1. Server request Zod schema
2. OpenAI strict JSON Schema Structured Outputs
3. Server Zod parse of generation result / plan
4. Client Zod parse before Worker preview/full

## Local execution boundary

The server never transforms the complete document. Preview and apply use the existing Worker only.

## Privacy limits

See `/privacy`. Do not claim “nothing leaves your device”, “zero retention”, “completely private”, or “100% secure”. `store: false` ≠ guaranteed Zero Data Retention.

## Environment variables

| Name                    | Scope         | Notes                               |
| ----------------------- | ------------- | ----------------------------------- |
| `RECIPE_GENERATOR_MODE` | server        | `prototype` \| `openai`             |
| `OPENAI_MODEL`          | server        | e.g. `gpt-5-mini` example           |
| `OPENAI_API_KEY`        | server secret | never commit; never `NEXT_PUBLIC_*` |

Local: gitignored `.env.local`. Production (later): `wrangler secret put OPENAI_API_KEY`.

## Rate-limit status

`RecipeGenerationRateLimiter` abstraction + in-memory limiter for local/dev and tests.  
**Cloudflare Rate Limiting binding is not claimed active in production** for this milestone. Remaining deployment configuration is documented; do not assert production RL without a validated binding.

## Failure states

Review · Generating · Generated · Unsupported · Rate limited · Service unavailable / configuration missing · Cancelled · Failed / validation / provider errors.

## Current limitations

- Live OpenAI calls require founder-configured local secrets (not part of CI).
- Sampling is coarse.
- In-memory rate limits are process-local only.
- Not every OpenAI model supports strict Structured Outputs.
