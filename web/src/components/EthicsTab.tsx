import {
  Lock,
  Scale,
  Eye,
  ShieldCheck,
  Accessibility,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ETHICS, FAIRNESS_ROWS } from "@/lib/content";

const ICONS = [Lock, Scale, Eye, ShieldCheck, Accessibility, BookOpen];

export function EthicsTab() {
  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-brand-900 to-ink text-white">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-bold">Pertimbangan etika &amp; privasi</h3>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-emerald-100/85">
            Sebagai aplikasi AI kesehatan, project ini mengikuti WHO (2021) Ethics &amp;
            Governance of AI for Health dan EU Ethics Guidelines for Trustworthy AI (2019).
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ETHICS.map((e, i) => {
          const Icon = ICONS[i] ?? Lock;
          return (
            <Card key={e.title}>
              <CardContent className="p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-display text-sm font-bold text-brand-800">{e.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section>
        <h3 className="mb-4 font-display text-lg font-bold text-brand-900">Hasil audit fairness</h3>
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left">
                  <th className="px-5 py-3 font-semibold text-brand-800">Kelompok</th>
                  <th className="px-5 py-3 font-semibold text-brand-800">Akurasi</th>
                  <th className="px-5 py-3 font-semibold text-brand-800">F1-Score</th>
                  <th className="px-5 py-3 font-semibold text-brand-800">Status</th>
                </tr>
              </thead>
              <tbody>
                {FAIRNESS_ROWS.map((r) => (
                  <tr key={r.group} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3 font-medium text-foreground">{r.group}</td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">{r.acc}</td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">{r.f1}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
