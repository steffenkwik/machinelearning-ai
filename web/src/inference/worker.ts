/// <reference lib="webworker" />
// ONNX inference runs entirely inside this Web Worker so the main thread
// (and therefore the UI) never blocks — this is the fix for the original
// "Page Unresponsive" freeze.
//
// We import the CPU-only `onnxruntime-web/wasm` build (no WebGPU/JSEP), and
// point the runtime at the exact WASM + loader URLs that Vite emits, so the
// app is fully self-contained (no CDN) and stays drop-in deployable on
// Cloudflare Pages. WASM is forced single-threaded so no cross-origin
// isolation (COOP/COEP) headers are required.

import * as ort from "onnxruntime-web/wasm";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import mjsUrl from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";

type InitMsg = { type: "init"; modelUrl: string };
type PredictMsg = { type: "predict"; id: number; input: number[] };
type InMsg = InitMsg | PredictMsg;

let sessionPromise: Promise<ort.InferenceSession> | null = null;

function createSession(modelUrl: string) {
  ort.env.wasm.wasmPaths = { wasm: wasmUrl, mjs: mjsUrl };
  ort.env.wasm.numThreads = 1; // no SharedArrayBuffer / COOP-COEP needed
  return ort.InferenceSession.create(modelUrl, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });
}

self.onmessage = async (e: MessageEvent<InMsg>) => {
  const msg = e.data;
  try {
    if (msg.type === "init") {
      if (!sessionPromise) sessionPromise = createSession(msg.modelUrl);
      await sessionPromise;
      (self as DedicatedWorkerGlobalScope).postMessage({ type: "ready" });
      return;
    }

    if (msg.type === "predict") {
      if (!sessionPromise) throw new Error("Model belum diinisialisasi.");
      const session = await sessionPromise;
      const tensor = new ort.Tensor("float32", Float32Array.from(msg.input), [1, 7]);
      const output = await session.run({ input: tensor });
      const probsTensor = output["probabilities"] ?? output[session.outputNames[1]];
      const labelTensor = output["label"] ?? output[session.outputNames[0]];
      const probabilities = Array.from(probsTensor.data as Float32Array);
      const label = Number((labelTensor.data as BigInt64Array | Int32Array)[0]);
      (self as DedicatedWorkerGlobalScope).postMessage({
        type: "result",
        id: msg.id,
        label,
        probabilities,
      });
    }
  } catch (err) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
