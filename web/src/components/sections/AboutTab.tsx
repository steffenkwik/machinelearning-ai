import { Lightbulb, Package, Target, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FACTORS } from "@/lib/content";

const INFO = [
  {
    icon: Target,
    title: "Masalah yang Diatasi",
    body: "Prevalensi stunting Indonesia 19,8% (SSGI 2024, Kemenkes RI) — sekitar 4,4 juta balita. Stunting disebabkan banyak faktor yang saling terkait, tidak hanya tinggi badan.",
  },
  {
    icon: Lightbulb,
    title: "Solusi",
    body: "Web app berbasis ML yang menghitung 7 faktor penyebab stunting sekaligus — dari data anak (umur, kelamin, tinggi, berat) hingga riwayat maternal (jarak kehamilan, usia ibu, gizi hamil).",
  },
];

const BENEFIT = [
  { icon: Users, title: "Penerima Manfaat", items: ["Orang Tua Balita — monitoring mandiri di rumah", "Kader Posyandu — skrining massal lebih akurat", "Dinas Kesehatan — data untuk kebijakan SDG #3"] },
  { icon: Package, title: "Output / Produk (MVP)", items: ["Web App real-time (in-browser AI)", "Prediksi 4 kategori dari 7 faktor", "Confidence score & analisis faktor risiko", "Rekomendasi tindak lanjut otomatis"] },
];

const LO = [
  { lo: "LO5 — Apply learning algorithms to solve problems", d: "Implementasi Random Forest (ensemble, 120 trees) yang dilatih pada 7 faktor penyebab stunting untuk klasifikasi 4 kategori status gizi — akurasi 88,40%." },
  { lo: "LO6 — Analyze the role of Ethics in AI", d: "Analisis privasi data (tidak disimpan), fairness antar gender (disparitas 1,83%), transparansi (confidence score), dan safety (disclaimer medis)." },
];

export function AboutTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {INFO.map(({ icon: Icon, title, body }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h4 className="font-bold text-emerald-900">{title}</h4>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {BENEFIT.map(({ icon: Icon, title, items }) => (
          <Card key={title}>
            <CardContent className="p-6">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <h4 className="font-bold text-emerald-900">{title}</h4>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="text-emerald-500">›</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-emerald-900">🧬 7 Faktor Penyebab Stunting yang Dihitung</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FACTORS.map((f) => (
            <div key={f.title} className="card-elevated border-l-4 border-l-amber-400 p-4">
              <p className="font-bold text-emerald-900">
                <span className="mr-1.5">{f.icon}</span>
                {f.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-bold text-emerald-900">🎓 Kaitan dengan Learning Outcomes</h3>
        <Accordion type="single" collapsible className="space-y-3">
          {LO.map((x, i) => (
            <AccordionItem key={i} value={`lo-${i}`}>
              <AccordionTrigger>📌 {x.lo}</AccordionTrigger>
              <AccordionContent>{x.d}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
