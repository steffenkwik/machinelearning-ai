# 💬 Asisten Edukasi Stunting (Tanya–Jawab)

Di atas form tab **Deteksi** ada kotak **"Asisten Edukasi Stunting"**. Pengguna
bisa bertanya tips mencegah stunting & gizi balita, lalu mendapat jawaban
edukatif.

## ✅ Gratis, tanpa setup, tanpa API key

Fitur ini **berjalan 100% di perangkat** (di dalam peramban) memakai **basis
pengetahuan terkurasi** yang dirangkum dari pedoman **WHO** dan **Kemenkes RI**.
Artinya:

- **Gratis** — tidak perlu API key, token, atau langganan apa pun.
- **Tanpa internet** — jawaban tersedia bahkan saat offline.
- **Privat** — pertanyaan tidak dikirim ke server mana pun.
- **Tidak mengarang** — jawaban berasal dari materi yang sudah disusun, bukan
  dibuat-buat oleh model.

**Tidak ada langkah konfigurasi.** Begitu situs ter-deploy, kotak asisten
langsung berfungsi.

## 🧩 Cara kerja singkat

- Materi pengetahuan: `web/src/lib/stunting-knowledge.ts` (±19 topik:
  pencegahan, ASI, MPASI, protein hewani, jarak kehamilan, gizi ibu/KEK,
  posyandu, sanitasi, imunisasi, 1000 HPK, membaca Z-Score, dll).
- Komponen UI: `web/src/components/StuntingChat.tsx` — mencocokkan pertanyaan
  pengguna dengan topik paling relevan (pencocokan kata kunci) lalu menampilkan
  jawaban + tombol saran topik.

## ✍️ Menambah / mengubah jawaban

Edit array `KNOWLEDGE` di `web/src/lib/stunting-knowledge.ts`. Tiap topik:

```ts
{
  id: "asi",
  title: "ASI eksklusif",           // teks tombol saran
  keywords: ["asi", "menyusui"],    // kata kunci pemicu
  answer: "ASI eksklusif = ...",    // jawaban (boleh multi-baris)
}
```

Tambah entri baru atau perbaiki `answer`, lalu `npm run build` dan deploy ulang.

## ℹ️ Catatan

Asisten ini bersifat **edukasi, bukan diagnosis**. Untuk kondisi spesifik anak,
arahkan pengguna berkonsultasi ke **posyandu, puskesmas, dokter anak, atau ahli
gizi**.
