# 🌱 PANDUAN LENGKAP — Deteksi Stunting Multi-Faktor (7 Fitur)

**Nama:** Daniel Steffen K | **NIM:** 2602071171
**Mata Kuliah:** Artificial Intelligence (COMP6065001) — LA05-LEC
**SDG #3:** Good Health and Well-being

---

## 📦 File dalam Folder Ini

| File | Fungsi | Wajib untuk app? |
|---|---|---|
| `app.py` | Web application Streamlit | ✅ |
| `model_stunting.pkl` | Model AI Random Forest (7 fitur) | ✅ |
| `encoder_jenis_kelamin.pkl` | Encoder jenis kelamin | ✅ |
| `encoder_gizi_ibu.pkl` | Encoder gizi ibu | ✅ |
| `encoder_status.pkl` | Encoder status gizi | ✅ |
| `requirements.txt` | Daftar library | ✅ |
| `.streamlit/config.toml` | Paksa tema terang | ✅ |
| `01_Stunting_ML_Training.ipynb` | Notebook training (Colab) | Untuk laporan |
| `dataset_stunting.csv` | Dataset 25.000 sampel | Untuk laporan |
| `dataset_combined_full.csv` | Dataset lengkap | Untuk laporan |
| `confusion_matrix.png` | Visualisasi evaluasi | Untuk laporan |
| `feature_importance.png` | Bobot 7 faktor | Untuk laporan |
| `eda_distribusi.png` | Distribusi data | Untuk laporan |

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
| **Model Size** | 9 MB |
| **Dataset** | 25.000 sampel |

---

## 🧬 7 Faktor Penyebab Stunting yang Dihitung

1. **Umur anak** (bulan) — acuan standar WHO
2. **Jenis kelamin** — standar berbeda L/P
3. **Tinggi badan** (cm) — Height-for-Age Z-Score (50,6% bobot)
4. **Berat badan** (kg) — Weight-for-Age (9,5% bobot)
5. **Jarak kehamilan** (bulan) — ideal >24 bln (BKKBN 4T)
6. **Usia ibu menikah** (tahun) — pernikahan dini <20 = risiko
7. **Gizi ibu saat hamil** (Baik/Sedang/Buruk) — KEK → BBLR → stunting

---

## 🚀 CARA MENJALANKAN (Langkah demi Langkah)

### 1. Siapkan folder
Pastikan semua file wajib (tabel di atas) ada dalam SATU folder, termasuk folder `.streamlit`.

### 2. Install library (sekali saja)
Buka Command Prompt di folder tersebut, ketik:
```
pip install -r requirements.txt
```

### 3. Jalankan aplikasi
```
python -m streamlit run app.py
```
Browser akan terbuka otomatis di `http://localhost:8501`.

> ⚠️ Kalau `streamlit run app.py` error "not recognized", selalu pakai `python -m streamlit run app.py`.

---

## ☁️ Deploy ke Streamlit Cloud (Online)

1. Upload semua file ke repository **GitHub** (public)
2. Buka https://share.streamlit.io → login GitHub
3. New app → pilih repo → main file: `app.py` → Deploy
4. Tunggu 2-3 menit → dapat URL publik untuk demo

---

## 🆘 Troubleshooting

| Masalah | Solusi |
|---|---|
| `streamlit not recognized` | Pakai `python -m streamlit run app.py` |
| `FileNotFoundError: model_stunting.pkl` | Pastikan semua .pkl di folder yang sama dengan app.py |
| Teks tidak terlihat / putih | Pastikan folder `.streamlit/config.toml` ada |
| `ModuleNotFoundError` | Ulangi `pip install -r requirements.txt` |

---

## 📝 Catatan untuk Presentasi

**Yang ditekankan ke dosen:**
- Topik masuk **SDG #3** (Good Health) — "Malnutrition monitoring in children"
- Model menghitung **7 faktor penyebab** stunting (bukan cuma tinggi badan)
- Akurasi **88,40%** → masuk kategori **Excellent** (rubrik ≥85%)
- Faktor maternal (jarak kehamilan, usia nikah, gizi hamil) berbasis literatur medis
- Aplikasi adalah **MVP** (Minimum Viable Product) sesuai syarat AOL

Good luck! 🍀
