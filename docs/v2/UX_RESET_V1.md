# UX Reset v1

**Status:** Implemented on `v2-rebuild`
**Date:** 2026-07-28
**Evidence:** EV-029 (implementation screenshots only; not adoption evidence)

## Product UX principle

The secure recipe architecture is **internal infrastructure**.

Normal users should understand the product in five seconds as:

> Paste your text, tell AI what to change, preview it, then apply the transformation locally.

They should not need to understand JSON, TransformationPlan, operation IDs, Worker messages, schema validation, or manual operation sequencing.

## Normal-user flow

1. Add text or a file
2. Describe the desired change (or pick an example)
3. Generate a transformation
4. Review before/after
5. Apply locally to the complete input
6. Copy or download the result

Primary route: `/app` (full-viewport application shell)
Advanced manual editor: `/app/advanced` (same shell, manual controls)

See also `docs/v2/APP_SHELL_AND_MOTION_V1.md` for the viewport shell and GSAP homepage.

## Why recipes are hidden

Recipes remain the execution contract that keeps processing safe and deterministic, but they are no longer the primary interface. Advanced details stay collapsed by default. Raw JSON is optional and nested.

## Mobile-first decisions

- Target widths include 320 / 375 / 390 / 430
- Sticky bottom primary action with `env(safe-area-inset-bottom)`
- Segmented Before/After on narrow screens
- Compact header + accessible menu
- Touch targets ≥ 44px
- Prefer `100dvh` for shell height
- One main task at a time; no squeezed desktop columns

## Prototype-generator limitation

`RecipeGenerationAdapter` → `LocalPrototypeRecipeGenerator` supports approved example prompts and close deterministic variants only.

It:

- returns schema-valid Transformation Plan v1 objects
- uses no network
- never executes JavaScript
- never claims prototype output was produced by AI
- shows an accurate Prototype mode badge

OpenAI mode (`RECIPE_GENERATOR_MODE=openai`) adds sample review, then same-origin recipe generation. See `docs/v2/AI_RECIPE_GENERATION_V1.md`.

Arbitrary unsupported instructions receive (prototype):

> This prototype currently supports the example transformations above. Flexible AI instructions are coming next.

Unsupported OpenAI / engine-limit copy:

> This request needs open-ended writing or reasoning that the local transformation engine cannot safely reproduce.

## Accessibility approach

- semantic headings and labels
- keyboard-operable controls
- visible focus rings
- aria-live status
- axe coverage on landing, app, preview, result, and mobile menu
- primary button text stays high-contrast white on indigo (including nav CTAs)

## Visual-system decisions

- Warm stone page background
- Deep ink text
- Indigo/violet primary accent
- Green for local/success states
- Amber for prototype/warnings
- Plus Jakarta Sans + IBM Plex Mono
- Restrained borders and soft shadows; no decorative AI sparkle chrome

## Product Hunt readiness criteria

**Not claimed yet.** Before launch readiness, the product still needs:

- founder-verified live OpenAI configuration (optional for CI)
- polished marketing copy review
- real Product Hunt assets and launch plan
- dependency audit remediation where feasible without breaking OpenNext/Next

## Remaining work before launch

- Validate Cloudflare Rate Limiting binding in production (not claimed active yet)
- Keep the prototype adapter replaceable without UX churn
- Continue mobile QA on physical devices
- Avoid absolute privacy claims (OpenAI mode may send approved samples + instruction)
