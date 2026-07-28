# App shell and motion v1

**Status:** Implemented on `v2-rebuild`  
**Date:** 2026-07-28  
**Evidence:** EV-030 (implementation screenshots only)

## Why `/app` is a viewport application

`/app` is a productivity surface, not a marketing page. It uses `100dvh`, fills the viewport, and omits the public site footer and long introductory copy.

## Desktop information architecture

- Compact application bar (~56px)
- Optional utility rail (New / Examples / Advanced / Help)
- Two-pane workspace: **Your text** | Preview/Result
- Docked instruction composer under the source pane
- Overflow menu for Home, Advanced editor, Privacy, About, GitHub

## Mobile information architecture

- Compact top bar + overflow menu
- Tabs: Text / Preview / Result
- Sticky bottom composer above safe-area inset
- Preview/Result tabs disabled until available
- No desktop split; one surface at a time

## Instruction-composer behaviour

- Label: What should change?
- Example prompts (expandable on mobile)
- Generate transformation
- Cmd/Ctrl+Enter shortcut
- Prototype status shown as a compact badge in the app bar

## Pane states

1. Empty intelligence pane — guidance only
2. Generated — summary + Preview
3. Preview — before/after + Apply locally
4. Result — output + copy/download/restore/start again

## Visual design system

Dark graphite base, violet primary actions, cyan for generation/status, green for local completion, restrained glow, high-contrast text.

## GSAP architecture

- Packages: `gsap`, `@gsap/react`
- Homepage only (`LandingMotion`)
- `useGSAP` with scoped selectors and automatic cleanup
- ScrollTrigger for benefits/flow/final CTA
- No animation of document content from the app

## Performance constraints

Prefer transform/opacity. Avoid continuous filter animation and layout thrashing loops.

## Reduced-motion behaviour

When `prefers-reduced-motion: reduce`, timelines are skipped and settled content remains visible with working CTAs.

## Accessibility decisions

App landmarks, labelled panes, tab semantics, 44px targets, focus-visible rings, escape-to-close menus, axe coverage.

## Remaining launch work

- Live secure AI generation
- Physical-device QA
- Product Hunt assets
- Dependency audit remediation without breaking Next/OpenNext
