# 💬 Asisten Edukasi Stunting (Chat AI Gratis)

Di atas form tab **Deteksi** ada kotak **"Asisten Edukasi Stunting"**. Pengguna
bisa bertanya apa saja (utamanya stunting & gizi balita) dan mendapat jawaban
dari **LLM gratis**.

## ✅ Gratis, tanpa API key, tanpa setup

- **LLM gratis & keyless** — memakai **Pollinations** (`text.pollinations.ai`),
  dipanggil lewat **Cloudflare Pages Function** (`/api/chat`) dari sisi server,
  sehingga **tidak perlu API key, token, atau langganan** apa pun.
- **Selalu hidup** — bila layanan gratis sedang sibuk/gagal, chat otomatis
  memakai **basis pengetahuan lokal** (`stunting-knowledge.ts`) sebagai cadangan,
  jadi tidak pernah mati.
- **Tidak ada langkah konfigurasi.** Begitu situs ter-deploy, chat langsung
  berfungsi.

## 🧩 Cara kerja

```
Pengguna ─POST /api/chat─► Cloudflare Pages Function ─► Pollinations (LLM gratis)
                                   │ gagal/sibuk
                                   ▼
                          Klien pakai basis pengetahuan lokal (offline)
```

- Fungsi server: `web/functions/api/chat.ts` (proxy ke LLM gratis; mencoba
  endpoint chat lalu endpoint teks; system prompt difokuskan ke stunting/gizi).
- UI: `web/src/components/StuntingChat.tsx` — kirim ke `/api/chat`, jika gagal
  pakai `findAnswer()` dari basis pengetahuan lokal.
- Basis pengetahuan cadangan: `web/src/lib/stunting-knowledge.ts` (±19 topik).

## ⚙️ Opsional

- **Ganti model** LLM: ubah `model: "openai"` di `web/functions/api/chat.ts`
  ke model Pollinations lain (mis. `"mistral"`).
- **Ingin pakai Claude/OpenAI berbayar** (lebih stabil): ganti isi fungsi
  dengan panggilan ke API tersebut dan simpan kuncinya sebagai secret Cloudflare
  (`ANTHROPIC_API_KEY` / `OPENAI_API_KEY`).
- **Tambah/ubah jawaban cadangan**: edit array `KNOWLEDGE` di
  `stunting-knowledge.ts`.

## ℹ️ Catatan privasi & etika

- Hanya **teks pertanyaan** yang dikirim ke layanan AI; **data anak pada form
  prediksi tidak dikirim** (prediksi tetap 100% di perangkat).
- UI sudah mengingatkan agar pengguna tidak memasukkan data pribadi.
- Bersifat **edukasi, bukan diagnosis** — kondisi khusus diarahkan ke
  posyandu/puskesmas/dokter.
- Layanan gratis bisa berubah/terbatas sewaktu-waktu; cadangan lokal memastikan
  fitur tetap berguna.
