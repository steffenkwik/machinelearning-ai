import { Activity, Cpu, ShieldCheck, Sparkles, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STATS = [
  { label: "Akurasi Model", value: "88,40%", icon: Target },
  { label: "F1-Score Macro", value: "83,56%", icon: Activity },
  { label: "Cross-Validation", value: "87,31%", icon: Cpu },
  { label: "Faktor Dianalisis", value: "7", icon: Sparkles },
];

export function Hero() {
  return (
    <header className="relative overflow-hidden hero-surface text-emerald-50">
      <div className="absolute inset-0 grid-overlay" />
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl animate-glow-pulse" />
      <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl animate-glow-pulse" />

      <div className="container relative z-10 py-12 md:py-16">
        {/* top bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/15 neon-ring">
              <span className="text-2xl">🌱</span>
            </div>
            <div className="leading-tight">
              <p className="text-base font-extrabold tracking-tight">StuntCare AI</p>
              <p className="text-xs text-emerald-300/80">Early Stunting Detection</p>
            </div>
          </div>
          <Badge variant="glass" className="hidden sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" /> Inferensi 100% di perangkat
          </Badge>
        </div>

        {/* headline */}
        <div className="mt-10 max-w-3xl animate-fade-up">
          <Badge variant="glass" className="mb-5">
            <Target className="h-3.5 w-3.5" /> SDG #3 · Good Health and Well-being
          </Badge>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Deteksi Dini Risiko{" "}
            <span className="gradient-text text-glow">Stunting</span> pada Balita
          </h1>
          <p className="mt-5 max-w-2xl text-base text-emerald-100/80 md:text-lg">
            Sistem prediksi <span className="font-semibold text-emerald-200">Machine Learning</span>{" "}
            yang menganalisis <span className="font-semibold text-emerald-200">7 faktor penyebab</span>{" "}
            stunting sekaligus — model <span className="font-semibold text-emerald-200">Random Forest</span>{" "}
            terlatih, distandarkan ke <span className="font-semibold text-emerald-200">WHO Child Growth Standards 2006</span>.
          </p>
        </div>

        {/* stat chips */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map(({ label, value, icon: Icon }, i) => (
            <div
              key={label}
              className="glass-card rounded-2xl p-4 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <Icon className="h-5 w-5 text-emerald-300" />
              <p className="mt-3 text-2xl font-extrabold text-white">{value}</p>
              <p className="text-xs text-emerald-200/70">{label}</p>
            </div>
          ))}
        </div>

        {/* author ribbon */}
        <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-emerald-400/20 bg-emerald-950/40 px-4 py-3 text-xs text-emerald-200/80 backdrop-blur">
          <span className="font-bold text-emerald-100">👨‍🎓 Daniel Steffen K</span>
          <Dot /> NIM 2602071171 <Dot /> LA05-LEC <Dot /> COMP6065001 <Dot /> BINUS University
        </div>
      </div>
    </header>
  );
}

function Dot() {
  return <span className="text-emerald-500/50">·</span>;
}
