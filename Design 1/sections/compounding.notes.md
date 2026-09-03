# Compounding advantage — section notes

**The idea in one sentence.** Draw the four projects as a *section through the ground* — one
fixed excavation depth per project, in which real knowledge from completed buildings displaces
the generic industry baseline, so Project 04 visibly stands on something Project 01 did not have.

**What moves and why.** The strata deposit once, left to right, column by column — each band
revealed downward by a `clip-path` wipe (340ms, `cubic-bezier(.4,0,.2,1)`, 90ms stagger, ~1.2s
total), with the orange knowledge-depth rule stepping down last in each column. It is the
argument performed: the base gets deeper as buildings complete. It runs once on
`IntersectionObserver` entry, disconnects, and rests; a 2.2s failsafe guarantees the drawing is
never left half-built. `prefers-reduced-motion` and no-JS both render the finished drawing with
no transitions. The only other state is hover: hovering a column dims the others (opacity and
colour, 120ms linear, no transform). ~1 KB of JS, no library.

**What a viewer learns in 3 seconds.** The orange rule descends like a staircase from 01 to 04.
Left column: hatch, nothing. Right column: four solid named layers. Same depth drawn, opposite
composition. Project 04 starts from a richer base.

**Fixes to the previous version.** The empty white boxes are gone — the header is now just the
grid ref, the caption and the prior-building list, and the strata own the frame. Layer names
moved to a left legend gutter so the four channels align as readable rows across all columns.

## To verify before shipping
1. **The unlock order is an invented editorial call.** Layers available: 01 none, 02 = L1, 03 =
   L1–L2, 04 = L1–L4. It follows the approved captions (04 mentions defect patterns from three
   buildings), but the 03 → 04 jump of two layers is my reading, not stated copy. Confirm with Raj.
2. `FROM 01`, `FROM 01–02`, `FROM 01–03` are counts of the projects drawn on screen — not
   performance claims. No rates, durations or metrics are shown anywhere. Keep it that way.
3. Section number `08` assumes the running order in the brief.
