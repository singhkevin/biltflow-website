# Site DNA — Coronation Property (https://coronation.com.au/)

AUDIT_MODE: standard
Audited for: Biltflow re-seed prompt — mechanism/technique only. Coronation is the (unconfirmed) anchor
client referenced elsewhere in the Biltflow brief, NOT a competitor. Its brand colors, logo, or any
client-identifying content must never be adopted into Biltflow's own system — layout/motion/interaction
technique only.

---

## 1.1 — Page Architecture

Single long-scroll homepage, 8 stacked full-width sections, ~7607px tall at 1280×720: (1) full-bleed video hero, 644px; (2) sticky header, 76px, pins directly under the hero; (3) two-column mission statement, 126px, constrained grid; (4) stats block, 198px, constrained; (5) full-bleed parallax media block, 880px; (6) constrained headline + full-bleed-overflow project carousel, 863px; (7) "Practice" scrolling sticky card-stack, 3220px — by far the tallest section (~4.5 screen-heights); (8) full-bleed-overflow news carousel, 1095px; (9) color-inverted footer, 498px.

Grid: strict 6-column CSS grid (`repeat(6,1fr)`) with a fixed 40px gutter governs every constrained section; hero, the parallax media block, and both carousels deliberately break out to full-bleed — rhythm alternates constrained-editorial ↔ full-bleed-cinematic roughly every other section. Vertical whitespace is a strict 40px-based scale (20/40/60/80/160px). No true section overlaps except the sticky header, which casts an upward drop-shadow (`0 -15px 16px rgba(0,0,0,.2)`) onto content still scrolling past above it.

---

## 1.2 — Design Tokens

**Palette:** Strictly monochrome — `--black:#000000`, `--white:#ffffff`, `--off-white:#ebebeb`, `--cement:#f1ede8`. No accent/brand hue anywhere in the CSS custom properties at all — the entire system is built on value contrast, not color.

**Typography:** A single custom family ("UniversalSans", fallback Helvetica) for everything — no serif, no mono, no secondary display face. Fluid type scale via `max(calc((px/1600)*100vw), floor)`. Headings/eyebrows render uppercase via `text-transform`, but with NO letter-spacing bump despite the uppercase, weight 400 throughout — no bold headline weight observed.

**Spacing:** Strict 40px base unit with named multiples (10/15/20/40/60/80/160px).

**Radius:** 0px measured on every sampled element — the whole site is hard-cornered.

**Shadow:** none by default; only functional micro-cues (header's upward scroll-shadow, a soft `0 0 10px rgba(0,0,0,.1)` on card-image hover only).

**Motion curve:** one global easing token reused verbatim sitewide — `--cb: 0.7s cubic-bezier(0.66,0,0.21,0.98)` (fast-start, decelerating-finish — not spring/bounce).

---

## 1.3b — Composition Map: Hero

A single full-bleed `<video>` (autoplay/muted/loop, 644px tall). The "split-screen, captioned" look is baked directly into the video's own edit (a burned-in motion-graphic montage), NOT a coded DOM overlay — the only real DOM text near the hero is an invisible/off-screen H1 present for SEO/a11y only. A flat black scrim `<div>` sits above the video at a fixed 60% opacity for caption legibility. The one CODED scroll mechanism: a GSAP ScrollTrigger tweens the hero section's own opacity 1→0.6 linearly, `scrub:true`, exactly bound to the hero's own height (`start:'top top', end:'bottom top'`) — the hero doesn't shrink, it dims to 60% in perfect lockstep with scroll distance, then the sticky header locks over it.

---

## Section Notes (selected)

**Stats block:** 4 stacked number+label pairs, static text (no JS count-up), fading/rising in via a shared stagger (150ms apart). **Media block:** one huge full-bleed photo in a fixed-aspect crop frame with a 0%→10% `translateY` scroll parallax. **"Practice" section (the tallest, most novel):** full breakdown below. **Carousels (projects + news):** identical Swiper config in both places.

---

## 1.9 — Motion Philosophy + Copy Voice

**Motion:** Engineered-editorial, not playful. Every scroll effect is scrub-bound to actual scroll distance (`ease:"none"`) — the user's scroll speed IS the animation speed, producing a controlled, almost mechanical precision. One shared decelerating curve governs every entrance. Nothing bounces, springs, or overshoots anywhere. Emotionally: calm confidence and restraint — large declarative single-sentence copy, numbers presented flat with no count-up gimmick, hover states that dim rather than glow.

**Copy voice:** Short, plain-language, stat-forward. Simple declaratives, one subject-verb-object each. Category labels are terse two-word tags. Headlines favor concrete nouns over abstract marketing language — a register that lands well with a non-technical, time-pressed reader (Biltflow's exact persona).

---

## Steal-Worthy Techniques

1. **Sticky Stack Section with Scroll-Spy Jump Bar** — N full-height panels, each `position:sticky; top:<header-height>`, stack under the header in normal DOM flow (no JS scroll-jack). Each panel scales `0.9→1` with `scrub:0.2` (smoothed, slightly lagging) as it arrives. A separate sticky jump-bar (one button per panel, active state synced to whichever panel is topmost, click = smooth-scroll to that panel) doubles as a live progress indicator. Zero color/gradient/blur/shadow dependency.
2. **Focus-Dim Card Hover** — two CSS rules, not one: `.wrapper:hover .card{opacity:.7}` dims every card, then `.card:hover{opacity:1;transform:scale(1.01)}` excepts the hovered one back up + a 1% scale lift. Needs no color at all — swap the box-shadow lift-cue for a border-color step-up to stay shadow-free.
3. **Word-Clip Roll-Up Text Reveal** — each word wrapped in an `overflow:hidden` clip mask; the inner span slides `translateY(100%)→0` + fades in, staggered per word, triggered once on viewport entry (not scroll-scrubbed). A typographic/mechanical effect, not a color effect.
4. **Global Stagger-by-CSS-Variable Entrance System** — one shared easing token, a `.enter`/`.enter.entered` container toggle (IntersectionObserver, fires once), and `.enter-child` descendants each carrying their own inline `--stagger:N` to drive delay off one shared rule — no per-component JS delay math.
5. **Scroll-Distance-Scrubbed Hero Recede** — a single ScrollTrigger tween, `scrub:true`, opacity 1→0.6 exactly bound to the hero's own height — a recede-not-vanish exit that keeps the outgoing view legible as a backdrop.
6. **Constant-Rate Parallax Photo Drift** — every large photo sits in a fixed-aspect crop frame; `translateY` scrubs 0%→10% across the range the specific image is on-screen (independently scoped per image, not one global parallax value).
7. **Wide-Gutter Peek Carousel** — `slidesPerView:2.8`, `spaceBetween:200` (gutter ~⅔ the card's own width), `loop:true` via DOM-duplicated slides, momentum-drag with snap. A pure spacing/layout decision, no color/softness required.

⚠ **Caution (flagged, not a recommendation):** the Global Stagger entrance system and the Word-Clip reveal are, mechanically, a "fade/clip up on every wrapper" pattern — and the locked Biltflow brief explicitly bans exactly that ("the fade-up-40px scroll reveal on every wrapper... the single most template-looking thing on any of these pages"). Both techniques are still valuable, but should be scoped to a small number of specific, deliberate componentized moments — not applied as a sitewide default — see the synthesis addendum for exactly where.
