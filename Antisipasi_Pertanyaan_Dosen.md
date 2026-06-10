# 🎓 Antisipasi Pertanyaan Dosen — Persiapan Q&A Presentasi

**Proyek:** StuntCare AI — Deteksi Dini Risiko Stunting Balita Berbasis Random Forest
**Nama:** Daniel Steffen K · NIM 2602071171 · COMP6065001 (Artificial Intelligence) · BINUS University

> Cara pakai: baca **"Jawaban singkat"** untuk diucapkan saat ditanya, lalu **"Poin pendukung"**
> kalau dosen menggali lebih dalam. Prinsip utama: **jujur**. Dosen menghargai kejujuran teknis
> jauh lebih daripada klaim yang tidak bisa dipertahankan.

---

## 🔴 BAGIAN 1 — DATASET (paling mungkin & paling kritis)

### Q1. Datasetnya dari mana? Berapa sampel?
**Jawaban singkat:** "Dataset berisi **25.000 sampel** dan bersifat **sintetis (simulasi)** yang saya
bangkitkan sendiri di notebook, dengan distribusi yang **di-*anchor* ke WHO Child Growth Standards
2006** dan literatur stunting Indonesia. Jadi ini **proof-of-concept**, bukan data klinis nyata."

**Poin pendukung:**
- Tinggi & berat di-*generate* dari **median ± standar deviasi WHO 2006** per umur & jenis kelamin (data WHO asli).
- Variabel demografis/maternal (gender 51,5%:48,5%, gizi ibu 55/30/15%, jarak kehamilan, usia nikah) memakai distribusi normal/realistis sesuai literatur (SSGI 2024, BKKBN "4 Terlalu").
- **Label** "Status Gizi" dihitung fungsi berbasis aturan: Z-score HAZ WHO (stunting = HAZ < −2 SD) dikurangi skor risiko dari berat, jarak kehamilan, usia nikah, gizi ibu.

### Q2. Kenapa pakai data sintetis, bukan data asli?
**Jawaban singkat:** "Data stunting nyata berisi informasi kesehatan anak yang **sensitif dan sulit
diakses publik** karena privasi & etika. Untuk lingkup tugas (proof-of-concept teknik AI), saya
gunakan data sintetis yang **dilandaskan standar WHO dan literatur**, sehingga pola yang dipelajari
tetap masuk akal secara medis."

**Poin pendukung:**
- Menghindari masalah privasi/perizinan data balita nyata.
- Bisa mengontrol keseimbangan kelas & jumlah sampel untuk eksperimen.
- Jujur soal batas: model **mempelajari aturan yang dikodekan**, jadi performa di dunia nyata harus diuji ulang.

### Q3. Kalau labelnya dari rumus, bukankah model cuma "menghafal rumus"?
**Jawaban singkat:** "Betul, dan saya transparan soal itu. Model belajar **mengaproksimasi aturan
medis WHO + faktor risiko literatur**. Nilainya: membuktikan bahwa **7 faktor bisa dikombinasikan**
oleh ML menjadi satu prediksi, dan pipeline-nya (training → deploy di peramban) berjalan. Untuk
produksi, langkah berikutnya adalah melatih ulang dengan **data posyandu/SSGI nyata**."

**Poin pendukung:**
- Label tidak sepenuhnya deterministik: ada **noise** dari sebaran tinggi (±2,2 SD) & faktor maternal yang menggeser Z-score, sehingga ada batas kelas yang kabur (lihat kesalahan antar kelas bertetangga di confusion matrix).
- Ini lazim untuk *educational proof-of-concept*; yang dinilai adalah **penguasaan teknik AI**, bukan klaim klinis.

### Q4. Bagaimana cara memvalidasi kalau punya data nyata?
**Jawaban singkat:** "Latih ulang model pada data lapangan (mis. data posyandu/SSGI), pakai
**train/validation/test terpisah**, evaluasi dengan akurasi, F1, dan **k-fold cross-validation**,
serta uji **fairness** antar kelompok. Idealnya juga validasi eksternal di wilayah berbeda."

---

## 🟢 BAGIAN 2 — ALGORITMA RANDOM FOREST (tekankan ini)

### Q5. Kenapa memilih Random Forest, bukan algoritma lain?
**Jawaban singkat:** "Karena Random Forest **akurat, tahan overfitting**, menangani **campuran fitur
numerik & kategorikal tanpa penskalaan**, dan memberi **feature importance** sehingga model bisa
ditafsirkan — penting untuk konteks kesehatan yang butuh transparansi."

**Poin pendukung:**
- *Ensemble* mengurangi varians dibanding satu Decision Tree.
- Lebih cocok untuk data tabular 7 fitur dibanding deep learning (yang butuh data jauh lebih besar & jadi kotak hitam).
- Cepat saat inferensi → ringan dijalankan di peramban.

### Q6. Jelaskan cara kerja Random Forest.
**Jawaban singkat:** "Random Forest adalah **ensemble dari 120 pohon keputusan**. Tiap pohon dilatih
pada **subsampel acak** data (bootstrap/bagging) dan tiap percabangan hanya melihat **sebagian fitur
acak**. Prediksi akhir = **rata-rata probabilitas** semua pohon (soft voting). Keacakan + rata-rata
inilah yang membuatnya akurat dan stabil."

### Q7. Hyperparameter apa yang dipakai dan kenapa?
**Jawaban singkat:** "120 pohon, kedalaman maks 14, `min_samples_leaf=6`, `min_samples_split=12`,
`max_features='sqrt'`, dan `class_weight='balanced'`."

**Poin pendukung (alasan):**
- `n_estimators=120`: cukup banyak untuk stabil tanpa terlalu berat.
- `max_depth=14` + `min_samples_leaf/split`: **membatasi overfitting** (pohon tidak tumbuh terlalu dalam/menghafal).
- `max_features='sqrt'`: menambah keragaman antar pohon.
- `class_weight='balanced'`: menangani **ketidakseimbangan kelas** (Normal 62,9% vs Stunted 11%).

### Q8. Bagaimana mencegah overfitting & memastikan model tidak hanya bagus di data latih?
**Jawaban singkat:** "Tiga lapis: (1) **split 80:20** train–test terstratifikasi; (2) **5-fold
cross-validation** (87,31% ± 0,42%, deviasinya kecil → stabil); (3) **regularisasi pohon**
(kedalaman & sampel daun minimum). Akurasi test (88,40%) dekat dengan CV → tidak overfit parah."

---

## 🔵 BAGIAN 3 — PERFORMA & INTERPRETASI

### Q9. Akurasi 88,40% — apakah itu bagus / tidak terlalu tinggi (mencurigakan)?
**Jawaban singkat:** "88,40% masuk kategori **Excellent** (rubrik ≥85%). Nilainya tinggi karena
label berasal dari aturan yang konsisten, tapi **tidak 100%** karena ada noise pada sebaran data dan
faktor maternal yang memperhalus batas kelas. CV yang stabil (±0,42%) menunjukkan model konsisten,
bukan kebetulan."

### Q10. Metrik apa saja selain akurasi? Kenapa F1?
**Jawaban singkat:** "Saya pakai **Precision 81,59%, Recall 85,93%, F1-macro 83,56%**. F1-**macro**
penting karena **kelas tidak seimbang** — ia merata-ratakan performa tiap kelas, jadi kelas minoritas
(Stunted/Severely Stunted) tetap dihitung adil, tidak tertutup oleh kelas Normal yang dominan."

### Q11. Faktor mana yang paling berpengaruh? Kenapa?
**Jawaban singkat:** "**Tinggi badan (50,6%)** dan **umur (28,7%)** paling dominan — wajar, karena
definisi stunting itu sendiri **tinggi-untuk-umur (HAZ)**. Berat badan 9,5%, lalu faktor maternal
(jarak kehamilan, usia nikah, gizi ibu) kontribusinya lebih kecil namun bermakna sebagai penambah konteks risiko."

### Q12. Kelas mana yang paling sering salah klasifikasi?
**Jawaban singkat:** "Kesalahan terbesar terjadi **antar kelas bertetangga**, misalnya *Stunted* vs
*Severely Stunted*, atau *Normal* vs *Tinggi* — karena batasnya kontinu (beda 1 SD). Ini wajar dan
tidak berbahaya secara klinis karena arah prediksinya tetap benar."

---

## 🟣 BAGIAN 4 — ETIKA, FAIRNESS, PRIVASI (LO6)

### Q13. Bagaimana aspek etika & fairness model ini?
**Jawaban singkat:** "Saya audit **fairness antar gender**: akurasi laki-laki 89,30% vs perempuan
87,46% → **disparitas 1,83%**, di bawah ambang industri 5%. Model juga **transparan** (menampilkan
confidence, probabilitas, Z-score) dan ada **disclaimer** bahwa ini skrining awal, bukan diagnosis."

### Q14. Bagaimana privasi data pengguna dijaga?
**Jawaban singkat:** "Aplikasi menjalankan model **100% di peramban** pengguna (ONNX Runtime Web),
jadi **data anak tidak pernah dikirim ke server**. Ini keunggulan privasi yang nyata dan jadi nilai
tambah etika."

### Q15. Apa risiko kalau alat ini salah memprediksi?
**Jawaban singkat:** "Risiko *false negative* (anak berisiko diprediksi normal) paling berbahaya.
Karena itu posisinya hanya **alat skrining/bantu**, bukan pengganti pemeriksaan tenaga kesehatan, dan
kasus berat selalu diarahkan ke fasilitas kesehatan."

---

## 🟠 BAGIAN 5 — ARSITEKTUR & REKAYASA PERANGKAT LUNAK

### Q16. Kenapa awalnya Streamlit lalu diganti ke React/Vite?
**Jawaban singkat:** "Streamlit butuh **server Python**, jadi tidak bisa di-*host* di Cloudflare Pages
yang statis, dan tampilannya terbatas. Saya bangun ulang sebagai web statis (React + Vite) dan
mengonversi model ke **ONNX** agar tetap memakai model 88,40% yang sama, tapi berjalan **gratis,
cepat, dan di peramban**."

### Q17. Bagaimana model scikit-learn bisa jalan di browser?
**Jawaban singkat:** "Model `.pkl` dikonversi ke format **ONNX** (skl2onnx), lalu dijalankan dengan
**ONNX Runtime Web** (WebAssembly). Saya verifikasi hasilnya **identik** dengan scikit-learn (galat
maksimum 3,4×10⁻⁷)."

### Q18. Tadi katanya web-nya sempat 'Page Unresponsive'. Bagaimana solusinya?
**Jawaban singkat:** "Versi awal menjalankan inferensi di **utas utama**, sehingga UI membeku. Saya
pindahkan inferensi ke **Web Worker** (utas terpisah) dengan WASM single-thread, jadi UI tetap
responsif. Inferensinya sendiri hanya **mikrodetik**."

### Q19. Kenapa tidak pakai server/API backend saja?
**Jawaban singkat:** "Karena pendekatan di-peramban lebih **murah (gratis), privat (data tak keluar
perangkat), dan dapat luring**. Tidak perlu biaya server, cocok untuk skala layanan kesehatan publik."

---

## 🟡 BAGIAN 6 — FITUR FOTO (jika ditanya)

### Q20. Fitur analisis foto itu mendeteksi stunting dari foto?
**Jawaban singkat:** "**Tidak** — dan saya sengaja jujur soal ini. Stunting itu **tinggi-untuk-umur**
yang **tak bisa diukur dari foto 2D**. Fitur foto hanya memperkirakan **proporsi tubuh**
(kurus/normal/gemuk) memakai MediaPipe, lalu **menggeser probabilitas akhir secara terbatas (maks
±10 poin)** dan transparan. Random Forest **tidak** dilatih ulang dengan foto."

**Poin pendukung:**
- Mengukur ketebalan anggota tubuh dari siluet, dinormalisasi ke panjang tulang (*scale-* & *pose-invariant*).
- Diberi label **Eksperimental**; ini justru memperkuat poin etika (transparansi & kejujuran).

---

## ⚫ BAGIAN 7 — PERTANYAAN "JEBAKAN" / KRITIS

### Q21. Apa keterbatasan utama proyek ini?
**Jawaban singkat:** "Tiga: (1) **dataset sintetis** — perlu validasi data nyata; (2) model belajar
aturan yang dikodekan, bukan temuan epidemiologis baru; (3) fitur foto masih eksperimental & ambangnya
perlu kalibrasi. Semua ini saya nyatakan terbuka di laporan."

### Q22. Apa kontribusi/keunikan proyek dibanding aplikasi stunting lain?
**Jawaban singkat:** "Tiga keunikan: (1) **multi-faktor** (7 penyebab sekaligus, bukan cuma tinggi);
(2) **AI berjalan 100% di peramban** — gratis, luring, dan **menjaga privasi**; (3) **transparan &
etis** (confidence, Z-score, disclaimer, audit fairness)."

### Q23. Bagaimana proyek ini mendukung SDG #3?
**Jawaban singkat:** "Mendukung **SDG #3 Good Health and Well-being** sub-tema *monitoring malnutrisi
pada anak* — menyediakan skrining dini stunting yang gratis & mudah diakses untuk membantu menurunkan
prevalensi (19,8%, SSGI 2024)."

### Q24. Kalau diberi waktu lebih, apa pengembangan selanjutnya?
**Jawaban singkat:** "(1) Latih ulang dengan **data posyandu/SSGI nyata** + validasi klinis; (2)
kalibrasi & validasi modul foto dengan foto berlabel; (3) tambah bahasa daerah & mode offline-PWA;
(4) integrasi rekomendasi gizi yang lebih personal."

### Q25. Berapa lama waktu inferensi & ukuran model?
**Jawaban singkat:** "Inferensi **mikrodetik** di peramban. Model ONNX ±14,8 MB (≈1,7 MB setelah
kompresi gzip), dimuat sekali lalu di-cache. Random Forest aslinya 120 pohon, 261 ribu node."

---

## ✅ Ringkasan 30 detik (kalau diminta menyimpulkan cepat)
> "StuntCare AI memprediksi risiko stunting dari **7 faktor** memakai **Random Forest (akurasi
> 88,40%)**. Inovasinya: model berjalan **100% di peramban** lewat ONNX — gratis, cepat, luring, dan
> **menjaga privasi**. Datasetnya **sintetis berbasis WHO 2006 & literatur** (proof-of-concept), dan
> semua keterbatasan saya nyatakan transparan, sejalan dengan etika AI kesehatan (SDG #3)."

---

## 💡 Tips Sikap Saat Tanya-Jawab
- Kalau tidak tahu: **akui jujur** lalu tawarkan arah ("Saya belum uji itu, tapi pendekatannya akan...").
- Untuk pertanyaan dataset: **akui sintetis lebih dulu** sebelum ditekan — itu menunjukkan integritas.
- Selalu kaitkan kembali ke **Random Forest, 88,40%, privasi di-peramban, dan SDG #3**.
- Tetap singkat; tawarkan demo langsung kalau perlu bukti.
