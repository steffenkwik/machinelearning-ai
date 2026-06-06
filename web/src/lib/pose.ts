/**
 * Experimental in-browser body-proportion analysis using MediaPipe Pose
 * Landmarker (BlazePose, 33 keypoints). Runs fully on-device.
 *
 * IMPORTANT (honesty / ethics): a single 2D photo CANNOT measure absolute
 * height, so this NEVER diagnoses stunting on its own. It only derives
 * scale-invariant PROPORTIONS (body:leg ratio, girth) as a weak auxiliary
 * signal — clearly labelled experimental in the UI, and fused with a strictly
 * capped weight on top of the real Random Forest output.
 *
 * References for visible/proportional signals & image-based malnutrition CV:
 *  - Facial/skeletal proportions in stunted children (PMC12384172, 2024)
 *  - Deep-learning malnutrition-from-image (iJOE 2024; Sci. Reports 2025)
 *  - Photo anthropometry needs a reference object (arXiv:2105.01688)
 */
import type { PoseLandmarker as PLType } from "@mediapipe/tasks-vision";

export type BuildClass = "Kurus" | "Normal" | "Gemuk / Berisi";

export interface PhotoSignal {
  ok: boolean;
  build: BuildClass;
  proportions: {
    legRatio: number; // lower-segment fraction of body (legLen / (legLen+torso))
    upperLowerRatio: number; // torso / leg  (higher = relatively short legs)
    widthRatio: number; // girth proxy (avg shoulder/hip width / torso)
  };
  concern: number; // -1..+1 ; + = leans toward undernutrition/short-leg signal
  quality: number; // 0..1 detection confidence (key landmark visibility)
  notes: string[];
  /** image-normalized [x,y] for drawing the skeleton overlay */
  points: { x: number; y: number; v: number }[];
}

let landmarkerPromise: Promise<PLType> | null = null;

async function getLandmarker(): Promise<PLType> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      return PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "/models/pose_landmarker_lite.task",
          delegate: "GPU",
        },
        runningMode: "IMAGE",
        numPoses: 1,
      });
    })().catch(async (e) => {
      // Fallback to CPU if GPU/WebGL is unavailable.
      console.warn("Pose GPU init failed, retrying on CPU", e);
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/mediapipe/wasm");
      return PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: "/models/pose_landmarker_lite.task",
          delegate: "CPU",
        },
        runningMode: "IMAGE",
        numPoses: 1,
      });
    });
  }
  return landmarkerPromise;
}

const dist = (a: any, b: any) =>
  Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
const mid = (a: any, b: any) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
  z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
});
const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

export async function analyzePhoto(image: HTMLImageElement | HTMLCanvasElement): Promise<PhotoSignal> {
  const landmarker = await getLandmarker();
  const res = landmarker.detect(image);

  const world = res.worldLandmarks?.[0];
  const img = res.landmarks?.[0];
  if (!world || !img) {
    return emptySignal(["Tidak terdeteksi tubuh pada foto. Pakai foto seluruh badan, berdiri tegak, latar polos."]);
  }

  // BlazePose indices
  const L = {
    nose: 0, lSh: 11, rSh: 12, lHip: 23, rHip: 24,
    lKnee: 25, rKnee: 26, lAnk: 27, rAnk: 28,
  };
  const vis = (i: number) => img[i]?.visibility ?? 0;
  const keyVis = [L.lSh, L.rSh, L.lHip, L.rHip, L.lAnk, L.rAnk].map(vis);
  const quality = clamp(keyVis.reduce((a, b) => a + b, 0) / keyVis.length, 0, 1);

  const notes: string[] = [];
  if (quality < 0.5) notes.push("⚠️ Sebagian tubuh tidak terlihat jelas — hasil proporsi kurang akurat.");

  const midShoulder = mid(world[L.lSh], world[L.rSh]);
  const midHip = mid(world[L.lHip], world[L.rHip]);
  const midKnee = mid(world[L.lKnee], world[L.rKnee]);
  const midAnkle = mid(world[L.lAnk], world[L.rAnk]);

  const shoulderW = dist(world[L.lSh], world[L.rSh]);
  const hipW = dist(world[L.lHip], world[L.rHip]);
  const torso = dist(midShoulder, midHip);
  const leg = dist(midHip, midKnee) + dist(midKnee, midAnkle);

  if (torso <= 0 || leg <= 0) return emptySignal(["Proporsi tidak dapat dihitung dari foto ini."]);

  const legRatio = leg / (leg + torso);
  const upperLowerRatio = torso / leg;
  const widthRatio = (shoulderW + hipW) / 2 / torso;

  // Build classification (HEURISTIC — disclosed as experimental in UI)
  let build: BuildClass = "Normal";
  if (widthRatio < 0.62) build = "Kurus";
  else if (widthRatio > 0.95) build = "Gemuk / Berisi";

  // Concern toward undernutrition / short-leg proportion (each clamped, then averaged)
  const concernThin = clamp((0.72 - widthRatio) / 0.18, -1, 1); // thin -> +
  const concernLeg = clamp((0.5 - legRatio) / 0.12, -1, 1); // short legs -> +
  const concern = clamp(0.5 * concernThin + 0.5 * concernLeg, -1, 1) * quality;

  if (build === "Kurus") notes.push("• Build cenderung kurus — perlu cek indikasi wasting/gizi kurang.");
  if (build === "Gemuk / Berisi") notes.push("• Build cenderung berisi — pantau risiko kegemukan/overweight.");
  if (legRatio < 0.46) notes.push("• Proporsi kaki relatif pendek terhadap badan (indikasi pendukung, lemah).");
  if (notes.length === 0 || (notes.length === 1 && notes[0].startsWith("⚠️")))
    notes.push("✅ Proporsi tubuh dalam rentang umum.");

  return {
    ok: true,
    build,
    proportions: { legRatio, upperLowerRatio, widthRatio },
    concern,
    quality,
    notes,
    points: img.map((p: any) => ({ x: p.x, y: p.y, v: p.visibility ?? 1 })),
  };
}

function emptySignal(notes: string[]): PhotoSignal {
  return {
    ok: false,
    build: "Normal",
    proportions: { legRatio: 0, upperLowerRatio: 0, widthRatio: 0 },
    concern: 0,
    quality: 0,
    notes,
    points: [],
  };
}

/** BlazePose skeleton connections for drawing the overlay. */
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24],
  [23, 25], [25, 27], [24, 26], [26, 28],
  [27, 29], [27, 31], [28, 30], [28, 32],
];
