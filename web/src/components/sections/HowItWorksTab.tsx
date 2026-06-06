import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { FEATURE_IMPORTANCE, MODEL_SPEC, REFERENCES } from "@/lib/content";

const STEPS = [
  { n: "1", t: "INPUT 7 FAKTOR", d: "Data anak + data ibu/kehamilan" },
  { n: "2", t: "PREPROCESS", d: "Encoding kategorikal & normalisasi" },
  { n: "3", t: "RANDOM FOREST", d: "120 Decision Trees voting" },
  { n: "4", t: "OUTPUT", d: "Prediksi + confidence + analisis faktor" },
];

const BAR_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#6ee7b7", "#a7f3d0", "#a7f3d0"];

export function HowItWorksTab() {
  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-emerald-900">🧠 Bagaimana AI Bekerja?</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Aplikasi menggunakan <b>Random Forest Classifier</b> (Breiman, 2001) — ensemble{" "}
            <b>120 Decision Tree</b> yang menganalisis <b>7 faktor</b> sekaligus melalui voting
            mayoritas untuk prediksi akurat & stabil. Model berjalan penuh di browser via ONNX Runtime.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl bg-gradient-to-br from-emerald-50 to-white p-5 text-center ring-1 ring-emerald-100">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-base font-extrabold text-white">
                  {s.n}
                </div>
                <p className="mt-3 text-sm font-extrabold text-emerald-900">{s.t}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h4 className="text-base font-bold text-emerald-900">📊 Bobot Kepentingan Tiap Faktor (Feature Importance)</h4>
          <div className="mt-4 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 12, right: 48 }}>
                <XAxis type="number" domain={[0, 55]} hide />
                <YAxis
                  type="category"
                  dataKey="faktor"
                  width={120}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#065f46", fontWeight: 600 }}
                />
                <Bar dataKey="bobot" radius={[0, 8, 8, 0]} barSize={22}>
                  {FEATURE_IMPORTANCE.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i]} />
                  ))}
                  <LabelList dataKey="bobot" position="right" formatter={(v: number) => `${v}%`} fill="#047857" fontSize={12} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h4 className="mb-4 text-base font-bold text-emerald-900">📋 Spesifikasi Model</h4>
            <div className="overflow-hidden rounded-xl border border-emerald-100">
              {MODEL_SPEC.map(([k, v], i) => (
                <div key={k} className={`flex justify-between gap-4 px-4 py-2.5 text-sm ${i % 2 ? "bg-white" : "bg-emerald-50/50"}`}>
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold text-emerald-900">{v}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="mb-4 text-base font-bold text-emerald-900">📚 Referensi</h4>
            <ul className="space-y-3">
              {REFERENCES.map((r, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {i + 1}
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
