// Basis pengetahuan terkurasi tentang stunting & gizi balita (WHO / Kemenkes).
// Dipakai oleh asisten tanya-jawab yang berjalan 100% di perangkat — gratis,
// tanpa API key, tanpa internet. Pencocokan berbasis kata kunci sederhana.

export interface KBEntry {
  id: string;
  title: string; // untuk tombol saran
  keywords: string[];
  answer: string;
}

export const KNOWLEDGE: KBEntry[] = [
  {
    id: "apa-itu",
    title: "Apa itu stunting?",
    keywords: ["apa itu stunting", "pengertian stunting", "definisi", "stunting itu apa", "arti stunting"],
    answer:
      "Stunting adalah kondisi gagal tumbuh pada balita akibat kekurangan gizi kronis (jangka panjang), ditandai tinggi badan lebih pendek dari standar usianya — yaitu Z-Score tinggi-untuk-umur (HAZ) di bawah −2 SD menurut WHO.\n\nStunting berbeda dari sekadar “anak pendek karena keturunan”: ia berkaitan dengan gizi, kesehatan, dan sanitasi sejak dalam kandungan.",
  },
  {
    id: "ciri",
    title: "Ciri-ciri anak stunting",
    keywords: ["ciri", "tanda", "gejala", "kenali", "terlihat", "ciri ciri stunting", "tanda stunting"],
    answer:
      "Beberapa tanda yang perlu diwaspadai:\n• Tinggi badan jelas lebih pendek dari anak seusianya\n• Pertambahan tinggi lambat dari bulan ke bulan\n• Berat badan cenderung kurang\n• Perkembangan (duduk, berjalan, bicara) bisa terlambat\n• Mudah sakit / daya tahan lemah\n\nCatatan: stunting tidak selalu terlihat jelas — anak bisa tampak “normal tapi kecil”. Pemeriksaan tinggi-untuk-umur di posyandu adalah cara paling tepat.",
  },
  {
    id: "penyebab",
    title: "Penyebab stunting",
    keywords: ["penyebab", "kenapa", "faktor", "akibat", "mengapa stunting", "penyebab stunting"],
    answer:
      "Stunting disebabkan banyak faktor yang saling terkait, bukan satu hal saja:\n• Asupan gizi anak kurang (terutama protein, zat besi, zinc)\n• Gizi ibu kurang saat hamil (KEK) → bayi lahir berat rendah (BBLR)\n• ASI tidak eksklusif / MPASI kurang tepat\n• Jarak kehamilan terlalu dekat (<24 bulan)\n• Pernikahan/kehamilan usia dini\n• Sanitasi & air bersih buruk, infeksi berulang (diare)\n\nKarena itu pencegahannya pun harus menyentuh banyak faktor sekaligus.",
  },
  {
    id: "cegah",
    title: "Cara mencegah stunting",
    keywords: ["cara mencegah", "mencegah", "pencegahan", "hindari", "cegah stunting", "biar tidak stunting", "agar tidak stunting", "supaya tidak stunting", "tips"],
    answer:
      "Langkah utama pencegahan stunting:\n• Penuhi gizi ibu sejak hamil (makan bergizi, minum tablet tambah darah)\n• Beri ASI eksklusif 0–6 bulan, lanjutkan sampai 2 tahun\n• MPASI bergizi mulai usia 6 bulan, kaya protein hewani\n• Pantau tumbuh kembang rutin di posyandu tiap bulan\n• Lengkapi imunisasi dasar\n• Jaga sanitasi: air bersih, cuci tangan, jamban sehat\n• Atur jarak kehamilan (ideal >24 bulan)\n\nFokus paling penting ada pada 1000 Hari Pertama Kehidupan (sejak hamil sampai usia 2 tahun).",
  },
  {
    id: "1000hpk",
    title: "1000 Hari Pertama Kehidupan",
    keywords: ["1000 hari", "hpk", "1000 hpk", "seribu hari", "periode emas", "golden"],
    answer:
      "1000 Hari Pertama Kehidupan (HPK) = 270 hari masa kehamilan + 730 hari (2 tahun pertama). Ini “periode emas” pertumbuhan otak dan tubuh.\n\nGizi dan kesehatan yang baik pada masa ini paling menentukan pencegahan stunting. Setelah usia 2 tahun, dampak stunting jauh lebih sulit diperbaiki — jadi intervensi paling efektif dilakukan di periode ini.",
  },
  {
    id: "asi",
    title: "ASI eksklusif",
    keywords: ["asi", "menyusui", "asi eksklusif", "air susu ibu", "berapa lama asi"],
    answer:
      "ASI eksklusif = hanya ASI saja (tanpa air, susu formula, atau makanan lain) selama 0–6 bulan.\n• Mulai sejak lahir (Inisiasi Menyusu Dini)\n• Berikan sesering bayi mau, siang & malam\n• Lanjutkan ASI sampai usia 2 tahun bersama MPASI\n\nASI mengandung gizi lengkap dan antibodi yang melindungi bayi dari infeksi — pelindung penting dari stunting.",
  },
  {
    id: "mpasi",
    title: "MPASI yang tepat",
    keywords: ["mpasi", "makanan pendamping", "makanan bayi 6 bulan", "mpasi pertama", "kapan mpasi"],
    answer:
      "MPASI (Makanan Pendamping ASI) dimulai tepat usia 6 bulan, sambil tetap menyusui.\n• Tekstur bertahap: lumat → cincang → makanan keluarga\n• Frekuensi bertambah sesuai usia (2–3x makan + camilan)\n• WAJIB ada protein hewani tiap kali makan: telur, ikan, hati ayam, daging\n• Tambahkan sayur, buah, dan sedikit lemak sehat (minyak/santan)\n• Jaga kebersihan saat menyiapkan makanan\n\nHindari memberi MPASI terlalu dini (<6 bln) atau terlambat.",
  },
  {
    id: "protein",
    title: "Protein hewani",
    keywords: ["protein", "telur", "ikan", "daging", "hati", "protein hewani", "lauk"],
    answer:
      "Protein hewani sangat penting mencegah stunting karena kaya zat besi, zinc, dan asam amino untuk pertumbuhan.\nSumber murah & bergizi:\n• Telur (1 butir/hari sangat dianjurkan)\n• Ikan (termasuk ikan kembung, lele, teri)\n• Hati ayam (kaya zat besi & vitamin A)\n• Daging ayam/sapi\n\nUsahakan ada protein hewani di setiap kali makan anak, sejak MPASI.",
  },
  {
    id: "gizi-seimbang",
    title: "Menu bergizi balita",
    keywords: ["menu", "makanan bergizi", "gizi seimbang", "makanan sehat", "makanan anak", "makanan 2 tahun", "makanan balita", "isi piringku"],
    answer:
      "Pakai prinsip “Isi Piringku” untuk balita:\n• ⅓ makanan pokok (nasi/kentang/ubi)\n• ⅓ sayur dan buah\n• ⅓ lauk — utamakan protein hewani (telur, ikan, hati, daging) + protein nabati (tahu, tempe)\n• Tambah sedikit minyak/santan sebagai sumber energi\n• Batasi gula, garam, dan makanan kemasan\n\nBeri makan teratur dengan porsi sesuai usia, dan dampingi anak saat makan.",
  },
  {
    id: "jarak-hamil",
    title: "Jarak kehamilan",
    keywords: ["jarak kehamilan", "jarak hamil", "4 terlalu", "bkkbn", "terlalu dekat", "jarak anak", "kb"],
    answer:
      "Jarak kehamilan ideal lebih dari 24 bulan. Jarak terlalu dekat membuat tubuh ibu belum pulih, sehingga gizi untuk kehamilan berikutnya kurang — menaikkan risiko stunting.\n\nIni bagian dari program “4 Terlalu” BKKBN: hindari Terlalu muda, Terlalu tua, Terlalu dekat, dan Terlalu banyak. Mengatur jarak kehamilan (mis. dengan KB) membantu mencegah stunting.",
  },
  {
    id: "gizi-ibu",
    title: "Gizi ibu hamil (KEK)",
    keywords: ["ibu hamil", "gizi ibu", "kek", "kurang energi kronis", "bblr", "hamil", "bumil"],
    answer:
      "Gizi ibu saat hamil sangat menentukan. KEK (Kurang Energi Kronis) = ibu kekurangan gizi dalam waktu lama (sering ditandai LiLA <23,5 cm). KEK bisa menyebabkan BBLR (bayi lahir <2,5 kg) yang berisiko stunting.\n\nUntuk ibu hamil:\n• Makan beragam & cukup, tambah porsi protein\n• Minum Tablet Tambah Darah (zat besi+asam folat) tiap hari\n• Periksa kehamilan rutin (minimal 6x) di bidan/puskesmas",
  },
  {
    id: "nikah-dini",
    title: "Pernikahan dini",
    keywords: ["nikah dini", "pernikahan dini", "menikah muda", "usia ibu", "hamil muda", "remaja"],
    answer:
      "Menikah dan hamil di usia terlalu muda (<20 tahun) menambah risiko stunting, karena tubuh remaja belum siap untuk kehamilan dan kebutuhan gizinya bersaing antara ibu dan janin.\n\nUsia ideal kehamilan adalah 20–35 tahun. Menunda kehamilan sampai siap secara fisik dan gizi membantu menurunkan risiko BBLR dan stunting.",
  },
  {
    id: "posyandu",
    title: "Pentingnya posyandu",
    keywords: ["posyandu", "timbang", "pantau", "tumbuh kembang", "kms", "ukur tinggi", "kontrol"],
    answer:
      "Bawa anak ke posyandu/puskesmas rutin tiap bulan untuk:\n• Menimbang berat & mengukur tinggi badan\n• Memantau grafik pertumbuhan (KMS)\n• Imunisasi dan vitamin A\n• Konsultasi gizi\n\nDeteksi dini sangat penting — jika tinggi/berat tidak naik 1–2 bulan berturut-turut, segera konsultasi agar bisa ditangani sebelum menjadi stunting.",
  },
  {
    id: "sanitasi",
    title: "Sanitasi & air bersih",
    keywords: ["sanitasi", "air bersih", "cuci tangan", "jamban", "diare", "kebersihan", "bab"],
    answer:
      "Sanitasi buruk menyebabkan infeksi berulang (terutama diare) yang membuat gizi tidak terserap → memicu stunting.\nLangkah penting:\n• Gunakan air bersih untuk minum & masak\n• Cuci tangan pakai sabun (sebelum makan/menyiapkan makanan, setelah BAB)\n• BAB di jamban sehat, jangan sembarangan\n• Jaga kebersihan alat makan & makanan bayi",
  },
  {
    id: "imunisasi",
    title: "Imunisasi & vitamin A",
    keywords: ["imunisasi", "vaksin", "vitamin a", "imun", "campak"],
    answer:
      "Imunisasi dasar lengkap melindungi anak dari penyakit infeksi yang bisa menghambat pertumbuhan dan memicu stunting.\n• Lengkapi imunisasi dasar sesuai jadwal (hepatitis B, polio, BCG, DPT-HB-Hib, campak/MR)\n• Berikan kapsul Vitamin A tiap Februari & Agustus (usia 6–59 bulan)\n\nSemua tersedia gratis di posyandu/puskesmas.",
  },
  {
    id: "zat-besi",
    title: "Zat besi, zinc & anemia",
    keywords: ["zat besi", "zinc", "anemia", "tablet tambah darah", "ttd", "kurang darah", "suplemen"],
    answer:
      "Zat besi dan zinc penting untuk pertumbuhan dan mencegah anemia. Kekurangan zat besi (anemia) pada ibu hamil dan anak berkaitan erat dengan stunting.\n• Ibu hamil & remaja putri: minum Tablet Tambah Darah\n• Anak: beri makanan kaya zat besi (hati, daging merah, telur, ikan, sayuran hijau)\n• Saat diare, zinc (sesuai anjuran tenaga kesehatan) membantu pemulihan\n\nUntuk suplemen/dosis, ikuti anjuran posyandu atau dokter.",
  },
  {
    id: "beda-gizi-buruk",
    title: "Beda stunting & gizi buruk",
    keywords: ["beda", "perbedaan", "gizi buruk", "wasting", "kurus", "stunting vs", "marasmus"],
    answer:
      "• Stunting = PENDEK untuk umur (masalah kronis/jangka panjang) — diukur dari tinggi-untuk-umur.\n• Wasting/gizi buruk = KURUS (masalah akut/baru terjadi) — diukur dari berat-untuk-tinggi.\n\nAnak bisa stunting tapi tidak kurus, atau sebaliknya. Keduanya bentuk masalah gizi dan butuh perhatian. Aplikasi ini menilai status berdasarkan tinggi-untuk-umur (kategori stunting).",
  },
  {
    id: "zscore",
    title: "Membaca Z-Score / hasil",
    keywords: ["z-score", "zscore", "haz", "baca hasil", "arti hasil", "severely", "normal", "sd"],
    answer:
      "Hasil dihitung dari Z-Score tinggi-untuk-umur (HAZ) standar WHO:\n• ≥ −2 SD → Normal\n• −3 sampai −2 SD → Stunted (pendek)\n• < −3 SD → Severely Stunted (sangat pendek)\n• > +2 SD → Tinggi di atas rata-rata\n\nZ-Score 0 = persis rata-rata anak seusianya. Hasil aplikasi ini adalah skrining awal — bukan diagnosis. Untuk kepastian, periksakan ke tenaga kesehatan.",
  },
  {
    id: "terlambat-tinggi",
    title: "Tinggi tidak naik",
    keywords: ["tidak naik", "tidak bertambah", "lambat tinggi", "berhenti tumbuh", "pendek", "tinggi kurang"],
    answer:
      "Jika tinggi/berat badan anak tidak naik selama 1–2 bulan berturut-turut, jangan tunggu:\n• Segera bawa ke posyandu/puskesmas untuk diperiksa\n• Evaluasi pola makan — tambah protein hewani & frekuensi makan\n• Periksa kemungkinan infeksi berulang/cacingan\n• Pastikan ASI/MPASI cukup dan tepat\n\nPenanganan dini jauh lebih efektif daripada menunggu sampai jelas stunting.",
  },
];

const GREETINGS = ["halo", "hai", "hi", "hallo", "assalam", "pagi", "siang", "sore", "malam"];
const THANKS = ["terima kasih", "makasih", "thanks", "thx", "trims"];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export interface KBResult {
  answer: string;
  matched: boolean;
}

/** Find the best curated answer for a free-text question. */
export function findAnswer(query: string): KBResult {
  const q = normalize(query);
  if (!q) return { answer: "Silakan tulis pertanyaan tentang stunting atau gizi balita.", matched: false };

  if (THANKS.some((t) => q.includes(t)))
    return { answer: "Sama-sama! Semoga membantu menjaga tumbuh kembang si kecil. 🌱", matched: true };
  if (GREETINGS.some((g) => q.includes(g)) && q.split(" ").length <= 3)
    return {
      answer:
        "Halo! Saya asisten edukasi gizi & stunting. Tanyakan, misalnya: cara mencegah stunting, menu MPASI, atau pentingnya ASI eksklusif.",
      matched: true,
    };

  let best: KBEntry | null = null;
  let bestScore = 0;
  for (const e of KNOWLEDGE) {
    let score = 0;
    for (const k of e.keywords) {
      const kn = normalize(k);
      if (!kn) continue;
      if (q.includes(kn)) score += Math.max(2, kn.split(" ").length * 2); // phrase match weighted by length
      else if (kn.split(" ").every((w) => w.length > 2 && q.includes(w))) score += 1; // all words present
    }
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }

  if (best && bestScore >= 2) return { answer: best.answer, matched: true };

  return {
    answer:
      "Maaf, saya belum punya jawaban khusus untuk itu. Saya bisa membantu seputar pencegahan stunting & gizi balita — coba tanyakan salah satu topik di bawah, atau konsultasikan ke posyandu/puskesmas untuk kondisi spesifik.",
    matched: false,
  };
}
