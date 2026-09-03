# eve-provenance

Merges 06 Provenance (nine static cards) and 07 Orchestration (a flat SVG) into one section.

**Idea.** The nine documents are the input; EVE relates them. EVE goes in the middle, the
nine around it in the order a building produces them, one document's relationships visible on
demand.

**What moves.** Hovering or tabbing a document routes its relationships *through the EVE hub*,
never document-to-document — that routing is the pitch. The source spoke turns Safety Orange,
arrow pointing into EVE; the three related spokes turn data blue, arrows out, each
labelled with the real relationship (BOQ → COST PLAN "PRICED FROM", CONTRACT "SCHEDULED",
PROCUREMENT PACKAGE "SPLIT INTO"). Unrelated documents drop back. The side panel repeats it in
words, for anyone who won't squint at a diagram. Click pins it.

The only sustained motion is the waveform in the EVE plate: flat at rest, resolving while you
ask it something, easing flat when you let go. EVE thinking, not idling. 3.7 KB vanilla JS;
pauses off-screen; dead under `prefers-reduced-motion`. The COPILOT—SUPERVISED—AUTOPILOT
control moves only on click.

**Three seconds.** Nine construction documents, one intelligence in the middle, wired together.

**Invented — verify before publishing.**

1. All 27 relationship labels and the per-document descriptions. Written to sound like a QS,
   but unconfirmed against Biltflow's data model. A QS must read these.
2. "SUPERVISED" as the middle detent, plus the three mode lines. The script gives two ends.
3. The old `$5B+` is deliberately gone — unverified. A bracketed placeholder replaces it.
