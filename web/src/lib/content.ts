import type { StatusClass } from "./model";

export interface StatusConfig {
  emoji: string;
  title: string;
  desc: string;
  tone: "normal" | "warning" | "danger" | "tall";
  recommendations: string[];
}

export const STATUS_CONFIG: Record<StatusClass, StatusConfig> = {
  Normal: {
    emoji: "✅",
    title: "STATUS GIZI NORMAL",
    desc: "Pertumbuhan anak sesuai standar WHO untuk usianya.",
    tone: "normal",
    recommendations: [
      "Pertahankan pola makan seimbang dengan gizi lengkap",
      "Pemeriksaan tumbuh kembang rutin di posyandu",
      "Pastikan asupan protein, vitamin, dan mineral cukup",
      "Berikan ASI eksklusif / MPASI bergizi",
      "Pantau pertumbuhan setiap bulan",
    ],
  },
  Stunted: {
    emoji: "⚠️",
    title: "RISIKO STUNTING TERDETEKSI",
    desc: "Tinggi badan anak di bawah standar usianya. Perlu intervensi.",
    tone: "warning",
    recommendations: [
      "🏥 Segera konsultasi ke puskesmas atau dokter anak",
      "🥗 Tingkatkan asupan protein hewani (telur, ikan, daging)",
      "💊 Periksa kemungkinan defisiensi zat besi & zinc",
      "🩺 Pantau tumbuh kembang setiap bulan",
      "💧 Pastikan akses air bersih & sanitasi baik",
    ],
  },
  "Severely Stunted": {
    emoji: "🚨",
    title: "RISIKO STUNTING BERAT",
    desc: "Tinggi badan sangat di bawah standar. SEGERA ke fasilitas kesehatan!",
    tone: "danger",
    recommendations: [
      "🚨 SEGERA bawa ke puskesmas/rumah sakit",
      "🩺 Pemeriksaan medis lengkap diperlukan",
      "🍽️ Program pemulihan gizi intensif",
      "👨‍⚕️ Konsultasi ahli gizi & dokter anak",
      "📋 Pemantauan rutin tenaga kesehatan",
    ],
  },
  Tinggi: {
    emoji: "🌟",
    title: "TINGGI DI ATAS RATA-RATA",
    desc: "Tinggi badan di atas standar usianya — pertumbuhan sangat baik.",
    tone: "tall",
    recommendations: [
      "Pertumbuhan sangat baik, pertahankan!",
      "Lanjutkan pola makan & gaya hidup sehat",
      "Tetap lakukan pemeriksaan rutin",
      "Pantau berat badan agar tetap seimbang",
    ],
  },
};

export const FACTORS = [
  { icon: "📅", title: "Umur Anak", desc: "Acuan standar pertumbuhan WHO per usia" },
  { icon: "⚧", title: "Jenis Kelamin", desc: "Standar WHO berbeda laki-laki & perempuan" },
  { icon: "📐", title: "Tinggi Badan", desc: "Indikator utama (Height-for-Age Z-Score)" },
  { icon: "⚖️", title: "Berat Badan", desc: "Indikator status gizi (Weight-for-Age)" },
  { icon: "👶", title: "Jarak Kehamilan", desc: "Jarak <24 bln tingkatkan risiko (BKKBN 4T)" },
  { icon: "💍", title: "Usia Ibu Menikah", desc: "Pernikahan dini <20 thn = faktor risiko" },
  { icon: "🍎", title: "Gizi Ibu Saat Hamil", desc: "KEK saat hamil → BBLR → stunting" },
];

export const FEATURE_IMPORTANCE = [
  { faktor: "Tinggi Badan", bobot: 50.6 },
  { faktor: "Umur", bobot: 28.67 },
  { faktor: "Berat Badan", bobot: 9.45 },
  { faktor: "Jarak Kehamilan", bobot: 4.31 },
  { faktor: "Usia Ibu Menikah", bobot: 4.19 },
  { faktor: "Gizi Ibu Hamil", bobot: 1.52 },
  { faktor: "Jenis Kelamin", bobot: 1.27 },
];

export const MODEL_SPEC = [
  ["Algoritma", "Random Forest Classifier"],
  ["Jumlah Fitur", "7 faktor"],
  ["Jumlah Trees", "120 trees"],
  ["Max Depth", "14 levels"],
  ["Training Data", "20.000 sampel (80%)"],
  ["Test Accuracy", "88,40%"],
  ["F1-Score (Macro)", "83,56%"],
  ["Cross-Validation", "87,31% ± 0,42%"],
  ["Dataset Total", "25.000 sampel"],
];

export const REFERENCES = [
  "Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5-32.",
  "WHO (2006). WHO Child Growth Standards. Geneva.",
  "Apriluana & Fikawati (2018). Analisis Faktor Risiko Stunting pada Balita. Media Litbangkes, 28(4).",
  "SSGI 2024. Survei Status Gizi Indonesia. Kementerian Kesehatan RI.",
  "BKKBN. Program 4 Terlalu (4T) dalam pencegahan stunting.",
];

export const ETHICS = [
  { icon: "🔒", title: "Privasi Data", desc: "Aplikasi TIDAK menyimpan data input. Seluruh inferensi berjalan di perangkat (browser) dan langsung dilupakan." },
  { icon: "⚖️", title: "Fairness", desc: "Akurasi laki-laki (89,30%) vs perempuan (87,46%). Disparitas 1,83% — di bawah standar industri 5%." },
  { icon: "🔍", title: "Transparency", desc: "Confidence score, probabilitas, & analisis faktor risiko selalu ditampilkan — bukan black-box." },
  { icon: "🛡️", title: "Safety", desc: "Disclaimer jelas: bukan diagnosis medis. Kasus berat diarahkan ke fasilitas kesehatan." },
  { icon: "🌐", title: "Accessibility", desc: "Gratis, mobile-friendly, mendukung SDG #3 Good Health & Well-being." },
  { icon: "📚", title: "Edukatif", desc: "Menampilkan Z-Score WHO & catatan faktor risiko agar pengguna paham konteks." },
  { icon: "🧪", title: "Eksperimental & Jujur", desc: "Fitur analisis foto bersifat eksperimental, berjalan di perangkat, dan hanya menyesuaikan hasil dengan bobot dibatasi (maks ±10%) — model Random Forest tidak diubah, dan perubahan selalu ditampilkan sebelum→sesudah." },
];

export const FAIRNESS_AUDIT = [
  { kelompok: "Laki-laki", akurasi: "89,30%", f1: "85,13%", status: "✅ Fair" },
  { kelompok: "Perempuan", akurasi: "87,46%", f1: "81,92%", status: "✅ Fair" },
  { kelompok: "Disparitas", akurasi: "1,83%", f1: "3,21%", status: "✅ < 5%" },
];
