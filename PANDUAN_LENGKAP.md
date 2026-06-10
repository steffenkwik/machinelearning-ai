# 🌱 PANDUAN LENGKAP — StuntCare AI (Deteksi Dini Stunting Multi-Faktor)

**Nama:** Daniel Steffen K | **NIM:** 2602071171
**Mata Kuliah:** Artificial Intelligence (COMP6065001) — LA05-LEC
**SDG #3:** Good Health and Well-being

> Aplikasi kini berupa **web statis modern** (React + Vite + TypeScript) yang
> menjalankan model **Random Forest** asli **100% di peramban** melalui **ONNX
> Runtime Web** — gratis, cepat, dapat luring, dan data anak tidak dikirim ke
> server. Versi Streamlit lama tetap disertakan sebagai referensi.

---

## 📦 Struktur Penting

| Path | Fungsi |
|---|---|
| `web/` | **Aplikasi web baru (yang di-deploy)** — React + Vite + ONNX |
| `web/public/model_stunting.onnx` | Model Random Forest (hasil konversi dari `.pkl`) |
| `web/src/inference/worker.ts` | Inferensi ONNX di **Web Worker** (anti-freeze) |
| `model_stunting.pkl` | Model asli scikit-learn (Random Forest 7 fitur) |
| `01_Stunting_ML_Training.ipynb` | Notebook pelatihan model |
| `app.py` | Purwarupa **lama (Streamlit)** — referensi |
| `dataset_stunting.csv` | Dataset 25.000 sampel |

---

## 🎯 Performa Model (Final)

| Metric | Score |
|---|---|
| **Accuracy** | 88,40% (Excellent — rubrik ≥85%) |
| **F1-Score (Macro)** | 83,56% |
| **Precision** | 81,59% |
| **Recall** | 85,93% |
| **Cross-Validation** | 87,31% ± 0,42% |
| **Fairness Disparity** | 1,83% (antar gender) |
| **Algoritma** | Random Forest — 120 trees, max depth 14 |
| **Dataset** | 25.000 sampel (80:20) |

---

## 🧬 7 Faktor Penyebab Stunting yang Dihitung

1. **Tinggi badan** (cm) — Height-for-Age Z-Score (bobot 50,6%)
2. **Umur anak** (bulan) — acuan standar WHO (28,7%)
3. **Berat badan** (kg) — Weight-for-Age (9,5%)
4. **Jarak kehamilan** (bulan) — ideal >24 bln (BKKBN 4T)
5. **Usia ibu menikah** (tahun) — pernikahan dini <20 = risiko
6. **Gizi ibu saat hamil** (Baik/Sedang/Buruk) — KEK → BBLR → stunting
7. **Jenis kelamin** — standar WHO berbeda L/P

---

## 🚀 Menjalankan Aplikasi Web (Utama)

```bash
cd web
npm install      # pasang dependency (sekali saja)
npm run dev      # buka http://localhost:5173
```

Build produksi:

```bash
cd web
npm run build    # hasil di web/dist
npm run preview  # uji hasil build
npm run preview  # uji hasil build secara lokal
```

---

## ☁️ Deploy ke Cloudflare Pages

| Pengaturan | Nilai |
|---|---|
| Framework preset | Vite |
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `dist` |

> **Penting:** Root sudah `web`, jadi output cukup `dist` (BUKAN `web/dist`).

---

## 🖥️ Menjalankan Purwarupa Lama (Streamlit) — Referensi

```bash
pip install -r requirements.txt
python -m streamlit run app.py
```

---

## 🔧 Konversi Ulang Model (opsional)

```python
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType
import joblib
m = joblib.load("model_stunting.pkl")
onx = to_onnx(m, initial_types=[("input", FloatTensorType([None, 7]))],
              options={id(m): {"zipmap": False}}, target_opset=15)
open("web/public/model_stunting.onnx", "wb").write(onx.SerializeToString())
```

---

## 📝 Catatan untuk Presentasi

- Topik **SDG #3** (Good Health) — monitoring malnutrisi pada anak.
- Model menghitung **7 faktor** penyebab stunting (bukan hanya tinggi badan).
- Akurasi **88,40%** → **Excellent** (rubrik ≥85%).
- Inovasi: model asli berjalan **di peramban** (ONNX) — gratis, luring, privat.
- Tekankan **algoritma Random Forest**: ensemble 120 pohon, soft voting,
  feature importance untuk transparansi.

Good luck! 🍀
