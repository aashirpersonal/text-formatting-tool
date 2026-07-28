# Architecture decision records — v2

**Branch:** `v2-rebuild` (local; not pushed as part of the baseline docs task)  
**Date series:** 2026-07-28  
**Status legend:** Accepted | Proposed | Superseded

These ADRs record **approved direction**. They do not claim that the v2 application already exists.

---

## ADR-001: Rebuild v2 instead of incrementally extending legacy CRA

| Field                     | Content                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                            |
| **Context**               | Legacy v1 is Create React App 5 with an unsafe AI path (`new Function` on model output) and browser API keys. CRA is unmaintained; dependency audit on the lockfile reported 70 vulnerabilities. |
| **Decision**              | Treat the CRA app as **legacy v1** and rebuild a modern v2 rather than incrementally restyling or patching the unsafe AI execution path.                                                         |
| **Reasons**               | Security model must change at the root; CRA toolchain debt; clearer product narrative; cleaner TypeScript full-stack boundary.                                                                   |
| **Alternatives rejected** | (1) Keep CRA and only remove AI. (2) Keep CRA and sandbox `new Function`. (3) Gradual visual refresh while retaining model-executed JS.                                                          |
| **Consequences**          | Short-term: two eras in one Git repo. Parallel work on docs/scaffold before feature parity. Legacy code remains for evidence, not as the production architecture.                                |
| **Unresolved questions**  | Exact cutover date for retiring any public legacy URL (currently already down).                                                                                                                  |

---

## ADR-002: Preserve legacy Git history and develop on `v2-rebuild`

| Field                     | Content                                                                                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                                     |
| **Context**               | Founders need an auditable trail from original product → security lessons → v2. Remote `master` holds the application history; remote `main` is a stub.                                                   |
| **Decision**              | Preserve remote history. Do not rewrite or force-push `master`/`main`. Develop v2 on local branch `v2-rebuild` (push only when explicitly approved later).                                                |
| **Reasons**               | Evidence for product evolution; safer collaboration; avoids destroying legacy commit `8d3fa8c` baseline.                                                                                                  |
| **Alternatives rejected** | New empty repository; orphan branch that drops history; rewriting `master`.                                                                                                                               |
| **Consequences**          | Legacy implementation remains reachable via Git history and an annotated tag (for example `legacy-v1`). The `v2-rebuild` working tree may later replace in-tree CRA files without rewriting past commits. |
| **Unresolved questions**  | Whether a future release notes entry should deep-link the legacy tag from the README only, or also keep a `legacy/` snapshot directory.                                                                   |

---

## ADR-003: Current stable Next.js App Router with Cloudflare Workers compatibility

| Field                     | Content                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**                | Accepted direction — 2026-07-28 (implementation not started)                                                                                                                                                                                                                                                                                                       |
| **Context**               | v2 needs a browser-heavy UI plus a **secure server API boundary** for OpenAI. Preference: current stable **Next.js App Router**, with deployment/runtime compatibility aimed at **Cloudflare Workers** (e.g. via supported Next-on-Workers tooling current at implementation time).                                                                                |
| **Decision**              | Intend to scaffold v2 with current stable Next.js (App Router) + TypeScript, targeting Cloudflare Workers-compatible deployment for the server/API surface. If a **material compatibility issue** appears during scaffold (unsupported APIs, broken AI SDK edge runtime, etc.), document it and pause for an explicit framework choice—**do not silently switch**. |
| **Reasons**               | First-class route handlers for secrets; strong TypeScript DX; wide ecosystem; Workers-friendly ops cost/global edge when compatible.                                                                                                                                                                                                                               |
| **Alternatives rejected** | Continuing CRA; SPA-only with exposed keys; undocumented framework swap mid-flight.                                                                                                                                                                                                                                                                                |
| **Consequences**          | Scaffold milestone must verify Workers (or chosen CF adapter) compatibility before locking CI/CD.                                                                                                                                                                                                                                                                  |
| **Unresolved questions**  | Exact Next.js minor and CF adapter are recorded in the scaffold README/CHANGELOG; Node vs Workers constraints for a future OpenAI route remain open.                                                                                                                                                                                                               |

---

## ADR-004: Never execute model-generated JavaScript

| Field                     | Content                                                                                                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                                                                            |
| **Context**               | Legacy v1 executed model `code` via `new Function`, enabling arbitrary code execution in the page origin.                                                                                                                                        |
| **Decision**              | The model must never generate JavaScript that the application executes. Forbidden mechanisms include `eval`, `Function`, `new Function`, injected `<script>`, Blob/Worker scripts built from model text, and dynamic `import()` of model output. |
| **Reasons**               | Non-negotiable security boundary; required for privacy-conscious public deployment; aligns with deterministic engine story.                                                                                                                      |
| **Alternatives rejected** | Sandboxed iframes for model JS; AST-restricted JS subset; “temporary” eval for power users.                                                                                                                                                      |
| **Consequences**          | Expressiveness limited to allowlisted plan operations; some user requests must be refused.                                                                                                                                                       |
| **Unresolved questions**  | UX copy for clear refusals when a request needs capabilities outside the allowlist.                                                                                                                                                              |

**Implementation note (2026-07-28):** Engine and schema packages enforce the no-eval boundary for Plan v1. UI still does not execute plans.

---

## ADR-005: Versioned JSON `TransformationPlan` with allowlisted operations

| Field                     | Content                                                                                                                                                        |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                          |
| **Context**               | Need an inspectable, testable, serialisable representation of work that is not code.                                                                           |
| **Decision**              | Use a versioned JSON document (`TransformationPlan`) whose `operations` are a **discriminated union** of allowlisted operation types (e.g. `op: "replaceExact" | "dedupeLines" | …`). |
| **Reasons**               | Schema validation; explainability; deterministic replay; future npm/CLI packaging.                                                                             |
| **Alternatives rejected** | Free-form JS; opaque model embeddings as “plans”; unversioned ad-hoc JSON.                                                                                     |
| **Consequences**          | Requires careful ops catalogue design and migration rules between plan versions.                                                                               |
| **Unresolved questions**  | Initial ops catalogue size; plan versioning policy (`planVersion` semver vs integer).                                                                          |

**Implementation note (2026-07-28):** Plan v1 shipped as `schemaVersion: "1.0"` in `@tft/transformation-schema` with eight allowlisted operations. Spec: `docs/v2/TRANSFORMATION_PLAN_V1.md`. Field name is `schemaVersion` (not `planVersion`).

---

## ADR-006: Validate transformation plans on both server and client

| Field                     | Content                                                                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                   |
| **Context**               | Plans may arrive from the model (via server) or from user edits / imported files.                                                                                       |
| **Decision**              | Validate every plan with the same schema/rules on the **server** (before returning to clients) and on the **client** (before preview/run). Invalid plans never execute. |
| **Reasons**               | Defense in depth; protects against buggy clients and tampering; shared types for engine package.                                                                        |
| **Alternatives rejected** | Server-only validation; client-only validation; trust model output without schema checks.                                                                               |
| **Consequences**          | Shared schema package or duplicated schema with CI drift checks.                                                                                                        |
| **Unresolved questions**  | Schema library choice (e.g. Zod) at scaffold time.                                                                                                                      |

**Implementation note (2026-07-28):** Zod **4.4.3** is the direct schema dependency. `executeTransformationPlan` validates unknown plans via `safeParseTransformationPlan` before any mutation. The workspace UI validates drafts with the same schema package before Worker execution. Server-side AI validation remains future work.

---

## ADR-007: Send only instruction and user-approved representative samples

| Field                     | Content                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                           |
| **Context**               | Legacy sent a truncated sample (and historically the full text). Users need control and disclosure.                                                             |
| **Decision**              | Network calls for recipe generation include **only** the natural-language instruction and **user-approved** representative samples (after review/redaction UI). |
| **Reasons**               | Privacy; cost; aligns with “full document stays local”.                                                                                                         |
| **Alternatives rejected** | Sending the full document to the model; silent auto-sampling without approval.                                                                                  |
| **Consequences**          | Sampling quality affects recipe quality; UI must support redaction.                                                                                             |
| **Unresolved questions**  | Default sampling strategy heuristics; max sample count/bytes.                                                                                                   |

---

## ADR-008: Keep the full document local in deterministic transformation mode

| Field                     | Content                                                                                                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                 |
| **Context**               | Product promise for large-text, privacy-conscious transforms.                                                                                                         |
| **Decision**              | In deterministic transformation mode, the complete document remains in the browser (or local engine consumer). The trusted engine applies the validated plan locally. |
| **Reasons**               | Privacy, scalability, repeatability, cost control.                                                                                                                    |
| **Alternatives rejected** | Server-side full-document processing as the default; chunking the full doc through the LLM.                                                                           |
| **Consequences**          | Browser memory/Worker design becomes critical; very large files need streaming/chunked engine strategies.                                                             |
| **Unresolved questions**  | Soft/hard size limits for MVP; disk-backed strategies later.                                                                                                          |

**Implementation note (2026-07-28):** Core engine library exists and is UI-agnostic. Workspace integration and Web Worker packaging are not done in this milestone.

---

## ADR-009: Execute the trusted transformation engine in a Web Worker

| Field                     | Content                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                     |
| **Context**               | Legacy ran transforms on the UI thread; large docs and regex can freeze the page.                         |
| **Decision**              | Run the trusted engine inside a **Web Worker** (or equivalent isolated worker scope in the chosen stack). |
| **Reasons**               | UI responsiveness; cleaner cancellation; separation from DOM privileges where possible.                   |
| **Alternatives rejected** | Main-thread-only engine; model-generated Worker source code.                                              |
| **Consequences**          | Structured messaging protocol for progress/cancel/results; careful Transferable usage for large strings.  |
| **Unresolved questions**  | Worker bundling approach under Next.js; fallback when Workers unavailable.                                |

**Implementation note (2026-07-28):** Engine core is Worker-compatible (no DOM/`Buffer`). The web workspace now runs preview/full jobs in a browser Web Worker via `TransformationWorkerClient`. Cancellation terminates the Worker; progress events remain future work.

---

## ADR-010: Progress, cancellation, operation limits, structured failures

| Field                     | Content                                                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                  |
| **Context**               | Large jobs need observability and safety valves.                                                                                                                                       |
| **Decision**              | Engine and UI support progress events, user cancellation, configurable operation/time/size limits, and structured failure objects (code, message, operation index)—not opaque crashes. |
| **Reasons**               | Usability; DoS resistance; debuggability.                                                                                                                                              |
| **Alternatives rejected** | Fire-and-forget runs; unlimited regex/time; `alert(error)`.                                                                                                                            |
| **Consequences**          | Requires cooperative cancellation in ops implementations.                                                                                                                              |
| **Unresolved questions**  | Default limits for MVP; whether limits are user-configurable.                                                                                                                          |

**Implementation note (2026-07-28):** Structured failures and configurable UTF-8 / operation limits are implemented. Progress events, cancellation, and timing wrappers are not yet implemented.

---

## ADR-011: Regex as a high-risk allowlisted operation

| Field                     | Content                                                                                                                                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                                                     |
| **Context**               | Legacy exposed unrestricted `RegExp` from UI; ReDoS risk on the main thread.                                                                                                                                              |
| **Decision**              | Regex-capable operations are explicitly **high-risk**: restricted flags/features, complexity limits, timeouts, preview-required, and clear UX warnings. They remain allowlisted ops—not a escape hatch to arbitrary code. |
| **Reasons**               | Real user need vs safety.                                                                                                                                                                                                 |
| **Alternatives rejected** | Ban all regex; unrestricted regex; model-authored regex executed without limits.                                                                                                                                          |
| **Consequences**          | Some power-user patterns unsupported initially.                                                                                                                                                                           |
| **Unresolved questions**  | Exact regex dialect and complexity metrics.                                                                                                                                                                               |

**Implementation note (2026-07-28):** Plan v1 intentionally omits regex operations. Literal matching only.

---

## ADR-012: Preserve original input and use bounded history

| Field                     | Content                                                                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                 |
| **Context**               | Legacy `useTextHistory` retained unbounded full-document copies—memory hazard.                                                                        |
| **Decision**              | Always retain a clear path to the **original** input for a session. Undo/history must be **bounded** (depth and/or bytes), not unlimited full copies. |
| **Reasons**               | Safety for large files; predictable memory.                                                                                                           |
| **Alternatives rejected** | Unlimited undo stacks of full strings; no undo.                                                                                                       |
| **Consequences**          | Deep undo may truncate; UI should disclose bound.                                                                                                     |
| **Unresolved questions**  | Default bound values; checkpoint compression strategy.                                                                                                |

---

## ADR-013: Do not log user input, output, or sample contents by default

| Field                     | Content                                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                     |
| **Context**               | Text corpora are often sensitive.                                                                                                                         |
| **Decision**              | Default telemetry/logging excludes document text, outputs, and sample contents. Any future analytics are opt-in and anonymised without raw corpus fields. |
| **Reasons**               | Privacy promise; evidence hygiene.                                                                                                                        |
| **Alternatives rejected** | Logging prompts/samples for “quality”; full request archival by default.                                                                                  |
| **Consequences**          | Debugging production issues needs careful, consent-based tooling.                                                                                         |
| **Unresolved questions**  | Whether aggregate counters (bytes processed, op types) are allowed without opt-in.                                                                        |

---

## ADR-014: Secure server-side OpenAI integration

| Field                     | Content                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                    |
| **Context**               | Legacy used `dangerouslyAllowBrowser` and `REACT_APP_*` keys.                                                                                                            |
| **Decision**              | OpenAI credentials live only in **server/encrypted secret storage**. Browser calls **our** API. Apply rate limiting and abuse protection. Never ship keys to the client. |
| **Reasons**               | Prevents key theft and billing abuse; required for public deployment.                                                                                                    |
| **Alternatives rejected** | User-pasted keys in localStorage as the primary model; browser SDK with embedded secrets.                                                                                |
| **Consequences**          | Requires backend route auth/abuse strategy even for an otherwise static UX.                                                                                              |
| **Unresolved questions**  | Auth model for MVP (anonymous rate limits vs accounts); provider failover.                                                                                               |

---

## ADR-015: Schema-constrained model output via current recommended OpenAI API

| Field                     | Content                                                                                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                                     |
| **Context**               | Legacy relied on free-form JSON in chat content and fragile `JSON.parse`.                                                                                                                                 |
| **Decision**              | When AI integration is implemented, use the **current recommended OpenAI structured/schema-constrained output** mechanism available at that time so responses conform to the `TransformationPlan` schema. |
| **Reasons**               | Reduces malformed plans; improves safety and UX.                                                                                                                                                          |
| **Alternatives rejected** | Prompt-only “return JSON”; executing code fences as JS.                                                                                                                                                   |
| **Consequences**          | Model/API version pinning becomes part of reproducibility.                                                                                                                                                |
| **Unresolved questions**  | Exact model ID and structured-output API surface at implementation time (must be re-verified; not claimed as already integrated).                                                                         |

---

## ADR-016: Engine designed for future npm package and CLI

| Field                     | Content                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                           |
| **Context**               | Differentiation includes local, automatable, data-free recipes.                                                                                                 |
| **Decision**              | Implement the transformation engine as a **UI-agnostic** TypeScript library boundary so it can later ship as an npm package and CLI without rewriting core ops. |
| **Reasons**               | Adoption paths; testability; reusable engineering artefact suitable for independent evaluation.                                                                 |
| **Alternatives rejected** | Engine logic embedded only in React components.                                                                                                                 |
| **Consequences**          | Monorepo or clear `packages/engine` layout at scaffold time.                                                                                                    |
| **Unresolved questions**  | None for package manager choice: npm workspaces selected for the scaffold. Publishing cadence remains open.                                                     |

---

## ADR-017: Reproducible benchmarks and an explicit threat model

| Field                     | Content                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                     |
| **Context**               | Claims about large-text performance and security must be evidence-backed.                                                                                                                 |
| **Decision**              | Maintain (1) an explicit **threat model** document and (2) **reproducible benchmarks** (fixtures, commands, machine notes). Do **not** invent benchmark numbers before they are measured. |
| **Reasons**               | Honest product claims; regression detection; external review readiness.                                                                                                                   |
| **Alternatives rejected** | Marketing numbers without methodology; security-by-obscurity.                                                                                                                             |
| **Consequences**          | Evidence register entries remain “planned” until artefacts exist.                                                                                                                         |
| **Unresolved questions**  | First benchmark corpus licence and size tiers (e.g. 100KB / 1MB / 10MB).                                                                                                                  |

---

## ADR-018: Hide recipes behind a mobile-first simple primary UX

| Field                     | Content                                                                                                                                                                                                                       |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**                | Accepted — 2026-07-28                                                                                                                                                                                                         |
| **Context**               | The manual recipe workspace exposed too much internal architecture for normal users and Product Hunt–style evaluation.                                                                                                        |
| **Decision**              | Make `/app` a simple instruction → preview → local-apply flow. Keep the manual builder at `/app/advanced`. Hide JSON/operation internals behind Advanced details. Use a replaceable prototype generator until live AI exists. |
| **Reasons**               | Five-second comprehension; mobile usability; preserve trusted engine architecture without forcing users to become recipe editors.                                                                                             |
| **Alternatives rejected** | Keep the staged recipe builder as the only UI; fake a chatbot that pretends to be AI.                                                                                                                                         |
| **Consequences**          | UX docs in `docs/v2/UX_RESET_V1.md`; prototype adapter must not overclaim AI capability.                                                                                                                                      |
| **Unresolved questions**  | Exact copy for the live AI handoff notice when the server adapter lands.                                                                                                                                                      |

---

## Summary table

| ADR | Title                                                | Status             |
| --- | ---------------------------------------------------- | ------------------ |
| 001 | Rebuild v2 vs extend CRA                             | Accepted           |
| 002 | Preserve history; branch `v2-rebuild`                | Accepted           |
| 003 | Next.js App Router + CF Workers compatibility intent | Accepted direction |
| 004 | Never execute model-generated JavaScript             | Accepted           |
| 005 | Versioned JSON `TransformationPlan`                  | Accepted           |
| 006 | Server + client validation                           | Accepted           |
| 007 | Instruction + approved samples only                  | Accepted           |
| 008 | Full document stays local                            | Accepted           |
| 009 | Web Worker engine execution                          | Accepted           |
| 010 | Progress, cancel, limits, structured failures        | Accepted           |
| 011 | Regex as high-risk op                                | Accepted           |
| 012 | Original preservation + bounded history              | Accepted           |
| 013 | No default content logging                           | Accepted           |
| 014 | Server-side OpenAI + abuse controls                  | Accepted           |
| 015 | Schema-constrained model output                      | Accepted           |
| 016 | Engine as future npm/CLI                             | Accepted           |
| 017 | Threat model + reproducible benchmarks               | Accepted           |
| 018 | Hide recipes; simple mobile-first primary UX         | Accepted           |
