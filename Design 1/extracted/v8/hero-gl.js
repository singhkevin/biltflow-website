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

/* ══════════ 1. THE BUILDING ═══════════════════════════════════════════════
   "The Record": one building, drawn as light, assembling as you scroll — and
   nothing ever disappears except the temporary works, because that IS the product
   claim. A building reads as a building because of its repeating members, so this
   is built from them: a column grid, floor plates with beams, a core, a façade at a
   fixed module, a podium setback, a crane that comes down before handover, and
   floors that light up once it is occupied.

   Two attributes carry the whole 13-phase story: aBuild (the point a member is
   placed) and aSeq (when it LEAVES, and how far it recedes once the building is in
   use). No geometry is created or destroyed at runtime — the entire sequence is one
   comparison in the fragment shader, so it costs nothing to download. ── */

const LV = 34, H = 3.1, NX = 7, NZ = 5, PODIUM = 9;
const CX = 2, CZ = -66;
const GX = 38, ZN = 16, ZF = -230;
const plan = k => k < PODIUM ? { w: 16, d: 11 } : { w: 11, d: 7.5 };
const at = (k, i, j) => { const { w, d } = plan(k);
  return [CX - w + 2*w*i/(NX-1), k*H, CZ - d + 2*d*j/(NZ-1)]; };

/* PHASE LADDER — where each trade lands on the page. Structure occupies the middle
   because that is where the page has the least type; occupancy is the payoff and is
   the one thing that BRIGHTENS while everything else quiets down. */
const tFrame = k => 0.16 + (k / LV) * 0.34;       // structure    16% -> 50%
const tClad  = k => Math.min(0.985, tFrame(k) + 0.07);
const tFin   = k => 0.50 + (k / LV) * 0.13;       // finishing    50% -> 63%
// Occupancy arrives UNEVENLY — a clean sweep up the tower reads as a progress bar.
const hashK  = k => Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
const tFit   = k => 0.635 + hashK(k) * 0.15;      // moving in    63% -> 78%
const HANDOVER = 0.80, MAINT0 = 0.845, OPERATE = 0.84;
const RETIRE_CRANE = HANDOVER + 0.04, RETIRE_JIB = HANDOVER, RETIRE_SITE = HANDOVER + 0.02;

const items = [];
const push = (cls, pts, build = 0, retire = 0, late = 0) =>
  items.push({ cls, pts, build, retire, late });

/* ── ground datum: the floor that makes this a place rather than a void ── */
const gStep = lowPower ? 14 : 9;
for (let z = ZN; z > ZF; z -= gStep) push('grid', [[-GX,0,z],[GX,0,z]]);
for (let x = -GX; x <= GX; x += gStep) push('grid', [[x,0,ZN],[x,0,ZF]]);


/* ── CONTEXT: the city the project sits in. Born at 0 and never retires, so the frame
   has real content from the FIRST pixel instead of an empty lot. This is what makes the
   hero land immediately — the subject tower then rises in front of it. Deliberately far
   and dim: it reads as depth, never competing with the building. ── */
{
  const CITY = [
    [-62, -126, 14, 31], [ 54, -116, 12, 25], [-34, -164, 17, 43], [ 78, -148, 15, 36],
    [-88, -190, 13, 28], [ 28, -198, 19, 49], [-54, -224, 16, 38], [ 96, -210, 13, 31],
    [  8, -250, 21, 55], [-100, -258, 15, 34],
  ];
  for (const [cx, cz, cw, ch] of CITY) {
    const q = [[-cw/2,-cw/2],[cw/2,-cw/2],[cw/2,cw/2],[-cw/2,cw/2]];
    for (let i = 0; i < 4; i++) {                                   // corner edges
      push('city', [[cx+q[i][0],0,cz+q[i][1]],[cx+q[i][0],ch,cz+q[i][1]]], 0);
      push('city', [[cx+q[i][0],ch,cz+q[i][1]],[cx+q[(i+1)%4][0],ch,cz+q[(i+1)%4][1]]], 0);
    }
    for (let f = 1; f < 5; f++) {                                   // a few floor bands
      const y = ch * (f / 5);
      push('city', [[cx-cw/2,y,cz+cw/2],[cx+cw/2,y,cz+cw/2]], 0);
    }
  }
}

/* ── the lot, setting-out, and the excavation ── */
const B = [[-22,-26],[28,-26],[28,-106],[-22,-106]];
for (let i = 0; i < 4; i++)
  push('tick', [[B[i][0],0,B[i][1]],[B[(i+1)%4][0],0,B[(i+1)%4][1]]], 0.012, 0, RETIRE_SITE);
push('set', [[-GX,0,CZ],[GX,0,CZ]], 0.04);
push('set', [[CX,0,ZN],[CX,0,ZF]], 0.04);
for (let z = -30; z >= -102; z -= 8) push('tick', [[CX-1.8,0,z],[CX+1.8,0,z]], 0.06, 0, 0.7);
// substructure: the pit, then the piles
const P0 = plan(0);
const PIT = [[CX-P0.w-3,CZ-P0.d-3],[CX+P0.w+3,CZ-P0.d-3],[CX+P0.w+3,CZ+P0.d+3],[CX-P0.w-3,CZ+P0.d+3]];
for (const dy of [0, -5.5]) for (let i = 0; i < 4; i++)
  push('set', [[PIT[i][0],dy,PIT[i][1]],[PIT[(i+1)%4][0],dy,PIT[(i+1)%4][1]]], 0.085, 0, 0.85);
for (let i = 0; i < 4; i++)
  push('set', [[PIT[i][0],0,PIT[i][1]],[PIT[i][0],-5.5,PIT[i][1]]], 0.09, 0, 0.85);
for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
  const p = at(0, i, j);
  push('frame', [[p[0],-5.5,p[2]],[p[0],0,p[2]]], 0.105 + (i+j)*0.002, 0, 0.6);  // piles
}

/* ── the building ── */
for (let k = 0; k < LV; k++) {
  const b = tFrame(k), { w, d } = plan(k), y0 = k*H, y1 = (k+1)*H;

  for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
    const p = at(k, i, j);
    push('frame', [[p[0], y0, p[2]], [p[0], y1, p[2]]], b, 0, 0.35);        // columns
  }
  const C4 = [at(k,0,0), at(k,NX-1,0), at(k,NX-1,NZ-1), at(k,0,NZ-1)];
  for (const dy of [0, 0.4]) for (let i = 0; i < 4; i++)                    // slab edge
    push(dy ? 'frame' : 'plan',
      [[C4[i][0], y1+dy, C4[i][2]], [C4[(i+1)%4][0], y1+dy, C4[(i+1)%4][2]]],
      b + 0.003, 0, dy ? 0.5 : 0.18);
  for (let i = 0; i < NX; i++)                                             // beams, both axes
    push('frame', [[at(k,i,0)[0], y1, CZ-d], [at(k,i,0)[0], y1, CZ+d]], b + 0.005, 0, 0.5);
  for (let j = 0; j < NZ; j++)
    push('frame', [[CX-w, y1, at(k,0,j)[2]], [CX+w, y1, at(k,0,j)[2]]], b + 0.005, 0, 0.5);

  const cw = 3.6, cd = 2.8;                                                // lift / stair core
  const K = [[CX-cw,CZ-cd],[CX+cw,CZ-cd],[CX+cw,CZ+cd],[CX-cw,CZ+cd]];
  for (let i = 0; i < 4; i++) {
    push('plan', [[K[i][0], y0, K[i][1]], [K[i][0], y1, K[i][1]]], b, 0, 0.15);
    push('plan', [[K[i][0], y1, K[i][1]], [K[(i+1)%4][0], y1, K[(i+1)%4][1]]], b + 0.003, 0, 0.15);
  }
  push('set', [[K[0][0], y0, K[0][1]], [K[1][0], y1, K[1][1]]], b + 0.006, 0, 0.8);
  push('set', [[K[1][0], y0, K[1][1]], [K[0][0], y1, K[0][1]]], b + 0.006, 0, 0.8);

  // FINISHING — partitions and a balustrade at each slab edge: the members that turn a
  // frame into somewhere you can occupy.
  {
    const f = tFin(k);
    for (let q = 1; q <= 2; q++) {
      const xq = CX - w + (2*w) * (q / 3);
      push('tick', [[xq, y1, CZ-d*0.72], [xq, y1, CZ+d*0.72]], f + q*0.004, 0, 0.25);
    }
    push('tick', [[CX-w, y1+1.0, CZ+d], [CX+w, y1+1.0, CZ+d]], f + 0.012, 0, 0.2);
    push('tick', [[CX-w, y1+1.0, CZ-d], [CX-w, y1+1.0, CZ+d]], f + 0.012, 0, 0.2);
  }

  // services risers climb the core once the frame is topped out
  if (k % 2 === 0) push('set', [[K[2][0]-0.7, y0, K[2][1]-0.7], [K[2][0]-0.7, y1, K[2][1]-0.7]], 0.62 + (k/LV)*0.10, 0, 0.45);

  // FAÇADE trails the frame — cladding chases structure up a real job
  if (k < LV - 1) {
    const c = tClad(k), MOD = 2.4;
    for (let x = CX - w + MOD; x < CX + w - 0.1; x += MOD)
      push('tick', [[x, y0+0.4, CZ+d], [x, y1, CZ+d]], c);
    for (let z = CZ - d + MOD; z < CZ + d - 0.1; z += MOD)
      push('tick', [[CX-w, y0+0.4, z], [CX-w, y1, z]], c);
  }
  // OCCUPANCY — the payoff. The record does not stop at handover.
  if (k % 2 === 0 && k < LV - 1) {
    const L = tFit(k), MOD = 2.4, yl = y0 + H*0.45;
    for (let x = CX - w + MOD; x < CX + w - 0.1; x += MOD*2)
      push('lit', [[x, yl, CZ+d], [x + MOD*0.6, yl, CZ+d]], L + Math.abs(Math.sin(x*7.3+k))*0.045);
    for (let z = CZ - d + MOD; z < CZ + d - 0.1; z += MOD*2)
      push('lit', [[CX-w, yl, z], [CX-w, yl, z + MOD*0.6]], L + Math.abs(Math.sin(z*5.1+k))*0.045);
  }
}

/* ── tower crane: up early, DOWN before handover ── */
const MX = CX - 23, MZ = CZ + 5, MH = LV*H + 13;
const Q = [[-1.4,-1.4],[1.4,-1.4],[1.4,1.4],[-1.4,1.4]];
for (const [ox, oz] of Q) push('frame', [[MX+ox,0,MZ+oz],[MX+ox,MH,MZ+oz]], 0.115, RETIRE_CRANE);
for (let y = 3; y < MH; y += 3.6)
  for (let i = 0; i < 4; i++)
    push('frame', [[MX+Q[i][0],y,MZ+Q[i][1]],[MX+Q[(i+1)%4][0],y,MZ+Q[(i+1)%4][1]]],
         0.115 + (y/MH)*0.14, RETIRE_CRANE - (y/MH)*0.05);
push('plan', [[MX,MH,MZ],[MX+38,MH,MZ]], 0.16, RETIRE_JIB);
push('plan', [[MX,MH,MZ],[MX-12,MH,MZ]], 0.16, RETIRE_JIB);
push('set',  [[MX,MH+5.5,MZ],[MX+38,MH,MZ]], 0.17, RETIRE_JIB);
push('set',  [[MX,MH+5.5,MZ],[MX-12,MH,MZ]], 0.17, RETIRE_JIB);
push('frame',[[MX,MH,MZ],[MX,MH+5.5,MZ]], 0.17, RETIRE_JIB + 0.01);
push('tick', [[MX+23,MH,MZ],[MX+23,MH-15,MZ]], 0.18, RETIRE_JIB - 0.02);

/* ── ENTRANCE CANOPY + PODIUM ACTIVITY: the building starts receiving people ── */
{
  const py = PODIUM * H, zf = CZ + 11;
  push('plan', [[CX-5, py+1.2, zf+3.4], [CX+5, py+1.2, zf+3.4]], 0.60, 0, 0.15);
  push('plan', [[CX-5, py+1.2, zf], [CX-5, py+1.2, zf+3.4]], 0.605, 0, 0.15);
  push('plan', [[CX+5, py+1.2, zf], [CX+5, py+1.2, zf+3.4]], 0.605, 0, 0.15);
  for (const x of [-4.2, -2.6, 1.4, 3.8])
    push('tick', [[CX+x, 0, zf+3.4], [CX+x, 0, zf+6.6]], 0.665 + Math.abs(x)*0.004, 0, 0.3);
}

/* ── MAINTENANCE ──────────────────────────────────────────────────────────────
   A roof davit that arrives at handover and stays, and a window-cleaning cradle that
   DESCENDS the façade. The cradle is a FLIPBOOK: copies down its path, each with a
   narrow build..retire window, so scrolling past reveals them one at a time. Recurring
   motion inside a monotonic build front — no new uniform, no runtime geometry. */
{
  const roof = LV * H, base = PODIUM * H + 2, d = 7.5;
  const bx = CX + 5, bz = CZ + d;
  push('plan', [[bx-1.6, roof+0.4, bz-2.2], [bx+1.6, roof+0.4, bz-2.2]], 0.825);
  push('plan', [[bx, roof+0.4, bz-2.2], [bx, roof+2.6, bz-2.2]], 0.828);
  push('plan', [[bx, roof+2.6, bz-2.2], [bx, roof+2.4, bz+0.4]], 0.831);

  const N = 18, span = roof - base;
  for (let i = 0; i < N; i++) {
    const y = roof - span * (i / (N - 1));
    const b = MAINT0 + i * 0.0088, r = b + 0.012;   // still descending at front 1.0
    push('lit',  [[bx-1.4, y, bz], [bx+1.4, y, bz]], b, r);
    push('tick', [[bx-1.4, y, bz], [bx-1.4, y+0.8, bz]], b, r);
    push('tick', [[bx+1.4, y, bz], [bx+1.4, y+0.8, bz]], b, r);
    push('tick', [[bx-1.0, y+0.8, bz], [bx-1.0, roof+2.4, bz]], b, r);
    push('tick', [[bx+1.0, y+0.8, bz], [bx+1.0, roof+2.4, bz]], b, r);
  }
  [[-6.0, 0.880], [0.6, 0.906], [7.4, 0.932]].forEach(([ox, b]) => {
    const y = roof - span * 0.45;
    push('tick', [[CX+ox-0.5, y, bz], [CX+ox-0.5, roof, bz]], b, b + 0.034);
    push('tick', [[CX+ox+0.5, y, bz], [CX+ox+0.5, roof, bz]], b, b + 0.034);
    push('lit',  [[CX+ox-0.7, y, bz], [CX+ox+0.7, y, bz]], b + 0.002, b + 0.034);
  });
}

/* ── streams: arrive across the ground, then climb the core ── */
const N_STREAM = lowPower ? 6 : 11;
for (let i = 0; i < N_STREAM; i++) {
  const a2 = (i/N_STREAM)*Math.PI*2, lx = CX + Math.cos(a2)*3.4, lz = CZ + Math.sin(a2)*2.6;
  const off = (i/N_STREAM - 0.5) * 34, pts = [];
  for (let j = 0; j <= 52; j++) {
    const t = j/52;
    if (t < 0.45) { const e = t/0.45, sm = e*e*(3-2*e);
      pts.push([off + (lx-off)*sm, 0, ZF + (lz-ZF)*sm]); }
    else { const sm = (t-0.45)/0.55; pts.push([lx, sm*sm*(LV*H), lz]); }
  }
  push('stream', pts, 0.07 + i*0.014, OPERATE + 0.02);   // the site record ends at handover
}
// The record does not stop at handover — it changes character: fewer, slower, steadier,
// running to the last pixel of scroll.
for (let i = 0; i < 4; i++) {
  const a2 = (i/4)*Math.PI*2 + 0.7, lx = CX + Math.cos(a2)*3.2, lz = CZ + Math.sin(a2)*2.4, pts = [];
  for (let j = 0; j <= 40; j++) { const t = j/40; pts.push([lx, t*t*(LV*H), lz]); }
  push('slow', pts, OPERATE + i*0.012);
}

/* ══════════ 2. CAMERA MODES ═══════════════════════════════════════════════
   Zero rotation, always. The vanishing point is SET by principal-point offset, not
   solved, so it is invariant under camera translation — which is what lets the
   camera travel the whole page without the composition drifting. The VP sits right
   so the site recedes into the empty half and the type keeps the left. */
const MODES = {
  WIDE:   { fov: 38, fx: 0.70, fy: 0.54, y0: 11, y1: 46, z0: 46, z1: 128 },
  ULTRA:  { fov: 30, fx: 0.68, fy: 0.54, y0: 12, y1: 50, z0: 54, z1: 150 },
  TABLET: { fov: 42, fx: 0.62, fy: 0.54, y0: 11, y1: 44, z0: 50, z1: 132 },
  TALL:   { fov: 50, fx: 0.54, fy: 0.56, y0: 10, y1: 40, z0: 46, z1: 124 },
};
function modeFor(aspect) {
  if (aspect >= 2.10) return MODES.ULTRA;
  if (aspect >= 1.30) return MODES.WIDE;
  if (aspect >= 0.85) return MODES.TABLET;
  return MODES.TALL;
}
const FOG_NEAR = 90, FOG_FAR = 340, MIN_PX = 1.15, NEAR_CULL = 2.0;

/* ══════════ 3. LINE CLASSES ═══════════════════════════════════════════════ */
const CLASSES = {
  stream: { color: '#2E38FF', alpha: 0.68, radius: 0.017, near: 0.16, far: 0.88, heat: 0.85 },
  // near/far are fractions of CURVE LENGTH: 0.22 on a 31-unit tower edge faded 42% of
  // it away, which is why the skyline was present in the buffer but invisible on screen.
  city:   { color: '#4A5599', alpha: 0.88, radius: 0.021, near: 0.05, far: 0.97, heat: 0 },
  slow:   { color: '#2E38FF', alpha: 0.52, radius: 0.016, near: 0.20, far: 0.90, heat: 0.55 },
  lit:    { color: '#FFFFFF', alpha: 1.00, radius: 0.015, near: 0.30, far: 0.94, heat: 1.15 },
  plan:   { color: '#F7F9FA', alpha: 0.88, radius: 0.017, near: 0.28, far: 0.94, heat: 0 },
  tick:   { color: '#DDE2F2', alpha: 0.48, radius: 0.012, near: 0.30, far: 0.96, heat: 0 },
  frame:  { color: '#7A84D8', alpha: 0.70, radius: 0.016, near: 0.26, far: 0.94, heat: 0 },
  set:    { color: '#9AA0FF', alpha: 0.58, radius: 0.015, near: 0.26, far: 0.94, heat: 0 },
  grid:   { color: '#5A63A8', alpha: 0.46, radius: 0.018, near: 0.30, far: 0.96, heat: 0 },
};

class PolylineCurve extends THREE.Curve {
  constructor(points) {
    super();
    this.pts = points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    this.arcLengthDivisions = Math.max(200, this.pts.length * 4);
  }
  getPoint(t, target = new THREE.Vector3()) {
    const n = this.pts.length - 1;
    const i = Math.min(n - 1, Math.floor(t * n));
    return target.copy(this.pts[i]).lerp(this.pts[i + 1], (t - i / n) * n);
  }
}

/* ══════════ 4. SHADERS ════════════════════════════════════════════════════ */

const LINE_VERT = /* glsl */`
uniform float uViewportH, uTanHalfFov, uMinPx;
attribute vec3 aColor; attribute vec4 aWave; attribute vec2 aFade, aSeq;
attribute float aRadius, aFar, aBuild;
varying vec3 vColor; varying vec4 vWave; varying vec2 vFade, vSeq;
varying float vDepth, vWidthFade, vFar, vBuild; varying vec2 vUvL;
void main(){
  vUvL = uv; vColor = aColor; vWave = aWave; vFade = aFade; vFar = aFar;
  vBuild = aBuild; vSeq = aSeq;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vDepth = -mv.z;
  // Constant screen weight: a hairline stays a hairline at every distance and loses
  // DENSITY, not WIDTH — plotted-line behaviour, the opposite of a 3D tube.
  float pxPerUnit = uViewportH / (2.0 * vDepth * uTanHalfFov);
  float wantR = max(aRadius, uMinPx / (2.0 * pxPerUnit));
  mv.xyz += normalize(normalMatrix * normal) * (wantR - aRadius);
  vWidthFade = aRadius / wantR;
  gl_Position = projectionMatrix * mv;
}`;

const LINE_FRAG = /* glsl */`
uniform float uTime, uBuild, uGlobalAlpha, uFogNear, uFogFar, uNearCull;
uniform vec2 uResolution, uMaskStops;
varying vec3 vColor; varying vec4 vWave; varying vec2 vFade, vSeq;
varying float vDepth, vWidthFade, vFar, vBuild; varying vec2 vUvL;
void main(){
  // THE BUILD FRONT — the entire 13-phase sequence is this one comparison. A member
  // exists only once the front has passed the point it is placed at.
  // v8's hero is ONE viewport of a 17,000px page, so uBuild there is ~0 — and at 0 the
  // only thing placed is an empty lot. Correct for /v7, wrong for a marketing hero that
  // has to land immediately. Starting the front at 0.24 opens on a podium, eight levels
  // of frame and the crane already up; nothing is skipped, those phases are simply
  // already PLACED rather than animating in.
  float front = uBuild * 0.76 + 0.24;
  float born = smoothstep(vBuild, vBuild + 0.03, front);
  if (born <= 0.001) discard;
  float ink = 1.0 + 2.2 * exp(-pow((front - vBuild) * 26.0, 2.0));   // placed just now
  // Temporary works LEAVE; the construction layer recedes once the building is in use.
  float gone = (vSeq.x > 0.0) ? 1.0 - smoothstep(vSeq.x, vSeq.x + 0.045, front) : 1.0;
  float late = 1.0 - vSeq.y * smoothstep(0.86, 0.97, front);

  float phase = vUvL.x * vWave.x - uTime * vWave.y + vWave.z;
  float pulse = smoothstep(-0.5, 0.5, sin(phase)) * step(0.5, vWave.y);
  float statMod = mix(0.78 + 0.22 * sin(vUvL.x * vWave.x * 0.5 + vWave.z), 1.0, step(0.5, vWave.y));

  float fogF  = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
  float nearF = smoothstep(uNearCull, uNearCull + 9.0, vDepth);
  float hide  = smoothstep(0.0, vFade.y, vUvL.x) * smoothstep(1.0, vFar, vUvL.x);

  float sy = 1.0 - (gl_FragCoord.y / uResolution.y);
  float mask = 1.0 - 0.30 * smoothstep(uMaskStops.x, uMaskStops.y, sy);

  // ADDITIVE crest, never mix(c, c*3, p): #2E38FF is linear (0.027,0.040,1.000) with
  // blue already clipped, so a multiply lands BELOW the bloom threshold and the glow
  // stops firing altogether.
  vec3 col = vColor * ink + pulse * vWave.w;
  float a = vFade.x * hide * fogF * nearF * vWidthFade * statMod * mask
          * born * gone * late * uGlobalAlpha;
  gl_FragColor = vec4(col, a);   // fog lives in alpha; doubling it squared the falloff
}`;

const COMPOSITE = {
  uniforms: {
    tDiffuse: { value: null }, uAspect: { value: 1 }, uTime: { value: 0 },
    uG1: { value: new THREE.Vector2(0.66, 0.52) },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */`
uniform sampler2D tDiffuse; uniform float uAspect, uTime; uniform vec2 uG1; varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453123); }
float sIO(float t){ return -0.5 * (cos(3.14159265 * t) - 1.0); }
void main(){
  vec4 c = texture2D(tDiffuse, vUv);
  c.rgb += vec3(0.0180,0.0245,0.2100) * sIO(clamp(1.0 - distance(uG1, vUv) * 1.02, 0.0, 1.0)) * 0.60;
  c.rgb += vec3(0.0320,0.0420,0.3400) * sIO(clamp(1.0 - distance(uG1, vUv) * 0.24, 0.0, 1.0)) * 0.42;
  c.rgb *= mix(1.0, 0.62, smoothstep(0.26, 0.0, vUv.y) * 0.88);
  c.rgb *= mix(1.0, smoothstep(0.95, 0.26, length((vUv - 0.5) * vec2(uAspect, 1.0))), 0.52);
  // Majority-STATIC grain — what makes a frame read as a printed sheet, not a render.
  float tq = floor(uTime * 12.0) / 12.0;
  c.rgb += (hash(gl_FragCoord.xy + tq * 91.7) - 0.5) * 0.013
         + (hash(gl_FragCoord.xy * 1.7) - 0.5) * 0.017;
  gl_FragColor = c;
}`,
};

/* ══════════ 5. BUILD ══════════════════════════════════════════════════════ */

function buildScene(mode) {
  const geos = [];
  const radial = lowPower ? 3 : 5;
  let animated = 0;

  items.forEach((it, idx) => {
    const C = CLASSES[it.cls];
    const curve = new PolylineCurve(it.pts);
    const len = curve.getLength();
    if (!(len > 0.01)) return;

    const tubular = (it.cls === 'stream' || it.cls === 'slow')
      ? Math.min(lowPower ? 120 : 260, Math.max(24, Math.round(len * 1.1)))
      : Math.max(2, Math.min(40, Math.round(len / 2.5)));

    const g = new THREE.TubeGeometry(curve, tubular, C.radius, radial, false);
    const n = g.attributes.position.count;
    const col = new THREE.Color(C.color);
    const speed = it.cls === 'stream' ? 1 : (it.cls === 'slow' ? 0.38 : 0);
    if (speed) animated++;
    const uSize = 2 * Math.PI * len / 17.0;
    const phase = idx * 2.399963;                 // golden angle — else everything crests in unison
    // End-fades are fractions of CURVE LENGTH; convert each to the world distance it
    // was tuned to mean, or a long stream fades out across the whole visible band.
    const nearFrac = Math.min(0.42, C.near * 60 / len);
    const farFrac  = Math.max(0.58, 1 - (1 - C.far) * 60 / len);

    const put = (name, size, fn) => {
      const arr = new Float32Array(n * size);
      for (let v = 0; v < n; v++) fn(arr, v * size);
      g.setAttribute(name, new THREE.BufferAttribute(arr, size));
    };
    put('aColor', 3, (a,o) => { a[o]=col.r; a[o+1]=col.g; a[o+2]=col.b; });
    put('aWave', 4, (a,o) => { a[o]=uSize; a[o+1]=speed; a[o+2]=phase; a[o+3]=C.heat; });
    put('aFade', 2, (a,o) => { a[o]=C.alpha; a[o+1]=nearFrac; });
    put('aSeq', 2, (a,o) => { a[o]=it.retire||0; a[o+1]=it.late||0; });
    put('aRadius', 1, (a,o) => { a[o]=C.radius; });
    put('aFar', 1, (a,o) => { a[o]=farFrac; });
    put('aBuild', 1, (a,o) => { a[o]=it.build; });
    geos.push(g);
  });

  const merged = mergeGeometries(geos, false);
  geos.forEach(g => g.dispose());

  const material = new THREE.ShaderMaterial({
    vertexShader: LINE_VERT, fragmentShader: LINE_FRAG,
    transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.AdditiveBlending,
    // fog:false is deliberate — the three.js chunk mixes toward fogColor, which under
    // additive blending BRIGHTENS distant geometry, the inverse of a depth cue.
    fog: false,
    uniforms: {
      uTime: { value: 0 }, uBuild: { value: 0 }, uGlobalAlpha: { value: 1 },
      uFogNear: { value: FOG_NEAR }, uFogFar: { value: FOG_FAR }, uNearCull: { value: NEAR_CULL },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uMaskStops: { value: new THREE.Vector2(0.62, 0.90) },
      uViewportH: { value: 1 }, uTanHalfFov: { value: Math.tan(mode.fov * Math.PI / 360) },
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
  camera = new THREE.PerspectiveCamera(mode.fov, aspect0, 0.5, 520);   // far must clear FOG_FAR
  camera.position.set(0, mode.y0, mode.z0);
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
      if (built) built.material.uniforms.uTanHalfFov.value = Math.tan(m.fov * Math.PI / 360);
    }
    camera.aspect = w / h;
    // MANDATORY on every resize, or the vanishing point drifts as the window changes.
    camera.setViewOffset(w, h, w * (0.5 - mode.fx), h * (0.5 - mode.fy), w, h);
    camera.updateProjectionMatrix();
    compositePass.uniforms.uG1.value.set(mode === MODES.TALL ? 0.56 : 0.66, 0.52);
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
    scrollP += (Math.min(1, Math.max(0, y / docScroll)) - scrollP) * 0.075;  // damped
    // Scroll drives the BUILD FRONT, not a dolly: page top is an empty lot, page bottom
    // is a building in use. The camera rises and pulls back just enough to keep the
    // growing tower framed — translation only, so the vanishing point cannot drift.
    if (built) built.material.uniforms.uBuild.value = scrollP;
    const drift = 0.3 * Math.sin(t * Math.PI * 2 / 26);
    camera.position.set(ptr.x, mode.y0 + scrollP * (mode.y1 - mode.y0) + ptr.y,
                        mode.z0 + scrollP * (mode.z1 - mode.z0) + drift);

    // Past the hero the page is dense with type, so the scene steps back rather than
    // competing with it. Ramp over the first viewport-height of scroll.
    if (built) {
      const past = Math.min(1, y / Math.max(1, window.innerHeight * 0.9));
      built.material.uniforms.uGlobalAlpha.value = 1 - 0.34 * past;
      // Only touch the DOM when the value actually moves — a style write every frame
      // invalidates layout for everything that reads after it.
      const sv = Math.round(past * 300) / 1000;
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
      built = buildScene(mode);
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
