import { useEffect } from "react";
import { BookOpen, Brain, ScanSearch, Scale } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hero } from "@/components/sections/Hero";
import { DetectionTab } from "@/components/sections/DetectionTab";
import { AboutTab } from "@/components/sections/AboutTab";
import { HowItWorksTab } from "@/components/sections/HowItWorksTab";
import { EthicsTab } from "@/components/sections/EthicsTab";
import { loadModel } from "@/lib/model";

const TABS = [
  { value: "deteksi", label: "Deteksi", icon: ScanSearch },
  { value: "tentang", label: "Tentang", icon: BookOpen },
  { value: "cara-kerja", label: "Cara Kerja AI", icon: Brain },
  { value: "etika", label: "Etika & Privasi", icon: Scale },
];

export default function App() {
  // Warm up the ONNX session in the background so the first prediction is instant.
  useEffect(() => {
    loadModel().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      <Hero />

      <main className="container -mt-6 pb-20">
        <Tabs defaultValue="deteksi" className="w-full">
          <div className="sticky top-3 z-20 flex justify-center">
            <TabsList>
              {TABS.map(({ value, label, icon: Icon }) => (
                <TabsTrigger key={value} value={value}>
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="deteksi">
            <DetectionTab />
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

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="hero-surface text-emerald-100">
      <div className="container py-10 text-center">
        <p className="text-lg font-extrabold text-white">
          🌱 Deteksi Dini Stunting Multi-Faktor
        </p>
        <p className="mt-1 text-sm text-emerald-200/80">
          AOL Project — BINUS University 2026
        </p>
        <p className="mt-4 text-sm text-emerald-200/70">
          Dibuat oleh <b className="text-emerald-100">Daniel Steffen K</b> · NIM 2602071171 ·
          COMP6065001 LA05-LEC
        </p>
        <p className="mt-1 text-xs text-emerald-300/50">
          7 Faktor · WHO 2006 · SSGI 2024 · Akurasi 88,40% (Excellent) · Inferensi di perangkat
        </p>
      </div>
    </footer>
  );
}
