# biltflow-website

Design and front-end work for the **Biltflow** marketing site — an operating system for
high-density residential development and construction (Hunt Global Pte Ltd).

> **Private.** Contains client strategy, an unconfirmed named client reference, and
> third-party vendor trademarks. Not for public distribution.

## Layout

| path | what it is |
|---|---|
| `CLAUDEDESIGNBRIEF.md` | The brief the design was built from — positioning, copy, palette, motion spec, and the open questions annotated on the canvas. |
| `Design 1/extracted/` | The Claude Design canvas export. `main.dc.html` (v1), `v2.dc.html` (current), `persona.dc.html`, `canvas.json`. `busy.dc.html` is v1 before the ornament cull, kept for comparison. |
| `Design 1/*.css` | `widescreen.css` (fluid root + elastic gutters), `quiet.css` (ornament cull). |
| `Design 1/*.js` | `motion.js` (pauses looping animation off-screen), `stages.js` (drives the 13-stage ring ↔ list link), `logos.js` (vendor logo swap with wordmark fallback). |
| `Design 1/logos/` | Vendor logo assets. **See the caveats below before shipping any of these.** |
| `Design 1/sections/` | Redesigns of five weak sections. |
| `ring/` | The antigravity.google background teardown, plus `cursor-field.js` — a 6 KB dependency-free replacement measured at 0.23 ms/frame that sleeps when idle. `NOTES.md` has the full teardown. |
| `assets/` | Biltflow logo, black and charcoal-gradient. Wordmark is lowercase `biltflow`. |

## Running it

```bash
cd "Design 1/extracted" && python3 -m http.server 8792
```

Then open `http://localhost:8792/v2.dc.html`.

The `.dc.html` files are a working copy of a Claude Design canvas. Changes here do **not**
flow back — to make them permanent, apply them in Claude Design and re-seed.

## Logo caveats

Only five of twelve vendor logos are usable as fetched:

- **Usable:** Procore, ProcurePro, Bluebeam, Buildsoft, Payapps (Payapps has "An Autodesk
  Company" baked into the artwork).
- **Wrong brand:** `aconex.svg` is the Oracle corporate wordmark — no standalone Aconex mark
  exists any more. `jobpac.png` is the Viewpoint lockup. `costx.svg` is the RIB Software
  logo, and is a raster inside an SVG wrapper.
- **Restricted:** Microsoft (Excel, Outlook, Teams) — product icons require an express
  licence; only wordmarks are permitted for nominative use. Oracle requires written
  authorisation. Meta/WhatsApp forbids recolouring, combining with other marks, and
  implying partnership.

## Unverified claims flagged on the canvas

- `$5B+` — from the locked film script. Raj said $4.5B and $9B on the 26 Aug call.
- `12 CONNECTIONS` — those twelve names come from screen 07 of the script, where they are
  the *overload*, not confirmed integrations.
- Coronation Property as anchor client — asserted in the reference pack, never confirmed
  on any recorded call.
- There are **zero** confirmed customers, no product screenshots, and no verified metrics.
