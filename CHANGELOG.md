# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added

- Transformation Plan **v1.0** schema in `@tft/transformation-schema` (direct Zod 4 dependency, strict objects, discriminated operation union, JSON Schema export).
- Deterministic allowlisted executor in `@tft/transformation-engine` for eight operations with structured success/failure results, UTF-8 limits, and line-document semantics.
- Specification document `docs/v2/TRANSFORMATION_PLAN_V1.md`.
- ESLint coverage for both transformation packages.
- Documentation for the legacy v1 baseline audit, v2 product blueprint, architecture decisions, and evidence register.
- Annotated Git tag `legacy-v1` pointing at commit `8d3fa8c`.
- npm-workspaces monorepo scaffold with `apps/web`, `packages/transformation-schema`, and `packages/transformation-engine`.
- Next.js App Router product shell with `/`, `/app`, `/privacy`, and `/about`.
- Local workspace input (paste/type, character/line counts, clear, plain-text file load).
- Vitest unit/component tests, Playwright Chromium smoke test, ESLint, Prettier, and GitHub Actions CI.
- Cloudflare OpenNext configuration for Workers builds (no deployment in this release).

### Security

- Schema and engine reject executable code fields; dispatch uses a closed allowlist with no `eval` / `Function` / `new Function`.
- No AI integration and no model-generated code execution in this milestone.
- Legacy CRA AI path that executed model-generated JavaScript is not carried forward into the v2 scaffold.
- No OpenAI client or API key is included in this scaffold.
