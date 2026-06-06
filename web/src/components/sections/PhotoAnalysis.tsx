import { useEffect, useRef, useState } from "react";
import { Camera, Info, Loader2, RefreshCw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyzePhoto, POSE_CONNECTIONS, type PhotoSignal } from "@/lib/pose";

const CANVAS_W = 520;

export function PhotoAnalysis({ onSignal }: { onSignal: (s: PhotoSignal | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [busy, setBusy] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [signal, setSignal] = useState<PhotoSignal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => stopCamera(), []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }

  function drawSkeleton(source: CanvasImageSource, w: number, h: number, sig: PhotoSignal | null) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = h / w;
    canvas.width = CANVAS_W;
    canvas.height = Math.round(CANVAS_W * ratio);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    if (!sig?.points?.length) return;
    const P = sig.points.map((p) => ({ x: p.x * canvas.width, y: p.y * canvas.height, v: p.v }));
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(16,185,129,0.9)";
    for (const [a, b] of POSE_CONNECTIONS) {
      if (P[a]?.v > 0.3 && P[b]?.v > 0.3) {
        ctx.beginPath();
        ctx.moveTo(P[a].x, P[a].y);
        ctx.lineTo(P[b].x, P[b].y);
        ctx.stroke();
      }
    }
    for (const p of P) {
      if (p.v <= 0.3) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#facc15";
      ctx.fill();
    }
  }

  async function runAnalysis(source: HTMLImageElement | HTMLCanvasElement, w: number, h: number) {
    setBusy(true);
    setError(null);
    try {
      const sig = await analyzePhoto(source);
      setSignal(sig);
      onSignal(sig.ok ? sig : null);
      drawSkeleton(source, w, h, sig);
      if (!sig.ok) setError(sig.notes[0] ?? "Tidak terdeteksi tubuh.");
    } catch (e) {
      console.error(e);
      setError("Gagal memuat model deteksi pose. Periksa koneksi lalu coba lagi.");
      onSignal(null);
    } finally {
      setBusy(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const img = new Image();
    img.onload = () => {
      setHasImage(true);
      runAnalysis(img, img.naturalWidth, img.naturalHeight);
    };
    img.onerror = () => setError("Gagal membaca file gambar.");
    img.src = URL.createObjectURL(file);
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 720 },
        audio: false,
      });
      streamRef.current = stream;
      setCamOn(true);
      setHasImage(false);
      setSignal(null);
      onSignal(null);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      });
    } catch {
      setError("Tidak bisa mengakses kamera. Beri izin kamera atau gunakan unggah foto.");
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const off = document.createElement("canvas");
    off.width = video.videoWidth;
    off.height = video.videoHeight;
    off.getContext("2d")!.drawImage(video, 0, 0);
    stopCamera();
    setHasImage(true);
    runAnalysis(off, off.width, off.height);
  }

  function reset() {
    stopCamera();
    setHasImage(false);
    setSignal(null);
    setError(null);
    onSignal(null);
  }

  const pct = (n: number) => `${(n * 100).toFixed(0)}%`;

  return (
    <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
            <Camera className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-emerald-800">
            Analisis Foto AI
          </h3>
        </div>
        <Badge variant="amber">Eksperimental</Badge>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        Opsional. Unggah / potret <b>seluruh badan anak berdiri tegak</b>. AI (MediaPipe Pose) menghitung
        <b> proporsi tubuh</b> di perangkat (foto tidak diunggah ke server) sebagai <b>sinyal tambahan</b> —
        <b> bukan</b> pengganti pengukuran tinggi & <b>bukan</b> diagnosis.
      </p>

      {/* viewport */}
      <div className="relative mb-3 grid place-items-center overflow-hidden rounded-xl bg-emerald-950/5 ring-1 ring-emerald-100" style={{ minHeight: 180 }}>
        {camOn ? (
          <video ref={videoRef} playsInline muted className="max-h-[340px] w-full object-contain" />
        ) : hasImage ? (
          <canvas ref={canvasRef} className="max-h-[340px] w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Camera className="h-8 w-8 text-emerald-400" />
            <p className="text-xs">Belum ada foto</p>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur-sm">
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
              <Loader2 className="h-4 w-4 animate-spin" /> Menganalisis pose…
            </span>
          </div>
        )}
      </div>

      {/* controls */}
      <div className="flex flex-wrap gap-2">
        {!camOn && (
          <>
            <Button asChild variant="outline" size="sm">
              <label className="cursor-pointer">
                <Upload className="h-4 w-4" /> Unggah Foto
                <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
              </label>
            </Button>
            <Button variant="outline" size="sm" onClick={startCamera}>
              <Camera className="h-4 w-4" /> Kamera
            </Button>
          </>
        )}
        {camOn && (
          <>
            <Button variant="gradient" size="sm" onClick={capture}>
              <Camera className="h-4 w-4" /> Ambil Foto
            </Button>
            <Button variant="ghost" size="sm" onClick={stopCamera}>
              <X className="h-4 w-4" /> Batal
            </Button>
          </>
        )}
        {(hasImage || signal) && !camOn && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RefreshCw className="h-4 w-4" /> Ulangi
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 flex items-start gap-2 text-xs font-medium text-amber-700">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </p>
      )}

      {/* results */}
      {signal?.ok && (
        <div className="mt-4 space-y-3 rounded-xl border border-emerald-100 bg-white p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Perkiraan Build Tubuh</span>
            <Badge variant={signal.build === "Normal" ? "default" : "amber"}>{signal.build}</Badge>
          </div>
          <Metric label="Rasio kaki : badan" value={signal.proportions.legRatio} />
          <Metric label="Proporsi badan (girth)" value={signal.proportions.widthRatio} cap={1.4} />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Kualitas deteksi</span>
            <span className="font-semibold text-emerald-800">{pct(signal.quality)}</span>
          </div>
          {signal.notes.length > 0 && (
            <ul className="space-y-1 border-t border-dashed border-emerald-100 pt-2 text-xs text-muted-foreground">
              {signal.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-[11px] leading-relaxed text-emerald-800">
            Sinyal ini hanya <b>menyesuaikan</b> probabilitas dari model utama dengan bobot dibatasi
            (maks ±10%). Hasil akhir tetap mengandalkan Random Forest 7-faktor.
          </p>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, cap = 1 }: { label: string; value: number; cap?: number }) {
  const w = Math.min(100, (value / cap) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-emerald-800">{value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-100">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${w}%` }} />
      </div>
    </div>
  );
}
