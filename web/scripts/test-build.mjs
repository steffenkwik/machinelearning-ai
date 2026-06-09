// Unit test for the build detector's MATH (the part that fixes the
// "obese & thin both read Normal" bug). MediaPipe needs a browser, so we
// can't run pose detection here — instead we feed measureBuild() synthetic
// landmarks + a synthetic body silhouette and confirm it discriminates
// thin vs normal vs obese, monotonically, in multiple poses.
//
// Run: node --experimental-strip-types scripts/test-build.mjs
import { measureBuild } from "../src/lib/pose.ts";

const W = 400;
const H = 560;

// A simple standing front-view skeleton in pixel coords.
const STAND = {
  11: [150, 140], 12: [250, 140], // shoulders
  13: [132, 232], 14: [268, 232], // elbows
  15: [122, 320], 16: [278, 320], // wrists
  23: [172, 300], 24: [228, 300], // hips
  25: [168, 412], 26: [232, 412], // knees
  27: [164, 512], 28: [236, 512], // ankles
  0: [200, 95],
};

// Segment list (joint pairs) and which "part" governs each limb's thickness.
const BONES = [
  [23, 25, "thigh"], [24, 26, "thigh"],
  [11, 13, "upperArm"], [12, 14, "upperArm"],
  [13, 15, "forearm"], [14, 16, "forearm"],
  [25, 27, "shin"], [26, 28, "shin"],
];

// target width÷length ratios per build (projected limb width)
const PROFILE = {
  thin: { thigh: 0.31, upperArm: 0.26, forearm: 0.27, shin: 0.25, torso: 0.5 },
  normal: { thigh: 0.47, upperArm: 0.4, forearm: 0.4, shin: 0.38, torso: 0.7 },
  obese: { thigh: 0.66, upperArm: 0.56, forearm: 0.55, shin: 0.54, torso: 0.96 },
};

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const distToSeg = (px, py, a, b) => {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const wx = px - a[0], wy = py - a[1];
  const c2 = vx * vx + vy * vy || 1;
  let t = (wx * vx + wy * vy) / c2;
  t = Math.max(0, Math.min(1, t));
  const cx = a[0] + t * vx, cy = a[1] + t * vy;
  return Math.hypot(px - cx, py - cy);
};

function makeBody(joints, profile) {
  // capsules around each bone with half-width = (ratio*length)/2
  const caps = BONES.map(([a, b, part]) => {
    const len = dist(joints[a], joints[b]);
    return { a: joints[a], b: joints[b], hw: (profile[part] * len) / 2 };
  });
  // torso slab between shoulder-mid and hip-mid
  const sh = [(joints[11][0] + joints[12][0]) / 2, (joints[11][1] + joints[12][1]) / 2];
  const hip = [(joints[23][0] + joints[24][0]) / 2, (joints[23][1] + joints[24][1]) / 2];
  const torsoLen = dist(sh, hip);
  caps.push({ a: sh, b: hip, hw: (profile.torso * torsoLen) / 2 });
  return (x, y) => caps.some((c) => distToSeg(x, y, c.a, c.b) <= c.hw);
}

function landmarks(joints) {
  const lm = [];
  for (let i = 0; i < 33; i++) {
    const j = joints[i];
    lm[i] = j ? { x: j[0] / W, y: j[1] / H, z: 0, visibility: 0.95 } : { x: 0, y: 0, z: 0, visibility: 0 };
  }
  return lm;
}

// rotate a skeleton 90° (lying down) about its centroid to test pose-invariance
function rotate(joints) {
  const out = {};
  const cx = 200, cy = 320;
  for (const k of Object.keys(joints)) {
    const [x, y] = joints[k];
    out[k] = [cx - (y - cy), cy + (x - cx)];
  }
  return out;
}

let pass = 0, fail = 0;
const check = (cond, msg) => { (cond ? pass++ : fail++); console.log(`${cond ? "✓" : "✗ FAIL"} ${msg}`); };

console.log("— Standing —");
const res = {};
for (const k of ["thin", "normal", "obese"]) {
  const lm = landmarks(STAND);
  const body = makeBody(STAND, PROFILE[k]);
  res[k] = measureBuild(lm, body, W, H);
  console.log(`  ${k.padEnd(7)} adiposity=${res[k].adiposity.toFixed(2)} build=${res[k].build} segments=${res[k].segments.length}`);
}
check(res.thin.build === "Kurus", "thin → Kurus");
check(res.normal.build === "Normal", "normal → Normal");
check(res.obese.build === "Gemuk", "obese → Gemuk");
check(res.thin.adiposity < res.normal.adiposity, "adiposity monotonic (thin<normal)");
check(res.normal.adiposity < res.obese.adiposity, "adiposity monotonic (normal<obese)");

console.log("— Lying down (rotated 90°) —");
const lj = rotate(STAND);
for (const k of ["thin", "obese"]) {
  const lm = landmarks(lj);
  const body = makeBody(lj, PROFILE[k]);
  const r = measureBuild(lm, body, W, H);
  console.log(`  ${k.padEnd(7)} adiposity=${r.adiposity.toFixed(2)} build=${r.build}`);
  check(r.build === (k === "thin" ? "Kurus" : "Gemuk"), `lying ${k} → ${k === "thin" ? "Kurus" : "Gemuk"} (pose-invariant)`);
}

console.log(`\n${fail === 0 ? "ALL PASS" : "FAILURES"}: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
