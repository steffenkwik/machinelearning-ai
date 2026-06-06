import { Card, CardContent } from "@/components/ui/card";
import { ETHICS, FAIRNESS_AUDIT } from "@/lib/content";

export function EthicsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-emerald-900">⚖️ Pertimbangan Etika & Privasi (LO6)</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sebagai aplikasi AI kesehatan, project mengikuti <b>WHO (2021) Ethics & Governance of AI
            for Health</b> dan <b>EU Ethics Guidelines for Trustworthy AI (2019)</b>.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ETHICS.map((e) => (
          <div key={e.title} className="card-elevated border-l-4 border-l-emerald-500 p-5">
            <p className="font-bold text-emerald-900">
              <span className="mr-1.5">{e.icon}</span>
              {e.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{e.desc}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h4 className="mb-4 text-base font-bold text-emerald-900">📊 Hasil Audit Fairness</h4>
          <div className="overflow-hidden rounded-xl border border-emerald-100">
            <div className="grid grid-cols-4 bg-emerald-600 text-xs font-bold text-white">
              {["Kelompok", "Akurasi", "F1-Score", "Status"].map((h) => (
                <div key={h} className="px-4 py-2.5">{h}</div>
              ))}
            </div>
            {FAIRNESS_AUDIT.map((r, i) => (
              <div key={r.kelompok} className={`grid grid-cols-4 text-sm ${i % 2 ? "bg-white" : "bg-emerald-50/50"}`}>
                <div className="px-4 py-2.5 font-semibold text-emerald-900">{r.kelompok}</div>
                <div className="px-4 py-2.5 text-muted-foreground">{r.akurasi}</div>
                <div className="px-4 py-2.5 text-muted-foreground">{r.f1}</div>
                <div className="px-4 py-2.5 font-medium text-emerald-700">{r.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
