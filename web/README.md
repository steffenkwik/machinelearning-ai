# 🌱 StuntCare AI — Frontend (Cloudflare Pages)

Web app modern untuk **Deteksi Dini Risiko Stunting** yang menjalankan model
**Random Forest (akurasi 88,40%)** asli **langsung di browser** lewat
[ONNX Runtime Web](https://onnxruntime.ai/). Tidak butuh server Python — data
anak **tidak pernah dikirim ke mana pun** (mendukung klaim privasi di tab Etika).

Stack: **React + Vite + TypeScript + Tailwind CSS + komponen shadcn/ui + Recharts**.

## 🧩 Hubungan dengan project Streamlit

Model `model_stunting.pkl` (scikit-learn) dikonversi ke
`public/model_stunting.onnx` dengan parity probabilitas terverifikasi (identik
sampai 4 desimal). Logika WHO Z-score, encoder, urutan 7 fitur, rekomendasi, dan
analisis faktor risiko diport 1:1 dari `app.py`. App Streamlit lama tetap ada di
root repo sebagai lampiran laporan.

## 🚀 Menjalankan secara lokal

```bash
cd web
npm install
npm run dev      # http://localhost:5173
```

Build produksi:

```bash
npm run build    # output ke web/dist
npm run preview
```

## ☁️ Deploy ke Cloudflare Pages

**Cara 1 — lewat dashboard (paling mudah):**

1. Push repo ke GitHub (sudah).
2. Buka **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
3. Pilih repo `machinelearning-ai`, lalu set:
   - **Production branch**: `main` (atau branch yang kamu pakai)
   - **Framework preset**: `Vite`
   - **Root directory**: `web`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **Save and Deploy**. Selesai — dapat URL `https://<nama>.pages.dev`.

**Cara 2 — lewat Wrangler CLI:**

```bash
cd web
npm install
npm run build
npx wrangler pages deploy dist --project-name stuntcare-ai
```

> Catatan: file `.wasm` ONNX Runtime otomatis disalin ke root output oleh
> `vite-plugin-static-copy`, jadi inferensi tetap jalan offline tanpa CDN.
