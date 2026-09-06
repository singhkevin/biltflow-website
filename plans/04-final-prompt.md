# Final Prompt — Biltflow homepage v4 addendum

AUDIT_MODE: standard
Quality checklist: PASSED (2026-09-04)

---

## Delivery Notes

**Adaptation from the standard ui-cloner flow:** this is a *re-seed* prompt against an already-locked,
already-built design system (`CLAUDEDESIGNBRIEF.md` v3 + `Design 1/extracted/v3.dc.html`), not a
from-scratch replication prompt. Phase 2's 12-question brand interview was skipped by explicit user
choice — all 12 answers already exist inside `CLAUDEDESIGNBRIEF.md` and `COPY-REWRITE.md`. Rule 4's
"Build the Design System" step became "**reaffirm** the design system" (§2 of the addendum) rather
than invent one. Section-by-section component architecture (Rule 5/6) is scoped to *deltas only* —
sections with no recommended change say so explicitly rather than being padded with invented content.

**Core Checklist:**
- [x] Named aesthetic identity — "Drawing-set precision, grounded in the real build." (6 words)
- [x] Complete design system — reaffirmed in §2 with exact hex/typography/texture values (unchanged
      from the locked v3 system, which already passes this bar)
- [x] Every borrowed technique carries a poetic + functional name (Layered Depth Compositing, Unified
      Hairline Frame, Off-Canvas Orange Wipe, Group-Hover Cascade Card, Rotating-Angle Ring,
      Compressed-Transformation Stat Headline, Focus-Dim Card Hover, Plus-to-Minus Bar Rotation,
      Reaching Arrow, Global Stagger Entrance)
- [x] Every interactive component has an implementation-level behavior spec (exact transform values,
      opacity steps, class-toggle logic)
- [x] At least one cubic-bezier or timing value per animated component (verified: 1.4s
      cubic-bezier(.4,0,.2,1) ring reveal; 0.3s orange wipe; 250–500ms group-hover cascade; 0.7s
      cubic-bezier(0.66,0,0.21,0.98) scoped stagger; 0.2s ease-in-out accordion reveal; 0%→10%
      parallax scrub)
- [x] Color hierarchy preserved — every borrowed technique's color role explicitly mapped to Biltflow's
      existing roles (accent→Safety Orange, data-relationship→data blue) or explicitly rejected where
      it couldn't be (DroneDeploy's AI-purple glow layer dropped, not reassigned)
- [x] Technical requirements section present (§6) — stack, new-file convention, video fallback, asset
      embedding, font loading, animation lifecycle
- [x] Execution directive present as the final line (§8), italicized, states how to feel/hold the
      tension rather than a literal instruction

**Zero Generic Language scan:** passed — no instance of "some animation," "nice hover effect," "smooth
transition," "add appropriate padding," "use a gradient," "make it feel premium," "add content here,"
or "similar to" found. Every Higgsfield image prompt is a concrete scene description, not a
placeholder. One intentional departure from the template's usual pixel-exactness: because this
addendum's audience is Claude Design (an AI design tool operating from a brief, not a literal code
handoff), new-layout elements reuse the *mechanism* specs captured verbatim from the source audits
(exact radii, opacities, durations, easing) but leave final pixel sizing of brand-new elements (the
project filmstrip, the six portrait cards) to the same level of discretion `CLAUDEDESIGNBRIEF.md`
itself already leaves Claude Design elsewhere — consistent with this project's existing convention,
not a fidelity gap.

**Structural flag surfaced during synthesis (not present in the original brief):** the live
`v3.dc.html` currently merges what the brief describes as two sections ("Built on real construction"
and "EVE") into one `id="eve-provenance"` block, and merges the "Proof slot" concept into the
`id="repurpose"` (objection register) block. `COPY-REWRITE.md`'s own heading rewrite implies splitting
the first merge back apart; the addendum surfaces this explicitly in §4.6 and §7 as an open decision
rather than silently restructuring the canvas.

---

## The Verified Prompt

See `CLAUDEDESIGNBRIEF-v4-addendum.md` at the project root (canonical, actively-maintained) — mirrored
verbatim in `plans/03-replication-prompt.md`. Not reproduced a third time here to avoid drift; all
three should be read as one artifact.

---

## User Instruction

Paste `CLAUDEDESIGNBRIEF-v4-addendum.md` (alongside the still-authoritative `CLAUDEDESIGNBRIEF.md` and
`COPY-REWRITE.md`) into Claude Design to re-seed the existing canvas. Before building, resolve the four
open decisions in the addendum's §7 — in particular §7.3 (this addendum intentionally proposes more
than one pass's worth of work; pick a first slice) and §7.4 (no Higgsfield generation has happened yet
— confirm before spending credits).
