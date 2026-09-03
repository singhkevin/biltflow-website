# repurpose — Objection Register

**The idea.** The proof slot becomes an RFI register: the five objections that kill deals in
this market, as numbered rows with a status stamp — two of them stamped **OPEN**, because
pricing and implementation time have no honest answer yet.

**Why this form.** An RFI register is a document this reader signs every week. Open items in it
are normal; a register with everything closed is the suspicious one. So "we can't answer that"
stops reading as weakness and reads as document convention — the only way to run an objection
section with zero customers.

**What moves.** One accordion, one row open at a time. Height opens via `grid-template-rows:
0fr→1fr` (no JS measurement) while an orange revision bar wipes down the margin — one
coordinated 260ms `cubic-bezier(.4,0,.2,1)` gesture. Transitions are opt-in: an
IntersectionObserver adds `.is-live` only on screen, and `prefers-reduced-motion` skips it, so
off-screen changes are instant. Nothing loops. ~1.1 KB of JS.

**Three seconds.** Five hard questions in the buyer's own words, three answered, two marked
open — and at the foot, *"No customer references appear on this page. Biltflow has none yet."*

**Verify — the answers are invented positioning, not policy:**
- RFI-02's design rule (site roles shouldn't need to open Biltflow).
- RFI-03's data commitments: ownership, export, no pooling into competitor pricing. The
  bracketed **Data & IP schedule** assumes counsel is drafting one.
- RFI-04's admission that no full lifecycle has run on a live job.
- Both practitioner quotes carried over unchanged.
