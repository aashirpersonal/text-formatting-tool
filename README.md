# Text Formatting Tool (v2)

**Status:** Active rebuild on branch `v2-rebuild`. Legacy Create React App v1 is preserved in Git history and tagged `legacy-v1`.

## Product architecture

Text Formatting Tool is intended to become an AI-guided, deterministic, privacy-conscious large-text transformation product:

1. You describe a deterministic transformation in plain English.
2. You review representative samples (and may redact them).
3. Only the instruction and approved samples are intended to leave the browser for recipe authoring.
4. The model returns a validated JSON transformation recipe — **never executable JavaScript**.
5. A trusted browser-local engine applies the recipe to the complete document.

AI recipe generation is **not implemented yet**. The web workspace does **not** call the engine yet.

## Repository structure

```text
apps/web/                         Next.js App Router product shell (Cloudflare OpenNext)
packages/transformation-schema/   Transformation Plan v1 (Zod) schema
packages/transformation-engine/   Allowlisted deterministic executor
docs/audits/                      Legacy baseline audit
docs/v2/                          Product blueprint, ADRs, plan specification
docs/evidence/                    Evidence register
```

## Implemented now

### Web scaffold

- Landing, workspace, privacy, and about routes
- Local text input with character/line counts, clear, and plain-text file load
- Honest UI states that recipe generation is unavailable
- Lint, format, typecheck, unit/component tests, Playwright Chromium smoke, CI workflow
- Cloudflare OpenNext Worker build configuration (not deployed from this milestone)

### Schema and engine (library only)

- Strict **Transformation Plan `schemaVersion: "1.0"`** in `@tft/transformation-schema` (Zod 4)
- Eight allowlisted operations with closed-dispatch execution in `@tft/transformation-engine`
- Structured success/failure results, UTF-8 byte limits, line-document semantics
- Package unit tests and ESLint coverage

See [`docs/v2/TRANSFORMATION_PLAN_V1.md`](docs/v2/TRANSFORMATION_PLAN_V1.md).

The workspace UI still does **not** import or run the engine.

## Planned (not in this milestone)

- Wiring the engine into the workspace / Web Worker
- Server-side OpenAI integration with secrets kept off the client
- Schema-constrained recipe generation
- Preview/diff, progress, cancellation, bounded history, recipe export
- Regex operations (future high-risk allowlist; not in v1)
- Benchmarks (no performance claims yet)

See:

- [`docs/v2/PRODUCT_BLUEPRINT.md`](docs/v2/PRODUCT_BLUEPRINT.md)
- [`docs/v2/ARCHITECTURE_DECISIONS.md`](docs/v2/ARCHITECTURE_DECISIONS.md)
- [`docs/v2/TRANSFORMATION_PLAN_V1.md`](docs/v2/TRANSFORMATION_PLAN_V1.md)
- [`docs/audits/2026-07-28-legacy-v1-baseline.md`](docs/audits/2026-07-28-legacy-v1-baseline.md)
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
| `npm run test:e2e`     | Playwright smoke (requires Chromium install)     |
| `npm run ci`           | Aggregate local CI checks                        |

## Security notes

- Do not reintroduce browser `dangerouslyAllowBrowser` OpenAI clients.
- Do not execute model-generated JavaScript (`eval` / `new Function` / injected scripts).
- Report vulnerabilities via GitHub security advisories (see `SECURITY.md`).
