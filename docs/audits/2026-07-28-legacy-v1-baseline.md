# Legacy v1 baseline audit

| Field | Value |
|-------|--------|
| Repository | https://github.com/aashirpersonal/text-formatting-tool |
| Branch inspected | `master` |
| Commit inspected | `8d3fa8c449aaccefb0071d2820b3b84b05c4fa68` (`8d3fa8c`) — *Update Dashboard.js* |
| Default remote branch | `master` (`origin/HEAD` → `origin/master`) |
| Other remote branch | `main` at `b7d0ebc` (stub README only; not the application tip) |
| Audit date | 2026-07-28 |
| Auditor context | Local reproduction after empty workspace; no OpenAI key supplied; no live model calls |

**Status:** This document describes **legacy v1**. It is **not approved for public redeployment**.

---

## 1. Original project summary

Legacy v1 is a Create React App single-page application that provides browser-local text formatting controls (case conversion, line operations, find/replace) and an “AI-Powered Transformations” panel.

The AI panel asks an OpenAI model to return JavaScript inside a JSON object, then executes that JavaScript in the browser against the full document via `new Function`. A production build embeds the OpenAI browser client and calls `api.openai.com` when a build-time `REACT_APP_OPENAI_API_KEY` is present.

The documented Heroku homepage was unreachable at audit time (`404 No such app`).

---

## 2. Framework and dependency facts

| Item | Observed value |
|------|----------------|
| Package name / version | `text-formatting-tool` `0.1.0` (`private: true`) |
| UI framework | React `18.2.0` + React DOM `18.2.0` |
| Scaffold | `react-scripts` `5.0.1` (Create React App) |
| Routing | `react-router-dom` `6.22.3` |
| AI SDK | `openai` `4.53.2` |
| Other runtime deps | `react-helmet` `6.1.0`, `react-icons` `5.0.1`, `react-split` `2.0.14`, `web-vitals` `2.1.4` |
| CSS tooling | Tailwind CSS `3.4.1`, PostCSS `8.4.36`, Autoprefixer `10.4.18` |
| Lockfile | `package-lock.json` lockfileVersion **3** |
| `engines` field | **Absent** |
| Package manager used for baseline | **npm** (lockfile-implied); Node `v24.12.0`, npm `11.6.2` |
| Licence file | **Missing** (README claims MIT; GitHub API reported `license: null`) |

---

## 3. Existing functionality (legacy)

### Live route (`App.js` → `/` → `Dashboard`)

- Paste/type text into a controlled textarea
- Local operations: uppercase, lowercase, capitalize sentences/words, trim lines, remove line breaks/tabs/extra spaces, sort lines, replace (literal or regex)
- Undo/redo via in-memory history (`useTextHistory`)
- Load `.txt` / save `.txt` / clipboard copy-paste (toast wiring incomplete on Dashboard path)
- AI assistant UI that generates and applies model-produced JavaScript
- Static pages: How to Use, Privacy Policy, Contact; theme toggle; SEO via `react-helmet`

### Present in tree but not on the live Dashboard path

- Alternate `src/components/TextArea/` layout (includes Extract Emails/Phones, LineOperations prefix/suffix UI, Toast)
- `ThemeSettings.js` (unused)
- Root `WordCharCount.js` duplicate (Dashboard uses `TextArea/WordCharCount.js`)

### Not implemented in legacy

- Validated transformation recipes / allowlisted engine
- Server-side OpenAI proxy
- Web Workers, progress, cancellation for transforms
- Automated tests, CI workflows, licence file
- Honest privacy disclosure for AI sample transmission

---

## 4. Critical security findings

| ID | Finding | Severity |
|----|---------|----------|
| SEC-01 | Model-generated JavaScript executed via `new Function` on the main thread (`src/components/AIAssistant.js`) | Critical |
| SEC-02 | OpenAI client constructed in the browser with `dangerouslyAllowBrowser: true` and `process.env.REACT_APP_OPENAI_API_KEY` (CRA inlines `REACT_APP_*` at build time) | Critical |
| SEC-03 | Prompt injection into generated code (instruction + sample interpolated into the prompt; no allowlist) | High |
| SEC-04 | Privacy Policy claims no data leaves the device and no third-party services, contradicting the OpenAI browser path | High |
| SEC-05 | User-supplied regex in Replace Text can cause ReDoS on the main thread | Medium |
| SEC-06 | No execution timeout, worker isolation, or memory/operation limits for generated code | High |

**Reproduction note (build artefact, no secret values):** After `npm run build` with **no** API key in the environment, `build/static/js/main.*.js` still contained `dangerouslyAllowBrowser` and `api.openai.com`. No hardcoded `sk-…` secret patterns were found in the bundle. A non-empty key at build time would be embedded in client JavaScript.

---

## 5. API-key architecture

- **Variable name:** `REACT_APP_OPENAI_API_KEY`
- **Delivery:** Client-side Create React App environment substitution
- **Server proxy:** None in repository
- **Example env files:** None committed
- `.gitignore` ignores `.env` and CRA `*.local` env files
- **Baseline environment:** Neither `REACT_APP_OPENAI_API_KEY` nor `OPENAI_API_KEY` was set during this audit
- **Live OpenAI requests:** Not attempted

This architecture is rejected for v2 (see `docs/v2/ARCHITECTURE_DECISIONS.md` ADR-014).

---

## 6. Arbitrary generated-code execution

In `src/components/AIAssistant.js` (legacy):

1. Model (`o1-mini` in tip commit) is prompted to return JSON `{ explanation, code }`.
2. Response is `JSON.parse`d (optional markdown fence strip).
3. `code` is executed with `new Function('inputText', …)` against the **full** textarea contents.
4. There is no AST allowlist, schema validation of operations, sandbox, timeout, or worker boundary.

**v2 rule:** The model must never generate JavaScript that the application executes.

---

## 7. Privacy inconsistency

`src/components/PrivacyPolicy.js` states that the tool operates entirely on-device and does not use third-party services that collect personal information. The AI path sends a representative sample (first 200 characters in the tip commit) plus the user instruction to OpenAI when invoked. Users are not clearly informed in the AI UI.

---

## 8. Deployment status

| Item | Status |
|------|--------|
| GitHub homepage field | `https://text-formatting-tool-6722790c2678.herokuapp.com/` |
| Probe on 2026-07-28 | HTTP 404 — Heroku “No such app” |
| `Procfile` / server entry | Not present in tree |
| GitHub Actions | Not present |
| Sitemap hostname | `https://textformat.io/` (domain status not established in this baseline) |

---

## 9. Local reproduction commands and results

Host: macOS; Node `v24.12.0`; npm `11.6.2`. Working directory after fetch/checkout of `master` @ `8d3fa8c`.

### 9.1 Dependency installation

```bash
npm ci
```

| Result | Value |
|--------|--------|
| Exit code | **0** |
| Outcome | Added 1522 packages; audited 1523 packages in ~58s |
| Lockfile hash before/after | `f3fccb0a73eb3cd15372015935064249421caa14` — **unchanged** |
| Tracked files changed | **None** |
| Reproducible with lockfile? | **Yes** for install on this host (lockfile not rewritten) |
| Warnings | Multiple deprecation warnings (workbox, svgo, babel proposal plugins, etc.); npm also warned about unknown config `devdir` from the environment |
| Audit summary printed by `npm ci` | 70 vulnerabilities (15 low, 17 moderate, 35 high, 3 critical) |

**Limitation:** Create React App 5 is unmaintained and was not designed for Node 24. Install succeeded here but is not a guarantee for all environments.

### 9.2 Production build

```bash
CI=true npm run build
```

| Result | Value |
|--------|--------|
| Exit code | **0** |
| Outcome | “Compiled successfully.” |
| Artefacts | `build/` (~3.4M); main JS ~94.35 kB gzip; CSS ~3.89 kB gzip |
| Tracked files changed | **None** (`build/` is gitignored) |
| Warnings | `fs.F_OK` deprecation (Node); outdated `caniuse-lite`; CRA/`babel-preset-react-app` unmaintained notice about `@babel/plugin-proposal-private-property-in-object` |

**Missing env:** Build succeeded without `REACT_APP_OPENAI_API_KEY`. AI calls would fail at runtime without a key; the unsafe client code remains in the bundle.

### 9.3 Tests

Default non-interactive CRA invocation:

```bash
CI=true npm test -- --watchAll=false
```

| Result | Value |
|--------|--------|
| Exit code | **1** |
| Outcome | `No tests found, exiting with code 1` |
| Matches | 0 test files under `src/**/*.{spec,test}.{js,jsx,ts,tsx}` and `__tests__` |
| Files changed | **None** |

Informational (not the primary reported result):

```bash
CI=true npm test -- --watchAll=false --passWithNoTests
```

Exit code **0** with message `No tests found` — confirms absence of tests rather than a green suite.

### 9.4 Lint

| Result | Value |
|--------|--------|
| Dedicated `lint` script in `package.json` | **None** |
| Available scripts | `start`, `build`, `test`, `eject` |
| Action taken | **No lint command run** (none exists) |
| Note | `eslintConfig` extends `react-app` / `react-app/jest` for CRA defaults only |

### 9.5 Dependency audit

```bash
npm audit
```

| Result | Value |
|--------|--------|
| Exit code | **1** (vulnerabilities reported) |
| Totals | **70** (15 low, 17 moderate, 35 high, **3 critical**) |
| Critical package names (audit report) | `form-data`, `shell-quote`, `websocket-driver` |
| Files / lockfile changed | **None** (audit is read-only; `npm audit fix` was **not** run) |

Many findings are transitive through the unmaintained CRA / webpack-dev-server toolchain. This reinforces retiring CRA for v2 rather than patching legacy in place.

### 9.6 Git status after baseline commands

```text
On branch master
nothing to commit, working tree clean
```

Lockfile checksum unchanged. `node_modules/` and `build/` present locally and ignored by `.gitignore`.

---

## 10. Reproducibility limitations

1. **Node version:** No `engines` pin; Node 24 is newer than CRA’s historical support window.
2. **No CI matrix:** Results are from a single local host on 2026-07-28.
3. **Network:** `npm ci` requires registry access; offline reproduce not verified.
4. **AI runtime:** Not exercised (by design for this baseline).
5. **Historical Heroku config:** Unknown whether a production key was ever set; the app is gone.
6. **npm `devdir` warning:** Environment-specific npm config noise; unrelated to the app lockfile.

---

## 11. Known unknowns

- Whether OpenAI still accepts the tip commit’s `o1-mini` request shape with the legacy SDK version.
- Exact historical production traffic and key exposure window.
- Operational status of `textformat.io`.
- Why `main` exists as a stub alongside application history on `master`.

---

## 12. Explicit non-approval statement

**Legacy v1 at `8d3fa8c` is retained as historical evidence only.**

It is **not** approved for public redeployment, marketing as a secure AI product, or use as the foundation for incremental “visual refresh” of the unsafe AI execution path.

Approved direction: preserve Git history on `master` / remote history, and rebuild on branch `v2-rebuild` per `docs/v2/PRODUCT_BLUEPRINT.md` and `docs/v2/ARCHITECTURE_DECISIONS.md`.
