/**
 * In-browser inference for the trained Random Forest (88.40% accuracy).
 * The original scikit-learn model was exported to ONNX with verified
 * probability parity, and runs entirely client-side via onnxruntime-web.
 * No data ever leaves the device.
 */
import type { Sex } from "./who";

// Label encoders — must match the values used during training (app.py).
const SEX_ENC: Record<Sex, number> = { "laki-laki": 0, perempuan: 1 };
const NUTRI_ENC: Record<string, number> = { Baik: 0, Buruk: 1, Sedang: 2 };

// Output class order (encoder_status.classes_ => indices 0..3)
export const STATUS_CLASSES = [
  "Normal",
  "Severely Stunted",
  "Stunted",
  "Tinggi",
] as const;
export type StatusClass = (typeof STATUS_CLASSES)[number];

export interface PredictInput {
  umur: number;
  jenisKelamin: Sex;
  tinggi: number;
  berat: number;
  jarakKehamilan: number;
  usiaIbuMenikah: number;
  giziIbu: "Baik" | "Sedang" | "Buruk";
}

export interface PredictResult {
  status: StatusClass;
  confidence: number; // 0..1 for the predicted class
  probabilities: { status: StatusClass; p: number }[];
}

type OrtModule = typeof import("onnxruntime-web/wasm");
let ortPromise: Promise<OrtModule> | null = null;
let sessionPromise: Promise<any> | null = null;

async function getOrt(): Promise<OrtModule> {
  if (!ortPromise) {
    // wasm-only build: avoids bundling the oversized webgpu/jsep binary
    // (which exceeds Cloudflare Pages' 25 MiB per-file limit).
    ortPromise = import("onnxruntime-web/wasm").then((ort) => {
      // Single-threaded WASM avoids needing cross-origin isolation headers,
      // and the model is tiny to evaluate. The "bundle" build inlines the glue
      // loader and lets Vite resolve the .wasm URL, so no wasmPaths is needed.
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;
      ort.env.wasm.proxy = false;
      return ort;
    });
  }
  return ortPromise;
}

export function loadModel(): Promise<any> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await getOrt();
      return ort.InferenceSession.create("/model_stunting.onnx", {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      });
    })();
  }
  return sessionPromise;
}

export async function predict(input: PredictInput): Promise<PredictResult> {
  const ort = await getOrt();
  const session = await loadModel();

  // Feature order must match training:
  // [Umur, Jenis_Kelamin_Enc, Tinggi, Berat, Jarak_Kehamilan, Usia_Ibu_Menikah, Gizi_Ibu_Enc]
  const features = Float32Array.from([
    input.umur,
    SEX_ENC[input.jenisKelamin],
    input.tinggi,
    input.berat,
    input.jarakKehamilan,
    input.usiaIbuMenikah,
    NUTRI_ENC[input.giziIbu],
  ]);

  const tensor = new ort.Tensor("float32", features, [1, 7]);
  const output = await session.run({ input: tensor });

  const probTensor = output["probabilities"] ?? output[session.outputNames[1]];
  const probs = Array.from(probTensor.data as Float32Array);

  let bestIdx = 0;
  for (let i = 1; i < probs.length; i++) if (probs[i] > probs[bestIdx]) bestIdx = i;

  const probabilities = STATUS_CLASSES.map((status, i) => ({
    status,
    p: probs[i] ?? 0,
  })).sort((a, b) => b.p - a.p);

  return {
    status: STATUS_CLASSES[bestIdx],
    confidence: probs[bestIdx] ?? 0,
    probabilities,
  };
}
