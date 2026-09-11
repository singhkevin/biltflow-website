// datum.js — verification harness for /v6 hero "Topping Out (Section Datum)"
// Zero camera rotation + setViewOffset principal-point offset.
// Run: node datum.js
'use strict';

/* ─── PRNG (full body, inlined) ─────────────────────────────────────── */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const SEED = 0x81174F10;
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const cl=(x,a,b)=>Math.min(b,Math.max(a,x));

/* ─── CORE ARMATURE ─────────────────────────────────────────────────── */
const HW=4.5, HH=3.0, GAP=3.15, LEVELS=288, Z0=4.0;
// Silhouette events are held PROPORTIONAL to the tower, not pinned to absolute levels:
// L14 of 32 is 44% up; L14 of 288 would be 5% and the setback would vanish off the bottom.
const SB0=LEVELS*0.44, SB1=LEVELS*0.48, LSC=LEVELS/32;
const zOf = k => Z0 - k*GAP;                       // L0 z=+4.0 ... L31 z=-93.65
const hw  = kf => HW*(1.0 - 0.14*ss(SB0,SB1,kf));  // podium->tower X setback
const leanX = kf => 0.62*LSC*Math.pow(kf/(LEVELS-1),1.25);  // LSC keeps the lean RATE constant
const leanY = kf => -0.34*LSC*(kf/(LEVELS-1));

// 6-vertex L-plan: rectangle with a re-entrant notch at the NE corner.
// The notch RE-CUTS across the same L14 band that the X setback happens in.
function planVerts(kf){
  const s = ss(SB0,SB1,kf);
  const nu = 0.36 + 0.26*s;      // notch return moves outboard
  const nv = 0.18 - 0.40*s;      // notch soffit drops
  return [[-1.00,-1.00],[1.00,-1.00],[1.00,nv],[nu,nv],[nu,1.00],[-1.00,1.00]];
}
const toWorld = (u,v,kf) => [ u*hw(kf)+leanX(kf), v*HH+leanY(kf), zOf(kf) ];

/* ─── LANES: real service positions on that plan ────────────────────── */
// [u, v, tangent-axis]  tangent 0 = slide in X (horizontal wall), 1 = slide in Y (vertical wall)
const LANES=[
  [-1.00,-0.55,1],  // 0 west wall, lift 1
  [-1.00, 0.55,1],  // 1 west wall, lift 2
  [-0.42, 1.00,0],  // 2 north wall, corridor face
  [ 0.36, 0.62,1],  // 3 notch return, stair lobby face
  [ 1.00,-0.30,1],  // 4 east wall, riser bundle
  [ 0.30,-1.00,0],  // 5 south wall, hydraulic riser
  [-0.55,-1.00,0],  // 6 south wall, comms riser
];
const NL = LANES.length;
function stationAt(l,kf){
  const L=LANES[l];
  // lane 3 rides the notch return, which moves with the setback
  const u = (l===3) ? planVerts(kf)[3][0] : L[0];
  return toWorld(u, L[1], kf);
}
const tangent = l => LANES[l][2]===0 ? [1,0] : [0,1];

/* ─── CLASS A: STREAMS ──────────────────────────────────────────────── */
// SUB drops 6->2: at 288 levels, 6 samples/level is 1728 points per stream for no visible
// gain — one sample per 1.6 world units is already smoother than the tube can resolve.
const SUB=2, TRANS=6.0, OFF=2.60;
function makeStream(i,R){
  const kStart=(i<14)?R()*1.8:(3.0+R()*8.0)*LSC, kEnd=LEVELS-1-R()*1.0*LSC;
  let lane=i%NL; const sched=[{k:kStart,lane}];
  let k=kStart+(2.4+R()*2.6)*LSC;
  while(k<kEnd-1.8*LSC){
    lane=((lane+[-2,-1,-1,1,1,2][(R()*6)|0])%NL+NL)%NL;
    sched.push({k,lane}); k+=9.0+R()*8.0;   // absolute, not scaled: ~25 transfers over the run
  }
  sched.push({k:kEnd,lane});
  const off = 2*(((i+0.5)*0.61803398875)%1)-1;  // stratified, not R(): keeps streams apart
  R();
  return {kStart,kEnd,sched,off,seed:R()};
}
function sampleStream(st){
  const pts=[], n=Math.ceil((st.kEnd-st.kStart)*SUB);
  for(let j=0;j<=n;j++){
    const kf=st.kStart+(st.kEnd-st.kStart)*(j/n);
    let a=st.sched[0], b=st.sched[st.sched.length-1];
    for(let m=0;m<st.sched.length-1;m++)
      if(kf>=st.sched[m].k&&kf<=st.sched[m+1].k){a=st.sched[m];b=st.sched[m+1];break;}
    const w=ss(Math.max(a.k,b.k-TRANS),b.k,kf);
    const A=stationAt(a.lane,kf), B=stationAt(b.lane,kf);
    let x=A[0]+(B[0]-A[0])*w, y=A[1]+(B[1]-A[1])*w;
    const tA=tangent(a.lane), tB=tangent(b.lane);
    x+=(tA[0]+(tB[0]-tA[0])*w)*st.off*OFF;
    y+=(tA[1]+(tB[1]-tA[1])*w)*st.off*OFF;
    const p=st.seed*6.283;
    x+=Math.sin(kf*0.83+p)*0.20+Math.sin(kf*0.31+p*2.1)*0.12;
    y+=Math.cos(kf*0.71+p*1.7)*0.15;
    pts.push([x,y,zOf(kf)]);
  }
  return pts;
}

/* ─── CLASS B: LEVEL FRAGMENTS (arcs of the 6-gon perimeter) ────────── */
function perim(s,kf){
  const P=planVerts(kf).map(([u,v])=>toWorld(u,v,kf));
  const seg=[],n=P.length; let tot=0;
  for(let i=0;i<n;i++){const a=P[i],b=P[(i+1)%n];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push(L);tot+=L;}
  let d=(((s%1)+1)%1)*tot, i=0;
  while(d>seg[i]){d-=seg[i];i=(i+1)%n;}
  const a=P[i],b=P[(i+1)%n],t=d/seg[i];
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, zOf(kf)];
}
function buildLevels(R){
  const out=[];
  for(let k=2;k<LEVELS;k+=3){
    if(R()<0.30) continue;
    const n=1+((R()*2.4)|0);
    for(let f=0;f<n;f++){
      const s0=R(), len=0.10+R()*0.19, pts=[];
      for(let j=0;j<=14;j++) pts.push(perim(s0+len*(j/14),k));
      out.push(pts);
    }
  }
  return out;
}
/* ─── CLASS C: CORE EDGES (6, one per plan vertex) ──────────────────── */
function buildCoreEdges(){
  const out=[];
  for(let vi=0; vi<6; vi++){
    const pts=[];
    for(let j=0;j<=16;j++){
      const kf=(LEVELS-1)*(j/16);
      const V=planVerts(kf)[vi];
      pts.push(toWorld(V[0],V[1],kf));
    }
    out.push(pts);
  }
  return out;
}
/* ─── CLASS D: PARTITIONS (lift/stair division) ─────────────────────── */
function buildPartitions(R){
  const out=[];
  for(let k=1;k<LEVELS;k+=6){
    if(R()<0.35) continue;
    const u = k<14 ? 0.20 : -0.06, pts=[];
    for(let j=0;j<=6;j++) pts.push(toWorld(u, -1+2*(j/6), k));
    out.push(pts);
  }
  return out;
}
/* ─── CLASS E: ANNOTATION TICKS (white; the drafting layer) ─────────── */
// Short perpendicular ticks at lane stations + unit-module ticks on the
// north wall at the 3.4m apartment party-wall spacing.
const TICK=0.42, UNIT=3.4;
function buildTicks(R){
  const out=[];
  for(let k=3;k<LEVELS;k+=3){
    if(R()<0.34) continue;
    const n=1+((R()*1.9)|0);
    for(let f=0;f<n;f++){
      const l=(R()*NL)|0, S=stationAt(l,k), t=tangent(l);
      // tick runs PERPENDICULAR to the wall it annotates (into the plan)
      const px=-t[1], py=t[0];
      out.push([[S[0]-px*TICK*0.5,S[1]-py*TICK*0.5,S[2]],
                [S[0]+px*TICK*0.5,S[1]+py*TICK*0.5,S[2]]]);
    }
    if(R()<0.40){                       // unit-module pair on the north wall
      const W=hw(k), span=2*W, nUnits=Math.max(1,Math.round(span/UNIT));
      const j=1+((R()*Math.max(1,nUnits-1))|0), u=-1+2*(j/nUnits);
      const P=toWorld(u,1.0,k);
      out.push([[P[0],P[1]-TICK*0.5,P[2]],[P[0],P[1]+TICK*0.5,P[2]]]);
    }
  }
  return out;
}

/* ─── CAMERA: zero rotation + setViewOffset ─────────────────────────── */
// VP of every -Z-parallel line lands exactly at frame fraction (fx,fy).
//   offsetX = W*(0.5-fx)   offsetY = H*(0.5-fy)
//   ndc_new.x = ndc_old.x - 2*offsetX/W   ndc_new.y = ndc_old.y + 2*offsetY/H
function makeCam(cfg){
  const {eye,fovy,aspect,fx,fy}=cfg;
  const ty=Math.tan(fovy/2), tx=ty*aspect;
  const sx=2*(0.5-fx), sy=2*(0.5-fy);          // == 2*offsetX/W , 2*offsetY/H
  const proj=P=>{
    const d=eye[2]-P[2];
    if(d<=0.01) return null;
    return { x:((P[0]-eye[0])/(d*tx))-sx, y:((P[1]-eye[1])/(d*ty))+sy, depth:d };
  };
  return { proj, vp:{x:-sx,y:sy}, ty, tx };
}

/* ─── SHADER-SIDE ALPHA (must match the GLSL exactly) ───────────────── */
const FOG_NEAR=22, FOG_FAR=320, MINPX=1.15, NEAR_CULL=5.0;
// Co-linearity limit, in LEVELS. The original 1.2 was 3.8 world units against a ~100-unit
// visible depth (3.8%). Fog now reaches 320, so the same share of the frame is ~12 units,
// i.e. ~3.8 levels. Rescaled rather than relaxed — 1.2 here would be 3x STRICTER than the
// value the composition was actually tuned against.
const ADJ_MAX=3.8;
function alphaOf(u, depth, nf, ff, base, radius, viewH, ty, mask){
  const fog = 1-cl((depth-FOG_NEAR)/(FOG_FAR-FOG_NEAR),0,1);
  const hide = ss(0,nf,u)*ss(1.0,ff,u);
  const pxPerUnit = viewH/(2*depth*ty);
  const wantR = Math.max(radius, MINPX/(2*pxPerUnit));
  const widthFade = radius/wantR;              // pay for the width clamp in alpha
  const nearF = ss(NEAR_CULL, NEAR_CULL+11.0, depth);
  return base*hide*fog*nearF*widthFade*mask;
}

/* ─── PRE-BLOOM SCREEN-SPACE TYPE MASK (in the LINE fragment shader) ── */
// s = fragment position in 0..1 screen space. Attenuates the SOURCE, so no
// bloom halo can be born inside the band at all.
const MASK_LEAD=0.15, MASK_OVER=0.03, MASK_FLOOR=0.06;
function maskStops(bandY){const e=(1-bandY)*0.5;return[e-MASK_LEAD,e+MASK_OVER];}
function typeMask(ndcX, ndcY, cfg){
  const sy=(1-ndcY)*0.5;                       // 0 at top, 1 at bottom
  const [t0,t1]=maskStops(cfg.bandY);
  return 1.0 - (1.0-MASK_FLOOR)*ss(t0,t1,sy);
}

/* ─── RUN ───────────────────────────────────────────────────────────── */
function run(label,cfg){
  const {proj,vp,ty}=makeCam(cfg);
  const Ra=mulberry32(SEED);            // streams only (re-rolls consume this)
  const Rb=mulberry32(SEED ^ 0x9E3779B9);// static classes — stable across viewports
  const viewH=cfg.viewH;

  const track=(pts,nf,ff,base,radius)=>{
    const t=[];
    for(let j=0;j<pts.length;j++){
      const pr=proj(pts[j]);
      if(!pr){t.push(null);continue;}
      const m=typeMask(pr.x,pr.y,cfg);
      t.push({x:pr.x,y:pr.y,a:alphaOf(j/(pts.length-1),pr.depth,nf,ff,base,radius,viewH,ty,m)});
    }
    return t;
  };
  const adj=(A,B)=>{
    let r=0,best=0;const n=Math.min(A.length,B.length);
    for(let j=0;j<n;j++){const a=A[j],b=B[j];
      if(a&&b&&a.a>0.15&&b.a>0.15&&Math.hypot(a.x-b.x,a.y-b.y)<0.012){r++;best=Math.max(best,r);}else r=0;}
    return best/SUB;
  };

  const NF_STREAM=cfg.nearFade;
  const trk=[]; let rr=0;
  for(let i=0;i<cfg.nStream;i++){
    let tr;
    for(let att=0;att<14;att++){
      const st=makeStream(i,Ra);
      tr=track(sampleStream(st),NF_STREAM,0.86,1.0,0.022);
      if(trk.every(T=>adj(tr,T)<ADJ_MAX)) break;
      rr++;
    }
    trk.push(tr);
  }
  const byClass={stream:trk.slice(),level:[],edge:[],part:[],tick:[]};
  for(const p of buildLevels(Rb))     byClass.level.push(track(p,0.38,0.88,0.20,0.013));
  for(const p of buildCoreEdges())   byClass.edge .push(track(p,0.46,0.90,0.10,0.017));
  for(const p of buildPartitions(Rb)) byClass.part .push(track(p,0.38,0.88,0.16,0.011));
  for(const p of buildTicks(Rb))      byClass.tick .push(track(p,0.55,1.00,0.26,0.010));

  const all=[].concat(...Object.values(byClass));
  const S=[];
  for(const t of all) for(const s of t)
    if(s&&Math.abs(s.x)<=1&&Math.abs(s.y)<=1&&s.a>0.02) S.push(s);
  const T=S.reduce((a,s)=>a+s.a,0);
  const band=S.filter(s=>s.y<cfg.bandY), bA=band.reduce((a,s)=>a+s.a,0);
  const mx=Math.max(...S.map(s=>s.a));
  const hot=band.filter(s=>s.a>0.30*mx);
  let cx=0,cy=0; for(const s of S){cx+=s.x*s.a;cy+=s.y*s.a;} cx/=T; cy/=T;

  // bright-region bbox: samples above 25% of peak
  const bright=S.filter(s=>s.a>0.25*mx);
  const bb=bright.reduce((o,s)=>({x0:Math.min(o.x0,s.x),x1:Math.max(o.x1,s.x),
    y0:Math.min(o.y0,s.y),y1:Math.max(o.y1,s.y)}),{x0:9,x1:-9,y0:9,y1:-9});

  // convergence quad at the fog wall (L30)
  const q=planVerts(30).map(([u,v])=>proj(toWorld(u,v,30))).filter(Boolean);
  const qx=q.map(p=>p.x), qy=q.map(p=>p.y);

  let worst=0;
  for(let m=0;m<trk.length;m++) for(let n=m+1;n<trk.length;n++) worst=Math.max(worst,adj(trk[m],trk[n]));

  const counts=Object.entries(byClass).map(([k,v])=>`${k} ${v.length}`).join('  ');
  const tickBand=byClass.tick.flat().filter(s=>s&&Math.abs(s.x)<=1&&Math.abs(s.y)<=1&&s.y<cfg.bandY&&s.a>0.02);

  console.log(`\n── ${label}  aspect ${cfg.aspect.toFixed(3)} fov ${(cfg.fovy*180/Math.PI).toFixed(0)} ──`);
  const [mt,mb]=maskStops(cfg.bandY);
  console.log(`   mask stops (screen y) : ${mt.toFixed(3)} -> ${mb.toFixed(3)}  floor ${MASK_FLOOR}`);
  console.log(`   VP (ndc)              : ${vp.x.toFixed(3)}, ${vp.y.toFixed(3)}   [frame ${(cfg.fx*100).toFixed(0)}% , ${(cfg.fy*100).toFixed(0)}%]`);
  console.log(`   curves                : ${counts}  = ${all.length} total, ${rr} re-rolls`);
  console.log(`   TYPE BAND (y<${cfg.bandY})   : ${(100*bA/T).toFixed(2)}% of light | ${band.length} samples | ${hot.length} above 30% peak | ${tickBand.length} white ticks`);
  console.log(`   luminance centroid    : ${cx.toFixed(3)}, ${cy.toFixed(3)}`);
  console.log(`   bright bbox (>25%)    : x ${bb.x0.toFixed(2)}..${bb.x1.toFixed(2)}   y ${bb.y0.toFixed(2)}..${bb.y1.toFixed(2)}   (band edge ${cfg.bandY})`);
  console.log(`   convergence quad      : x ${Math.min(...qx).toFixed(3)}..${Math.max(...qx).toFixed(3)}  y ${Math.min(...qy).toFixed(3)}..${Math.max(...qy).toFixed(3)}  = ${(Math.max(...qx)-Math.min(...qx)).toFixed(3)} x ${(Math.max(...qy)-Math.min(...qy)).toFixed(3)} NDC`);
  console.log(`   worst adjacent run    : ${worst.toFixed(2)} levels`);
  const pass = (100*bA/T)<1.5 && hot.length<=12 && worst<ADJ_MAX && bb.y0>cfg.bandY;
  console.log(`   GATE                  : ${pass?'PASS':'*** FAIL ***'}`);
  return pass;
}

const D=Math.PI/180;
const WIDE  = {fovy:40*D, fx:0.63, fy:0.30, eye:[1.10,0.60,6.5], nearFade:0.18,
               bandY:-0.10, maskTop:0.50, maskBot:0.70, maskFloor:0.10, nStream:34};
const ULTRA = Object.assign({},WIDE,{fovy:26*D, fx:0.60, fy:0.32, eye:[1.35,0.60,8.0]});
const TAB   = Object.assign({},WIDE,{fovy:40*D, fx:0.60, fy:0.28, eye:[1.00,0.55,6.2],
               bandY:-0.10, maskTop:0.46, maskBot:0.66, nStream:26});
const TALL  = Object.assign({},WIDE,{fovy:44*D, fx:0.52, fy:0.22, eye:[0.70,0.40,5.6],
               bandY:-0.10, maskTop:0.34, maskBot:0.54, nStream:16});

let ok=true;
ok &= run('DESKTOP 1512x982', Object.assign({},WIDE, {aspect:1512/982, viewH:982}));
ok &= run('DESKTOP 1920x1080',Object.assign({},WIDE, {aspect:1920/1080,viewH:1080}));
ok &= run('LAPTOP  1440x800', Object.assign({},WIDE, {aspect:1440/800, viewH:800}));
ok &= run('ULTRAWIDE 3440x1440',Object.assign({},ULTRA,{aspect:3440/1440,viewH:1440}));
// 844x390 phone-landscape: viewport height < 520 -> still frame, scene never starts (see spec)
ok &= run('TABLET  834x1112', Object.assign({},TAB,  {aspect:834/1112, viewH:1112}));
ok &= run('PHONE   393x852',  Object.assign({},TALL, {aspect:393/852,  viewH:852}));
console.log(`\n${ok?'ALL GATES PASS':'*** ONE OR MORE GATES FAILED ***'}\n`);
