# 💬 Panduan Mengaktifkan Asisten AI Gizi (Chat)

Fitur chat memungkinkan pengguna bertanya tips mencegah stunting & gizi balita.
Chat ditenagai **Claude (Anthropic)** dan dipanggil lewat **Cloudflare Pages
Function** (`/api/chat`) supaya **API key tetap rahasia di server** — tidak
pernah ikut terkirim ke peramban pengguna.

> Tanpa langkah di bawah, kotak chat tetap muncul tetapi akan menampilkan
> "Fitur chat belum diaktifkan". Prediksi stunting (Random Forest) tetap
> berjalan normal 100% di perangkat tanpa perlu API key.

---

## Arsitektur singkat

```
Pengguna (browser)  ─POST /api/chat─►  Cloudflare Pages Function
                                         (web/functions/api/chat.ts)
                                              │  pakai ANTHROPIC_API_KEY (rahasia)
                                              ▼
                                       Anthropic Claude API
```

- File fungsi: `web/functions/api/chat.ts` (sudah disertakan).
- Model: `claude-opus-4-8`.
- Kunci API disimpan sebagai **secret** Cloudflare bernama `ANTHROPIC_API_KEY`.

---

## Langkah 1 — Buat API key Anthropic

1. Buka **https://console.anthropic.com** lalu masuk/daftar.
2. Masuk ke **Settings → API Keys → Create Key**.
3. Salin kunci (mulai dengan `sk-ant-...`). Simpan baik-baik.
4. Pastikan akun punya saldo/kredit (chat memakai token berbayar).

## Langkah 2 — Tambahkan secret di Cloudflare Pages

1. Buka **Cloudflare Dashboard → Workers & Pages → (proyek kamu)**.
2. **Settings → Environment variables** (atau **Variables and Secrets**).
3. Tambah variabel **Production** (dan Preview jika perlu):
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (kunci dari Langkah 1)
   - Klik **Encrypt** agar tersimpan sebagai secret.
4. **Save**.

## Langkah 3 — Deploy ulang

1. Cloudflare otomatis build saat ada push ke `main`. Setelah menambahkan
   secret, jalankan **Retry deployment** / deploy ulang agar secret terbaca.
2. Pastikan setting build tetap: Root `web`, Build command `npm run build`,
   Output `dist`. Folder `web/functions/` otomatis terdeteksi sebagai
   Pages Functions.
3. Buka situs → tab Deteksi → buka kotak **"Tanya Asisten AI Gizi"** → coba
   bertanya. Jika menjawab, berarti sudah aktif. 🎉

---

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| "Fitur chat belum diaktifkan" | Secret `ANTHROPIC_API_KEY` belum ada / belum deploy ulang |
| "Asisten sedang tidak tersedia" | Kunci salah, kredit habis, atau rate limit — cek di console Anthropic |
| Error fungsi saat build | Pastikan folder `web/functions/` ikut ter-deploy (Root directory = `web`) |
| Ingin model lebih murah | Ubah `MODEL` di `web/functions/api/chat.ts` ke `claude-haiku-4-5` |

---

## Catatan privasi & etika

- **Hanya teks pertanyaan** yang dikirim ke layanan AI; data anak pada form
  prediksi **tidak** dikirim. UI sudah menampilkan peringatan agar pengguna
  tidak memasukkan data pribadi.
- Asisten dibatasi pada topik gizi/stunting dan **tidak memberi diagnosis**.
- Karena chat memanggil API berbayar, pertimbangkan menambah pembatasan
  (mis. Cloudflare Turnstile / rate limit) bila situs ramai.

## Catatan biaya

Tiap pertanyaan memakai token Claude (input + output). Jawaban dibatasi singkat
(maks 1024 token output) untuk menghemat. Pantau penggunaan di console Anthropic.
