import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

// ───────────────────────────────────────────────────────────────────────────
// Body-composition ("build") detector for the optional photo feature.
//
// WHY THIS WORKS WHERE THE OLD ONE FAILED
// The previous version read only skeleton JOINT positions (leg:torso ratio,
// joint-to-joint girth). Joints lie on the body centerline, so they encode
// height/proportions but almost nothing about fatness — an obese and a thin
// baby looked identical. Here we additionally use MediaPipe's SEGMENTATION
// MASK to measure real limb/torso THICKNESS, then normalize each thickness by
// its own bony segment LENGTH (thigh thickness ÷ thigh length, etc.). That
// ratio is scale-invariant (independent of how big the baby looks in frame)
// and pose-invariant (works standing, sitting, or lying), because it is a
// purely local measurement along each limb.
// ───────────────────────────────────────────────────────────────────────────

// BlazePose 33-landmark indices we use.
const L = {
  nose: 0,
  lShoulder: 11,
  rShoulder: 12,
  lElbow: 13,
  rElbow: 14,
  lWrist: 15,
  rWrist: 16,
  lHip: 23,
  rHip: 24,
  lKnee: 25,
  rKnee: 26,
  lAnkle: 27,
  rAnkle: 28,
};

const VIS = 0.5; // min landmark visibility to trust a segment

// Per-metric "normal" centre (mid) and scale. `adiposity` for a metric =
// clamp((ratio - mid) / scale, -1, +1): negative = thinner than typical,
// positive = chunkier. These are anthropometric estimates for toddlers and
// are deliberately exposed/raw in the UI so they can be field-calibrated.
interface MetricDef {
  mid: number;
  scale: number;
  weight: number;
}
// Mids are the projected width÷length ratio of a typically-built toddler limb,
// estimated from anthropometry (e.g. thigh circumference ≈25 cm ⇒ diameter
// ≈8 cm over a ≈17 cm hip→knee ⇒ ~0.47). `scale` sets how far from the mid
// counts as fully thin/fat. Tune these against labeled photos for production.
const METRICS: Record<string, MetricDef> = {
  thigh: { mid: 0.47, scale: 0.16, weight: 1.0 },
  upperArm: { mid: 0.4, scale: 0.14, weight: 0.9 },
  waist: { mid: 0.7, scale: 0.22, weight: 0.95 },
  forearm: { mid: 0.4, scale: 0.14, weight: 0.5 },
  shin: { mid: 0.38, scale: 0.14, weight: 0.5 },
};

export type BuildCategory = "Kurus" | "Normal" | "Gemuk";
export type PoseType = "berdiri" | "duduk" | "berbaring" | "tidak jelas";

export interface SegmentMeasure {
  key: string;
  label: string;
  ratio: number; // thickness / length
  adiposity: number; // -1..+1
}

export interface PhotoAnalysis {
  ok: boolean;
  reason?: string;
  landmarks?: NormalizedLandmark[];
  maskBitmap?: ImageData; // body silhouette for overlay
  imageWidth: number;
  imageHeight: number;
  build: BuildCategory;
  adiposity: number; // -1 (sangat kurus) .. +1 (sangat gemuk)
  confidence: number; // 0..1 detection quality
  poseType: PoseType;
  segments: SegmentMeasure[];
  coverage: number; // fraction of frame that is body
}

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

/** Lazy singleton — loads WASM + the 9 MB pose model once, on first use. */
export async function getPoseLandmarker(baseUrl: string): Promise<PoseLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks(`${baseUrl}mediapipe/wasm`);
      const make = (delegate: "GPU" | "CPU") =>
        PoseLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: `${baseUrl}mediapipe/pose_landmarker_full.task`,
            delegate,
          },
          runningMode: "IMAGE",
          numPoses: 1,
          minPoseDetectionConfidence: 0.4,
          minPosePresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
          outputSegmentationMasks: true,
        });
      try {
        return await make("GPU");
      } catch {
        return await make("CPU");
      }
    })();
  }
  return landmarkerPromise;
}

// ── geometry helpers ───────────────────────────────────────────────────────
type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const mid = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const lerp = (a: Pt, b: Pt, t: number): Pt => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const median = (xs: number[]) => {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Scan the binary body mask outward from (cx,cy) along ±(nx,ny) and return the
 * total contiguous body width (in mask px). Bridges 1px mask holes; if the
 * centre is just off-body, nudges a few px to find the limb first.
 */
function scanWidth(
  body: (x: number, y: number) => boolean,
  cx: number,
  cy: number,
  nx: number,
  ny: number,
  maxScan: number
): number {
  // recover if centre landed off the silhouette
  if (!body(cx, cy)) {
    let found = false;
    for (let s = 1; s <= 6 && !found; s++) {
      for (const dir of [1, -1]) {
        const x = cx + nx * s * dir;
        const y = cy + ny * s * dir;
        if (body(x, y)) {
          cx = x;
          cy = y;
          found = true;
          break;
        }
      }
    }
    if (!found) return 0;
  }
  const run = (sign: number) => {
    let count = 0;
    let gap = 0;
    for (let s = 1; s <= maxScan; s++) {
      const x = cx + nx * s * sign;
      const y = cy + ny * s * sign;
      if (body(x, y)) {
        count += gap + 1;
        gap = 0;
      } else {
        gap++;
        if (gap > 2) break;
      }
    }
    return count;
  };
  // Use 2×min(left,right) rather than the sum: for a roughly centred limb this
  // is the true width, and if one side's silhouette merges with the torso or
  // another limb (arms-down photos), `min` ignores the inflated side.
  return 2 * Math.min(run(1), run(-1)) + 1;
}

function classifyPose(lm: NormalizedLandmark[], w: number, h: number): PoseType {
  const sh = mid({ x: lm[L.lShoulder].x * w, y: lm[L.lShoulder].y * h }, { x: lm[L.rShoulder].x * w, y: lm[L.rShoulder].y * h });
  const hip = mid({ x: lm[L.lHip].x * w, y: lm[L.lHip].y * h }, { x: lm[L.rHip].x * w, y: lm[L.rHip].y * h });
  const dx = Math.abs(sh.x - hip.x);
  const dy = Math.abs(sh.y - hip.y);
  if (dx > dy * 1.2) return "berbaring"; // torso roughly horizontal
  // torso vertical → standing vs sitting from knee/hip vertical gap
  const knee = mid({ x: lm[L.lKnee].x * w, y: lm[L.lKnee].y * h }, { x: lm[L.rKnee].x * w, y: lm[L.rKnee].y * h });
  const ankle = mid({ x: lm[L.lAnkle].x * w, y: lm[L.lAnkle].y * h }, { x: lm[L.rAnkle].x * w, y: lm[L.rAnkle].y * h });
  const torsoLen = dist(sh, hip) || 1;
  const legDrop = (ankle.y - hip.y) / torsoLen; // how far legs extend below hips
  if (Number.isFinite(legDrop) && legDrop > 1.4) return "berdiri";
  if (knee.y < hip.y + torsoLen * 0.3) return "duduk";
  return legDrop > 0.9 ? "berdiri" : "duduk";
}

export type BodyMask = (x: number, y: number) => boolean;

export interface BuildMeasurement {
  segments: SegmentMeasure[];
  adiposity: number;
  build: BuildCategory;
  valid: boolean;
}

/**
 * Pure build estimator: given pose landmarks and a body-silhouette predicate,
 * measure each limb/torso thickness ÷ its bony length, map to per-metric
 * adiposity, and aggregate. No DOM/MediaPipe dependency, so it is unit-tested
 * directly in Node (see scripts/test-build.mjs).
 */
export function measureBuild(
  lm: NormalizedLandmark[],
  body: BodyMask,
  maskW: number,
  maskH: number
): BuildMeasurement {
  const P = (i: number): Pt => ({ x: lm[i].x * maskW, y: lm[i].y * maskH });
  const visible = (i: number) => (lm[i]?.visibility ?? 0) > VIS;

  const segDefs: { key: string; label: string; a: number; b: number }[] = [
    { key: "thigh", label: "Paha", a: L.lHip, b: L.lKnee },
    { key: "thigh", label: "Paha", a: L.rHip, b: L.rKnee },
    { key: "upperArm", label: "Lengan atas", a: L.lShoulder, b: L.lElbow },
    { key: "upperArm", label: "Lengan atas", a: L.rShoulder, b: L.rElbow },
    { key: "forearm", label: "Lengan bawah", a: L.lElbow, b: L.lWrist },
    { key: "forearm", label: "Lengan bawah", a: L.rElbow, b: L.rWrist },
    { key: "shin", label: "Betis", a: L.lKnee, b: L.lAnkle },
    { key: "shin", label: "Betis", a: L.rKnee, b: L.rAnkle },
  ];

  const perKey = new Map<string, { label: string; ratios: number[] }>();
  const diag = Math.hypot(maskW, maskH);
  for (const s of segDefs) {
    if (!visible(s.a) || !visible(s.b)) continue;
    const p1 = P(s.a);
    const p2 = P(s.b);
    const len = dist(p1, p2);
    if (len < diag * 0.04) continue;
    const dx = (p2.x - p1.x) / len;
    const dy = (p2.y - p1.y) / len;
    const nx = -dy;
    const ny = dx;
    const widths: number[] = [];
    for (const t of [0.4, 0.5, 0.6]) {
      const c = lerp(p1, p2, t);
      const wpx = scanWidth(body, c.x, c.y, nx, ny, len * 1.4);
      if (wpx > 0) widths.push(wpx);
    }
    const thick = median(widths);
    if (!Number.isFinite(thick) || thick <= 0) continue;
    const ratio = thick / len;
    if (!perKey.has(s.key)) perKey.set(s.key, { label: s.label, ratios: [] });
    perKey.get(s.key)!.ratios.push(ratio);
  }

  if (visible(L.lShoulder) && visible(L.rShoulder) && visible(L.lHip) && visible(L.rHip)) {
    const sh = mid(P(L.lShoulder), P(L.rShoulder));
    const hip = mid(P(L.lHip), P(L.rHip));
    const torsoLen = dist(sh, hip);
    if (torsoLen > diag * 0.05) {
      const dx = (hip.x - sh.x) / torsoLen;
      const dy = (hip.y - sh.y) / torsoLen;
      const nx = -dy;
      const ny = dx;
      const widths: number[] = [];
      for (const t of [0.75, 0.9, 1.05]) {
        const c = lerp(sh, hip, t);
        const wpx = scanWidth(body, c.x, c.y, nx, ny, torsoLen * 1.6);
        if (wpx > 0) widths.push(wpx);
      }
      const thick = median(widths);
      if (Number.isFinite(thick) && thick > 0) {
        perKey.set("waist", { label: "Perut/torso", ratios: [thick / torsoLen] });
      }
    }
  }

  const segments: SegmentMeasure[] = [];
  let wsum = 0;
  let asum = 0;
  for (const [key, { label, ratios }] of perKey) {
    const def = METRICS[key];
    if (!def || ratios.length === 0) continue;
    const ratio = median(ratios);
    const adip = Math.max(-1, Math.min(1, (ratio - def.mid) / def.scale));
    segments.push({ key, label, ratio, adiposity: adip });
    asum += adip * def.weight;
    wsum += def.weight;
  }

  if (wsum === 0) return { segments: [], adiposity: 0, build: "Normal", valid: false };
  const adiposity = asum / wsum;
  const build: BuildCategory =
    adiposity >= 0.3 ? "Gemuk" : adiposity <= -0.3 ? "Kurus" : "Normal";
  return { segments, adiposity, build, valid: true };
}

/**
 * Analyze a still image (or a frame drawn into a canvas) and estimate build.
 */
export async function analyzePhoto(
  landmarker: PoseLandmarker,
  source: HTMLImageElement | HTMLCanvasElement,
  imageWidth: number,
  imageHeight: number
): Promise<PhotoAnalysis> {
  let result: PoseLandmarkerResult;
  try {
    result = landmarker.detect(source);
  } catch (e) {
    return emptyResult(imageWidth, imageHeight, "Gagal memproses gambar.");
  }
  const lm = result.landmarks?.[0];
  if (!lm) {
    return emptyResult(imageWidth, imageHeight, "Tubuh anak tidak terdeteksi. Gunakan foto seluruh/sebagian besar badan dengan pencahayaan baik.");
  }

  // Build the binary body lookup from the segmentation mask.
  const mask = result.segmentationMasks?.[0];
  let body: (x: number, y: number) => boolean;
  let maskW = imageWidth;
  let maskH = imageHeight;
  let coverage = 0;
  let maskImage: ImageData | undefined;
  if (mask) {
    maskW = mask.width;
    maskH = mask.height;
    const data = mask.getAsFloat32Array();
    let on = 0;
    const rgba = new Uint8ClampedArray(maskW * maskH * 4);
    for (let i = 0; i < data.length; i++) {
      const v = data[i] > 0.5;
      if (v) {
        on++;
        rgba[i * 4] = 16;
        rgba[i * 4 + 1] = 185;
        rgba[i * 4 + 2] = 129;
        rgba[i * 4 + 3] = 90;
      }
    }
    coverage = on / (maskW * maskH);
    maskImage = new ImageData(rgba, maskW, maskH);
    body = (x, y) => {
      const xi = x | 0;
      const yi = y | 0;
      if (xi < 0 || yi < 0 || xi >= maskW || yi >= maskH) return false;
      return data[yi * maskW + xi] > 0.5;
    };
    mask.close();
  } else {
    body = () => false;
  }

  // Measure build from landmarks + mask (pure, unit-tested in Node).
  const m = measureBuild(lm, body, maskW, maskH);
  if (!m.valid) {
    return {
      ...emptyResult(imageWidth, imageHeight, "Anggota tubuh tidak cukup terlihat untuk menilai proporsi. Coba foto yang menampilkan lengan & kaki."),
      landmarks: lm,
      maskBitmap: maskImage,
      coverage,
    };
  }
  const { segments, adiposity, build } = m;

  // Confidence: blend of (#segments measured), mean landmark visibility, and
  // body coverage in frame.
  const meanVis =
    [L.lShoulder, L.rShoulder, L.lHip, L.rHip, L.lKnee, L.rKnee, L.lElbow, L.rElbow]
      .map((i) => lm[i]?.visibility ?? 0)
      .reduce((a, b) => a + b, 0) / 8;
  const segScore = Math.min(1, segments.length / 4);
  const covScore = Math.min(1, coverage / 0.12);
  const confidence = Math.max(0, Math.min(1, 0.5 * meanVis + 0.3 * segScore + 0.2 * covScore));

  return {
    ok: true,
    landmarks: lm,
    maskBitmap: maskImage,
    imageWidth,
    imageHeight,
    build,
    adiposity,
    confidence,
    poseType: classifyPose(lm, maskW, maskH),
    segments,
    coverage,
  };
}

function emptyResult(w: number, h: number, reason: string): PhotoAnalysis {
  return {
    ok: false,
    reason,
    imageWidth: w,
    imageHeight: h,
    build: "Normal",
    adiposity: 0,
    confidence: 0,
    poseType: "tidak jelas",
    segments: [],
    coverage: 0,
  };
}

// Skeleton connections for the overlay.
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28],
];
