# Site DNA — DroneDeploy (https://www.dronedeploy.com/)

AUDIT_MODE: standard
Audited for: Biltflow re-seed prompt (mechanism/technique extraction only — not brand/color adoption)

---

## 1.1 — Page Architecture

Single long-scroll homepage, ~5047px tall at 1280px width, 7 stacked full-width sections with hard (non-gradient) background-color cuts — a strong black/white banding rhythm:

1. Hero — y0–720, transparent bg over a full-bleed photographic background image.
2. Logo/trust marquee — y720–959 (239px), transparent.
3. "More than just site photos" product video — y959–1890 (931px), solid `#000000`.
4. "Understand all your sites" auto-advancing feature tabs — y1890–2648 (758px), solid `#000000` (seamless continuation of section 3 — ~1690px of unbroken black).
5. "Don't get left behind" synced dual-carousel — y2648–3530 (882px), solid `#FFFFFF` (the one light interruption in an otherwise all-black lower page).
6. "DroneDeploy Insider" content hub — y3530–4716 (1187px), solid `#000000`.
7. Final CTA + footer — y4716–5047+, solid `#000000`.

Grid: constrained content (`container-large26`, max ~1217px) centered inside full-bleed section backgrounds, ~31px side gutters, never edge-to-edge content. Asymmetry comes from alternating column splits, not broken grids. Overlaps: hero worker-cutout photo (z-index 2) + Lottie drone animation layered above the full-bleed hero photo; a soft gradient-glow div overhangs the feature-tabs content column; a solid-indigo color blob bleeds behind both testimonial-carousel panels; a persistent fixed AI "ask bar" widget (z-index 1000–100000) floats above all section boundaries.

---

## 1.2 — Design Tokens

**Palette:** Ground `#FFFFFF` / `#000000` (near-black `#111111` secondary), primary text `#1F1F1F`, secondary text `#666666`/`#9B9B9B`. Brand orange `#FAAF33` (CTA hover-wipe fills, 12 uses). Brand indigo `#3F48E9` (filled hero-btn, focus accent, color blob, caret). A THIRD accent family reserved exclusively for "this is AI" UI: violet `#9900FF` / `#8F00FF` + magenta `#D23B7F` glow tint — never used elsewhere on the page. Card tint grays `#F5F5F7`/`#F9F9F9`.

**Typography:** Hanken Grotesk (display/UI/body/nav, 1041 uses). DM Mono reserved for meta text only — eyebrow/kicker labels (17.6px/400) and footer legal copy (9.4px/400) — a deliberate mono-for-labels/sans-for-content split, directly analogous to an Archivo+Plex-Mono pairing. Inter is swapped in only inside the AI ask-bar (breaks the site's normal 2-font system for that one component). H1: 67.37px/600/lh 74.1px/tracking -1.567px, white on hero. Button text 18px/600.

**Spacing/Grid:** Container max ~1217px, ~31px gutters. No fixed vertical unit — each section sized to content (239px–1187px).

**Corners:** No single global radius — recurring family: 23.5px (pill CTAs), 3.92px (small cards), 9.79px (media cards), 100%/50% (circular FAB/avatars), 28px (AI search bar pill explicitly).

**Shadow:** Page is otherwise shadow-free. Exceptions confined entirely to the AI ask-bar/FAB: a 1px white inset ring, and a 3-layer colored glow (`rgba(143,0,255,.1) 0 0 0 1px, rgba(0,0,0,.35) 0 12px 40px, rgba(210,59,127,.18) 0 0 18px`), swapping to a blue-tinted version on focus.

---

## 1.3b — Composition Map: Hero

5 layered elements: (1) full-bleed photographic construction-site background; (2) a cutout photo of a worker in hi-vis + hard hat, isolated on transparent bg, positioned right-of-center (230×540px, z-index 2 — a discrete depth layer above the photo, not baked in); (3) a Lottie quadcopter-drone animation (290×247px) floating between the worker and a crane visible in the photo — implies a subtle hover/bob + rotor-spin loop; (4) H1 left-aligned, 447px column; (5) supporting paragraph below. Two CTAs ("Book a demo" solid pill, "Explore our content" ghost pill). A persistent fixed AI search bar (600×54px) with live typewriter placeholder anchors the hero's bottom, independent of hero scroll — the same DOM node later collapses into a corner FAB on scroll-away.

---

## 1.4/1.5/1.6 — Animations, Micro-interactions, Component Behaviors

See full technique specs in the "steal-worthy techniques" list below — the richest confirmed source is the bespoke AI ask-bar/FAB component (genie-morph open/close, rotating conic-gradient ring, steps(2) terminal caret, skeleton shimmer, 3-dot bounce), plus a hairline timer-fill auto-advancing tab system, an off-canvas transform-wipe CTA hover, a synced dual-panel carousel driven by a hairline text list, and a scroll-direction-driven fixed-nav hide/reveal.

Elsewhere, motion is short and restrained: 0.25–0.3s color/opacity/transform transitions, standard eases, no spring/bounce/overshoot anywhere in the sampled CSS.

---

## 1.8 — Technical Stack

Webflow-published. GSAP 3.15.0 + ScrollTrigger + SplitText (scroll-triggered per-line/word heading reveals implied). Wistia for hero-adjacent product video + 3 tab-panel videos. Swiper.js for 3 carousels. Ketch for cookie consent. A fully bespoke in-house "AI ask bar" widget (not a third-party chat widget) with its own CSS custom-property system.

---

## 1.9 — Motion Philosophy + Copy Voice

**Motion:** Confident, functional-with-one-showpiece. The vast majority of the page uses short, restrained, purely functional transitions; the one place the site invests heavily in "wow" motion is the bespoke AI widget — clearly meant to signal "this part of the UI is alive/intelligent" in contrast to the calm, static rest of the page. The auto-advancing tabs and synced carousels contribute a slower, editorial "let it play out" rhythm. Net effect: authoritative, engineered, quietly high-tech — motion proves competence rather than decorating.

**Copy voice:** Short, confident, declarative, benefit-first. Headlines are noun phrases or clipped statements ("Visual AI and robotics across all your sites"; "Don't get left behind."). Section labels: one word + one benefit sentence ("Progress / Deliver on time with accurate earthworks analysis..."). Heavy reliance on named, titled customer quotes over adjective-heavy self-description.

---

## Steal-Worthy Techniques

1. **Anchor-Point Genie Morph** — a 56px circular trigger fixed at one corner morphs into a full panel via a single shared `transform-origin` at that corner; wrapper + content panel both `animation: 0.45s cubic-bezier(0.4,0,0.2,1)`, content panel keyframes `scale(0.2)`→`scale(1)` anchored to the same corner. Pure transform/geometry — zero color/blur dependency.
2. **Rotating-Angle Custom-Property Ring** — a CSS custom property (`--hs-bar-angle`) animated 0deg→360deg feeds a `conic-gradient(from var(--hs-bar-angle), …)` used as a pseudo-element border — one animated custom property, not a rotated DOM node or animated `background-position`.
3. **Steps(2) Terminal Caret + Rotating Placeholder** — `animation: 1s steps(2) infinite` gives a hard on/off blink (not eased) paired with a JS-swapped ghost-text span cycling example queries. Zero library dependency.
4. **Hairline Timer-Fill Auto-Tabs** — a 1px track + 1px fill div per tab row, fill width driven 0→100% over the tab's dwell period; on completion, active index increments and the paired content pane hard-swaps.
5. **Off-Canvas Transform Wipe (button hover)** — an oversized color block parked at `transform: translate(-102%)` with `transition: transform 0.3s`, driven to `translate(0)` on hover, clipped by the button's own overflow — a directional ink-fill wipe, not a background-color fade.
6. **Synced Dual-Panel Carousel with External Hairline Nav** — a vertical list of hairline-divided text rows drives two separate carousels in lockstep (a larger content panel + a smaller matched card).
7. **Scroll-Direction Fixed-Nav Hide/Reveal** — `position:fixed` nav kept off-screen (`translate(0%,-120%); opacity:0`) by default, toggled by scroll-direction (not a fixed Y threshold).
8. **Full-Bleed Hard Section Banding** — consecutive full-width sections alternate solid background colors with NO gradient/blend at the boundary — a pure layout/color-blocking mechanism.
