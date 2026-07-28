# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added

- Secure schema-constrained AI recipe generation behind `RECIPE_GENERATOR_MODE=prototype|openai`.
- Same-origin `POST /api/recipes/generate` with request limits, sample-review UX, Structured Outputs, and generation-result envelope validation.
- Deterministic start/middle/end sample selection, rate-limit abstraction, and `docs/v2/AI_RECIPE_GENERATION_V1.md`.
- Official server-only `openai` SDK dependency (`openai@7.1.0`).

### Changed

- Privacy page distinguishes prototype vs OpenAI modes without overclaiming retention.
- App chrome/composer badges reflect the active generator mode.

### Security

- Complete documents are rejected by the recipe endpoint; browser bundles must not include API keys or the OpenAI client.
- Model output is Zod-validated Transformation Plan v1 only — never executable JavaScript.

### Changed (earlier)

- Polished the warm light app shell: document-style editor, unified docked composer, single examples system, richer preview empty state, and demoted Advanced to the app menu.
- Default application and marketing visuals switched to a warm light productivity theme with shared design tokens, button hierarchy (primary/secondary/tertiary/destructive/disabled), and reduced example-prompt density.

### Added

- Full-viewport application shell for `/app` and `/app/advanced` (no marketing footer).
- Desktop two-pane workspace with docked instruction composer; mobile Text/Preview/Result tabs.
- GSAP-powered Product Hunt-oriented homepage (`gsap`, `@gsap/react`) with reduced-motion path.
- App shell / motion documentation (`docs/v2/APP_SHELL_AND_MOTION_V1.md`).

### Added (earlier)

- Mobile-first simple transform flow at `/app` with example prompts, prototype generation notice, before/after preview, and local apply.
- Advanced manual recipe editor moved to `/app/advanced`.
- Product Hunt-oriented landing page redesign and UX reset documentation (`docs/v2/UX_RESET_V1.md`).
- `RecipeGenerationAdapter` boundary with `LocalPrototypeRecipeGenerator` (no network, no AI claims).

### Fixed

- Worker-client cancellation and dispose now settle the active execute Promise with a typed cancellation outcome (no hanging awaits).
- Trailing whitespace in `docs/v2/LOCAL_WORKSPACE_V1.md` so `git diff --check` passes.
- Stronger workspace tests: oversized-file rejection before read, recipe field invalidation, and Playwright order A/B result divergence.

### Added (earlier)

- Local manual recipe workspace with Input → Recipe → Preview → Result flow.
- Browser Web Worker execution client for preview and full-document processing, with cancellation and stale-response protection.
- Operation card editors for all eight Transformation Plan v1 operations, templates, copy/download, and restore-original.
- Workspace specification `docs/v2/LOCAL_WORKSPACE_V1.md`.
- Transformation Plan **v1.0** schema in `@tft/transformation-schema` (direct Zod 4 dependency, strict objects, discriminated operation union, JSON Schema export).
- Deterministic allowlisted executor in `@tft/transformation-engine` for eight operations with structured success/failure results, UTF-8 limits, and line-document semantics.
- Specification document `docs/v2/TRANSFORMATION_PLAN_V1.md`.
- ESLint coverage for both transformation packages.
- Documentation for the legacy v1 baseline audit, v2 product blueprint, architecture decisions, and evidence register.
- Annotated Git tag `legacy-v1` pointing at commit `8d3fa8c`.
- npm-workspaces monorepo scaffold with `apps/web`, `packages/transformation-schema`, and `packages/transformation-engine`.
- Next.js App Router product shell with `/`, `/app`, `/privacy`, and `/about`.
- Vitest unit/component tests, Playwright Chromium tests, ESLint, Prettier, and GitHub Actions CI.
- Cloudflare OpenNext configuration for Workers builds (no deployment in this release).

### Security

- Workspace transformations run locally in a Web Worker; full-document processing is never offloaded to the recipe endpoint.
- Schema and engine reject executable code fields; dispatch uses a closed allowlist with no `eval` / `Function` / `new Function`.
- OpenAI integration is server-only when enabled; prototype mode makes no AI request.
- Legacy CRA AI path that executed model-generated JavaScript is not carried forward into the v2 scaffold.
