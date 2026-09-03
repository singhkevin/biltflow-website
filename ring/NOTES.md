# antigravity.google background — how it actually works

Source: `MainParticlesComponent.astro_...Dox42TL8.js` (20 KB) + `Mouse.ZrlRGzn3.js` (548 KB,
Three.js bundled). Astro site, WebGL2 canvas, absolutely positioned full-viewport.

## Architecture

A **GPGPU particle system**. Positions live in a texture, not in JS.

- Rest positions seeded by **Poisson-disc sampling** on a 500×500 field, recentred and
  normalised to [-1, 1]. Density maps 0–300 → min distance 10–2.
- Two 256×256 `FloatType` render targets (65,536 slots) **ping-ponged** each frame.
- Sim pass writes `vec4(x, y, scale, velocity)`; render pass reads it in the vertex shader
  and draws `THREE.Points`.

## The follow behaviour — three separate dampings

This is why it feels expensive rather than twitchy.

1. **Spatial damping.** The cursor's raycast hit is multiplied by **0.175**. The ring never
   travels more than a fraction of the viewport, no matter where you put the pointer.
2. **Temporal damping.** `ring += (cursor - ring) * 0.02` per frame — a ~0.8 s time constant
   at 60 fps. It *arrives* rather than tracks. When the pointer leaves, the factor halves
   to 0.01.
3. **Idle life.** With no pointer, the target is 1-D value noise on two channels
   (`0.2` and `0.1` amplitude, different seeds/rates). It is never static.

Plus a **breathing radius**: `0.175 + sin(t)·0.03 + cos(3t)·0.02` — two frequencies, so the
ring never repeats visibly.

## The sim shader

Distance from each particle's **home** to the ring centre drives three smoothstep bands:

    t  = band at uRingWidth  (0.05)   -> pow(t, 2)
    t2 = band at uRingWidth2 (0.015)  -> pow(t2, 3)   sharp inner edge
    t3 = everything inside the ring

They are summed with weights (`t += t2*3`, `t += t3*0.4`) plus high-frequency noise inside the
ring, plus a broad noise floor so the field is never completely dead.

Displacement pushes **away from the ring centre**, weighted by the sharp band only:

    pos -= (uRingPos - (home + disp)) * pow(t2, 0.75) * uRingDisplacement

and `pos *= 0.8` every frame, so particles spring home. `disp` is layered noise (mid-scale
×0.03, fine ×0.005) plus two sine waves scaled by distance — that is the drifting texture you
see away from the ring.

`scale` eases toward the band value at 0.2/frame. **Alpha is `smoothstep(0.1, 0.2, scale)`** —
so every particle exists all the time and the ring simply *reveals* them. That is the trick.

## The render shader

- `gl_PointSize = scale * 7 * pixelRatio * 0.5 * particleScale` — size follows the same band.
- Each point is an **`sdRoundBox`**, not a circle: a rounded dash.
- It is **rotated to face the ring centre**: `atan(localPos - ringPos)` plus noise, which is
  why the ring reads as radiating strokes rather than dots.
- Colour is a **three-stop gradient driven by noise, not position** (mix at h = 0.8), then
  multiplied by velocity in light mode.

Palettes shipped: dark `#7189ff / #3074f9 / #000000` · light `#2c64ed / #f84242 / #ffcf03`.

## For Biltflow

The mechanic is a good fit for the lifecycle ring — it is literally a ring, it rewards a
slow cursor, and it needs no product imagery. But note the cost: Three.js is ~550 KB and
this runs a fullscreen GPGPU pass every frame. If it goes on the homepage hero, it should be
lazy-loaded below the fold trigger, capped at `pixelRatio` 2, paused when off-screen, and
disabled under `prefers-reduced-motion`.

The `biltflow` palette button in the demo swaps to `#FF5500 / #C43D00 / #12161B` on the
light ground to show how it reads in the brand.

---

# The lite version — `cursor-field.js`

Built after the teardown, because the real thing is too heavy for a marketing hero.
**No dependencies. 6 KB unminified (~2 KB gzipped). One 2D canvas.**

## Measured on this machine

1440 × 900 viewport, DPR 2 (2880 × 1800 backing store), 2,052 dots:

| | |
|---|---|
| cursor on screen (worst case) | **0.233 ms/frame** |
| cursor away | 0.181 ms/frame |
| share of the 60 fps budget | **1.4 %** |
| idle | **0 ms — the loop stops** |

For comparison, the antigravity original ships ~550 KB of Three.js and runs a fullscreen
GPGPU pass every frame, forever.

## How it sleeps

This is where the savings actually come from. The RAF loop halts when:

- the eased cursor has settled (< 0.35 px/frame) **and** nothing has moved for `idleMs` (1.2 s)
- the tab is hidden (`visibilitychange`)
- the canvas scrolls off screen (`IntersectionObserver`)
- the visitor has `prefers-reduced-motion: reduce` — it never starts

Any pointer movement wakes it. On a static page with the cursor parked, this costs literally
nothing.

## What it draws

A grid of dots at `step` px. Distance from the eased cursor drives a smoothstep band peaking
at 42 % of the influence radius, which:

- pushes the dot outward along the radius (`push`, max 26 px)
- grows it (`dot` 1.6 → `+grow` 3.4)
- blends its colour from `rest` to `hot`
- past `t > 0.25`, swaps the circle for a **rounded dash rotated to face the cursor** — the one
  detail worth keeping from the original, and what stops it reading as a generic dot grid

Rows entirely outside the influence radius take a cheap early-out path.

## Using it

    <canvas id="field" style="position:fixed;inset:0;width:100%;height:100%"></canvas>
    <script src="cursor-field.js"></script>
    <script>
      new CursorField(document.getElementById('field'), {
        step: 26, radius: 190, ease: 0.12, push: 26,
        rest: '#C9D0D7', hot: '#FF5500'
      });
    </script>

Methods: `draw()` force a repaint · `jump(x, y)` place without animating ·
`setCursor(x, y)` animate to a point · `isRunning()` · `destroy()`.

Put the canvas behind the hero content with a lower `z-index` and `pointer-events: none` on
the copy that sits over it.
