import {
  CheckCircle2,
  AlertTriangle,
  Siren,
  Sparkles,
  TriangleAlert,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  RESULT_CONFIG,
  STATUS_ORDER,
  type ResultConfig,
  type StatusKey,
} from "@/lib/content";
import type { FormValues } from "@/lib/encode";
import { whoStats } from "@/lib/who";
import { cn } from "@/lib/utils";

export interface AnalysisResult {
  status: StatusKey;
  confidence: number;
  probabilities: number[];
  zScore: number;
  values: FormValues;
}

const TONE: Record<
  ResultConfig["tone"],
  { wrap: string; icon: typeof CheckCircle2 }
> = {
  normal: { wrap: "from-brand-500 to-brand-800", icon: CheckCircle2 },
  tall: { wrap: "from-emerald-600 to-brand-900", icon: Sparkles },
  warning: { wrap: "from-amber-500 to-orange-600", icon: AlertTriangle },
  danger: { wrap: "from-rose-500 to-rose-700", icon: Siren },
};

function riskNotes(v: FormValues, zScore: number): { tone: "warn" | "info" | "ok"; text: string }[] {
  const notes: { tone: "warn" | "info" | "ok"; text: string }[] = [];
  if (!v.anakPertama && v.jarakKehamilan > 0 && v.jarakKehamilan < 24)
    notes.push({ tone: "warn", text: "Jarak kehamilan < 24 bulan (ideal > 24 bulan)" });
  if (v.usiaIbuMenikah < 20)
    notes.push({ tone: "warn", text: "Ibu menikah pada usia dini (< 20 tahun)" });
  if (v.giziIbu === "Buruk")
    notes.push({ tone: "warn", text: "Gizi ibu saat hamil buruk (risiko KEK)" });
  else if (v.giziIbu === "Sedang")
    notes.push({ tone: "info", text: "Gizi ibu saat hamil tergolong sedang" });
  if (zScore < -2)
    notes.push({ tone: "warn", text: "Tinggi badan di bawah −2 SD standar WHO" });
  if (notes.length === 0)
    notes.push({ tone: "ok", text: "Tidak ada faktor risiko maternal yang signifikan" });
  return notes;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/70 py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

export function ResultPanel({ result }: { result: AnalysisResult }) {
  const cfg = RESULT_CONFIG[result.status];
  const tone = TONE[cfg.tone];
  const Icon = tone.icon;
  const v = result.values;
  const [refHeight] = whoStats(v.umur, v.jenisKelamin);

  const probs = STATUS_ORDER.map((s, i) => ({
    status: s,
    p: result.probabilities[i] ?? 0,
  })).sort((a, b) => b.p - a.p);

  const notes = riskNotes(v, result.zScore);
  const years = Math.floor(v.umur / 12);
  const months = v.umur % 12;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Verdict */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br p-6 text-white shadow-xl sm:p-8",
          tone.wrap
        )}
      >
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
        <div className="relative flex items-start gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              {cfg.label}
            </p>
            <h3 className="mt-0.5 font-display text-2xl font-extrabold leading-tight">
              {cfg.headline}
            </h3>
            <p className="mt-2 text-sm text-white/85">{cfg.description}</p>
          </div>
        </div>
        <div className="relative mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-white/85">Tingkat keyakinan AI</span>
            <span className="font-display text-lg">{result.confidence.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-700"
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Probabilities */}
      <Card>
        <CardContent className="p-5">
          <h4 className="mb-3 font-display text-sm font-bold text-brand-800">
            Probabilitas tiap kategori
          </h4>
          <div className="space-y-3">
            {probs.map(({ status, p }) => (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className={cn("font-semibold", status === result.status ? "text-brand-700" : "text-muted-foreground")}>
                    {status}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {(p * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={p * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analyzed data */}
      <Card>
        <CardContent className="p-5">
          <h4 className="mb-2 font-display text-sm font-bold text-brand-800">
            Data yang dianalisis (7 faktor)
          </h4>
          <dl>
            <Row label="Nama anak" value={v.namaAnak || "—"} />
            <Row label="Umur" value={`${v.umur} bln (${years} thn ${months} bln)`} />
            <Row label="Jenis kelamin" value={v.jenisKelamin === "laki-laki" ? "Laki-laki" : "Perempuan"} />
            <Row label="Tinggi badan" value={`${v.tinggi} cm · median WHO ${refHeight.toFixed(1)}`} />
            <Row label="Berat badan" value={`${v.berat} kg`} />
            <Row
              label="Z-Score (HAZ)"
              value={`${result.zScore >= 0 ? "+" : ""}${result.zScore.toFixed(2)} SD`}
            />
            <Row
              label="Jarak kehamilan"
              value={v.anakPertama ? "Anak pertama" : `${v.jarakKehamilan} bulan`}
            />
            <Row label="Usia ibu menikah" value={`${v.usiaIbuMenikah} tahun`} />
            <Row label="Gizi ibu saat hamil" value={v.giziIbu} />
          </dl>
        </CardContent>
      </Card>

      {/* Risk notes */}
      <Card>
        <CardContent className="p-5">
          <h4 className="mb-3 font-display text-sm font-bold text-brand-800">
            Catatan faktor risiko
          </h4>
          <ul className="space-y-2">
            {notes.map((n, i) => {
              const NIcon = n.tone === "warn" ? TriangleAlert : n.tone === "info" ? Info : CheckCircle2;
              const color =
                n.tone === "warn" ? "text-amber-600" : n.tone === "info" ? "text-sky-600" : "text-brand-600";
              return (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <NIcon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />
                  <span>{n.text}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardContent className="p-5">
          <h4 className="mb-3 font-display text-sm font-bold text-brand-800">
            Rekomendasi tindak lanjut
          </h4>
          <ul className="space-y-2.5">
            {cfg.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Disclaimer:</strong> Hasil ini adalah alat skrining awal, bukan diagnosis
          medis. Akurasi model 88,40% pada test set. Selalu konsultasikan dengan dokter anak
          atau ahli gizi untuk diagnosis dan penanganan yang tepat.
        </p>
      </div>
    </div>
  );
}
