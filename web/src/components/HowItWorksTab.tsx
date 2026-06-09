import { ListChecks, Binary, Trees, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/Reveal";
import { FACTORS, MODEL_SPECS, REFERENCES } from "@/lib/content";

const STEPS = [
  { icon: ListChecks, title: "Input 7 faktor", body: "Data anak + data ibu / kehamilan." },
  { icon: Binary, title: "Preprocess", body: "Encoding kategorikal & penyusunan fitur." },
  { icon: Trees, title: "Random Forest", body: "120 decision tree melakukan voting." },
  { icon: BarChart3, title: "Output", body: "Prediksi + confidence + analisis faktor." },
];

export function HowItWorksTab() {
  const maxImp = Math.max(...FACTORS.map((f) => f.importance));
  return (
    <div className="space-y-8">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold text-brand-900">
            Bagaimana AI bekerja?
          </h3>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Aplikasi menggunakan <strong>Random Forest Classifier</strong> (Breiman, 2001) —
            ensemble 120 decision tree yang menganalisis 7 faktor sekaligus melalui voting
            mayoritas untuk prediksi yang akurat dan stabil.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="group animate-fade-up interactive-card relative rounded-2xl border border-border bg-secondary/40 p-4"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="font-mono text-xs font-semibold text-brand-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <s.icon className="mt-2 h-6 w-6 text-brand-600 transition-transform duration-300 group-hover:scale-110" />
                <h4 className="mt-2 font-display text-sm font-bold text-foreground">{s.title}</h4>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
        <Card className="interactive-card h-full">
          <CardContent className="p-6">
            <h3 className="font-display text-base font-bold text-brand-800">
              Bobot kepentingan tiap faktor
            </h3>
            <p className="mb-4 text-xs text-muted-foreground">Feature importance Random Forest</p>
            <div className="space-y-3">
              {FACTORS.map((f) => (
                <div key={f.name}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{f.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{f.importance}%</span>
                  </div>
                  <Progress value={(f.importance / maxImp) * 100} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </Reveal>

        <Reveal delay={100}>
        <Card className="interactive-card h-full">
          <CardContent className="p-6">
            <h3 className="mb-4 font-display text-base font-bold text-brand-800">
              Spesifikasi model
            </h3>
            <dl className="divide-y divide-border">
              {MODEL_SPECS.map((s) => (
                <div key={s.label} className="flex items-center justify-between py-2.5">
                  <dt className="text-sm text-muted-foreground">{s.label}</dt>
                  <dd className="text-sm font-semibold text-foreground">{s.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        </Reveal>
      </div>

      <Reveal>
      <Card className="interactive-card">
        <CardContent className="p-6">
          <h3 className="mb-3 font-display text-base font-bold text-brand-800">Referensi</h3>
          <ul className="space-y-2">
            {REFERENCES.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-muted-foreground">
                <span className="font-mono text-xs text-brand-500">[{i + 1}]</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      </Reveal>
    </div>
  );
}
