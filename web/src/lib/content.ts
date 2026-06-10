// Static content shared across tabs — kept in one place so copy stays
// consistent and the components stay presentational.

export type StatusKey = "Normal" | "Severely Stunted" | "Stunted" | "Tinggi";

// Output index order MUST match the ONNX model's `probabilities` tensor:
// 0=Normal, 1=Severely Stunted, 2=Stunted, 3=Tinggi
export const STATUS_ORDER: StatusKey[] = [
  "Normal",
  "Severely Stunted",
  "Stunted",
  "Tinggi",
];

export interface ResultConfig {
  label: string;
  tone: "normal" | "tall" | "warning" | "danger";
  headline: string;
  description: string;
  recommendations: string[];
}

export const RESULT_CONFIG: Record<StatusKey, ResultConfig> = {
  Normal: {
    label: "Status Gizi Normal",
    tone: "normal",
    headline: "Pertumbuhan sesuai standar",
    description:
      "Tinggi badan anak berada dalam rentang normal WHO untuk usianya. Pertahankan kebiasaan baik ini.",
    recommendations: [
      "Pertahankan pola makan seimbang dengan gizi lengkap",
      "Lakukan pemeriksaan tumbuh kembang rutin di posyandu",
      "Pastikan asupan protein, vitamin, dan mineral mencukupi",
      "Lanjutkan ASI eksklusif / MPASI bergizi sesuai usia",
      "Pantau pertumbuhan setiap bulan",
    ],
  },
  Stunted: {
    label: "Risiko Stunting Terdeteksi",
    tone: "warning",
    headline: "Tinggi badan di bawah standar usianya",
    description:
      "Hasil menunjukkan indikasi stunting. Intervensi gizi lebih dini akan sangat membantu pemulihan.",
    recommendations: [
      "Segera konsultasi ke puskesmas atau dokter anak",
      "Tingkatkan asupan protein hewani (telur, ikan, daging, hati)",
      "Periksa kemungkinan defisiensi zat besi dan zinc",
      "Pantau tumbuh kembang setiap bulan secara ketat",
      "Pastikan akses air bersih dan sanitasi yang baik",
    ],
  },
  "Severely Stunted": {
    label: "Risiko Stunting Berat",
    tone: "danger",
    headline: "Tinggi badan sangat di bawah standar",
    description:
      "Hasil menunjukkan risiko stunting berat. Anak perlu segera dievaluasi oleh tenaga kesehatan.",
    recommendations: [
      "Segera bawa anak ke puskesmas atau rumah sakit",
      "Lakukan pemeriksaan medis lengkap",
      "Ikuti program pemulihan gizi intensif",
      "Konsultasi dengan ahli gizi dan dokter anak",
      "Jalani pemantauan rutin oleh tenaga kesehatan",
    ],
  },
  Tinggi: {
    label: "Tinggi di Atas Rata-rata",
    tone: "tall",
    headline: "Pertumbuhan sangat baik",
    description:
      "Tinggi badan anak berada di atas standar usianya. Pertumbuhan berlangsung sangat baik.",
    recommendations: [
      "Pertahankan pola makan dan gaya hidup sehat",
      "Tetap lakukan pemeriksaan tumbuh kembang rutin",
      "Pantau berat badan agar tetap proporsional",
      "Jaga aktivitas fisik dan istirahat yang cukup",
    ],
  },
};

export interface FactorInfo {
  name: string;
  short: string;
  detail: string;
  importance: number; // % feature importance from the trained model
}

// Feature importances from the trained Random Forest (sum ≈ 100%).
export const FACTORS: FactorInfo[] = [
  { name: "Tinggi Badan", short: "Height-for-Age", detail: "Indikator utama stunting (HAZ).", importance: 50.6 },
  { name: "Umur Anak", short: "Usia (bulan)", detail: "Acuan standar pertumbuhan WHO per usia.", importance: 28.67 },
  { name: "Berat Badan", short: "Weight-for-Age", detail: "Indikator status gizi anak.", importance: 9.45 },
  { name: "Jarak Kehamilan", short: "Birth spacing", detail: "Jarak < 24 bln menaikkan risiko (BKKBN 4T).", importance: 4.31 },
  { name: "Usia Ibu Menikah", short: "Maternal age", detail: "Pernikahan dini < 20 thn = faktor risiko.", importance: 4.19 },
  { name: "Gizi Ibu Hamil", short: "Maternal nutrition", detail: "KEK saat hamil → BBLR → stunting.", importance: 1.52 },
  { name: "Jenis Kelamin", short: "Sex", detail: "Standar WHO berbeda untuk laki-laki & perempuan.", importance: 1.27 },
];

export const MODEL_SPECS: { label: string; value: string }[] = [
  { label: "Algoritma", value: "Random Forest Classifier" },
  { label: "Jumlah Fitur", value: "7 faktor" },
  { label: "Jumlah Trees", value: "120 pohon" },
  { label: "Max Depth", value: "14 level" },
  { label: "Data Latih", value: "20.000 sampel (80%)" },
  { label: "Test Accuracy", value: "88,40%" },
  { label: "F1-Score (Macro)", value: "83,56%" },
  { label: "Cross-Validation", value: "87,31% ± 0,42%" },
  { label: "Dataset Total", value: "25.000 sampel" },
];

export const HEADLINE_STATS = [
  { value: 88.4, decimals: 2, suffix: "%", label: "Akurasi Model", hint: "Test set 5.000 sampel" },
  { value: 83.56, decimals: 2, suffix: "%", label: "F1-Score Macro", hint: "Rata-rata 4 kelas" },
  { value: 87.31, decimals: 2, suffix: "%", label: "Cross-Validation", hint: "± 0,42% (5-fold)" },
  { value: 7, decimals: 0, suffix: "", label: "Faktor Dianalisis", hint: "Anak + maternal" },
];

export const FAIRNESS_ROWS = [
  { group: "Laki-laki", acc: "89,30%", f1: "85,13%", status: "Fair" },
  { group: "Perempuan", acc: "87,46%", f1: "81,92%", status: "Fair" },
  { group: "Disparitas", acc: "1,83%", f1: "3,21%", status: "< 5%" },
];

export const ETHICS = [
  { title: "Privasi Data", body: "Prediksi stunting berjalan 100% di perangkat Anda — data anak tidak dikirim ke server dan langsung dilupakan. Fitur chat AI bersifat opsional: hanya teks pertanyaan yang dikirim ke layanan AI, dan pengguna diingatkan untuk tidak memasukkan data pribadi." },
  { title: "Fairness", body: "Akurasi laki-laki 89,30% vs perempuan 87,46%. Disparitas 1,83% — di bawah ambang industri 5%." },
  { title: "Transparansi", body: "Confidence score, probabilitas tiap kelas, dan catatan faktor risiko selalu ditampilkan — bukan kotak hitam." },
  { title: "Keamanan", body: "Disclaimer jelas: hasil adalah skrining awal, bukan diagnosis medis. Kasus berat diarahkan ke fasilitas kesehatan." },
  { title: "Aksesibilitas", body: "Gratis, ringan, mobile-friendly, dan dapat berjalan offline. Mendukung SDG #3 Good Health & Well-being." },
  { title: "Edukatif", body: "Menampilkan Z-Score WHO dan konteks faktor risiko agar pengguna memahami hasilnya, bukan sekadar label." },
  { title: "Eksperimental & Jujur", body: "Fitur analisis foto memperkirakan proporsi tubuh (wasting/overweight), BUKAN tinggi/stunting yang tak bisa diukur dari foto 2D. Pengaruhnya ke hasil dibatasi (maks ±10 poin), ditampilkan sebelum→sesudah, dan Random Forest tidak dilatih ulang." },
];

export const REFERENCES = [
  "Breiman, L. (2001). Random Forests. Machine Learning, 45(1), 5–32.",
  "WHO (2006). WHO Child Growth Standards. Geneva.",
  "Apriluana & Fikawati (2018). Analisis Faktor Risiko Stunting pada Balita. Media Litbangkes, 28(4).",
  "SSGI 2024. Survei Status Gizi Indonesia. Kementerian Kesehatan RI.",
  "BKKBN. Program 4 Terlalu (4T) dalam pencegahan stunting.",
];
