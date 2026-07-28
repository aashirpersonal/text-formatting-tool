# Text Formatting Tool (v2)

**Status:** Active rebuild on branch `v2-rebuild`. Legacy Create React App v1 is preserved in Git history and tagged `legacy-v1`.

## Product architecture

Text Formatting Tool is intended to become an AI-guided, deterministic, privacy-conscious large-text transformation product:

1. You describe a deterministic transformation in plain English.
2. You review representative samples (and may redact them).
3. Only the instruction and approved samples are intended to leave the browser for recipe authoring.
4. The model returns a validated JSON transformation recipe — **never executable JavaScript**.
5. A trusted browser-local engine applies the recipe to the complete document.

**AI recipe generation is implemented behind `RECIPE_GENERATOR_MODE`.** Default `prototype` mode stays fully local. OpenAI mode uses a same-origin server endpoint, sample review, and schema-validated Transformation Plans — never executable JavaScript. See [`docs/v2/AI_RECIPE_GENERATION_V1.md`](docs/v2/AI_RECIPE_GENERATION_V1.md).

## Repository structure

```text
apps/web/                         Next.js App Router + local Worker workspace + recipe API
packages/transformation-schema/   Transformation Plan v1 + generation request/result schemas
packages/transformation-engine/   Allowlisted deterministic executor
docs/audits/                      Legacy baseline audit
docs/v2/                          Product blueprint, ADRs, plan + workspace + AI specs
docs/evidence/                    Evidence register
```

## Implemented now

### Simple local transform flow (`/app`)

- Paste text or choose a file
- Describe the change with example prompts
- Prototype generator (default) or OpenAI mode with sample review
- Preview before/after, then apply locally in a Web Worker
- Copy / download / restore original
- Full-viewport app shell (see [`docs/v2/APP_SHELL_AND_MOTION_V1.md`](docs/v2/APP_SHELL_AND_MOTION_V1.md) and [`docs/v2/UX_RESET_V1.md`](docs/v2/UX_RESET_V1.md))

### Advanced manual editor (`/app/advanced`)

- Four-stage flow: Input → Recipe → Preview → Result
- Manual editors for all eight Plan v1 operations
- Built-in local templates (not AI-generated)
- See [`docs/v2/LOCAL_WORKSPACE_V1.md`](docs/v2/LOCAL_WORKSPACE_V1.md)

### Schema and engine libraries

- Strict Transformation Plan `schemaVersion: "1.0"`
- Deterministic allowlisted executor
- Recipe generation request/result envelopes
- See [`docs/v2/TRANSFORMATION_PLAN_V1.md`](docs/v2/TRANSFORMATION_PLAN_V1.md) and [`docs/v2/AI_RECIPE_GENERATION_V1.md`](docs/v2/AI_RECIPE_GENERATION_V1.md)

### Platform

- Landing, workspace, privacy, and about routes
- Lint, format, typecheck, unit/component/e2e tests, CI
- Cloudflare OpenNext Worker build configuration (not deployed)

## Planned (not claimed done)

- Intelligent representative sampling (beyond start/middle/end)
- Validated Cloudflare Rate Limiting binding in production
- Regex operations
- Persistent sessions, CLI, npm publish, benchmarks
- Public production deployment

## Docs

- [`docs/v2/PRODUCT_BLUEPRINT.md`](docs/v2/PRODUCT_BLUEPRINT.md)
- [`docs/v2/ARCHITECTURE_DECISIONS.md`](docs/v2/ARCHITECTURE_DECISIONS.md)
- [`docs/v2/AI_RECIPE_GENERATION_V1.md`](docs/v2/AI_RECIPE_GENERATION_V1.md)
- [`docs/v2/TRANSFORMATION_PLAN_V1.md`](docs/v2/TRANSFORMATION_PLAN_V1.md)
- [`docs/v2/LOCAL_WORKSPACE_V1.md`](docs/v2/LOCAL_WORKSPACE_V1.md)
- Legacy tag: `legacy-v1` → commit `8d3fa8c`

## Requirements

- Node.js 24 LTS (see `.nvmrc`; `engines.node` allows `>=24.12.0 <25`)
- npm 11+ (lockfile-managed via npm workspaces)

## Setup

```bash
git checkout v2-rebuild
nvm use
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default recipe mode is **prototype** (no API key required). To enable OpenAI mode locally, copy `.env.example` values into a gitignored `apps/web/.env.local`, set `RECIPE_GENERATOR_MODE=openai`, `OPENAI_MODEL`, and `OPENAI_API_KEY`, then restart `npm run dev`. Never commit the local env file.

## Commands

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Next.js development server                       |
| `npm run build`        | Next.js production build                         |
| `npm run cf-build`     | OpenNext Cloudflare Worker build                 |
| `npm run preview`      | Build and preview on the Workers runtime locally |
| `npm run lint`         | ESLint across web and packages                   |
| `npm run format:check` | Prettier check                                   |
| `npm run typecheck`    | TypeScript across workspaces                     |
| `npm run test`         | Vitest unit/component tests                      |
| `npm run test:e2e`     | Playwright tests (requires Chromium install)     |
| `npm run ci`           | Aggregate local CI checks                        |

## Security notes

- Do not reintroduce browser OpenAI clients or `eval` / `new Function`.
- OpenAI SDK stays server-only; keys never use `NEXT_PUBLIC_*`.
- Plan data selects only allowlisted engine operations.
- Report vulnerabilities via GitHub security advisories (see `SECURITY.md`).
