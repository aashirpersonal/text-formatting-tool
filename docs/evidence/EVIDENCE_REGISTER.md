# Evidence register

**Purpose:** Track claims and artefacts that could support product credibility, security narrative, and (where applicable) Global Talent–style evidence—without manufacturing proof.

**Rules:**

- Unproven items are **planned** or **missing**.
- Do not invent users, metrics, testimonials, or benchmark numbers.
- Prefer links to immutable Git commits, signed releases, or dated documents.
- “Suitable for public use?” means the artefact can be shared without exposing secrets or private user data.

**Last updated:** 2026-07-28  
**Owner (default):** Repository maintainer (`aashirpersonal`)

| Evidence ID | Category | Claim | Required proof | Current status | Source or link | Owner | Date | Next action | Suitable for public use? | Possible Global Talent relevance | Limitations |
|-------------|----------|-------|----------------|----------------|----------------|-------|------|-------------|------------|----------------------------------|-------------|
| EV-001 | Provenance | Original public repository exists with inspectable history | Git remote URL + commit graph | **Present** | https://github.com/aashirpersonal/text-formatting-tool ; tip of application history `8d3fa8c` on `master` | Maintainer | 2026-07-28 | Keep history intact; avoid force-push | Yes | Shows sustained project continuity | `main` is a stub; app history is on `master` |
| EV-002 | Provenance | Legacy v1 architecture is documented | Dated audit of architecture and risks | **Present** | `docs/audits/2026-07-28-legacy-v1-baseline.md` | Maintainer | 2026-07-28 | Cross-link from README in a later docs PR | Yes | Demonstrates critical evaluation of own prior work | Audit is maintainer-authored, not independent |
| EV-003 | Security evolution | Project moved from unsafe model-JS execution to a no-eval recipe architecture | Diff between legacy AI path and v2 ADRs/implementation | **Partial** | Legacy: `src/components/AIAssistant.js` (`new Function`); Direction: `docs/v2/ARCHITECTURE_DECISIONS.md` ADR-004/005 | Maintainer | 2026-07-28 | Implement v2 engine; keep ADR + code evidence | Yes (docs); code when merged | Strong narrative of security learning | Implementation not yet started |
| EV-004 | Architecture | v2 architecture decisions are recorded | ADR set with status/context/consequences | **Present** | `docs/v2/ARCHITECTURE_DECISIONS.md` (ADR-001–017) | Maintainer | 2026-07-28 | Update ADRs when scaffold reveals CF/Next constraints | Yes | Decision quality / technical leadership signal | Decisions ≠ working system |
| EV-005 | Engineering | Trusted transformation engine implemented | Tagged release + tests for allowlisted ops | **Missing** | — | Maintainer | 2026-07-28 | Scaffold package boundary; write ops + tests | Not yet | Core technical contribution | Do not claim performance yet |
| EV-006 | Engineering | Schema and validation design exists | Published schema + server/client validation code | **Missing** (design intent only) | Intent in ADR-005/006/015; blueprint in `docs/v2/PRODUCT_BLUEPRINT.md` | Maintainer | 2026-07-28 | Author JSON Schema/Zod module | Not yet | Reproducible interface design | No schema file in repo yet |
| EV-007 | Security | Explicit threat model published | Threat-model doc + review date | **Planned** | ADR-017 commits to creating one | Maintainer | 2026-07-28 | Draft `docs/security/THREAT_MODEL.md` after scaffold | Intended yes | Security maturity | Absent today |
| EV-008 | Performance | Reproducible large-text benchmarks | Fixture set + scripts + raw results + machine notes | **Planned** | ADR-017; no numbers claimed | Maintainer | 2026-07-28 | Define 100KB/1MB/10MB fixtures; measure Worker engine | Intended yes (anonymised fixtures) | Quantitative engineering evidence | No benchmarks run in this docs task |
| EV-009 | Cost / privacy | API-cost comparison vs sending full documents to a model | Methodology + measured token/cost estimate on fixtures | **Missing** | — | Maintainer | 2026-07-28 | Compare sample-only recipe calls vs naive full-doc LLM transforms | Yes if no private data | Economic + privacy argument | Easy to overclaim; needs methodology |
| EV-010 | Performance | Local-processing comparison (Worker engine vs main-thread / vs LLM chunking) | Side-by-side reproducible runs | **Missing** | — | Maintainer | 2026-07-28 | Benchmark after engine exists | Yes | Systems performance evidence | Not measured |
| EV-011 | Deployment | Public production deployment of safe v2 | Live HTTPS URL + security headers notes + version | **Missing** | Legacy Heroku URL returned **404** on 2026-07-28 | Maintainer | 2026-07-28 | Deploy v2 only after ADR-004/014 satisfied | Yes when live | Real-world operation | Do not redeploy legacy v1 |
| EV-012 | Release management | Versioned release history | GitHub Releases / tags with notes | **Missing** | No tags observed at fetch time (2026-07-28) | Maintainer | 2026-07-28 | Tag legacy baseline; release v2 when ready | Yes | Process maturity | No releases yet |
| EV-013 | Distribution | npm package and/or CLI adoption | npm page + download stats + version | **Missing** | ADR-016 future intent | Maintainer | 2026-07-28 | Publish engine when stable | Yes | Reach beyond a single app | Adoption not guaranteed |
| EV-014 | Community | GitHub stars and forks | Snapshot dated metrics | **Observed baseline (low)** | Public repo metadata as of prior audit: 1 star, 0 forks (re-check before citing) | Maintainer | 2026-07-28 | Re-fetch metrics when preparing applications; do not inflate | Yes | Weak alone; context only | Vanity metrics; easy to misread |
| EV-015 | Community | Independent issues and pull requests from non-owners | Third-party GitHub issues/PRs | **Missing / not evidenced** | Open issues count was 0 at prior API check | Maintainer | 2026-07-28 | Encourage real external contribution after v2 usable | Yes | Independent engagement | Do not fabricate issues |
| EV-016 | Users | Genuine active users | Privacy-preserving analytics or attested case counts | **Missing** | — | Maintainer | 2026-07-28 | Optional opt-in analytics post-ADR-013 | Only aggregate public stats | Impact evidence | Must not log document contents |
| EV-017 | Users | Returning users | Longitudinal aggregate metrics | **Missing** | — | Maintainer | 2026-07-28 | Requires product + analytics design | Aggregate only | Retention signal | Easy to overstate |
| EV-018 | Workload | Large files processed | Attested max sizes + benchmark logs (no user data) | **Missing** | Legacy architecture unsuitable; no Worker engine yet | Maintainer | 2026-07-28 | Record synthetic large-file runs | Yes (synthetic) | Scale claim | No production stats |
| EV-019 | Social proof | Testimonials | Named permissioned quotes | **Missing** | — | Maintainer | 2026-07-28 | Collect only with consent | With consent | Impact narrative | None exist |
| EV-020 | Social proof | Case studies | Written case study with measurable outcome | **Missing** | — | Maintainer | 2026-07-28 | After real deployments | Redacted yes | Strong impact evidence | None exist |
| EV-021 | Communication | Technical articles | Published posts linking architecture | **Missing** | — | Maintainer | 2026-07-28 | Publish post on recipe-vs-codegen after implementation | Yes | Knowledge sharing | None yet |
| EV-022 | Communication | Talks or workshops | Slides/video + event listing | **Missing** | — | Maintainer | 2026-07-28 | Propose talk when demo-ready | Yes | Field contribution | None yet |
| EV-023 | Review | Independent expert review | Written review by unaffiliated expert | **Missing** | — | Maintainer | 2026-07-28 | Seek review of threat model + engine | Yes if reviewer agrees | High-value endorsement | None yet |
| EV-024 | Academic | Academic connection | Supervisor/lab collaboration artefact | **Unknown / not documented here** | No formal product affiliation artefact is recorded in this register | Maintainer | 2026-07-28 | Document only real, permitted affiliations | Only if appropriate | Optional GT pathway support | Do not imply endorsement or invent affiliations |
| EV-025 | Recommendations | Recommendation-letter briefing material | Briefing pack referencing EV-IDs | **Planned** | This register as spine | Maintainer | 2026-07-28 | Draft briefing only from **Present** evidence | Private until approved | Supports recommenders | Must not overclaim |

---

## How to use this register

1. When a claim appears in README, funding, or immigration materials, cite an **Evidence ID**.
2. Promote status only when proof lands in-repo or at a stable URL.
3. If proof is withdrawn (e.g. deployment taken down), demote status and note the date.
4. Never store API keys, user corpora, or private sample contents as “evidence”.

## Snapshot notes (2026-07-28)

- Legacy baseline install/build/test/audit results are recorded in `docs/audits/2026-07-28-legacy-v1-baseline.md`.
- Product intent is recorded in `docs/v2/PRODUCT_BLUEPRINT.md`.
- No v2 application source was implemented in the documentation task that created this file.
