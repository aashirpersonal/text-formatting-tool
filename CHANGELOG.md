# Changelog

All notable changes to this project will be documented in this file.

## Unreleased

### Added

- Documentation for the legacy v1 baseline audit, v2 product blueprint, architecture decisions, and evidence register.
- Annotated Git tag `legacy-v1` pointing at commit `8d3fa8c`.
- npm-workspaces monorepo scaffold with `apps/web`, `packages/transformation-schema`, and `packages/transformation-engine`.
- Next.js App Router product shell with `/`, `/app`, `/privacy`, and `/about`.
- Local workspace input (paste/type, character/line counts, clear, plain-text file load).
- Vitest unit/component tests, Playwright Chromium smoke test, ESLint, Prettier, and GitHub Actions CI.
- Cloudflare OpenNext configuration for Workers builds (no deployment in this release).

### Security

- Legacy CRA AI path that executed model-generated JavaScript is not carried forward into the v2 scaffold.
- No OpenAI client or API key is included in this scaffold.
