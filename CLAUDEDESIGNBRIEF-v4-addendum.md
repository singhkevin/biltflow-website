# Claude Design brief — Biltflow homepage v4 addendum

Paste this alongside `CLAUDEDESIGNBRIEF.md` (v3, still authoritative for everything not called out
below) into Claude Design to re-seed the existing canvas (`Design 1/extracted/v3.dc.html`). This is
not a new direction — it is three layered updates on top of the locked v3 system: **updated copy**,
a **borrowed technique layer** (sourced from three reference-site forensic audits, mechanism-only —
never their colors), and a **new hyperrealistic photo/video layer** (Higgsfield-generated, per the
loosened photography rule — see `CLAUDEDESIGNBRIEF.md` annotation 6).

---

## 1. Role + Aesthetic Identity

**Role:** Act as the Senior Creative Technologist continuing the Biltflow canvas in Claude Design.
You (or a predecessor session) built v3. This is v4 — an update pass, not a rebuild.

**Aesthetic identity:** *Drawing-set precision, grounded in the real build.*

---

## 2. What's still locked (do not touch)

Everything in `CLAUDEDESIGNBRIEF.md`'s "Visual system" section stands: ground `#F9FAFB` / cards
`#FFFFFF` / borders `#C9D0D7` / hairline `#9AA4AD` / text `#12161B` primary, `#59636E` secondary,
`#3D4650` emphatic / Safety Orange `#FF5500` as the only accent, large type/rules/marks only / data
blue `#0E6FC2` for diagram data-relationships only, never a button / true black `#000000` for the
single reveal band / Archivo (display/UI) + IBM Plex Mono (labels, data, annotations) / sharp corners
everywhere, `border-radius:0` / no gradients, no glass, no glow / nothing bounces, no spring easing /
inline stroke SVG icons on a 24px grid / the supplied logo SVGs, embedded not redrawn.

The 13-stage ring, the "no fake screenshots" rule, the "no customer logo wall" rule, and the "no
performance numbers/stat counters" rule are all unchanged and absolute.

---

## 3. What's changed since v3

### 3a — Copy

Apply `COPY-REWRITE.md` section by section. Where it offers options, use its own **recommended**
option as the default and carry the open question forward as an annotation (do not silently pick for
Raj on the two items that are explicitly his call):

- Hero subheadline → **Option A**: *"One record for the whole build — site sourcing to defects — so
  the variation, the RFI and the programme finally agree."* (Flag: still uses neither "AI-native" nor
  "for construction," which resolves annotation 2 below rather than leaving it open — note this to
  Raj explicitly rather than assuming it settles the question.)
- Stat line (noise section) → `TWELVE SYSTEMS. NOT ONE OF THEM AGREES.`
- Ring section label → `THIRTEEN STAGES. ONE RECORD.`; sub → *"Site sourcing to defects, and back
  again. Every record connected to the one before it — and the one after."*
- Modules captions → tightened per the copy doc's table (Procurement alone / Add Commercial / All
  thirteen).
- Integrations kicker → `YOUR EXISTING STACK`; "how to read this" line and panel line → rewritten per
  copy doc.
- Provenance/EVE heading → **split into two headings** (see §4.6 below — this requires a structural
  change, not just a text swap).
- Compounding sub → *"Your fourth building is estimated on what your first three actually cost — not
  on the industry average."*
- Roles heading → *"Six roles. Each one sees the stages it signs for."*
- Repurpose (objection register) heading → *"Five questions we get asked. Three we can answer. Two we
  can't yet."*; intro tightened per copy doc.
- CTA wording: keep **"Book a demo"** everywhere (copy doc's own recommendation — Option A). The copy
  doc's Option B/C are flagged as a positioning test for later, not a build change now.
- Title/meta: apply verbatim from the copy doc's "Meta content" section.

### 3b — Photography loosened

See `CLAUDEDESIGNBRIEF.md` annotation 6. Hyperrealistic, Higgsfield-generated real-world photo/video
may now run full-bleed in five sections: Hero, Built on real construction, The compounding advantage,
Who it's for, and the Close. Everywhere else, the original bordered-frame-only discipline holds.
Product UI stays diagram-only, unchanged, everywhere.

**Photographic style anchor (added this revision):** Kevin flagged Procore's own main homepage
(`full_page_screenshot_to_pdf.pdf` — not the AI subpage audited in §3c) as the reference for tone:
warm, confident, well-lit editorial photography of real people in role — not gritty, moody, or
overly cinematic documentary photography. Genuine expressions, natural daylight leaning warm rather
than dramatic golden-hour, close-crop portrait treatment for people. This updates the tone of every
Higgsfield prompt in §4 below (shifted warmer from an earlier moodier draft) — the mechanism and
scope (which 5 sections, full-bleed vs. framed) are unchanged.

**Explicitly NOT adopted from that reference:** its customer logo wall and its real in-product
screenshots. Kevin's call, direct: pull the photography/warmth only. Everything else on that page —
logo wall, screenshots, the "3 million+ projects" claim — conflicts with the locked "zero customers,
zero product screenshots, zero performance numbers" constraint and stays out.

### 3c — Borrowed technique layer

Three reference sites were forensically audited for UI/motion mechanism only (full detail in
`plans/01-site-dna-*.md`): **DroneDeploy** (construction reality-capture SaaS), **Procore AI** (the
category leader's own AI product page — most relevant to the EVE section), and **Coronation
Property** (an Australian property developer's site — audited *only* for tone/polish that would land
with Biltflow's exact reader; per annotation 3, Coronation is the unconfirmed anchor client, not a
competitor, so **none of its brand colors, logo, or content are used** — mechanism only).

Every technique below is filtered for one property: it must transplant on **mechanism alone** — no
technique that depends on the source site's color, gradient, glow, blur, or rounded corners survives
into this list. Section-by-section application is in §4.

---

## 4. Section-by-section build instructions

The canvas currently has these 10 blocks (confirmed against the live `v3.dc.html`, not just the
original brief): **Hero → The noise → The lifecycle → Start anywhere → Integrations → EVE+Provenance
(currently merged) → Compounding → Roles → Repurpose (objection register + proof slot, currently
merged) → Close.**

### 4.1 — Hero

**Copy:** per §3a.

**New imagery (full-bleed, per 3b):** a hyperrealistic aerial/establishing shot as the hero's base
layer, replacing the current plain light ground for this section only.

**Technique — Layered Depth Compositing** (adapted from DroneDeploy's hero, mechanism only — see
`plans/01-site-dna-dronedeploy.md` §1.3b): DroneDeploy's hero is a real-world photo as the base layer,
with a cutout subject and a Lottie animation as *discrete, separately-positioned layers on top* — not
baked into the photo. Apply the same layering logic here: the hyperrealistic photo/video is layer 0
(full-bleed, behind everything), the existing lifecycle ring sits as an independent SVG/canvas layer
floating above the photo, and the H1/sub/CTA sit in a padded text column above both (Procore's hero
pattern — text never baked into the image, always a separate DOM layer over a full-bleed background).
A flat scrim `<div>` (DroneDeploy's exact mechanism: a plain opacity layer, not a gradient) sits
between the photo and the text/ring layers for legibility — no blur, no vignette, just a flat
near-black fill at whatever opacity keeps text at contrast ratio.

**Ring motion (per Kevin's feedback — no circular animation):** the ring does its one-time 1.4s
stroke-dash reveal (`cubic-bezier(.4,0,.2,1)`) and then sits static — the continuously-travelling
illuminated segment is cut, see `CLAUDEDESIGNBRIEF.md` annotation 7. Nothing about the ring spins or
loops once drawn, including here where it's layered over the new photo/video.

**Example Higgsfield prompt (draft only — not generated yet; warmed per the Procore-homepage tone
anchor in §3b, not moody/cinematic):**
> Aerial drone shot, hyperrealistic, clear warm daylight, high-density residential construction site
> in Australia — mid-rise apartment towers under construction, tower cranes, scaffolding, exposed
> concrete floor plates, workers in hi-vis visible at small scale, confident and optimistic tone
> (not moody or dramatic), documentary-editorial construction photography, subtle slow camera drift,
> natural warm color grade, no text overlay, no logos, 16:9, loopable 8–12s.

### 4.2 — The noise

**No change.** No photography — a hyperrealistic photo would soften the deliberate "uncomfortable,
colliding" instruction. DroneDeploy's own **Full-Bleed Hard Section Banding** (solid-color cuts, no
gradient at section boundaries) validates what this section already does — nothing to add.

### 4.3 — The lifecycle / 4.4 — Start anywhere

**No change.** The ring is "the whole strategic move" per the locked brief — it stays a diagram, and
no borrowed technique or photo should compete with it for attention.

### 4.5 — Integrations ("Your existing stack")

**Copy:** per §3a.

**Technique — Unified Hairline Frame** (Procore, `plans/01-site-dna-procore-ai.md` — Unified Hairline
Frame): arrange the 12 vendor logo tiles as ONE outer hairline-bordered container (`#C9D0D7`, 1px —
or adopt Procore's crisper 0.5px sub-pixel variant sitewide, see §5) with logos sitting edge-to-edge,
sharing hairline dividers on the internal seams only — reads as one bordered panel, not 12 separate
cards with gaps. Radius 0 throughout (stricter than Procore's own near-zero corners). This is exactly
the visual rhyme the copy already argues for: chaos in §2, this same set at rest here.

**Technique — Off-Canvas Orange Wipe** (DroneDeploy — Off-Canvas Transform Wipe): each logo tile gets
a hover state — an oversized Safety Orange `#FF5500` block parked at `transform: translate(-102%)`,
`transition: transform 0.3s`, driven to `translate(0)` on hover, radius 0, clipped by the tile's own
`overflow:hidden`. An ink-fill wipe, not a background-color fade — reads as a marker-pen mark on a
drawing set.

### 4.6 — Built on real construction / EVE

**Structural change:** split the currently-merged `id="eve-provenance"` section back into two
sections, per `COPY-REWRITE.md`'s own reasoning — "two arguments in one heading, and they belong to
two different sections." Provenance heading → *"Built on the documents a building actually
produces."* EVE heading → *"How far EVE goes is your call."*

**Provenance sub-section — new imagery (full-bleed, per 3b):** the document-chain diagram
(`ARCHITECTURAL DRAWING → … → COMPLIANCE`, "Nine document types.") stays a diagram — never a fake
screenshot. Pair it with a large-format hyperrealistic photo of a real high-density residential
build at structural stage, grounding the document chain in physical reality.

**Technique — Constant-Rate Parallax Photo Drift** (Coronation — `plans/01-site-dna-coronation.md`):
the photo sits in a fixed-aspect, `overflow:hidden` crop frame (radius 0 — this technique clips at a
hard edge natively, no softening needed), with `translateY` scrubbed 0%→10% linearly across the
range the image is on-screen. Restrained, non-decorative — matches the brief's own art direction line
("controlled movement").

**$5B+ figure:** keep as a static, large Archivo/Plex Mono figure — no animated counter. This isn't a
new import; it's a confirmation. Procore AI's own **Compressed-Transformation Stat Headline**
technique (see §4.7) validates that pure typography beats an animated counter for a 3-second read —
apply that lesson here by *not* adding motion to this figure, not by adding a new mechanism.

**Example Higgsfield prompt (draft only; warmed per §3b):**
> Hyperrealistic architectural/construction photography, structural stage of a high-density
> residential building — exposed rebar and formwork, poured concrete slab edge, a site engineer
> reviewing drawings on a clipboard in the foreground, confident and engaged expression, natural warm
> daylight, editorial construction-photography style, sharp focus, no branding.

**EVE sub-section:**

**Technique — Group-Hover Cascade Card** (Procore — Group-Hover Cascade Card), adapted: the specialist
agent rows stay "plain enterprise UI rows, not characters" per the locked constraint — use a small
inline stroke icon instead of Procore's photo. One shared hover state fires two coordinated changes:
the icon nudges `scale(1.02)` and the row's Reaching Arrow (see §5) elongates — both keyed off one
`group`/`group-hover` class, 250–500ms, no outer row bounding-box change.

**Technique — Rotating-Angle Ring: CUT** (per Kevin's feedback — no circular animation, sitewide,
this addendum included). This section previously proposed a rotating conic-gradient "processing/live"
scan cue on the copilot/autopilot slider, borrowed from DroneDeploy's AI widget. It's removed and not
replaced — the slider's own position (COPILOT ●━━━━ AUTOPILOT) and the waveform indicator already
communicate state without needing a spinning cue.

**No new imagery here** — per the locked "do NOT draw a humanoid AI character" rule, this sub-section
stays abstract/diagram, unchanged from the loosened-photography carve-out.

### 4.7 — The compounding advantage

**Copy:** per §3a.

**Technique — Compressed-Transformation Stat Headline** (Procore — Compressed-Transformation Stat
Headline): the rewritten sub-line ("Your fourth building is estimated on what your first three
actually cost — not on the industry average") *is* already this format — a before/after relationship
expressed as plain-language typography, not a chart or counter. Set it exactly per Procore's spec:
tiny tracked Plex Mono eyebrow → one large Archivo headline → one sentence of context — with the
data-blue `#0E6FC2` reserved for the joining relationship mark, matching the existing rule that
data-blue only ever marks a relationship inside a diagram.

**New imagery (full-bleed or large-format, per 3b):** a 4-panel filmstrip, Project 01→02→03→04, each
panel one hyperrealistic photo of a distinct real (or honestly-labeled placeholder) high-density
residential project. Use the **Unified Hairline Frame** technique again (§4.5) — one outer
hairline-bordered row, radius 0, four panels edge-to-edge sharing internal hairline dividers, each
panel captioned with its stage number in Plex Mono. Avoids the brief's explicit "avoid a generic
exponential curve" instruction by staying strictly typographic + photographic, never a chart.

**Example Higgsfield prompt (draft only; warmed per §3b):**
> Series of 4 hyperrealistic photographs of distinct Australian high-density residential building
> projects at varying stages (foundation / structure / facade / completed), consistent warm editorial
> photography style and color grade across all four, architectural detail focus, natural warm
> daylight, confident and optimistic tone, no branding or text.

### 4.8 — Who it's for

**Copy:** per §3a.

**New imagery (per 3b) — this is the section closest to the Procore-homepage anchor:** each of the six
named roles (Site Manager, Project Manager, Contracts Manager, Design Manager, Developer,
Construction Director) gets a small hyperrealistic portrait, close-crop headshot style — mirroring
Procore's own "Main Contractors / Owners / Subcontractors" card treatment on their homepage: warm,
confident, genuine expression, well-lit, role-appropriate context (hi-vis + hard hat on-site for
site-facing roles, business-casual/office context for design/development roles) — not gritty or
overly documentary.

**Technique — Focus-Dim Card Hover** (Coronation — Focus-Dim Card Hover), shadow-substituted: hovering
the six-role grid dims siblings to 70% opacity (`.wrapper:hover .card{opacity:.7}`), the hovered role
excepts back to full opacity + a 1% scale lift (`.card:hover{opacity:1;transform:scale(1.01)}`). Since
Biltflow disallows shadow beyond a 1px hairline, substitute Coronation's `box-shadow` lift-cue for a
border-color step (`#C9D0D7` → `#9AA4AD`, or a Safety Orange 1px top rule) on the hovered card.

**Technique — Global Stagger Entrance, scoped** (Coronation — Global Stagger-by-CSS-Variable Entrance
System): apply ONLY here, to this one group of six cards, as they enter view — `opacity:0,
translateY(5vh)` → `opacity:1, translateY(0)`, each card's own inline `--stagger:N` driving a 150ms
cascade off one shared `0.7s cubic-bezier(0.66,0,0.21,0.98)` rule. **Do not** apply this sitewide —
see the caution in §5.

**Example Higgsfield prompts (draft only, one per role; warm headshot-crop per §3b, not moody
documentary):**
> Hyperrealistic close-crop portrait, warm confident genuine expression, [role] on an Australian
> high-density residential construction site — natural warm light, editorial headshot photography
> style, no text overlay. e.g. Site Manager in hi-vis and hard hat holding a tablet, warm smile;
> Project Manager in a site office reviewing drawings; Contracts Manager reviewing a document,
> confident expression; Design Manager at a desk with drawings; Developer walking a site,
> approachable; Construction Director on-site overseeing works, assured. Consistent warm grade across
> all six, matching the Procore-homepage tone anchor.

### 4.9 — Repurpose (objection register + proof slot)

**Copy:** per §3a.

**Technique — Plus-to-Minus Bar Rotation, hard-edged** (Procore — Plus-to-Minus Bar Rotation): for the
RFI-01…RFI-06 accordion triggers, use Procore's exact mechanism (two independently-rotating rects,
keyed off the accordion's own open/closed state, content reveals via `slideDown/slideUp` 0.2s
ease-in-out against an auto-measured height) but set `rx:0` on both rect ends instead of Procore's
rounded pill ends — reads as a technical drafting +/− mark, not a generic SaaS accordion.

**No new imagery.** The bracketed empty client/testimonial slots stay deliberately empty — that is
the point of the section; a photo there would undermine the honesty device.

### 4.10 — Close

**Copy:** per §3a (final lockup unchanged, verbatim per the locked script).

**New imagery (full-bleed, per 3b):** a hyperrealistic exterior photo of a completed high-density
residential building — a narrative bookend to the hero's under-construction opening shot, echoing
"BUILD. LEARN. IMPROVE. REPEAT." Use the same flat-scrim-for-legibility mechanism as the hero (§4.1),
never a gradient or blur.

**Example Higgsfield prompt (draft only; warmed per §3b):**
> Hyperrealistic exterior photograph of a completed high-density residential building, Australian
> urban context, warm late-afternoon light, optimistic and confident tone, clean architectural
> composition, no people, no branding.

---

## 5. New sitewide utilities

- **Reaching Arrow** (Procore) — adopt as the standard micro-interaction for every "Explore/See
  how/Read more"-type text link sitewide. Inline SVG, `d`-path morphs on hover/focus (shaft extends
  ~56%) via `transition: 250ms` on `d` directly — render with harder angles than Procore's own
  slightly-soft rendering (a drafting-tool arrowhead), in Safety Orange, so it reads as a Biltflow mark
  rather than a borrowed one.
- **Sub-pixel hairline** (Procore) — consider upgrading the sitewide 1px hairline spec to 0.5px
  (`border-width:0.5px`) for a crisper retina render. Pure refinement, zero conflict with the locked
  system.

⚠ **Caution — do not apply sitewide:** the Global Stagger entrance system and Coronation's Word-Clip
Roll-Up text reveal are, mechanically, "fade/clip up on scroll" patterns — and the locked brief
explicitly bans exactly that ("the fade-up-40px scroll reveal on every wrapper... the single most
template-looking thing on any of these pages"). Both are scoped to exactly one place each above
(§4.8's role grid for the stagger; nowhere for word-clip — it was considered for the split EVE/
Provenance headings but rejected as unnecessary motion on top of an already-changing structure). Do
not extend either beyond its named scope without a deliberate decision to do so.

---

## 6. Technical requirements

```
TECHNICAL REQUIREMENTS
  Stack:                 Claude Design canvas (.dc.html), same conventions as the existing v3 build.
  New behavior files:    follow the existing pattern of motion.js / stages.js / logos.js — vanilla
                         JS/CSS, no new library dependency introduced by this addendum (GSAP is not
                         currently loaded in this canvas and none of the borrowed techniques above
                         require it — every one is pure CSS transition/animation or a small vanilla
                         JS state toggle, chosen specifically for that reason).
  Hero/Close video:      if a video asset is used, provide a static poster-frame fallback consistent
                         with "static mockups, not a clickable prototype."
  Image embedding:       follow whatever asset convention Design 1/extracted/uploads already uses for
                         this canvas; do not inline large base64 photos directly in .dc.html source if
                         the canvas has an existing upload/asset mechanism.
  Font loading:          unchanged — Archivo + IBM Plex Mono via Google Fonts <link> inside <helmet>.
  Animation lifecycle:   match motion.js's existing pattern (pause when off-screen) for any new
                         continuously-running animation (the hero's looping video/photo drift is
                         now the only one — the ring itself is a one-time reveal, then static, and
                         the EVE processing ring was cut, see §4.6).
```

---

## 7. Open decisions still needing sign-off

Carried forward from `CLAUDEDESIGNBRIEF.md` (unchanged): logo casing, "AI-native"/"for construction"
wording, Coronation as named client, the `$5B+` figure, the light-palette divergence.

New, from this addendum:

1. **Hero subhead** — this addendum defaults to Option A per `COPY-REWRITE.md`'s own recommendation.
   Confirm this also resolves (or doesn't) annotation 2's open question about "AI-native"/"for
   construction," since Option A drops both terms.
2. **EVE/Provenance section split** — this addendum recommends physically splitting the merged
   `id="eve-provenance"` block back into two sections. Confirm before building — it's a structural
   change, not just a copy swap.
3. **Which borrowed techniques actually get built** — §4 lists what fits; it is not an instruction to
   build all of it in one pass. Recommend picking 3–4 highest-leverage items for a first update
   (suggested: Hero layered compositing + new imagery, Integrations hairline frame + orange wipe,
   Compounding stat headline + filmstrip, Who-it's-for focus-dim hover + portraits) rather than
   shipping every item in §4 at once.
4. **Higgsfield generation** — nothing has been generated yet. The prompts in §4 are drafts to refine,
   not final. Generating them will use credits — confirm before kicking off.

---

## 8. Execution directive

*Don't illustrate the build. Photograph it, diagram what can't be photographed honestly, and let the
two never trade places.*
