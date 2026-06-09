# StuntCare AI — Web App

Frontend baru untuk **Deteksi Dini Risiko Stunting pada Balita**. Model Random
Forest asli (88,40% akurasi) dijalankan **100% di browser** lewat ONNX Runtime
Web, sehingga data anak tidak pernah dikirim ke server.

- **Stack:** React + Vite + TypeScript + Tailwind + komponen bergaya shadcn/ui
- **Inferensi:** `onnxruntime-web` (CPU/WASM) berjalan di **Web Worker** — UI
  tidak pernah membeku
- **Model:** `public/model_stunting.onnx` (dikonversi dari `model_stunting.pkl`,
  parity terverifikasi vs scikit-learn, error < 1e-6)
- **4 tab:** Deteksi · Tentang · Cara Kerja AI · Etika & Privasi

## Menjalankan secara lokal

```bash
cd web
npm install
npm run dev      # http://localhost:5173
```

## Build produksi

```bash
npm run build    # output ke web/dist
npm run preview  # uji hasil build secara lokal
```

## Deploy ke Cloudflare Pages

**Opsi A — Connect ke GitHub (otomatis tiap push):**

| Setting | Nilai |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm install && npm run build` |
| Build output directory | `web/dist` |
| Root directory | `web` |

**Opsi B — Direct Upload (drag & drop):**

1. `cd web && npm install && npm run build`
2. Buka Cloudflare Pages → Create project → Direct Upload
3. Unggah isi folder `web/dist`

Tidak perlu header khusus: WASM dijalankan single-thread sehingga tidak
memerlukan COOP/COEP. Semua aset (model + runtime) ter-bundle, jadi aplikasi
juga bisa berjalan offline setelah load pertama.

## Catatan teknis

Konversi model ke ONNX (referensi, sudah dilakukan):

```python
from skl2onnx import to_onnx
from skl2onnx.common.data_types import FloatTensorType
import joblib

model = joblib.load("model_stunting.pkl")
onx = to_onnx(model, initial_types=[("input", FloatTensorType([None, 7]))],
              options={id(model): {"zipmap": False}}, target_opset=15)
open("web/public/model_stunting.onnx", "wb").write(onx.SerializeToString())
```

Urutan 7 fitur (harus persis): `Umur (bulan)`, `Jenis_Kelamin_Enc`,
`Tinggi Badan (cm)`, `Berat Badan (kg)`, `Jarak Kehamilan (bulan)`,
`Usia Ibu Menikah (tahun)`, `Gizi_Ibu_Enc`. Output kelas berurutan:
`Normal`, `Severely Stunted`, `Stunted`, `Tinggi`.
