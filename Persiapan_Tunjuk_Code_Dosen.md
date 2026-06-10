# 🗂️ Panduan: Code Mana yang Harus Ditunjukkan ke Dosen

**Proyek:** StuntCare AI · Daniel Steffen K · NIM 2602071171 · COMP6065001
**Repo:** github.com/steffenkwik/machinelearning-ai · **Live:** machinelearning-ai.pages.dev

> Cara pakai: dosen bertanya/minta sesuatu → cari di tabel → buka file yang
> ditunjuk → baca poin "Apa yang ditunjukkan". Semua jalur file relatif ke root
> repo. Kode notebook ada di `01_Stunting_ML_Training.ipynb` (per **sel**).

---

## ⭐ Tabel cepat (paling sering diminta)

| Dosen minta… | Buka file | Letak |
|---|---|---|
| **Algoritma Random Forest / pelatihan** | `01_Stunting_ML_Training.ipynb` | **sel 12** |
| **Dataset dari mana** | `01_Stunting_ML_Training.ipynb` + `dataset_stunting.csv` | **sel 6** |
| **Encoding (teks→angka)** | notebook **sel 10** + `web/src/lib/encode.ts` | — |
| **Evaluasi / akurasi / confusion matrix** | notebook **sel 14** | — |
| **Feature importance** | notebook **sel 16** + `web/src/lib/content.ts` | `FACTORS` |
| **Model jalan di website (inferensi)** | `web/src/inference/worker.ts` | seluruh file |
| **Konversi model ke ONNX** | `PANDUAN_LENGKAP.md` / `Petunjuk_Instalasi_StuntCare_AI.pdf` | bagian "Konversi" |
| **Z-Score WHO** | `web/src/lib/who.ts` | `hazZScore()` |
| **Form 7 faktor + alur prediksi** | `web/src/components/DetectionTab.tsx` | `onAnalyze()` |
| **Tampilan hasil** | `web/src/components/ResultPanel.tsx` | — |
| **Dataset NYATA & validasi** | `dataset_stunting_real.csv` + `scripts/train_real.py` | `train_real.py` |
| **Benchmark / grafik hasil** | `scripts/train_real.py` + `real_*.png` | grafik PNG |
| **Chat AI** | `web/functions/api/chat.ts` + `web/src/components/StuntingChat.tsx` | — |
| **Etika / privasi** | `web/src/components/EthicsTab.tsx` + `content.ts` | `ETHICS` |
| **Versi lama (Streamlit)** | `app.py` | — |

---

## 1) 🌳 Random Forest — algoritma & pelatihan
**File:** `01_Stunting_ML_Training.ipynb` → **sel 12**
```python
model = RandomForestClassifier(n_estimators=120, max_depth=14,
        min_samples_leaf=6, min_samples_split=12, max_features='sqrt',
        class_weight='balanced', random_state=42, n_jobs=-1)
model.fit(X_train, y_train)
```
**Tunjukkan & jelaskan:** 120 pohon, kedalaman 14, `class_weight='balanced'`
(untuk kelas tak seimbang), 5-fold cross-validation di sel yang sama.
**Pendukung:** sel 11 (judul), sel 18 (fungsi `prediksi()` contoh pakai model).

## 2) 📊 Dataset — dari mana & isinya
**File:** notebook **sel 6** (pembuatan data) + `dataset_stunting.csv` (hasil).
```python
N=25000 ...  # tiap baris di-generate dari median ± SD WHO + distribusi literatur
# label dihitung fungsi classify_multifactor() (sel 4) berbasis Z-Score HAZ
```
**Jawab jujur:** dataset **sintetis (simulasi)** berbasis **WHO 2006** & literatur
(SSGI, BKKBN) — proof-of-concept, bukan data klinis nyata. (Detail jawaban ada di
`Antisipasi_Pertanyaan_Dosen.md` bagian 1.)
**Pendukung:** sel 4 = fungsi pelabelan (aturan Z-Score + faktor risiko).

## 3) 🔢 Encoding (teks → angka)
**File:** notebook **sel 10** (saat training) + `web/src/lib/encode.ts` (di web).
- Di web, `encode.ts` menunjukkan pemetaan persis: `laki-laki→0, perempuan→1`;
  `Baik→0, Buruk→1, Sedang→2`, dan fungsi `toFeatureVector()` menyusun 7 fitur
  dalam urutan yang sama persis dengan model.

## 4) ✅ Evaluasi — akurasi, confusion matrix, metrik
**File:** notebook **sel 14**.
```python
accuracy_score(...)  # 88,40%
f1_score(..., average='macro')  # 83,56%
confusion_matrix(...)  # disimpan ke confusion_matrix.png
```
**Tunjukkan juga:** gambar `confusion_matrix.png`. Angka yang sama ditampilkan di
web (tab **Cara Kerja AI**) dari `web/src/lib/content.ts` → `MODEL_SPECS`.

## 5) 📈 Feature importance
**File:** notebook **sel 16** (hitung & plot) + `feature_importance.png`.
- Di web: `web/src/lib/content.ts` → array `FACTORS` (Tinggi 50,6%, Umur 28,7%, …).
**Jelaskan:** model yang menghitung sendiri (bukan kita) — lihat tab Cara Kerja AI.

## 6) ⚙️ Model dijalankan di website (inferensi di peramban)
**File utama:** `web/src/inference/worker.ts`
- Memuat `model_stunting.onnx`, menjalankan via **ONNX Runtime Web (WASM)** di
  dalam **Web Worker** (agar UI tidak macet).
**Pendukung:** `web/src/inference/useModel.ts` (hook React pengelola worker),
`web/public/model_stunting.onnx` (model hasil konversi).

## 7) 🔄 Konversi model .pkl → ONNX
**File:** `PANDUAN_LENGKAP.md` (bagian "Konversi Ulang Model") atau
`Petunjuk_Instalasi_StuntCare_AI.pdf`.
```python
from skl2onnx import to_onnx ...  # parity terverifikasi (galat 3,4e-7)
```

## 8) 📐 Z-Score WHO (HAZ)
**File:** `web/src/lib/who.ts` → fungsi `whoStats()` & `hazZScore()`.
- Berisi tabel WHO 2006 (laki-laki & perempuan) dan rumus z-score.

## 9) 🧾 Form 7 faktor & alur prediksi (React)
**File:** `web/src/components/DetectionTab.tsx`
- Lihat fungsi `onAnalyze()`: bangun vektor 7 fitur (`toFeatureVector`) → panggil
  model (`predict`) → hitung z-score → tampilkan.
**Hasil:** `web/src/components/ResultPanel.tsx`.

## 10) 📊 Dataset NYATA & Validasi (penting — masukan dosen)
**File:** `dataset_stunting_real.csv` (55.367 sampel real Indonesia) + `scripts/train_real.py`.
- `train_real.py` melatih ulang Random Forest pada data nyata, benchmark vs DT/KNN/LogReg/NB,
  dan menghasilkan grafik: `real_confusion_matrix.png`, `real_feature_importance.png`,
  `real_per_class_metrics.png`, `real_benchmark.png`, `real_class_distribution.png`.
- **Tunjukkan:** jalankan `python scripts/train_real.py` atau buka grafik PNG-nya.
- **Hasil:** akurasi 99,4% (Random Forest unggul). Sumber dataset tercantum di laporan.

> Catatan: fitur kamera/foto **sudah dihapus** sesuai masukan dosen.

## 11) 💬 Chat AI (LLM gratis + cadangan lokal)
**File:** `web/functions/api/chat.ts` (proxy ke LLM gratis tanpa API key),
`web/src/components/StuntingChat.tsx` (UI), `web/src/lib/stunting-knowledge.ts`
(basis pengetahuan cadangan/offline).

## 12) ⚖️ Etika & privasi (LO6)
**File:** `web/src/components/EthicsTab.tsx` + `web/src/lib/content.ts`
(array `ETHICS`, `FAIRNESS_ROWS`). Tunjukkan juga di web tab **Etika & Privasi**.

## 13) 🖥️ Tampilan / struktur React (kalau ditanya "ini React-nya mana")
- Titik masuk: `web/src/main.tsx` → `web/src/App.tsx` (4 tab).
- Komponen: `Hero.tsx`, `DetectionTab.tsx`, `ResultPanel.tsx`, `AboutTab.tsx`,
  `HowItWorksTab.tsx`, `EthicsTab.tsx`, dan `components/ui/*` (tombol, kartu, tab).
- Build & styling: `web/package.json`, `web/vite.config.ts`, `web/tailwind.config.js`.

## 14) 🐍 Versi lama (jika diminta bandingkan)
**File:** `app.py` (purwarupa Streamlit). Jelaskan kenapa pindah ke React+ONNX
(Streamlit butuh server → tak bisa di Cloudflare statis).

---

## 🎯 3 yang paling mungkin diminta (siapkan duluan)
1. **Random Forest** → notebook **sel 12** (+ sel 14 evaluasi).
2. **Dataset** → notebook **sel 6** (jawab jujur: sintetis berbasis WHO).
3. **Model jalan di website** → `web/src/inference/worker.ts`.

## 💡 Tips menunjukkan code
- Buka **GitHub** di browser, atau editor (VS Code) dengan repo sudah di-clone.
- Untuk notebook, buka di **Google Colab/Jupyter** dan tunjuk **sel** yang diminta.
- Kalau diminta "buktikan jalan": buka **live demo**, isi form, tekan Analisis.
- Selalu kaitkan: *algoritma (Random Forest) → konversi ONNX → jalan di peramban*.
- Jujur soal dataset sintetis — itu nilai plus untuk etika (LO6).
