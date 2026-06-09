import { Target, Lightbulb, Users, Package, GraduationCap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FACTORS } from "@/lib/content";

const INFO = [
  {
    icon: Target,
    title: "Masalah yang diatasi",
    body: "Prevalensi stunting Indonesia 19,8% (SSGI 2024, Kemenkes RI) — sekitar 4,4 juta balita. Stunting dipicu banyak faktor yang saling terkait, bukan hanya tinggi badan.",
  },
  {
    icon: Lightbulb,
    title: "Solusi",
    body: "Aplikasi web berbasis ML yang menghitung 7 faktor penyebab stunting sekaligus — dari data anak (umur, kelamin, tinggi, berat) hingga riwayat maternal (jarak kehamilan, usia ibu, gizi saat hamil).",
  },
  {
    icon: Users,
    title: "Penerima manfaat",
    body: "Orang tua balita untuk monitoring mandiri, kader posyandu untuk skrining massal yang lebih akurat, dan dinas kesehatan untuk data kebijakan SDG #3.",
  },
  {
    icon: Package,
    title: "Output produk (MVP)",
    body: "Web app real-time, prediksi 4 kategori dari 7 faktor, confidence score, analisis faktor risiko, dan rekomendasi tindak lanjut otomatis.",
  },
];

const LEARNING_OUTCOMES = [
  {
    code: "LO5",
    title: "Apply learning algorithms to solve problems",
    body: "Implementasi Random Forest (ensemble 120 trees) yang dilatih pada 7 faktor penyebab stunting untuk klasifikasi 4 kategori status gizi — akurasi 88,40%.",
  },
  {
    code: "LO6",
    title: "Analyze the role of Ethics in AI",
    body: "Analisis privasi data (tidak disimpan), fairness antar gender (disparitas 1,83%), transparansi (confidence score), dan safety (disclaimer medis).",
  },
];

export function AboutTab() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {INFO.map((it) => (
          <Card key={it.title}>
            <CardContent className="p-6">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-brand-800">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section>
        <h3 className="mb-4 font-display text-lg font-bold text-brand-900">
          7 faktor penyebab yang dihitung
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACTORS.map((f, i) => (
            <Card key={f.name} className="border-l-4 border-l-brand-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-brand-500">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-brand-600">
                    {f.importance}%
                  </span>
                </div>
                <h4 className="mt-1 font-display text-sm font-bold text-foreground">{f.name}</h4>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-brand-600" />
          <h3 className="font-display text-lg font-bold text-brand-900">
            Kaitan dengan Learning Outcomes
          </h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {LEARNING_OUTCOMES.map((lo) => (
            <Card key={lo.code}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-brand-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
                    {lo.code}
                  </span>
                  <h4 className="font-display text-sm font-bold text-brand-800">{lo.title}</h4>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lo.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
