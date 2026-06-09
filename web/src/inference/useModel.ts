import { useCallback, useEffect, useRef, useState } from "react";

export type ModelStatus = "idle" | "loading" | "ready" | "error";

export interface PredictionResult {
  label: number;
  probabilities: number[];
}

interface Pending {
  resolve: (r: PredictionResult) => void;
  reject: (e: Error) => void;
}

/**
 * Manages the ONNX inference worker. The worker and the 1.7 MB (gzipped)
 * model are loaded lazily AFTER first paint, so the page is interactive
 * immediately and the heavy WASM init never blocks the UI.
 */
export function useModel() {
  const [status, setStatus] = useState<ModelStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, Pending>());
  const nextId = useRef(1);

  useEffect(() => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    setStatus("loading");

    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "ready") {
        setStatus("ready");
      } else if (msg.type === "result") {
        const p = pending.current.get(msg.id);
        if (p) {
          pending.current.delete(msg.id);
          p.resolve({ label: msg.label, probabilities: msg.probabilities });
        }
      } else if (msg.type === "error") {
        setError(msg.message);
        setStatus((s) => (s === "ready" ? s : "error"));
        // Reject any in-flight predictions so the UI can recover.
        pending.current.forEach((p) => p.reject(new Error(msg.message)));
        pending.current.clear();
      }
    };

    worker.onerror = (e) => {
      setError(e.message || "Gagal memuat model di perangkat.");
      setStatus("error");
    };

    const base = import.meta.env.BASE_URL ?? "/";
    const modelUrl = new URL(base + "model_stunting.onnx", window.location.href).href;
    worker.postMessage({ type: "init", modelUrl });

    return () => {
      worker.terminate();
      workerRef.current = null;
      pending.current.clear();
    };
  }, []);

  const predict = useCallback((input: number[]): Promise<PredictionResult> => {
    const worker = workerRef.current;
    if (!worker) return Promise.reject(new Error("Model belum siap."));
    const id = nextId.current++;
    return new Promise<PredictionResult>((resolve, reject) => {
      pending.current.set(id, { resolve, reject });
      worker.postMessage({ type: "predict", id, input });
    });
  }, []);

  return { status, error, predict };
}
