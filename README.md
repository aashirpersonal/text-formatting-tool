# Text Formatting Tool (v2)

**Status:** Active rebuild on branch `v2-rebuild`. Legacy Create React App v1 is preserved in Git history and tagged `legacy-v1`.

## Product architecture

Text Formatting Tool is intended to become an AI-guided, deterministic, privacy-conscious large-text transformation product:

1. You describe a deterministic transformation in plain English.
2. You review representative samples (and may redact them).
3. Only the instruction and approved samples are intended to leave the browser for recipe authoring.
4. The model returns a validated JSON transformation recipe — **never executable JavaScript**.
5. A trusted browser-local engine applies the recipe to the complete document.

This repository currently contains a **scaffold**. AI recipe generation and the transformation engine are **not implemented yet**.

## Repository structure

```text
apps/web/                         Next.js App Router product shell (Cloudflare OpenNext)
packages/transformation-schema/   Future TransformationPlan schema (placeholder)
packages/transformation-engine/   Trusted engine foundation (explicitly not implemented)
docs/audits/                      Legacy baseline audit
docs/v2/                          Product blueprint and ADRs
docs/evidence/                    Evidence register
```

## Implemented now

- Landing, workspace, privacy, and about routes
- Local text input with character/line counts, clear, and plain-text file load
- Honest UI states that recipe generation is unavailable
- Package placeholders with typed `not_implemented` contracts
- Lint, format, typecheck, unit/component tests, Playwright Chromium smoke, CI workflow
- Cloudflare OpenNext Worker build configuration (not deployed from this milestone)

## Planned (not in this scaffold)

- Server-side OpenAI integration with secrets kept off the client
- Schema-constrained recipe generation
- Allowlisted operations and Web Worker execution
- Preview/diff, progress, cancellation, bounded history, recipe export

See:

- [`docs/v2/PRODUCT_BLUEPRINT.md`](docs/v2/PRODUCT_BLUEPRINT.md)
- [`docs/v2/ARCHITECTURE_DECISIONS.md`](docs/v2/ARCHITECTURE_DECISIONS.md)
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
| `npm run lint`         | ESLint / package type lint scripts               |
| `npm run format:check` | Prettier check                                   |
| `npm run typecheck`    | TypeScript across workspaces                     |
| `npm run test`         | Vitest unit/component tests                      |
| `npm run test:e2e`     | Playwright smoke (requires Chromium install)     |
| `npm run ci`           | Aggregate local CI checks                        |

## Security notes

- No OpenAI API key is required or accepted by this scaffold.
- Do not reintroduce browser `dangerouslyAllowBrowser` OpenAI clients.
- Report vulnerabilities via GitHub private advisories when available (see `SECURITY.md`).

## Licence

MIT — see `LICENSE`.
