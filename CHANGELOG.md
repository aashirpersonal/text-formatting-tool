# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added

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

- Workspace transformations run locally in a Web Worker; no AI/network upload path in this milestone.
- Schema and engine reject executable code fields; dispatch uses a closed allowlist with no `eval` / `Function` / `new Function`.
- No AI integration and no model-generated code execution in this milestone.
- Legacy CRA AI path that executed model-generated JavaScript is not carried forward into the v2 scaffold.
- No OpenAI client or API key is included in this scaffold.
