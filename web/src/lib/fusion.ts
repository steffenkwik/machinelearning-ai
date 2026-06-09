import type { BuildCategory } from "./pose";

// ───────────────────────────────────────────────────────────────────────────
// Transparent late-fusion of the photo "build" signal into the Random Forest
// output. The RF model is NEVER retrained or altered — we only nudge its final
// probability vector, by a strictly capped amount, and we always surface the
// before/after so the adjustment is auditable.
//
// Rationale (honest & defensible for the Ethics LO):
//  • Stunting = height-for-age, which a 2D photo cannot measure. So the photo
//    is a SUPPORTING signal, not a diagnosis.
//  • What a photo CAN estimate is build (wasting vs overweight). A very thin
//    (wasted) child carries higher overall undernutrition risk → nudge the
//    stunting-spectrum probability UP. An overweight child → nudge it DOWN
//    slightly (and is flagged separately as its own concern).
// ───────────────────────────────────────────────────────────────────────────

const MAX_SHIFT = 0.1; // ±10 percentage points, hard cap

export interface PhotoSignal {
  available: boolean;
  adiposity: number; // -1 (sangat kurus) .. +1 (sangat gemuk)
  confidence: number; // 0..1
  build: BuildCategory;
}

export interface FusionResult {
  before: number[];
  after: number[];
  riskBefore: number; // p(Stunted)+p(Severely Stunted)
  riskAfter: number;
  shiftPP: number; // signed percentage-point change in risk
  capped: boolean;
  direction: "naik" | "turun" | "tetap";
}

// class order: 0=Normal, 1=Severely Stunted, 2=Stunted, 3=Tinggi
const RISK_IDX = [1, 2];
const NONRISK_IDX = [0, 3];

export function fuse(probs: number[], signal: PhotoSignal): FusionResult | null {
  if (!signal.available || signal.confidence <= 0) return null;

  // thin → positive shift (risk up); obese → negative shift (risk down)
  const raw = -signal.adiposity * signal.confidence * MAX_SHIFT;
  const shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, raw));
  const capped = Math.abs(raw) >= MAX_SHIFT - 1e-9;

  const riskBefore = RISK_IDX.reduce((s, i) => s + probs[i], 0);
  let riskAfter = Math.max(0, Math.min(1, riskBefore + shift));
  const delta = riskAfter - riskBefore;

  const after = [...probs];
  if (Math.abs(delta) > 1e-6) {
    if (delta > 0) {
      // pull `delta` out of non-risk classes (proportionally), add to risk
      const nonRiskSum = NONRISK_IDX.reduce((s, i) => s + probs[i], 0) || 1;
      NONRISK_IDX.forEach((i) => (after[i] = probs[i] - (delta * probs[i]) / nonRiskSum));
      const riskSum = riskBefore || 1;
      RISK_IDX.forEach((i) => (after[i] = probs[i] + (delta * probs[i]) / riskSum));
    } else {
      const riskSum = riskBefore || 1;
      RISK_IDX.forEach((i) => (after[i] = probs[i] + (delta * probs[i]) / riskSum));
      const nonRiskSum = NONRISK_IDX.reduce((s, i) => s + probs[i], 0) || 1;
      NONRISK_IDX.forEach((i) => (after[i] = probs[i] - (delta * probs[i]) / nonRiskSum));
    }
  }
  // numerical clean-up + renormalize
  const sum = after.reduce((s, v) => s + Math.max(0, v), 0) || 1;
  for (let i = 0; i < after.length; i++) after[i] = Math.max(0, after[i]) / sum;

  const riskAfterNorm = RISK_IDX.reduce((s, i) => s + after[i], 0);
  const shiftPP = (riskAfterNorm - riskBefore) * 100;

  return {
    before: probs,
    after,
    riskBefore,
    riskAfter: riskAfterNorm,
    shiftPP,
    capped,
    direction: shiftPP > 0.05 ? "naik" : shiftPP < -0.05 ? "turun" : "tetap",
  };
}

export function buildBadge(build: BuildCategory): { text: string; tone: "ok" | "warn" } {
  switch (build) {
    case "Kurus":
      return { text: "Proporsi tubuh tampak kurus — indikasi kemungkinan wasting/undernutrisi.", tone: "warn" };
    case "Gemuk":
      return { text: "Proporsi tubuh tampak berlebih — perhatikan risiko overweight (masalah gizi tersendiri).", tone: "warn" };
    default:
      return { text: "Proporsi tubuh tampak dalam rentang normal.", tone: "ok" };
  }
}
