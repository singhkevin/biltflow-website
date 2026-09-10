/* hero-gl.js — /v6 hero background: "Section Datum".
 *
 * You are sighting up the lift/stair/riser core of a high-density residential tower.
 * Streams of light enter at different levels, transfer between service lanes as they
 * climb, and top out together at one point. The core is DRAWN, not photographed: the
 * camera has zero rotation and the vanishing point is placed by principal-point offset
 * (setViewOffset), so every world vertical stays plumb on screen and every level run
 * stays level. White hairlines are the drafting; blue is the live layer.
 *
 * Of 106 curves, 86 are mathematically incapable of blooming (their alpha x luminance
 * sits below the 0.55 bloom threshold) and only 16 animate. That is what keeps this a
 * section drawing with work moving through it rather than a neon tunnel.
 *
 * Geometry is generated from a pinned seed by ./gate/datum.js, which is a real build
 * gate: it measures, at six viewports, how much light falls in the type band. Every
 * number below is a property of that seed plus the exact camera triples. Change one and
 * they are all stale — re-run the gate.
 *
 * Nothing here is taken from madarplatform.com: no OBJ asset, no shader source, no
 * colour, no camera behaviour. The one shared idea is the general technique of sweeping
 * a polyline into a tube and running a sine along its uv.x.
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/* ══════════ 0. REFUSE-TO-START GATES ══════════════════════════════════════ */

const reduceMQ = matchMedia('(prefers-reduced-motion: reduce)');
const hoverMQ = matchMedia('(hover: hover)');
const coarse = matchMedia('(pointer: coarse)').matches;
const lowPower = coarse || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;

function tooWeak() {
  if (navigator.connection && navigator.connection.saveData) return 'savedata';
  if ((navigator.deviceMemory || 8) <= 2) return 'memory';
  if ((navigator.hardwareConcurrency || 8) <= 2) return 'cpu';
  // A phone in landscape is ~390px tall. Measured: 2.60% band light, 46 hot samples —
  // there is no composition to have at that height. The still frame is better.
  if (window.innerHeight < 520) return 'short';
  return null;
}

function webglOk() {
  // Feature-test by ATTEMPTING creation. !!window.WebGL2RenderingContext is true even
  // when WebGL is blocklisted. Release the probe or it counts against the ~8-16 live
  // context cap and the real context fails later.
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    return true;
  } catch (e) { return false; }        // Firefox can throw rather than return null
}

/* ══════════ 1. PRNG + CORE ARMATURE ═══════════════════════════════════════
   Ported from the gate harness. Two independent streams: changing the stream
   layout must not shift the static drafting, or the still frame stops matching
   the live scene (the stream rejection pass consumes 0-7 draws per viewport). */

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const SEED = 0x81174F10;
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const HW = 4.5, HH = 3.0, GAP = 3.15, LEVELS = 288, Z0 = 4.0;
// Silhouette events stay PROPORTIONAL to the tower rather than pinned to absolute levels:
// L14 of 32 is 44% up; L14 of 288 would be 5% and the setback would slide off the bottom.
const SB0 = LEVELS * 0.44, SB1 = LEVELS * 0.48, LSC = LEVELS / 32;
const zOf = k => Z0 - k * GAP;                          // L0 z=+4.0 … L31 z=-93.65
const hw = kf => HW * (1.0 - 0.14 * ss(SB0, SB1, kf));   // podium→tower X setback
const leanX = kf => 0.62 * LSC * Math.pow(kf / (LEVELS - 1), 1.25);  // LSC holds the lean RATE
const leanY = kf => -0.34 * LSC * (kf / (LEVELS - 1));

// 6-vertex L-plan: a rectangle with a re-entrant notch at the NE corner. The notch
// re-cuts across the same L14 band the setback happens in, so the two events read as
// one structural move rather than two coincidences.
function planVerts(kf) {
  const s = ss(SB0, SB1, kf);
  const nu = 0.36 + 0.26 * s;    // notch return moves outboard
  const nv = 0.18 - 0.40 * s;    // notch soffit drops
  return [[-1, -1], [1, -1], [1, nv], [nu, nv], [nu, 1], [-1, 1]];
}
const toWorld = (u, v, kf) => [u * hw(kf) + leanX(kf), v * HH + leanY(kf), zOf(kf)];

// Real service positions on that plan: [u, v, tangent-axis] (0 = slides in X, 1 = in Y)
const LANES = [
  [-1.00, -0.55, 1],  // west wall, lift 1
  [-1.00, 0.55, 1],   // west wall, lift 2
  [-0.42, 1.00, 0],   // north wall, corridor face
  [0.36, 0.62, 1],    // notch return, stair lobby face
  [1.00, -0.30, 1],   // east wall, riser bundle
  [0.30, -1.00, 0],   // south wall, hydraulic riser
  [-0.55, -1.00, 0],  // south wall, comms riser
];
const NL = LANES.length;
function stationAt(l, kf) {
  const L = LANES[l];
  const u = (l === 3) ? planVerts(kf)[3][0] : L[0];   // lane 3 rides the moving notch
  return toWorld(u, L[1], kf);
}
const tangent = l => LANES[l][2] === 0 ? [1, 0] : [0, 1];

/* ── Class A: streams ─────────────────────────────────────────────────────── */
// SUB drops 6->2: at 288 levels, 6 samples/level is 1728 points per stream for no visible
// gain — one sample per 1.6 world units is finer than the tube can resolve anyway.
const SUB = 2, TRANS = 6.0, OFF = 2.60;   // wider lateral spread: 34 streams need more room
function makeStream(i, R) {
  // Most streams start at the very bottom so the near field is populated; the rest enter
  // progressively up the tower, which is what keeps new lines arriving during the scroll.
  const kStart = (i < 14) ? R() * 1.8 : (3.0 + R() * 8.0) * LSC, kEnd = LEVELS - 1 - R() * 1.0 * LSC;
  let lane = i % NL; const sched = [{ k: kStart, lane }];
  let k = kStart + (2.4 + R() * 2.6) * LSC;
  while (k < kEnd - 1.8 * LSC) {
    lane = ((lane + [-2, -1, -1, 1, 1, 2][(R() * 6) | 0]) % NL + NL) % NL;
    sched.push({ k, lane }); k += 9.0 + R() * 8.0;
  }
  sched.push({ k: kEnd, lane });
  const off = 2 * (((i + 0.5) * 0.61803398875) % 1) - 1;  // stratified, not R(): keeps streams apart
  R();
  return { kStart, kEnd, sched, off, seed: R() };
}
function sampleStream(st) {
  const pts = [], n = Math.ceil((st.kEnd - st.kStart) * SUB);
  for (let j = 0; j <= n; j++) {
    const kf = st.kStart + (st.kEnd - st.kStart) * (j / n);
    let a = st.sched[0], b = st.sched[st.sched.length - 1];
    for (let m = 0; m < st.sched.length - 1; m++)
      if (kf >= st.sched[m].k && kf <= st.sched[m + 1].k) { a = st.sched[m]; b = st.sched[m + 1]; break; }
    const w = ss(Math.max(a.k, b.k - TRANS), b.k, kf);
    const A = stationAt(a.lane, kf), B = stationAt(b.lane, kf);
    let x = A[0] + (B[0] - A[0]) * w, y = A[1] + (B[1] - A[1]) * w;
    const tA = tangent(a.lane), tB = tangent(b.lane);
    x += (tA[0] + (tB[0] - tA[0]) * w) * st.off * OFF;
    y += (tA[1] + (tB[1] - tA[1]) * w) * st.off * OFF;
    const p = st.seed * 6.283;
    x += Math.sin(kf * 0.83 + p) * 0.20 + Math.sin(kf * 0.31 + p * 2.1) * 0.12;
    y += Math.cos(kf * 0.71 + p * 1.7) * 0.15;
    pts.push([x, y, zOf(kf)]);
  }
  return pts;
}

/* ── Class B: level fragments (arcs of the 6-gon perimeter) ───────────────── */
function perim(s, kf) {
  const P = planVerts(kf).map(([u, v]) => toWorld(u, v, kf));
  const seg = []; const n = P.length; let tot = 0;
  for (let i = 0; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]); seg.push(L); tot += L;
  }
  let d = (((s % 1) + 1) % 1) * tot, i = 0;
  while (d > seg[i]) { d -= seg[i]; i = (i + 1) % n; }
  const a = P[i], b = P[(i + 1) % n], t = d / seg[i];
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, zOf(kf)];
}
function buildLevels(R) {
  const out = [];
  for (let k = 2; k < LEVELS; k++) {
    if (R() < 0.30) continue;
    const n = 1 + ((R() * 2.4) | 0);
    for (let f = 0; f < n; f++) {
      const s0 = R(), len = 0.10 + R() * 0.19, pts = [];
      for (let j = 0; j <= 14; j++) pts.push(perim(s0 + len * (j / 14), k));
      out.push(pts);
    }
  }
  return out;
}
/* ── Class C: core edges (one per plan vertex) ────────────────────────────── */
function buildCoreEdges() {
  const out = [];
  for (let vi = 0; vi < 6; vi++) {
    const pts = [];
    for (let j = 0; j <= 16; j++) {
      const kf = (LEVELS - 1) * (j / 16);
      const V = planVerts(kf)[vi];
      pts.push(toWorld(V[0], V[1], kf));
    }
    out.push(pts);
  }
  return out;
}
/* ── Class D: partitions (lift/stair division) ────────────────────────────── */
function buildPartitions(R) {
  const out = [];
  for (let k = 1; k < LEVELS; k += 2) {
    if (R() < 0.35) continue;
    const u = k < 14 ? 0.20 : -0.06, pts = [];
    for (let j = 0; j <= 6; j++) pts.push(toWorld(u, -1 + 2 * (j / 6), k));
    out.push(pts);
  }
  return out;
}
/* ── Class E: annotation ticks — the white drafting layer ──────────────────
   These carry the entire static luminance ladder: alpha x L = 0.2455 against the
   next class down at 0.0185, a 25.2:1 span. Without them the frame is a blue
   gradient with scratches on it. They are not a polish item and they cannot be
   added later — they change the light distribution the mask was solved against.
   They stay ticks: no numerals, no sheet numbers, no callouts. An abstract tick
   implies nothing; a numeral is a claim about a drawing that does not exist. */
const TICK = 0.42, UNIT = 3.4;
function buildTicks(R) {
  const out = [];
  for (let k = 3; k < LEVELS; k++) {
    if (R() < 0.34) continue;
    const n = 1 + ((R() * 1.9) | 0);
    for (let f = 0; f < n; f++) {
      const l = (R() * NL) | 0, S = stationAt(l, k), t = tangent(l);
      const px = -t[1], py = t[0];       // perpendicular to the wall it annotates
      out.push([[S[0] - px * TICK * 0.5, S[1] - py * TICK * 0.5, S[2]],
                [S[0] + px * TICK * 0.5, S[1] + py * TICK * 0.5, S[2]]]);
    }
    if (R() < 0.40) {                    // unit-module pair at 3.4m party-wall spacing
      const W = hw(k), nUnits = Math.max(1, Math.round(2 * W / UNIT));
      const j = 1 + ((R() * Math.max(1, nUnits - 1)) | 0), u = -1 + 2 * (j / nUnits);
      const P = toWorld(u, 1.0, k);
      out.push([[P[0], P[1] - TICK * 0.5, P[2]], [P[0], P[1] + TICK * 0.5, P[2]]]);
    }
  }
  return out;
}

/* ══════════ 2. CAMERA MODES ═══════════════════════════════════════════════
   Zero rotation, always. The vanishing point is SET by principal-point offset,
   not solved by trigonometry — which makes it invariant under camera translation,
   so the idle dolly and pointer parallax provably cannot move it. Any rotation
   breaks that, and the type-band guarantee goes with it. The eye is deliberately
   off the core axis (x != 0): with zero rotation that costs nothing but it kills
   the dead-centre symmetry that is the fastest generic tell.
   The aspect breakpoints are functional, not cosmetic — ultrawide has the least
   headroom (0.07 NDC vs 0.10 on desktop) and ULTRA's longer lens is what buys it back. */
const MODES = {
  WIDE:  { fov: 40, eye: [1.10, 0.60, 6.50], fx: 0.63, fy: 0.30, bandY: -0.10, nStream: 34 },
  // ULTRA's tx is ~30% larger than WIDE's, which compresses x and made streams read as
  // merged for 18 levels. Measured sweep: fov 34 -> 18.0, 30 -> 7.5, 28 -> 7.5, 26 -> 3.5.
  ULTRA: { fov: 26, eye: [1.35, 0.60, 8.00], fx: 0.60, fy: 0.32, bandY: -0.10, nStream: 34 },
  TABLET:{ fov: 40, eye: [1.00, 0.55, 6.20], fx: 0.60, fy: 0.28, bandY: -0.10, nStream: 26 },
  TALL:  { fov: 44, eye: [0.70, 0.40, 5.60], fx: 0.52, fy: 0.22, bandY: -0.10, nStream: 16 },
};
function modeFor(aspect) {
  if (aspect >= 2.10) return MODES.ULTRA;
  if (aspect >= 1.30) return MODES.WIDE;
  if (aspect >= 0.85) return MODES.TABLET;
  return MODES.TALL;
}

/* Mask stops are DERIVED from the band edge, never hand-set. Hand-set stops failed
   four of seven viewport gates on the first harness run, including desktop. */
const MASK_FLOOR = 0.06;
const maskStops = bandY => { const e = (1 - bandY) * 0.5; return [e - 0.15, e + 0.03]; };

// FOG_FAR rose 104 -> 320 with the tower. At 104 you saw ~30 of 288 levels, and since the
// lean and setback are now spread over 900 units, that slice was a nearly straight prism —
// the sweep had been scaled out of view. Seeing ~100 levels at once puts it back, and the
// min-pixel width clamp dims the far end to ~27% on its own, so depth still reads.
const FOG_NEAR = 22, FOG_FAR = 320, MIN_PX = 1.15;
// Everything nearer than this fades out entirely; see the depth cull in the fragment shader.
const NEAR_CULL = 5.0;

/* ══════════ 3. LINE CLASSES ═══════════════════════════════════════════════
   colour is authored sRGB; THREE.Color converts to linear on construction, which is
   what the shader wants. alpha x linear-luminance is the bloom selector: threshold
   0.55 sits 2.24x above the white ticks (0.2455) and 3.10x below the crest (1.706),
   so the selection is not marginal. */
const CLASSES = {
  // near 0.42 -> 0.18: as a world distance that is 41 units -> 18, so a stream reaches full
  // strength well inside the near field instead of halfway to the vanishing point.
  stream: { color: '#2E38FF', alpha: 1.00, radius: 0.022, near: 0.18, far: 0.86, heat: 1.6 },
  tick:   { color: '#F7F9FA', alpha: 0.26, radius: 0.010, near: 0.55, far: 1.00, heat: 0.0 },
  level:  { color: '#434CAA', alpha: 0.20, radius: 0.013, near: 0.38, far: 0.88, heat: 0.0 },
  part:   { color: '#434CAA', alpha: 0.16, radius: 0.011, near: 0.38, far: 0.88, heat: 0.0 },
  edge:   { color: '#4C5586', alpha: 0.10, radius: 0.017, near: 0.46, far: 0.90, heat: 0.0 },
};

class PolylineCurve extends THREE.Curve {
  constructor(points) {
    super();
    this.pts = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    // TubeGeometry samples via getPointAt(), which is arc-length reparameterised off a
    // cache of arcLengthDivisions samples (default 200). Our streams reach ~190 points,
    // so at the default the cache cuts corners and the spacing goes wrong.
    this.arcLengthDivisions = Math.max(200, this.pts.length * 4);
  }
  getPoint(t, target = new THREE.Vector3()) {
    const n = this.pts.length - 1;
    const i = Math.min(n - 1, Math.floor(t * n));
    const w = (t - i / n) * n;
    return target.copy(this.pts[i]).lerp(this.pts[i + 1], w);
  }
}

/* ══════════ 4. SHADERS ════════════════════════════════════════════════════ */

const LINE_VERT = /* glsl */`
uniform float uViewportH, uTanHalfFov, uMinPx;
attribute vec3 aColor; attribute vec4 aWave; attribute vec2 aFade;
attribute float aRadius; attribute float aFar;
varying vec3 vColor; varying vec4 vWave; varying vec2 vFade;
varying float vDepth; varying float vWidthFade; varying float vFar; varying vec2 vUvL;
void main(){
  vUvL = uv; vColor = aColor; vWave = aWave; vFade = aFade; vFar = aFar;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  // Constant screen weight: a hairline stays a hairline at every distance and loses
  // DENSITY, not WIDTH — plotted-line behaviour, the opposite of a 3D tube. Also kills
  // far-field scintillation and tightens the convergence knot.
  float pxPerUnit = uViewportH / (2.0 * vDepth * uTanHalfFov);
  float wantR = max(aRadius, uMinPx / (2.0 * pxPerUnit));
  mv.xyz += normalize(normalMatrix * normal) * (wantR - aRadius);
  vWidthFade = aRadius / wantR;          // pay for the width clamp in alpha
  gl_Position = projectionMatrix * mv;
}`;

const LINE_FRAG = /* glsl */`
uniform float uTime, uGlobalAlpha, uFogNear, uFogFar, uNearCull;
uniform vec2 uResolution, uMaskStops;
varying vec3 vColor; varying vec4 vWave; varying vec2 vFade;
varying float vDepth; varying float vWidthFade; varying float vFar; varying vec2 vUvL;
const float MASK_FLOOR = ${MASK_FLOOR.toFixed(3)};
void main(){
  // MINUS uTime: crests CLIMB toward the vanishing point. Plus would send them at the
  // camera, which is the opposite story.
  float phase = vUvL.x * vWave.x - uTime * vWave.y + vWave.z;
  float vProgress = smoothstep(-0.5, 0.5, sin(phase)) * step(0.5, vWave.y);
  // Static lines carry a baked standing wave so they read as drawn, not dead.
  float statMod = mix(0.72 + 0.28 * sin(vUvL.x * vWave.x * 0.5 + vWave.z), 1.0, step(0.5, vWave.y));

  float fogF = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
  float hide = smoothstep(0.0, vFade.y, vUvL.x) * smoothstep(1.0, vFar, vUvL.x);
  // Depth cull at the near end. The per-curve fade runs along uv.x, which cannot help a
  // level fragment sitting at L2: that curve is near the camera along its WHOLE length, so
  // it sprawled across frame as a giant arc. Fading by DEPTH empties the foreground and is
  // what turns the tangle into a structure receding from darkness.
  float nearF = smoothstep(uNearCull, uNearCull + 11.0, vDepth);

  // PRE-BLOOM TYPE MASK. Attenuates the SOURCE, so no bloom halo can be born inside the
  // band at all — the worst pixel it can leave is linear luminance 0.1024, below the
  // 0.55 threshold. MASK_FLOOR is load-bearing: raise it to 0.35 "to see more lines" and
  // crests cross the threshold inside the band and the guarantee is gone, silently.
  float sy = 1.0 - (gl_FragCoord.y / uResolution.y);
  float mask = 1.0 - (1.0 - MASK_FLOOR) * smoothstep(uMaskStops.x, uMaskStops.y, sy);

  // ADDITIVE, never mix(c, c*3, p). #2E38FF is linear (0.027,0.040,1.000) — blue is
  // already clipped, so a multiply yields #4B61F8 at luminance 0.361, BELOW our bloom
  // threshold: the multiply would not merely flatten the colour, it would stop the bloom
  // firing entirely. Adding 1.6 gives #ECECF4 at 1.706 — the brand's own off-white,
  // reached the way a real over-driven trail clips toward white.
  vec3 col = vColor + vProgress * vWave.w;
  float a = vFade.x * hide * fogF * nearF * vWidthFade * statMod * mask * uGlobalAlpha;
  gl_FragColor = vec4(col * fogF, a);
}`;

const COMPOSITE = {
  uniforms: {
    tDiffuse: { value: null },
    uAspect: { value: 1 },
    uTime: { value: 0 },
    uGrain: { value: 1 },
    uG1: { value: new THREE.Vector2(0.60, 0.66) },
    uG2: { value: new THREE.Vector2(0.60, 0.66) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
uniform sampler2D tDiffuse; uniform float uAspect, uTime, uGrain;
uniform vec2 uG1, uG2; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453123); }
float sineInOut(float t){ return -0.5 * (cos(3.14159265 * t) - 1.0); }
void main(){
  vec4 color = texture2D(tDiffuse, vUv);

  // Two additive radial gradients build the depth field. Colours are LINEAR — do not
  // re-convert. (This is the one idea we take from the source: that two cheap additive
  // radials read as atmosphere. Our positions, strengths and colours are our own.)
  float a1 = sineInOut(clamp(1.0 - distance(uG1, vUv) * 1.05, 0.0, 1.0));
  color.rgb += vec3(0.0180, 0.0245, 0.2100) * a1 * 0.62;
  float a2 = sineInOut(clamp(1.0 - distance(uG2, vUv) * 0.22, 0.0, 1.0));
  color.rgb += vec3(0.0320, 0.0420, 0.3400) * a2 * 0.46;

  // Bottom darken runs POST-bloom so a halo cannot defeat it.
  color.rgb *= mix(1.0, 0.34, smoothstep(0.46, 0.10, vUv.y) * 0.86);

  color.rgb *= mix(1.0, smoothstep(0.92, 0.28, length((vUv - 0.5) * vec2(uAspect, 1.0))), 0.55);

  // Grain last, and majority STATIC — a static grain field is what makes a frame read as
  // a printed sheet rather than a render. Quantising the moving half to 12Hz makes it
  // film rather than digital noise. It runs after the bottom darken so the dark band
  // keeps texture; that is also why the DOM scrim stops at 0.80 rather than flattening it.
  float tq = floor(uTime * 12.0) / 12.0;
  float film = hash(gl_FragCoord.xy + tq * 91.7) - 0.5;
  float tooth = hash(gl_FragCoord.xy * 1.7) - 0.5;
  color.rgb += (film * 0.014 + tooth * 0.018) * uGrain;

  gl_FragColor = color;
}`,
};

/* ══════════ 5. BUILD ══════════════════════════════════════════════════════ */

function buildScene(mode, aspect) {
  const Ra = mulberry32(SEED);                 // streams
  const Rb = mulberry32(SEED ^ 0x9E3779B9);    // static classes — stable across viewports

  const items = [];
  for (let i = 0; i < mode.nStream; i++) {
    items.push({ cls: 'stream', pts: sampleStream(makeStream(i, Ra)), i });
  }
  buildLevels(Rb).forEach(p => items.push({ cls: 'level', pts: p }));
  buildCoreEdges().forEach(p => items.push({ cls: 'edge', pts: p }));
  buildPartitions(Rb).forEach((p, i) => items.push({ cls: 'part', pts: p, i }));
  buildTicks(Rb).forEach(p => items.push({ cls: 'tick', pts: p }));

  const geos = [];
  const radial = lowPower ? 3 : 5;
  let animated = 0;

  items.forEach((it, idx) => {
    const C = CLASSES[it.cls];
    const curve = new PolylineCurve(it.pts);
    const len = curve.getLength();
    if (!(len > 0.001)) return;

    // The cap has to rise with the tower or a 900-unit stream gets 160 segments — 5.6
    // units each — and the smooth sweep turns into a polygon.
    const tubular = it.cls === 'stream'
      ? Math.min(lowPower ? 260 : 900, Math.max(24, Math.round(len * 1.2)))
      : Math.max(6, Math.min(48, it.pts.length * 2));

    const g = new THREE.TubeGeometry(curve, tubular, C.radius, radial, false);
    const n = g.attributes.position.count;

    // 16 of 106 curves animate (15%). 14 streams + 2 riser partitions; 90 are still.
    let speed = 0;
    if (it.cls === 'stream' && it.i % 3 !== 2) { speed = 1.0; animated++; }
    else if (it.cls === 'part' && it.i % 5 === 1) { speed = 0.34; animated++; }

    // Fixed WORLD wavelength of 18 units -> 3.7-6.1 crests per stream. Never the source's
    // round(len*100)/2, which is calibrated to their 1/7.7-scaled world and would give
    // ~400 cycles here, aliasing into a crawling moire.
    const uSize = 2 * Math.PI * len / 18.0;
    const phase = idx * 2.399963;    // golden angle: without it every stream crests in unison

    const col = new THREE.Color(C.color);     // -> linear, which is what the shader wants
    const aColor = new Float32Array(n * 3);
    const aWave = new Float32Array(n * 4);
    const aFade = new Float32Array(n * 2);
    const aRadius = new Float32Array(n);
    const aFar = new Float32Array(n);
    // The end-fades are fractions of uv.x, i.e. of CURVE LENGTH, and the class constants
    // were tuned against a ~98-unit tower. On a 900-unit stream 0.42 fades the first 380
    // units — the whole visible band — and the hero comes up empty. Convert each fraction
    // to the world distance it used to mean and re-derive it for this curve's real length.
    const nearFrac = Math.min(0.45, C.near * 98 / len);
    const farFrac = Math.max(0.55, 1 - (1 - C.far) * 98 / len);
    for (let v = 0; v < n; v++) {
      aColor[v * 3] = col.r; aColor[v * 3 + 1] = col.g; aColor[v * 3 + 2] = col.b;
      aWave[v * 4] = uSize; aWave[v * 4 + 1] = speed; aWave[v * 4 + 2] = phase; aWave[v * 4 + 3] = C.heat;
      aFade[v * 2] = C.alpha; aFade[v * 2 + 1] = nearFrac;
      aRadius[v] = C.radius; aFar[v] = farFrac;
    }
    g.setAttribute('aColor', new THREE.BufferAttribute(aColor, 3));
    g.setAttribute('aWave', new THREE.BufferAttribute(aWave, 4));
    g.setAttribute('aFade', new THREE.BufferAttribute(aFade, 2));
    g.setAttribute('aRadius', new THREE.BufferAttribute(aRadius, 1));
    g.setAttribute('aFar', new THREE.BufferAttribute(aFar, 1));
    geos.push(g);
  });

  // One merged mesh, one draw call. (The source ships one material per line.)
  const merged = mergeGeometries(geos, false);
  geos.forEach(g => g.dispose());

  const [t0, t1] = maskStops(mode.bandY);
  const material = new THREE.ShaderMaterial({
    vertexShader: LINE_VERT,
    fragmentShader: LINE_FRAG,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    // fog: false is deliberate. ShaderMaterial with fog:true and unmerged UniformsLib.fog
    // throws on first render, and the fog chunk mixes toward fogColor — which under
    // additive blending BRIGHTENS distant geometry, the inverse of the intended depth read.
    fog: false,
    uniforms: {
      uTime: { value: 0 },
      uGlobalAlpha: { value: 1 },
      uFogNear: { value: FOG_NEAR },
      uFogFar: { value: FOG_FAR },
      uNearCull: { value: NEAR_CULL },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMaskStops: { value: new THREE.Vector2(t0, t1) },
      uViewportH: { value: 1 },
      uTanHalfFov: { value: Math.tan(mode.fov * Math.PI / 360) },
      uMinPx: { value: MIN_PX },
    },
  });

  const mesh = new THREE.Mesh(merged, material);
  mesh.frustumCulled = false;
  return { mesh, material, curves: items.length, animated };
}

/* ══════════ 6. MOUNT ══════════════════════════════════════════════════════ */

function start() {
  if (document.getElementById('bf-hero-gl')) return;   // re-entrancy guard: FIRST LINE.
  const why = tooWeak();
  if (why) { window.__heroGl = 'refused:' + why; return; }
  if (!webglOk()) { window.__heroGl = 'unsupported'; return; }

  const host = document.createElement('div');
  host.id = 'bf-hero-gl';
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;visibility:hidden';
  // FIRST child, not appended. A positioned z-index:0 element paints in tree order with
  // #top's positioned box; appended last, the canvas would paint OVER the hero content.
  document.body.insertBefore(host, document.body.firstChild);

  let renderer, composer, camera, scene, built = null, compositePass, bloomPass;
  let scrollP = 0, scrimOpacity = -1;
  // Cached so the render loop never reads layout. Content height changes as sections
  // reveal, so refresh on resize and on a slow interval rather than every frame.
  let docScroll = 1;
  const measureDoc = () => { docScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); };
  // 10x the journey. The tower is now ~900 units tall and fog hides everything past 104,
  // so structure emerges continuously out of the dark for the whole scroll instead of the
  // camera running out of building partway down the page.
  const TRAVEL = 620;         // world units the camera covers over one full page scroll
  const state = { visible: !document.hidden, alive: true, paused: false, running: false };
  let reduced = reduceMQ.matches;
  let t = 0, last = performance.now(), mode = null;
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, stencil: false, depth: false, powerPreference: 'default' });
  } catch (e) { window.__heroGl = 'construct-failed'; host.remove(); return; }

  const canvas = renderer.domElement;
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 600ms ease-out';
  host.appendChild(canvas);
  // Readability scrim over the canvas, under the content. Ramps in past the hero so body
  // copy never sits directly on a moving crest.
  const scrim = document.createElement('div');
  scrim.style.cssText = 'position:absolute;inset:0;pointer-events:none;background:#05070A;opacity:0';
  host.appendChild(scrim);

  const dprCap = () => {
    const raw = Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.5);
    const px = window.innerWidth * window.innerHeight * raw * raw;
    return px > 2.5e6 ? raw * Math.sqrt(2.5e6 / px) : raw;   // 2.5Mpx ceiling
  };

  renderer.setPixelRatio(dprCap());          // BEFORE the composer — it snapshots the ratio
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.72;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor('#05070A', 1);

  scene = new THREE.Scene();
  const aspect0 = window.innerWidth / window.innerHeight;
  mode = modeFor(aspect0);
  camera = new THREE.PerspectiveCamera(mode.fov, aspect0, 0.5, 420);   // far must clear FOG_FAR
  camera.position.set(mode.eye[0], mode.eye[1], mode.eye[2]);
  // camera.rotation stays (0,0,0). Never lookAt(), never OrbitControls, never group.rotation.z.

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth / (lowPower ? 3 : 2), window.innerHeight / (lowPower ? 3 : 2)),
    0.62, 0.35, 0.55);      // all four args — radius/threshold have no defaults in r186
  composer.addPass(bloomPass);
  compositePass = new ShaderPass(COMPOSITE);
  composer.addPass(compositePass);
  composer.addPass(new OutputPass());   // LAST. Without it, linear values blit unencoded.

  function applyCamera() {
    const w = window.innerWidth, h = window.innerHeight;
    const m = modeFor(w / h);
    if (m !== mode) {
      mode = m;
      camera.fov = m.fov;
      camera.position.set(m.eye[0], m.eye[1], m.eye[2]);
      if (built) {
        const [a, b] = maskStops(m.bandY);
        built.material.uniforms.uMaskStops.value.set(a, b);
        built.material.uniforms.uTanHalfFov.value = Math.tan(m.fov * Math.PI / 360);
      }
    }
    camera.aspect = w / h;
    // MANDATORY on every resize, or the vanishing point drifts as the window changes.
    camera.setViewOffset(w, h, w * (0.5 - mode.fx), h * (0.5 - mode.fy), w, h);
    camera.updateProjectionMatrix();
    const g = mode === MODES.TALL ? [0.55, 0.78] : [0.60, 0.66];
    compositePass.uniforms.uG1.value.set(g[0], g[1]);
    compositePass.uniforms.uG2.value.set(g[0], g[1]);
    compositePass.uniforms.uAspect.value = w / h;
    if (built) {
      built.material.uniforms.uResolution.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
      built.material.uniforms.uViewportH.value = h * renderer.getPixelRatio();
    }
  }
  applyCamera();

  function tick(now) {
    if (now - last < 15.5) return;                 // cap 60fps
    // Own the clock. Clock.getElapsedTime() teleports the wave after a tab-away, which
    // reads as a glitch; the clamp also covers the first frame after the sliced build.
    t += Math.min(now - last, 33) * 0.001;
    last = now;
    if (built) {
      built.material.uniforms.uTime.value = t * 0.78;   // 2pi in 8.06s ~ 2.23 m/s
      compositePass.uniforms.uTime.value = t;
    }
    if (hoverMQ.matches) {
      ptr.x += (ptr.tx - ptr.x) * 0.045;             // translate, NEVER rotate
      ptr.y += (ptr.ty - ptr.y) * 0.045;
    }
    // SCROLL DRIVE. The scene is the ground for the whole page now, so the camera travels
    // up the core as you scroll: scroll progress 0..1 maps to a dolly along -Z. Because the
    // vanishing point is set by principal-point offset rather than by aiming the camera,
    // translating along the view axis cannot move it — the composition holds all the way
    // down the page while the structure streams past.
    // scrollHeight is CACHED, never read here. Reading it forces a synchronous layout, and
    // doing that every frame — right after writing scrim.style.opacity the frame before —
    // is textbook layout thrash. With Lenis stepped from the same tick and lagSmoothing(0),
    // that thrash lands directly on the smooth scroll as stutter.
    const y = window.scrollY;
    scrollP += (Math.min(1, Math.max(0, y / docScroll)) - scrollP) * 0.08;  // damped
    const dolly = -scrollP * TRAVEL + 0.28 * Math.sin(t * Math.PI * 2 / 26);
    camera.position.set(mode.eye[0] + ptr.x, mode.eye[1] + ptr.y, mode.eye[2] + dolly);

    // Past the hero the page is dense with type, so the scene steps back rather than
    // competing with it. Ramp over the first viewport-height of scroll.
    if (built) {
      const past = Math.min(1, y / Math.max(1, window.innerHeight * 0.9));
      built.material.uniforms.uGlobalAlpha.value = 1 - 0.62 * past;
      // Only touch the DOM when the value actually moves — a style write every frame
      // invalidates layout for everything that reads after it.
      const sv = Math.round(past * 420) / 1000;
      if (sv !== scrimOpacity) { scrimOpacity = sv; scrim.style.opacity = String(sv); }
    }
    composer.render();
  }

  // Lenis is stepped from the GSAP ticker with lagSmoothing(0), so a second, independent
  // rAF (which is what renderer.setAnimationLoop gives you) lands in an arbitrary order
  // relative to Lenis every frame and shows up as scroll jitter. Share the tick when GSAP
  // is present; fall back to setAnimationLoop when it is not.
  const gsapTick = () => tick(performance.now());
  const useGsap = () => typeof window.gsap !== 'undefined' && window.gsap.ticker;
  function startLoop() { if (useGsap()) window.gsap.ticker.add(gsapTick); else renderer.setAnimationLoop(tick); }
  function stopLoop() { if (useGsap()) window.gsap.ticker.remove(gsapTick); else renderer.setAnimationLoop(null); }

  function updateRunState() {
    // state.onScreen is deliberately NOT in this expression any more. The scene is the
    // ground for every section, not a hero decoration, so it stays visible for the whole
    // document; the tab-hidden and pause gates are what stop it.
    const shouldRun = state.visible && state.alive && !state.paused && !reduced && !!built;
    if (shouldRun && !state.running) { last = performance.now(); measureDoc(); startLoop(); state.running = true; }
    else if (!shouldRun && state.running) { stopLoop(); state.running = false; }
    host.style.visibility = built ? 'visible' : 'hidden';
  }

  /* Build off the critical path: ~2600 curve samples + shader links + render targets
     together stall 100-300ms, and doing that on load puts a Long Task inside the LCP
     window. Idle, then one warm frame, then fade in. */
  const kickoff = () => {
    try {
      built = buildScene(mode, window.innerWidth / window.innerHeight);
      scene.add(built.mesh);
      applyCamera();
      renderer.compileAsync(scene, camera).then(() => {
        composer.render();                     // one throwaway frame: force links + RT alloc
        canvas.style.opacity = '1';
        document.documentElement.classList.add('bf-gl-on');   // reveal the canvas: see #top in the CSS
        window.__heroGl = 'ok:' + built.curves + ':' + built.animated;
        window.__heroDebug = { camera, scene, renderer, composer, mesh: built.mesh, material: built.material, mode: () => mode };
        if (reduced) { built.material.uniforms.uTime.value = 3.40 * 0.78; compositePass.uniforms.uTime.value = 3.40; composer.render(); }
        updateRunState();
      }).catch(e => { window.__heroGl = 'compile-failed:' + (e && e.message); });
    } catch (e) {
      window.__heroGl = 'build-failed:' + (e && e.message);
    }
  };
  if (window.requestIdleCallback) requestIdleCallback(kickoff, { timeout: 600 });
  else setTimeout(kickoff, 200);

  /* ── observers ─────────────────────────────────────────────────────────── */
  document.addEventListener('visibilitychange', () => { state.visible = !document.hidden; updateRunState(); });
  window.addEventListener('pagehide', () => { state.alive = false; updateRunState(); });
  window.addEventListener('pageshow', () => { state.alive = true; last = performance.now(); updateRunState(); });
  reduceMQ.addEventListener('change', e => { reduced = e.matches; updateRunState(); });

  if (hoverMQ.matches) {
    window.addEventListener('pointermove', e => {
      ptr.tx = (e.clientX / window.innerWidth - 0.5) * 0.22;
      ptr.ty = -(e.clientY / window.innerHeight - 0.5) * 0.16;
    }, { passive: true });
  }

  canvas.addEventListener('webglcontextlost', e => {
    e.preventDefault();                       // omit this and contextrestored never fires
    stopLoop(); state.running = false;
    host.style.visibility = 'hidden';
    window.__heroGl = 'lost';
  });

  let rt = 0;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      renderer.setPixelRatio(dprCap());
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);   // BOTH. The source ships only the first.
      applyCamera();
      measureDoc();
    }, 200);
  }, { passive: true });

  // NOTE: an IntersectionObserver on #top used to gate visibility here. It is gone on
  // purpose — the scene is now the ground for the whole document, so there is nothing to
  // gate on. (For the record, that observer needed rebinding: support.js swaps the <x-dc>
  // subtree ~150ms in, and an observer left on the detached first #top reports
  // isIntersecting:false forever, which pinned the canvas hidden.)

  measureDoc();
  setInterval(measureDoc, 1500);   // cheap, and off the render path

  window.__heroPause = v => { state.paused = v; updateRunState(); };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
