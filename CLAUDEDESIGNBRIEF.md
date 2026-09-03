# Claude Design brief — Biltflow homepage (v3)

Paste everything below the line into Claude Design.

---

## Build this

A **design canvas** for **BILTFLOW** — the AI-native operating system for high-density
residential development and construction. Deliver:

1. `main.dc.html` — homepage. **Static mockups, not a clickable prototype.** One long
   scrolling artboard, root fixed **1440px** wide, `expand: "fill"`, height ~12000px.
2. `persona.dc.html` — one persona page ("For Commercial & Procurement"), 1440 × ~5200px,
   proving the pattern the other five will follow.
3. No mobile artboards. Artboards share no runtime state, so a mobile frame is a full
   duplicate, not a responsive variant. Do check the desktop page at phone width and fix
   what breaks.

**The aesthetic is settled below. Do not produce direction artboards. Do not ask which
direction to take.**

## Reader

Australian builder-developers who develop, build, own and operate high-density residential.
**45–60, non-technical, on site.** They run 9–11 disconnected systems. They arrive from a
LinkedIn message or a referral, never from search. They do not read — they look. The client's
instruction: a visitor must understand this in **three seconds**.

## Three hard constraints

Biltflow today has **no customers, no product screenshots, and no verified metrics.** The
client's own locked script says **"NEVER FAKE PRODUCT CAPABILITY."** So:

- **No customer logo wall.** Zero confirmed clients.
- **No invented dashboard screenshots.** If it isn't real, draw it as a diagram, never as a
  fake screen.
- **No performance numbers.** No "40% faster", no stat counters.

Every competitor in this space leans on all three. Biltflow can't. That constraint is the
brief: **the lifecycle ring has to carry the page.**

## Visual system

Concept: **drawing-set precision** — a construction document set, not SaaS. Hairline rules,
grid references, dimension ticks, monospace annotation. The client's own art direction, verbatim:

> Before Biltflow: grain, noise, phones, paper, fragmentation, chaos.
> After Biltflow: **precision, space, clarity, controlled movement, connected information.**

**Ground: light.** `#F9FAFB`. This is a deliberate call — every competitor is dark-navy or
blue (Fiable `#1A67FF`, BidLevel `#1F5EFF`, EliseAI purple `#7638FA` on `#0F042D`), and
glow-on-dark with neon accents is precisely the grammar that reads as AI-generated. Light
ground makes Biltflow look like a drawing set, not another AI product. **Black is used once**,
for the cut-to-black reveal beat the script mandates — a dramatic device, not the palette.

- ground `#F9FAFB` · cards `#FFFFFF` · borders `#C9D0D7` · hairline `#9AA4AD`
- text `#12161B` primary · `#59636E` secondary · `#3D4650` emphatic
- **Safety Orange `#FF5500`** — the only accent. Large type, rules and marks ONLY (3.2:1).
  Orange text under 24px uses `#C43D00` (4.9:1).
- data blue `#0E6FC2` — data relationships inside diagrams only. Never a button, never chrome.
- true black `#000000` for the single reveal band.

**Type — two Google families:**
- **Archivo** — display and UI. Hero 76px/500, tracking `-0.035em`. Section heads 44px/500.
  Body 17px/400.
- **IBM Plex Mono** — stage names, labels, figures, annotations. 12px/500, tracking `0.16em`,
  uppercase.
- Close-metric fallbacks on both. (Do not use Inter or Roboto.)

**Non-negotiable:** sharp corners, `border-radius: 0` everywhere. No gradients, no glass, no
glow, no shadows beyond a 1px hairline. Nothing bounces — no spring easing anywhere. Icons are
inline stroke SVG on a 24px grid, never emoji. Photography plated in a bordered frame, never
full-bleed, never the brightest thing on screen.

**Logo — real vector assets, supplied.** `assets/biltflow-logo-black.svg` (pure black) and
`assets/biltflow-logo-charcoal.svg` (linear gradient `#555D64` → `#292C2E`). Native size
114 × 30. Embed the SVG; do not redraw it, do not retype the wordmark as live text.

- **The wordmark is lowercase: `biltflow`.** A rounded geometric sans with soft terminals.
  The locked script and the storyboard set `BILTFLOW` in caps — that is a display treatment
  inside the film, not the wordmark. Follow the logo file.
- The mark is a stacked double-chevron in an implied hex outline — reads as layered floors.
  Use it alone as the favicon and as a small repeating motif; never redraw or restyle it.
- Header and footer use the black version. On the one black band, use the black SVG with its
  fill flipped to `#F9FAFB` — never the gradient version, which muddies on dark.
- The logo is the softest thing on the page, and that is fine: it sits against a precise
  drawing-set system by design. Do not round anything else to match it.

## Page structure

Competitors converge on a standard 11-slot running order. Keep the order, change what fills it.

**1 — Hero.** Light. Logo top-left at native scale. H1, approved copy from the script:

> **The tools changed.**
> **The way construction operates didn't.**

Sub: *The AI-native operating system for high-density residential development and construction.*
One CTA: **Book a demo**. Not two, not three.
Beside the copy: **the lifecycle ring** (see Motion). Headline is static — no rotating word.

**2 — The noise.** Full-bleed **black**. Heading: *More software. More data. More complexity.*
Scatter the twelve real systems the script names — Aconex, Procore, Jobpac, ProcurePro,
Payapps, Buildsoft, Bluebeam, CostX, Excel, Outlook, Teams, WhatsApp — overlapping with
notification chips over them: `RFI 127 — OVERDUE`, `VARIATION — APPROVAL REQUIRED`,
`PROGRAM UPDATE`, `EMAIL — 38 UNREAD`, `WHATSAPP — 17 MESSAGES`.

> **The script's instruction, verbatim: "Do NOT arrange the logos beautifully. This is not an
> integration diagram. It is fragmentation."** Overlap them. Let them collide. Uncomfortable
> is correct.

Ends on large type: **LESS CLARITY.** Then the band ends abruptly — hard cut, no transition.

**3 — The ring.** Back to light. The centrepiece and the page's spine. The **13 stages, exact
labels from the locked script**:

`SITE SOURCING · FEASIBILITY · APPROVALS · DESIGN · ESTIMATING · PROCUREMENT · COMMERCIAL ·
CONSTRUCTION · COMPLIANCE · HANDOVER · DEFECTS · MAINTENANCE · LEARNING`

— drawn as a **closed ring**, LEARNING returning into SITE SOURCING. Hairline stroke,
dimension ticks at each stage, mono labels, grid-reference numbers `01`–`13`.

**This is the whole strategic move.** Not one of the six reference sites draws a closed loop.
Procore claims "preconstruction to closeout" in a subhead and never draws it — the category
leader has left the lifecycle diagram on the table. Take it.

Below the ring, each stage gets one plain-English line: what enters, what artefact leaves, who
signs. Data objects and accountability — never UI chrome.

**4 — Start anywhere.** Approved screen copy: **START ANYWHERE. CONNECT EVERYTHING.**
Show the ring with one stage lit (PROCUREMENT), then two, then all. Copy from the script:
*"You don't have to start with everything. Start with one module. Add more when you're ready."*

**5 — Works with your existing stack.** The same logos from section 2 — now ordered, aligned,
connected on a clean grid. The visual rhyme is the argument: chaos, then the same set at rest.
Approved line: **BILTFLOW WORKS WITH YOUR EXISTING STACK.**
Sub: *Connect first. Replace on your timeline, not ours.*
**Never draw competitors as inferior or broken** — an explicit rule in the client's script.

**6 — Built on real construction.** The credibility section, built without a single customer.
The document chain from script screen 15, as a connected sequence:
`ARCHITECTURAL DRAWING → STRUCTURAL DRAWING → COST PLAN → BOQ → CONTRACT → PROGRAMME →
PROCUREMENT PACKAGE → SITE PROGRESS → COMPLIANCE`
Then, large: **$5B+** / `REAL HIGH-DENSITY RESIDENTIAL CONSTRUCTION PROJECT DATA`.
(Use $5B+ — it is the figure in the locked script. Not $4.5B, not $9B.)

**7 — EVE.** The orchestration layer. **Do NOT draw a humanoid AI character** — script rule.
EVE is a subtle waveform and an indicator inside the interface, not a mascot, not Marvel.
Show the real control from the script: a slider reading `COPILOT ●━━━━ AUTOPILOT`.
Around her, specialist agents as plain enterprise UI rows, not characters.

**8 — The compounding advantage.** `PROJECT 01 → 02 → 03 → 04`, each one thickening a
knowledge layer beneath. Approved line: *Every building creates knowledge. Biltflow remembers
it.* Avoid a generic exponential curve — the script says so explicitly.

**9 — Who it's for.** Six roles, named in the script's human close: Site Manager, Project
Manager, Contracts Manager, Design Manager, Developer, Construction Director. Mono role
titles, one line each. Links to persona pages.

**10 — Proof slot.** Two devices, both honest:
- **Unattributed practitioner quotes**, labelled truthfully: *"What we hear on Class 2 jobs."*
  Proof by recognition, not endorsement.
- **Bracketed empty slots** with hairline borders and mono labels:
  `[ CLIENT LOGO — pending Coronation sign-off ]` · `[ TESTIMONIAL — pending ]`.
  Designed as deliberate placeholders, not mistakes — they show Raj exactly what he owes.

**11 — Close.** The script's final lockup, used as-is:

> `biltflow` *(the logo mark + wordmark, not typeset text)*
> THE AI-NATIVE OPERATING SYSTEM FOR
> HIGH-DENSITY RESIDENTIAL DEVELOPMENT + CONSTRUCTION
> **BUILD. LEARN. IMPROVE. REPEAT.**

One CTA: **Book a demo**. No pricing, no trial — both are undecided and sales-gated.
Footer: `biltflow.com` · `Australia · New Zealand · GCC · United States` · Hunt Global Pte Ltd.
Bottom corner, very subtle: `POWERED BY EVE`.

## Motion

The client's most repeated criticism of all six reference sites is **static screens**. Fiable —
the benchmark they named — has zero videos, zero canvas, zero animation on the whole page.
Move these, and nothing else:

- **Hero ring**: draws itself once, stroke-dash reveal, 1.4s, `cubic-bezier(.4,0,.2,1)`. Then a
  single illuminated segment travels the circumference continuously, ~10s per revolution,
  **linear**, mask over a duplicated stroke.
- **Noise band**: system windows accumulate and overlap on scroll, accelerating. Once. Never loops.
- **Ring section**: scroll-pinned; the active marker advances as the reader moves through stages.
- **The return arc**: the one showy moment — a pulse travelling from DEFECTS back to
  SITE SOURCING, 7s cycle, offset behind the main revolution. This is the argument, animated.
- **Static, always**: body copy, cards, quotes, numbers, integration logos. Buttons get a
  120ms colour change and nothing more.
- `prefers-reduced-motion` freezes the ring composed and collapses durations to 0.01s.

## Avoid

- **Glow-on-dark with neon accents.** That grammar — not blue specifically — is what reads as
  AI slop. A green or orange version trips the same alarm.
- **"AI" in the H1 or in every section heading.** EliseAI says AI in five headings. Quarantine
  it: the sub-line and the EVE section, nowhere else. Show it working; never announce it.
- **The fade-up-40px scroll reveal on every wrapper** — the single most template-looking thing
  on any of these pages.
- Gradient heroes, rounded glassy cards, three-column icon grids with soft shadows.
- Fake dashboard screenshots. Unsourced numbers. Padded logo walls. More than 11 bands.

## Technical

- Keep `<script src="./support.js"></script>` in the head exactly as-is.
- Static artboards: omit `<script data-dc-script>` entirely.
- `canvas.json`: only `artboards`, `annotations`, `pages`, `launch`. Launch focused on
  `main.dc.html`. ≥80px between frames in a row, ≥120px between rows.
- Google Fonts `<link>` inside `<helmet>`; define `a` / `a:hover` colours there too.
- Sibling groups: flex/grid + `gap`, never margins. Grids as `repeat(N, minmax(0, 1fr))`.
- Copy as literal text in markup, not props — the client retypes it in place.
- Inline `style="..."` for anything they should be able to restyle.

## Annotate these on the canvas

1. Logo casing: the supplied vector is lowercase `biltflow`; the film sets it in caps.
   This design follows the vector. Confirm which is the actual brand wordmark.
2. The locked script uses **"AI-native"** and **"for construction"** — both of which Raj argued
   against on the 26 Aug call. This design uses the script's wording. Raj to confirm.
3. **Coronation Property** as named client appears in the reference pack but was never confirmed
   on any recorded call. Slot designed, left empty.
4. **$5B+** is the script's figure. Raj said $4.5B and $9B on the call. Script wins; verify.
5. Palette is **light** — Raj's investor storyboard is dark with blue. Deliberate divergence,
   reasoned above. Overrule if he objects.
