import { useMemo, useState, type ReactNode } from "react";
import {
  Baby,
  HeartPulse,
  Ruler,
  Scale,
  Calendar,
  VenetianMask,
  Loader2,
  ScanSearch,
  Sparkles,
  Apple,
  Heart,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, SegmentItem } from "@/components/ui/radio-group";
import { ResultPanel, type AnalysisResult } from "@/components/ResultPanel";
import { PhotoAnalysis } from "@/components/PhotoAnalysis";
import { STATUS_ORDER } from "@/lib/content";
import { toFeatureVector, type FormValues, type GiziIbu } from "@/lib/encode";
import { hazZScore, whoStats, type Sex } from "@/lib/who";
import { fuse, type PhotoSignal } from "@/lib/fusion";
import type { ModelStatus } from "@/inference/useModel";
import type { PredictionResult } from "@/inference/useModel";

interface Props {
  status: ModelStatus;
  predict: (input: number[]) => Promise<PredictionResult>;
}

const clamp = (n: number, lo: number, hi: number) =>
  Number.isFinite(n) ? Math.min(Math.max(n, lo), hi) : lo;

function FieldLabel({
  icon: Icon,
  children,
  htmlFor,
}: {
  icon: typeof Baby;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <Label htmlFor={htmlFor}>
      <Icon className="h-4 w-4 text-brand-500" />
      {children}
    </Label>
  );
}

export function DetectionTab({ status, predict }: Props) {
  const [values, setValues] = useState<FormValues>({
    namaAnak: "",
    umur: 24,
    jenisKelamin: "laki-laki",
    tinggi: 85,
    berat: 11,
    anakPertama: true,
    jarakKehamilan: 24,
    usiaIbuMenikah: 23,
    giziIbu: "Baik",
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [photoSignal, setPhotoSignal] = useState<PhotoSignal | null>(null);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const [refHeight] = useMemo(
    () => whoStats(values.umur, values.jenisKelamin),
    [values.umur, values.jenisKelamin]
  );

  const onAnalyze = async () => {
    setErrMsg(null);
    setBusy(true);
    try {
      const vector = toFeatureVector(values);
      const { label, probabilities } = await predict(vector);
      const zScore = hazZScore(values.umur, values.jenisKelamin, values.tinggi);

      // Optional transparent fusion with the photo build signal.
      const fusion = photoSignal?.available ? fuse(probabilities, photoSignal) : null;
      const finalProbs = fusion ? fusion.after : probabilities;
      const topIdx = finalProbs.indexOf(Math.max(...finalProbs));
      const confidence = (finalProbs[topIdx] ?? probabilities[label]) * 100;

      setResult({
        status: STATUS_ORDER[topIdx] ?? STATUS_ORDER[label] ?? STATUS_ORDER[0],
        confidence,
        probabilities: finalProbs,
        zScore,
        values,
        fusion: fusion ?? undefined,
        photoBuild: photoSignal?.available ? photoSignal.build : undefined,
      });
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Analisis gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const modelReady = status === "ready";
  const buttonLabel = busy
    ? "Menganalisis…"
    : status === "loading" || status === "idle"
      ? "Memuat model…"
      : status === "error"
        ? "Model gagal dimuat"
        : "Analisis risiko stunting";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
      {/* ---------------- Form ---------------- */}
      <div className="space-y-5">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <Baby className="h-5 w-5 text-brand-600" />
              <h3 className="font-display text-base font-bold text-brand-800">Data Anak</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <FieldLabel icon={Baby} htmlFor="nama">
                  Nama anak (opsional)
                </FieldLabel>
                <Input
                  id="nama"
                  placeholder="Contoh: Adi"
                  value={values.namaAnak}
                  onChange={(e) => set("namaAnak", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel icon={Calendar} htmlFor="umur">
                    Umur anak (bulan)
                  </FieldLabel>
                  <Input
                    id="umur"
                    type="number"
                    min={0}
                    max={60}
                    value={values.umur}
                    onChange={(e) => set("umur", clamp(e.target.valueAsNumber, 0, 60))}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel icon={VenetianMask}>Jenis kelamin</FieldLabel>
                  <RadioGroup
                    className="grid-cols-2"
                    value={values.jenisKelamin}
                    onValueChange={(val) => set("jenisKelamin", val as Sex)}
                  >
                    <SegmentItem value="laki-laki" label="Laki-laki" />
                    <SegmentItem value="perempuan" label="Perempuan" />
                  </RadioGroup>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel icon={Ruler} htmlFor="tinggi">
                    Tinggi badan (cm)
                  </FieldLabel>
                  <Input
                    id="tinggi"
                    type="number"
                    min={30}
                    max={130}
                    step={0.1}
                    value={values.tinggi}
                    onChange={(e) => set("tinggi", clamp(e.target.valueAsNumber, 30, 130))}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel icon={Scale} htmlFor="berat">
                    Berat badan (kg)
                  </FieldLabel>
                  <Input
                    id="berat"
                    type="number"
                    min={2}
                    max={30}
                    step={0.1}
                    value={values.berat}
                    onChange={(e) => set("berat", clamp(e.target.valueAsNumber, 2, 30))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-brand-600" />
              <h3 className="font-display text-base font-bold text-brand-800">
                Data Ibu &amp; Riwayat Kehamilan
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel icon={Baby}>Apakah anak pertama?</FieldLabel>
                  <RadioGroup
                    className="grid-cols-2"
                    value={values.anakPertama ? "Ya" : "Tidak"}
                    onValueChange={(val) => set("anakPertama", val === "Ya")}
                  >
                    <SegmentItem value="Ya" label="Ya" />
                    <SegmentItem value="Tidak" label="Tidak" />
                  </RadioGroup>
                </div>
                <div className="space-y-1.5">
                  <FieldLabel icon={Calendar} htmlFor="jarak">
                    Jarak dari anak sebelumnya (bulan)
                  </FieldLabel>
                  <Input
                    id="jarak"
                    type="number"
                    min={6}
                    max={72}
                    disabled={values.anakPertama}
                    value={values.anakPertama ? 0 : values.jarakKehamilan}
                    onChange={(e) => set("jarakKehamilan", clamp(e.target.valueAsNumber, 6, 72))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {values.anakPertama ? "Anak pertama → jarak = 0" : "Ideal > 24 bulan"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <FieldLabel icon={Heart} htmlFor="usiaibu">
                    Usia ibu saat menikah (tahun)
                  </FieldLabel>
                  <Input
                    id="usiaibu"
                    type="number"
                    min={14}
                    max={45}
                    value={values.usiaIbuMenikah}
                    onChange={(e) => set("usiaIbuMenikah", clamp(e.target.valueAsNumber, 14, 45))}
                  />
                  <p className="text-xs text-muted-foreground">Ideal 20–35 tahun</p>
                </div>
                <div className="space-y-1.5">
                  <FieldLabel icon={Apple}>Gizi ibu saat hamil</FieldLabel>
                  <RadioGroup
                    className="grid-cols-3"
                    value={values.giziIbu}
                    onValueChange={(val) => set("giziIbu", val as GiziIbu)}
                  >
                    <SegmentItem value="Baik" label="Baik" />
                    <SegmentItem value="Sedang" label="Sedang" />
                    <SegmentItem value="Buruk" label="Buruk" />
                  </RadioGroup>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2.5 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <p>
            Referensi WHO: median tinggi anak {values.umur} bulan (
            {values.jenisKelamin === "laki-laki" ? "laki-laki" : "perempuan"}) ={" "}
            <strong>{refHeight.toFixed(1)} cm</strong>.
          </p>
        </div>

        <PhotoAnalysis onSignal={setPhotoSignal} />

        <Button
          size="lg"
          className="btn-shine w-full"
          onClick={onAnalyze}
          disabled={!modelReady || busy}
          aria-busy={busy}
        >
          {busy || !modelReady ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ScanSearch className="h-5 w-5" />
          )}
          {buttonLabel}
        </Button>

        {errMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errMsg}
          </div>
        )}
      </div>

      {/* ---------------- Result ---------------- */}
      <div className="lg:sticky lg:top-6 lg:self-start">
        {result ? (
          <ResultPanel result={result} />
        ) : (
          <Card className="h-full">
            <CardContent className="flex min-h-[28rem] flex-col items-center justify-center p-10 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-500">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-brand-800">
                Hasil analisis muncul di sini
              </h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Lengkapi 7 faktor di sebelah kiri lalu tekan{" "}
                <span className="font-semibold text-brand-700">Analisis</span>. Model Random
                Forest memproses langsung di perangkat Anda — data tidak dikirim ke server.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
