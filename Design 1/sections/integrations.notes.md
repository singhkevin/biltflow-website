# INTEGRATIONS — notes

**Idea.** Turn the static logo grid into a riser diagram: twelve systems wired down two buses
into one record card, so the connection is drawn rather than asserted.

**What moves.** Two things, never at once. On entry the twelve hairline routes draw once in a
55ms stagger, then rest permanently — establishing that the lines are wiring, not decoration.
On hover or tab, one route redraws in Safety Orange from that card to the record, the card's
port fills, an arrival square lands on the record edge, and the record swaps to that system's
contents. Everything else stays still. Off-screen the section is inert; under
`prefers-reduced-motion` only the state swap remains. Vanilla JS, ~2.4KB, keyboard-operable.

**In 3 seconds.** You keep your systems. They feed one record. Nothing is taken away.

**Verify before shipping.**

- The **record-type lists** ("RFIs, transmittals, drawing revisions") describe what each tool
  typically holds — plausible, not sourced. Check the wording, especially Excel's "the one
  file nobody replaces" and Outlook's "approvals buried in threads": jokes at the reader's
  expense that may land badly.
- `[ Connector scope to confirm ]` is the honesty placeholder. It stays until scope is real.
- Three logos are **parent brands, not products** — Oracle (Aconex), Viewpoint (Jobpac), RIB
  (CostX) — so those cards show mark plus product name. Confirm the lockups.
- Bluebeam and Payapps are cropped to drop parent-company straplines; sources untouched.
- Column headings and the nominative-use footnote are mine; legal should read them.
