import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Baby,
  HeartPulse,
  Info,
  Loader2,
  Ruler,
  ScanSearch,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioPill } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { predict, type PredictResult } from "@/lib/model";
import { hazZScore, whoStats, type Sex } from "@/lib/who";
import { STATUS_CONFIG } from "@/lib/content";

const TONE_STYLES: Record<string, string> = {
  normal: "from-emerald-500 to-emerald-800",
  warning: "from-amber-500 to-orange-600",
  danger: "from-rose-500 to-red-700",
  tall: "from-teal-600 to-emerald-900",
};

export function DetectionTab() {
  const [nama, setNama] = useState("");
  const [umur, setUmur] = useState(24);
  const [jenisKelamin, setJenisKelamin] = useState<Sex>("laki-laki");
  const [tinggi, setTinggi] = useState(85);
  const [berat, setBerat] = useState(11);
  const [anakPertama, setAnakPertama] = useState<"Ya" | "Tidak">("Ya");
  const [jarakKehamilan, setJarakKehamilan] = useState(24);
  const [usiaIbuMenikah, setUsiaIbuMenikah] = useState(23);
  const [giziIbu, setGiziIbu] = useState<"Baik" | "Sedang" | "Buruk">("Baik");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [snapshot, setSnapshot] = useState<any>(null);

  const [refHeight] = useMemo(() => whoStats(umur, jenisKelamin), [umur, jenisKelamin]);
  const effJarak = anakPertama === "Ya" ? 0 : jarakKehamilan;

  async function handlePredict() {
    setLoading(true);
    setError(null);
    try {
      const res = await predict({
        umur,
        jenisKelamin,
        tinggi,
        berat,
        jarakKehamilan: effJarak,
        usiaIbuMenikah,
        giziIbu,
      });
      const z = hazZScore(umur, jenisKelamin, tinggi);
      setResult(res);
      setSnapshot({ nama, umur, jenisKelamin, tinggi, berat, effJarak, usiaIbuMenikah, giziIbu, z, refHeight });
      setTimeout(() => document.getElementById("hasil")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (e: any) {
      setError("Gagal memuat model AI. Periksa koneksi lalu coba lagi.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ───────── FORM ───────── */}
      <div className="lg:col-span-3 space-y-5">
        <SectionCard icon={<Baby className="h-4 w-4" />} title="Data Anak">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Nama Anak (opsional)">
              <Input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Adi" />
            </Field>
            <Field label="📅 Umur Anak (bulan)">
              <Input type="number" min={0} max={60} value={umur} onChange={(e) => setUmur(clamp(+e.target.value, 0, 60))} />
            </Field>
            <Field label="⚧ Jenis Kelamin">
              <RadioGroup
                className="grid-flow-col"
                value={jenisKelamin}
                onValueChange={(v) => setJenisKelamin(v as Sex)}
              >
                <RadioPill value="laki-laki" label="Laki-laki" />
                <RadioPill value="perempuan" label="Perempuan" />
              </RadioGroup>
            </Field>
            <Field label="📐 Tinggi Badan (cm)">
              <Input type="number" step={0.1} min={30} max={130} value={tinggi} onChange={(e) => setTinggi(clamp(+e.target.value, 30, 130))} />
            </Field>
            <Field label="⚖️ Berat Badan (kg)">
              <Input type="number" step={0.1} min={2} max={30} value={berat} onChange={(e) => setBerat(clamp(+e.target.value, 2, 30))} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard icon={<HeartPulse className="h-4 w-4" />} title="Data Ibu & Riwayat Kehamilan">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Apakah anak pertama?">
              <RadioGroup
                className="grid-flow-col"
                value={anakPertama}
                onValueChange={(v) => setAnakPertama(v as "Ya" | "Tidak")}
              >
                <RadioPill value="Ya" label="Ya" />
                <RadioPill value="Tidak" label="Tidak" />
              </RadioGroup>
            </Field>
            <Field label="👶 Jarak dari anak sebelumnya (bulan)">
              <Input
                type="number"
                min={6}
                max={72}
                value={jarakKehamilan}
                disabled={anakPertama === "Ya"}
                onChange={(e) => setJarakKehamilan(clamp(+e.target.value, 6, 72))}
              />
              {anakPertama === "Ya" && (
                <p className="text-xs text-muted-foreground">Jarak kehamilan = 0 (anak pertama)</p>
              )}
            </Field>
            <Field label="💍 Usia Ibu Saat Menikah (tahun)">
              <Input type="number" min={14} max={45} value={usiaIbuMenikah} onChange={(e) => setUsiaIbuMenikah(clamp(+e.target.value, 14, 45))} />
            </Field>
            <Field label="🍎 Gizi Ibu Saat Hamil">
              <Select value={giziIbu} onValueChange={(v) => setGiziIbu(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baik">Baik</SelectItem>
                  <SelectItem value="Sedang">Sedang</SelectItem>
                  <SelectItem value="Buruk">Buruk</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </SectionCard>

        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>
            <b>Referensi WHO:</b> median tinggi anak {umur} bulan ({jenisKelamin}) ={" "}
            <b>{refHeight.toFixed(1)} cm</b>
          </span>
        </div>

        <Button variant="gradient" size="lg" className="w-full" onClick={handlePredict} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Menganalisis…
            </>
          ) : (
            <>
              <ScanSearch /> Analisis Risiko Stunting (7 Faktor)
            </>
          )}
        </Button>
        {error && (
          <p className="flex items-center gap-2 text-sm font-medium text-red-600">
            <AlertTriangle className="h-4 w-4" /> {error}
          </p>
        )}
      </div>

      {/* ───────── RESULT ───────── */}
      <div className="lg:col-span-2" id="hasil">
        {result && snapshot ? (
          <ResultPanel result={result} s={snapshot} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function ResultPanel({ result, s }: { result: PredictResult; s: any }) {
  const cfg = STATUS_CONFIG[result.status];
  const notes = buildRiskNotes(s);
  return (
    <div className="space-y-4 animate-fade-up lg:sticky lg:top-6">
      <div className={`rounded-3xl bg-gradient-to-br ${TONE_STYLES[cfg.tone]} p-6 text-center text-white shadow-xl`}>
        <div className="text-5xl">{cfg.emoji}</div>
        <h2 className="mt-2 text-xl font-extrabold tracking-tight">{cfg.title}</h2>
        <p className="mt-1 text-sm text-white/85">{cfg.desc}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold backdrop-blur">
          <Sparkles className="h-4 w-4" /> Keyakinan AI: {(result.confidence * 100).toFixed(1)}%
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h4 className="text-sm font-bold text-emerald-900">📊 Probabilitas Tiap Kategori</h4>
          <div className="space-y-3">
            {result.probabilities.map((p) => (
              <div key={p.status}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-emerald-800">
                  <span>{p.status}</span>
                  <span>{(p.p * 100).toFixed(1)}%</span>
                </div>
                <Progress value={p.p * 100} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2.5 p-5 text-sm">
          <h4 className="text-sm font-bold text-emerald-900">📋 Data yang Dianalisis</h4>
          <Row k="Nama Anak" v={s.nama || "-"} />
          <Row k="Umur" v={`${s.umur} bln (${Math.floor(s.umur / 12)} th ${s.umur % 12} bln)`} />
          <Row k="Jenis Kelamin" v={cap(s.jenisKelamin)} />
          <Row k="Tinggi Badan" v={`${s.tinggi} cm (WHO ${s.refHeight.toFixed(1)})`} />
          <Row k="Berat Badan" v={`${s.berat} kg`} />
          <Row k="Z-Score (HAZ)" v={`${s.z >= 0 ? "+" : ""}${s.z.toFixed(2)} SD`} highlight={s.z < -2} />
          <Row k="Jarak Kehamilan" v={s.effJarak > 0 ? `${s.effJarak} bulan` : "Anak pertama"} />
          <Row k="Usia Ibu Menikah" v={`${s.usiaIbuMenikah} tahun`} />
          <Row k="Gizi Ibu Saat Hamil" v={s.giziIbu} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5 text-sm">
          <h4 className="text-sm font-bold text-emerald-900">🔬 Catatan Faktor Risiko</h4>
          <ul className="space-y-1.5">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-muted-foreground">
                <span className="shrink-0">{n.startsWith("✅") ? "" : "•"}</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-5 text-sm">
          <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-900">
            <Stethoscope className="h-4 w-4 text-emerald-600" /> Rekomendasi Tindak Lanjut
          </h4>
          <ul className="space-y-1.5">
            {cfg.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2 text-muted-foreground">
                <span className="shrink-0 text-emerald-500">›</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <span>
          <b>Disclaimer:</b> hasil ini adalah <b>alat skrining awal</b>, BUKAN diagnosis medis (akurasi
          model 88,40%). Selalu konsultasikan dengan <b>dokter anak atau ahli gizi</b>.
        </span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="lg:sticky lg:top-6">
      <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-3xl bg-emerald-50 text-emerald-500">
          <ScanSearch className="h-9 w-9" />
        </div>
        <h4 className="text-lg font-bold text-emerald-900">Hasil analisis muncul di sini</h4>
        <p className="max-w-xs text-sm text-muted-foreground">
          Lengkapi 7 faktor di sebelah kiri lalu tekan <b>Analisis</b>. Model Random Forest akan
          memproses langsung di perangkat Anda — data tidak dikirim ke server.
        </p>
      </CardContent>
    </Card>
  );
}

/* ───────── helpers & small components ───────── */
function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-emerald-100 pb-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100 text-emerald-700">{icon}</span>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-emerald-800">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Row({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed border-emerald-100 pb-1.5 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className={`text-right font-semibold ${highlight ? "text-red-600" : "text-emerald-900"}`}>{v}</span>
    </div>
  );
}

function buildRiskNotes(s: any): string[] {
  const notes: string[] = [];
  if (s.effJarak > 0 && s.effJarak < 24) notes.push("⚠️ Jarak kehamilan < 24 bln (ideal >24)");
  if (s.usiaIbuMenikah < 20) notes.push("⚠️ Ibu menikah usia dini (<20 thn)");
  if (s.giziIbu === "Buruk") notes.push("⚠️ Gizi ibu saat hamil buruk (risiko KEK)");
  else if (s.giziIbu === "Sedang") notes.push("• Gizi ibu saat hamil sedang");
  if (s.z < -2) notes.push("⚠️ Tinggi badan di bawah standar WHO");
  if (notes.length === 0) notes.push("✅ Tidak ada faktor risiko maternal signifikan");
  return notes;
}

const clamp = (n: number, lo: number, hi: number) => (Number.isNaN(n) ? lo : Math.min(Math.max(n, lo), hi));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
