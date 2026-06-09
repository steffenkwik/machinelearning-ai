import { Sprout, ShieldCheck, Cpu } from "lucide-react";
import { HEADLINE_STATS } from "@/lib/content";
import { CountUp } from "@/components/CountUp";
import type { ModelStatus } from "@/inference/useModel";

function StatusPill({ status }: { status: ModelStatus }) {
  const map: Record<ModelStatus, { text: string; dot: string }> = {
    idle: { text: "Menyiapkan model…", dot: "bg-amber-400" },
    loading: { text: "Memuat model di perangkat…", dot: "bg-amber-400 animate-pulse-glow" },
    ready: { text: "Model siap · inferensi di perangkat", dot: "bg-brand-300" },
    error: { text: "Model gagal dimuat", dot: "bg-rose-400" },
  };
  const s = map[status];
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-50 backdrop-blur">
      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
      {s.text}
    </div>
  );
}

export function Hero({ status }: { status: ModelStatus }) {
  return (
    <header className="relative overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 hero-mesh" aria-hidden />
      <div className="absolute inset-0 grid-lines opacity-60" aria-hidden />
      <div className="orb -right-24 top-10 h-72 w-72 bg-brand-400/25" aria-hidden />
      <div
        className="orb -left-16 bottom-0 h-64 w-64 bg-emerald-500/20"
        style={{ animationDelay: "-6s" }}
        aria-hidden
      />

      <div className="container relative py-7">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-900/40">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-lg font-bold tracking-tight">StuntCare AI</p>
              <p className="text-xs text-emerald-200/80">Early Stunting Detection</p>
            </div>
          </div>
          <div className="hidden sm:block">
            <StatusPill status={status} />
          </div>
        </nav>

        <div className="mx-auto mt-14 max-w-4xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-emerald-100 backdrop-blur">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
            SDG #3 · Good Health and Well-being
          </div>
          <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl">
            Deteksi Dini Risiko{" "}
            <span className="bg-gradient-to-r from-brand-300 via-emerald-200 to-brand-400 bg-clip-text text-transparent">
              Stunting
            </span>{" "}
            pada Balita
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-emerald-100/85 sm:text-lg">
            Sistem <span className="font-semibold text-white">Machine Learning</span> yang
            menganalisis <span className="font-semibold text-white">7 faktor penyebab</span>{" "}
            stunting sekaligus — model Random Forest terlatih, distandarkan ke WHO Child
            Growth Standards 2006.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-50 backdrop-blur">
              <Cpu className="h-4 w-4 text-brand-300" />
              Inferensi 100% di perangkat
            </div>
            <div className="sm:hidden">
              <StatusPill status={status} />
            </div>
          </div>
        </div>

        <dl className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {HEADLINE_STATS.map((s, i) => (
            <div
              key={s.label}
              className="animate-fade-up rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-brand-400/50 hover:bg-white/[0.1]"
              style={{ animationDelay: `${0.15 + i * 0.09}s` }}
            >
              <dd className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </dd>
              <dt className="mt-1 text-sm font-semibold text-emerald-100">{s.label}</dt>
              <p className="mt-0.5 text-xs text-emerald-200/60">{s.hint}</p>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-center text-xs text-emerald-200/70">
          Daniel Steffen K · NIM 2602071171 · LA05-LEC · COMP6065001 · BINUS University
        </p>
      </div>

      <div className="h-10 bg-gradient-to-b from-transparent to-background" aria-hidden />
    </header>
  );
}
