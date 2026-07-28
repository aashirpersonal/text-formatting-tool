# Text Formatting Tool (v2)

**Status:** Active rebuild on branch `v2-rebuild`. Legacy Create React App v1 is preserved in Git history and tagged `legacy-v1`.

## Product architecture

Text Formatting Tool is intended to become an AI-guided, deterministic, privacy-conscious large-text transformation product:

1. You describe a deterministic transformation in plain English.
2. You review representative samples (and may redact them).
3. Only the instruction and approved samples are intended to leave the browser for recipe authoring.
4. The model returns a validated JSON transformation recipe — **never executable JavaScript**.
5. A trusted browser-local engine applies the recipe to the complete document.

**AI recipe generation is not implemented yet.** You can already build recipes manually and run them locally.

## Repository structure

```text
apps/web/                         Next.js App Router + local Worker workspace
packages/transformation-schema/   Transformation Plan v1 (Zod) schema
packages/transformation-engine/   Allowlisted deterministic executor
docs/audits/                      Legacy baseline audit
docs/v2/                          Product blueprint, ADRs, plan + workspace specs
docs/evidence/                    Evidence register
```

## Implemented now

### Local workspace (manual recipes)

- Four-stage flow: Input → Recipe → Preview → Result
- Manual editors for all eight Plan v1 operations, with reorder/enable/disable/remove
- Built-in local templates (not AI-generated)
- Schema validation via `@tft/transformation-schema`
- Preview and full execution inside a **browser Web Worker**
- Cancellation, stale-response protection, copy/download, restore original
- See [`docs/v2/LOCAL_WORKSPACE_V1.md`](docs/v2/LOCAL_WORKSPACE_V1.md)

### Schema and engine libraries

- Strict Transformation Plan `schemaVersion: "1.0"`
- Deterministic allowlisted executor
- See [`docs/v2/TRANSFORMATION_PLAN_V1.md`](docs/v2/TRANSFORMATION_PLAN_V1.md)

### Platform

- Landing, workspace, privacy, and about routes
- Lint, format, typecheck, unit/component/e2e tests, CI
- Cloudflare OpenNext Worker build configuration (not deployed)

## Planned (not in this milestone)

- AI / OpenAI recipe authoring
- Schema-constrained model output on a server API
- Intelligent representative sampling
- Regex operations
- Persistent sessions, CLI, npm publish, benchmarks

## Docs

- [`docs/v2/PRODUCT_BLUEPRINT.md`](docs/v2/PRODUCT_BLUEPRINT.md)
- [`docs/v2/ARCHITECTURE_DECISIONS.md`](docs/v2/ARCHITECTURE_DECISIONS.md)
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
- Plan data selects only allowlisted engine operations.
- Report vulnerabilities via GitHub security advisories (see `SECURITY.md`).
