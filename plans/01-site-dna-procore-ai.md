# Site DNA — Procore AI (https://www.procore.com/en-sg/ai)

AUDIT_MODE: standard
Audited for: Biltflow re-seed prompt — the category leader's AI/copilot page, most relevant reference for the EVE orchestration section.

---

## 1.1 — Page Architecture

11 content sections grouped into 5 "chapters" by background color: CH1 black hero (1) → CH2 warm-stone `#F5F1ED` (4: logo bar, "Future-proof" 3-card bento, 3× "story" 50/50 blocks, "Smarter decisions" stat bento) → CH3 black (4: Rive infrastructure diagram + 3-step row, agent-tile carousel, trust bento, draggable testimonial carousel) → CH4 grey FAQ accordion (1) → CH5 black CTA closer (1). ~9541px tall at 1280px width.

Grid: constrained-with-generous-padding, not full-bleed content (hero content `max-w-210`, gutter scales `px-3→lg:px-6` = 12px→24px). Hero uses an asymmetric `lg:grid-cols-[6fr_5fr]` split (headline in the larger column, body+CTAs in the smaller). Story sections use a strict 50/50 flex row (558/558px). No literal overlaps; closest is a full-card `before:absolute before:inset-0` invisible hit-target on agent tiles.

---

## 1.2 — Design Tokens

**Palette:** CTA orange `#FF5201` → hover `#E14504` (darker shade swap, not a gradient). Black chapters `#000000`. Warm-stone chapters `#F5F1ED`. Hairline card borders `#CBBAAB` at **0.5px** (sub-pixel, not 1px — crisper on retina). Body text binary: pure black on light, pure white on dark — no mid-grey body text.

**Typography — 3-font system:** pitchSans exclusively for uppercase eyebrow/kicker labels (16px/500/+0.8px tracking) — doing the same job Plex Mono does for Biltflow. procoreSans reserved for the single largest hero H2 only (60px/700, white on black). Inter Tight for everything else (H2s 44px/600, card body 28px/600 down to 16px/500 nav). CTA button label tracking +0.48px.

**Radius:** Chakra buttons/CTAs use 4px (soft, not sharp); the bento-card grid system uses ~3.25px on ONLY the outermost corners of a hairline-bordered row, interior seams dead square — Procore's own system already leans toward near-zero radius on structural/data cards.

**Shadow:** `none` on every hovered/focused element checked; the only shadow token is a `:focus-visible` accessibility ring. Flat, no-drop-shadow — transplants trivially to Biltflow's shadow-free system.

**Blur/glass:** exactly one usage sitewide — a full-viewport nav-dropdown scrim (`backdrop-blur-[50px]`), confined to a modal backdrop, never decorative chrome.

---

## 1.3b — Composition Map: Hero

Full-bleed pure-black section. Eyebrow row: 20×20px orange hexagon icon + pitchSans uppercase label. Asymmetric 6fr/5fr grid: headline "Construction AI built to get work done" (procoreSans 60px/700/white) in the larger column; a 3-line body paragraph + CTA row ("Request a demo" filled orange, "Explore plans" text link with animated arrow) in the smaller column. Below, a full-width 1184×508px media panel: a single static PNG **literal in-product screenshot** of the Procore AI chat sidebar inside real app chrome — no abstract illustration, no floating decorative elements. All visual interest comes from typographic scale contrast (60px vs 16px) plus the one edge-to-edge screenshot.

---

## Section Notes (selected)

**"Future-proof your business" / "Smarter decisions" bento rows:** a single unified hairline-bordered container (0.5px `#CBBAAB`) split into equal columns with NO gap — dividers are shared hairlines internal to one continuous border box, only the row's outermost corners rounded (~3.25px), interior seams dead square. "Smarter decisions" cards use a text-only **compressed-transformation headline** ("One week → ten minutes") instead of an animated counter — full spec below.

**"AI Agents" carousel (5 cards, most relevant section):** fixed-width 312×516px cards, `overflow-hidden` track, cards visibly bleed past the viewport edge signaling more content. Card: black-bg 3:4 photo → title-as-link with a shared "animated-arrow" icon → one-sentence description. Whole card is one hit-target via `before:absolute before:inset-0`. Hover fires three coordinated changes off one `group` class: photo opacity 100%→80%, photo scale 100%→102%, arrow shaft elongates — 500ms ease-out (photo), 250ms (arrow).

**FAQ / accordion (reused 4× across the page):** same Ark UI/Zag.js component restyled per context via wrapper classes only — plus-to-minus icon rotation + `slideDown/slideUp` 0.2s ease-in-out height-auto reveal.

**Testimonial carousel:** react-slick, center-mode — active slide 100% opacity, every other visible slide flat `opacity:0.35` (not a distance gradient), `cursor:grab`, confirmed autoplay ~3–4s, **zero visible dots/arrows** — the only affordance is the dimmed peek + grab cursor.

---

## 1.9 — Motion Philosophy + Copy Voice

**Motion:** Restrained and functional — nearly every confirmed animation is sub-500ms with simple ease/ease-out timing, no spring/bounce/overshoot anywhere. The one moment of visual richness (a Rive canvas animation of the AI infrastructure pipeline) is a single deliberate hero moment inside an otherwise flat, static-screenshot-and-hairline-frame page. Everything else is IMAGE, not MOTION. Reads as an intentional "enterprise-credible, not flashy" choice.

**Copy voice:** Confident, plainspoken, B2B-enterprise register using construction jargon unapologetically (site diary, submittal, RFI, spec book). Short declaratives structured as "[blunt problem]. [named mechanism as solution]." Headlines favor compressed-transformation format over adjectives or percentages. Trust/governance copy is explicit and reassurance-forward, naming competitor models directly for credibility.

---

## Steal-Worthy Techniques

1. **Reaching Arrow** — shared SVG arrow icon (viewBox 0 0 24 14) whose `d` path morphs on hover/focus, shaft extending ~56% (27→42 units), via `transition: 250ms` on the `d` property directly (not a transform, which would distort the arrowhead). 100% of hover affordance lives in this one glyph — no color/position change on the parent text.
2. **Unified Hairline Frame** — one outer 0.5px-bordered container, radius only on the two outermost corners, interior cards edge-to-edge sharing hairline dividers on the seams only — reads as one bordered panel divided by rules, not N separate cards with gaps. Nearly identical to a construction drawing-set title block or a quantity-takeoff table.
3. **Group-Hover Cascade Card** — one `group` class on the card root fires 3 coordinated child effects on hover (photo dim+scale 500ms ease-out, arrow elongation 250ms, full-card hit-target) — the card's own outer bounding box never changes, only its contents animate.
4. **Plus-to-Minus Bar Rotation** — 18×18 viewbox, two rects (horizontal + vertical bar) each `transition-transform` off the accordion's own `data-state` attribute; content reveals via `slideDown/slideUp` 0.2s ease-in-out using an auto-measured `--height` custom property (animates to true content height, not a fixed guess).
5. **Compressed-Transformation Stat Headline** — tiny tracked eyebrow → ONE headline combining before-state + literal arrow character (→) + after-state at 28px/600, set in the display face → one sentence of named-customer attribution. No animated counter, no chart, no unit-labeling ambiguity — the entire visual weight is plain-language typography.
6. **Center-Mode Peek Carousel (silent controls)** — active slide 100% opacity, every other visible slide a single flat 35% opacity value (not gradient falloff), `cursor:grab` as the only interactivity affordance — zero dots, zero arrow chrome.
7. **Sub-Pixel Hairline + Two-Font Label System** — `border-width: 0.5px` renders crisper than 1px on retina; one face used exclusively for uppercase kicker labels, never body/headlines — validates Biltflow's own Archivo/Plex-Mono role split as the thing that makes a system read precise rather than decorative.
