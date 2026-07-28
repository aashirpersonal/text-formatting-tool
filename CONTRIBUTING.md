# Contributing

Thanks for your interest in Text Formatting Tool.

## Before you start

1. Read `docs/v2/PRODUCT_BLUEPRINT.md` and `docs/v2/ARCHITECTURE_DECISIONS.md`.
2. Use Node.js 24 LTS (see `.nvmrc` and `engines` in the root `package.json`).
3. Prefer small, reviewable pull requests.

## Hard rules

- Do **not** add `eval`, `new Function`, dynamic script injection, or execution of model-generated code.
- Do **not** add browser-exposed OpenAI keys or `dangerouslyAllowBrowser`.
- Do **not** commit secrets, `.env` files with credentials, or private user documents.
- Distinguish implemented behaviour from planned behaviour in docs and UI copy.

## Local setup

```bash
nvm use
npm ci
npm run dev
```

## Checks before opening a PR

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Optional Cloudflare Worker build validation:

```bash
npm run cf-build
```

Optional Playwright smoke (Chromium):

```bash
npx playwright install chromium
npm run test:e2e
```

## Commit style

Use concise conventional commits when practical, for example `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
