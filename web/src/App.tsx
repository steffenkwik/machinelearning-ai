import { ScanSearch, BookOpen, BrainCircuit, Scale, Sprout } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Hero } from "@/components/Hero";
import { DetectionTab } from "@/components/DetectionTab";
import { AboutTab } from "@/components/AboutTab";
import { HowItWorksTab } from "@/components/HowItWorksTab";
import { EthicsTab } from "@/components/EthicsTab";
import { useModel } from "@/inference/useModel";

const TABS = [
  { value: "deteksi", label: "Deteksi", icon: ScanSearch },
  { value: "tentang", label: "Tentang", icon: BookOpen },
  { value: "cara-kerja", label: "Cara Kerja AI", icon: BrainCircuit },
  { value: "etika", label: "Etika & Privasi", icon: Scale },
];

export default function App() {
  const { status, predict } = useModel();

  return (
    <div className="min-h-screen">
      <Hero status={status} />

      <main className="container -mt-2 pb-20">
        <Tabs defaultValue="deteksi" className="w-full">
          <div className="sticky top-0 z-20 -mx-6 flex justify-center bg-background/80 px-6 py-3 backdrop-blur-md">
            <TabsList className="flex-wrap justify-center">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  <t.icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="deteksi">
            <DetectionTab status={status} predict={predict} />
          </TabsContent>
          <TabsContent value="tentang">
            <AboutTab />
          </TabsContent>
          <TabsContent value="cara-kerja">
            <HowItWorksTab />
          </TabsContent>
          <TabsContent value="etika">
            <EthicsTab />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border bg-secondary/40">
        <div className="container flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600">
              <Sprout className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-sm font-bold text-brand-800">StuntCare AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Deteksi Dini Stunting Multi-Faktor · AOL Project — BINUS University 2026
          </p>
          <p className="text-xs text-muted-foreground/80">
            Daniel Steffen K · NIM 2602071171 · COMP6065001 LA05-LEC · 7 Faktor · WHO 2006 ·
            SSGI 2024 · Akurasi 88,40%
          </p>
        </div>
      </footer>
    </div>
  );
}
