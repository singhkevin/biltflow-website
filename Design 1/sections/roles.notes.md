# WHO IT'S FOR — roles

**Idea.** The decorative mini-ring becomes a 13-stage linear strip per role: owned stages
solid orange, upstream dependencies hollow in data blue, the rest a faint baseline mark.

**What moves.** One element: the shared 13-column ruler. At rest its column height is how
many roles sign for that stage, so CONSTRUCTION and HANDOVER show as the crowded seams.
Hover or focus a card and it resolves to that role — owned solid, upstream hollow, rest
dropped — then rests. Colour and opacity only, 160ms linear, no loop. Unbound off-screen
by IntersectionObserver; `prefers-reduced-motion` kills all of it. ~1.4 KB vanilla JS.

**In 3 seconds.** Six roles, thirteen stages, one record — no role owns the whole ring,
so the handovers are the product.

## Invented — verify before shipping

No customer, metric or screen is claimed. The stage assignments are my judgement from
Australian Class 2 practice — Raj should mark them up. Stages 01 SITE SOURCING to 13 LEARNING:

- Site Manager — owns 08, 09, 11 · reads 04, 06, 07
- Project Manager — owns 08, 09, 10 · reads 03, 04, 06, 07
- Contracts Manager — owns 05, 06, 07 · reads 02, 04
- Design Manager — owns 03, 04 · reads 01, 02
- Developer — owns 01, 02, 12 · reads 05, 13
- Construction Director — owns 08, 10, 13 · reads 05, 06, 07, 09, 11

Least safe: Design Manager owning APPROVALS, Contracts Manager owning ESTIMATING.
Developer reading LEARNING is deliberate — that is the ring closing.
Page counts are arithmetic on this list.
