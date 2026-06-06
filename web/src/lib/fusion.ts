/**
 * Transparent late-fusion of the Random Forest output with the experimental
 * photo signal. The RF model is NEVER modified or retrained — instead a
 * strictly capped amount of probability mass (max ±10 percentage points,
 * scaled by the photo's concern & detection quality) is shifted between the
 * "sehat" classes (Normal, Tinggi) and the "stunting" classes (Stunted,
 * Severely Stunted). The UI always shows the before → after so the
 * adjustment is fully auditable.
 */
import { STATUS_CLASSES, type PredictResult, type StatusClass } from "./model";
import type { PhotoSignal } from "./pose";

const STUNT_SET: StatusClass[] = ["Stunted", "Severely Stunted"];
const OK_SET: StatusClass[] = ["Normal", "Tinggi"];
export const MAX_SHIFT = 0.1; // hard cap: 10 percentage points

export interface FusionResult {
  probabilities: { status: StatusClass; p: number }[]; // sorted desc
  status: StatusClass;
  confidence: number;
  shift: number; // signed mass moved toward stunting (+) or toward sehat (-)
  applied: boolean;
}

export function fuse(rf: PredictResult, photo: PhotoSignal | null): FusionResult {
  const map: Record<StatusClass, number> = {
    Normal: 0,
    "Severely Stunted": 0,
    Stunted: 0,
    Tinggi: 0,
  };
  for (const { status, p } of rf.probabilities) map[status] = p;

  if (!photo || !photo.ok || photo.concern === 0) return finalize(map, 0, false);

  let shift = MAX_SHIFT * photo.concern; // signed, |concern| already ≤ 1
  if (shift > 0) {
    const avail = OK_SET.reduce((s, c) => s + map[c], 0);
    const mv = Math.min(shift, avail);
    redistribute(map, OK_SET, STUNT_SET, mv);
    shift = mv;
  } else if (shift < 0) {
    const avail = STUNT_SET.reduce((s, c) => s + map[c], 0);
    const mv = Math.min(-shift, avail);
    redistribute(map, STUNT_SET, OK_SET, mv);
    shift = -mv;
  }
  return finalize(map, shift, true);
}

function redistribute(
  map: Record<StatusClass, number>,
  from: StatusClass[],
  to: StatusClass[],
  amount: number
) {
  const fromTotal = from.reduce((s, c) => s + map[c], 0) || 1;
  const toTotal = to.reduce((s, c) => s + map[c], 0);
  for (const c of from) map[c] -= amount * (map[c] / fromTotal);
  for (const c of to) {
    const w = toTotal > 0 ? map[c] / toTotal : 1 / to.length;
    map[c] += amount * w;
  }
}

function finalize(
  map: Record<StatusClass, number>,
  shift: number,
  applied: boolean
): FusionResult {
  let sum = 0;
  for (const c of STATUS_CLASSES) {
    if (map[c] < 0) map[c] = 0;
    sum += map[c];
  }
  if (sum === 0) sum = 1;
  const probs = STATUS_CLASSES.map((s) => ({ status: s, p: map[s] / sum })).sort(
    (a, b) => b.p - a.p
  );
  return { probabilities: probs, status: probs[0].status, confidence: probs[0].p, shift, applied };
}
