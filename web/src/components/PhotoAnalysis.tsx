import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  Loader2,
  ScanFace,
  X,
  Info,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  analyzePhoto,
  getPoseLandmarker,
  POSE_CONNECTIONS,
  type PhotoAnalysis as Analysis,
} from "@/lib/pose";
import { buildBadge, type PhotoSignal } from "@/lib/fusion";

type Status = "idle" | "loading" | "analyzing" | "done" | "error";
const MAX_DIM = 560; // cap longest side for speed + adequate mask resolution

export function PhotoAnalysis({
  onSignal,
}: {
  onSignal: (s: PhotoSignal | null) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [camOn, setCamOn] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const baseUrl = import.meta.env.BASE_URL ?? "/";

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const drawOverlay = useCallback((a: Analysis, base: HTMLCanvasElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = base.width;
    const h = base.height;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(base, 0, 0);

    // mask tint
    if (a.maskBitmap) {
      const tmp = document.createElement("canvas");
      tmp.width = a.maskBitmap.width;
      tmp.height = a.maskBitmap.height;
      tmp.getContext("2d")!.putImageData(a.maskBitmap, 0, 0);
      ctx.drawImage(tmp, 0, 0, w, h);
    }

    // skeleton
    const lm = a.landmarks;
    if (lm) {
      ctx.strokeStyle = "rgba(52,211,153,0.95)";
      ctx.lineWidth = Math.max(2, w / 220);
      ctx.lineCap = "round";
      for (const [i, j] of POSE_CONNECTIONS) {
        const p = lm[i];
        const q = lm[j];
        if ((p?.visibility ?? 0) < 0.4 || (q?.visibility ?? 0) < 0.4) continue;
        ctx.beginPath();
        ctx.moveTo(p.x * w, p.y * h);
        ctx.lineTo(q.x * w, q.y * h);
        ctx.stroke();
      }
      ctx.fillStyle = "#10b981";
      const r = Math.max(2.5, w / 160);
      for (const p of lm) {
        if ((p?.visibility ?? 0) < 0.4) continue;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  const runAnalysis = useCallback(
    async (source: HTMLImageElement | HTMLCanvasElement, natW: number, natH: number) => {
      setStatus("loading");
      setError(null);
      try {
        const landmarker = await getPoseLandmarker(baseUrl);
        // downscale into a working canvas
        const scale = Math.min(1, MAX_DIM / Math.max(natW, natH));
        const w = Math.round(natW * scale);
        const h = Math.round(natH * scale);
        const work = document.createElement("canvas");
        work.width = w;
        work.height = h;
        work.getContext("2d")!.drawImage(source, 0, 0, w, h);

        setStatus("analyzing");
        const a = await analyzePhoto(landmarker, work, w, h);
        drawOverlay(a, work);
        setResult(a);
        setStatus(a.ok ? "done" : "error");
        if (!a.ok) setError(a.reason ?? "Analisis gagal.");
        onSignal(
          a.ok
            ? { available: true, adiposity: a.adiposity, confidence: a.confidence, build: a.build }
            : null
        );
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Gagal memuat model foto.");
        onSignal(null);
      }
    },
    [baseUrl, drawOverlay, onSignal]
  );

  const handleFile = useCallback(
    (file: File) => {
      stopCamera();
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        runAnalysis(img, img.naturalWidth, img.naturalHeight).finally(() =>
          URL.revokeObjectURL(url)
        );
      };
      img.onerror = () => {
        setStatus("error");
        setError("Gambar tidak dapat dibaca.");
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },
    [runAnalysis, stopCamera]
  );

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      setCamOn(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setError("Tidak dapat mengakses kamera. Beri izin kamera atau gunakan unggah foto.");
    }
  }, []);

  const capture = useCallback(() => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const c = document.createElement("canvas");
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")!.drawImage(v, 0, 0);
    stopCamera();
    runAnalysis(c, c.width, c.height);
  }, [runAnalysis, stopCamera]);

  const reset = () => {
    setResult(null);
    setStatus("idle");
    setError(null);
    onSignal(null);
  };

  const busy = status === "loading" || status === "analyzing";
  const badge = result?.ok ? buildBadge(result.build) : null;

  return (
    <Card className="border-dashed">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScanFace className="h-5 w-5 text-brand-600" />
            <h3 className="font-display text-base font-bold text-brand-800">
              Analisis Foto AI
            </h3>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              Eksperimental
            </span>
          </div>
          {result && (
            <button
              onClick={reset}
              className="rounded-lg p-1 text-muted-foreground hover:bg-accent"
              aria-label="Hapus foto"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          Opsional. Mendeteksi 33 titik tubuh + siluet badan langsung di perangkat
          (foto tidak diunggah ke server) untuk memperkirakan <strong>proporsi tubuh</strong>{" "}
          (kurus/normal/gemuk). Berfungsi untuk posisi berdiri, duduk, maupun berbaring.
        </p>

        {/* Stage */}
        <div className="relative overflow-hidden rounded-xl border border-border bg-secondary/40">
          {camOn ? (
            <video ref={videoRef} className="aspect-[4/3] w-full object-contain" playsInline muted />
          ) : result ? (
            <canvas ref={canvasRef} className="aspect-[4/3] w-full bg-ink object-contain" />
          ) : (
            <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <ScanFace className="h-10 w-10 opacity-40" />
              <p className="text-xs">Unggah foto atau gunakan kamera</p>
            </div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-ink/60 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Loader2 className="h-5 w-5 animate-spin" />
                {status === "loading" ? "Memuat model foto…" : "Menganalisis…"}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Upload className="h-4 w-4" /> Unggah foto
          </Button>
          {camOn ? (
            <>
              <Button size="sm" onClick={capture} disabled={busy}>
                <Camera className="h-4 w-4" /> Ambil &amp; analisis
              </Button>
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                Batal
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={startCamera} disabled={busy}>
              <Camera className="h-4 w-4" /> Kamera
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {result?.ok && badge && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold",
                  result.build === "Normal"
                    ? "bg-brand-50 text-brand-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {result.build === "Normal" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <TriangleAlert className="h-4 w-4" />
                )}
                Proporsi: {result.build}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Posisi: {result.poseType}
              </span>
              <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                Kualitas: {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* adiposity meter */}
            <div>
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>Kurus</span>
                <span>Normal</span>
                <span>Gemuk</span>
              </div>
              <div className="relative h-2.5 rounded-full bg-gradient-to-r from-sky-300 via-brand-300 to-amber-400">
                <div
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink shadow"
                  style={{ left: `${((result.adiposity + 1) / 2) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{badge.text}</p>

            {/* per-segment ratios (transparency) */}
            {result.segments.length > 0 && (
              <details className="rounded-lg border border-border bg-secondary/40 px-3 py-2">
                <summary className="cursor-pointer text-xs font-semibold text-brand-700">
                  Detail pengukuran ({result.segments.length} segmen)
                </summary>
                <ul className="mt-2 space-y-1">
                  {result.segments.map((s, i) => (
                    <li key={i} className="flex justify-between font-mono text-[11px] text-muted-foreground">
                      <span>{s.label}</span>
                      <span>
                        tebal/panjang {s.ratio.toFixed(2)} → {s.adiposity >= 0 ? "+" : ""}
                        {s.adiposity.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <div className="flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Estimasi proporsi tubuh (wasting/overweight), <strong>bukan</strong> pengukuran
                tinggi/stunting. Hasil ini hanya menyesuaikan probabilitas akhir secara terbatas
                (maks ±10 poin) dan ditampilkan transparan di panel hasil.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
