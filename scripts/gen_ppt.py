# -*- coding: utf-8 -*-
"""Generate the StuntCare AI presentation deck (16:9) — revisi pasca-dosen:
real dataset, kebutuhan nyata, matematika & langkah training detail, grafik
hasil/benchmark/pengujian; fitur kamera dihapus."""
import os, json
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image as PImage

DARK = RGBColor(0x05, 0x31, 0x2A); GREEN = RGBColor(0x03, 0x98, 0x55)
MINT = RGBColor(0x6C, 0xE9, 0xA6); LIGHT = RGBColor(0xEA, 0xF7, 0xF0)
INK = RGBColor(0x15, 0x24, 0x1C); GREY = RGBColor(0x4B, 0x55, 0x63)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = json.load(open(os.path.join(BASE, "real_metrics.json")))

prs = Presentation(); prs.slide_width = Inches(13.333); prs.slide_height = Inches(7.5)
SW, SH = prs.slide_width, prs.slide_height
BLANK = prs.slide_layouts[6]


def rect(sl, x, y, w, h, color):
    s = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    s.fill.solid(); s.fill.fore_color.rgb = color; s.line.fill.background(); s.shadow.inherit = False
    return s


def text(sl, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, space=6):
    tb = sl.shapes.add_textbox(x, y, w, h); tf = tb.text_frame; tf.word_wrap = True; tf.vertical_anchor = anchor
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space)
        for (t, size, color, bold, italic) in para:
            r = p.add_run(); r.text = t; r.font.size = Pt(size); r.font.color.rgb = color
            r.font.bold = bold; r.font.italic = italic; r.font.name = "Calibri"
    return tb


def bullets(sl, x, y, w, h, items, size=18, color=INK, gap=10):
    tb = sl.shapes.add_textbox(x, y, w, h); tf = tb.text_frame; tf.word_wrap = True
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.space_after = Pt(gap)
        rb = p.add_run(); rb.text = "▸  "; rb.font.size = Pt(size); rb.font.color.rgb = GREEN; rb.font.bold = True
        for j, part in enumerate(it.split("**")):
            if not part: continue
            r = p.add_run(); r.text = part; r.font.size = Pt(size); r.font.color.rgb = color
            r.font.bold = (j % 2 == 1); r.font.name = "Calibri"
    return tb


def infobox(sl, x, y, w, h, title, body, bg=LIGHT, accent=GREEN, tcolor=None):
    rect(sl, x, y, w, h, bg); rect(sl, x, y, Inches(0.09), h, accent)
    runs = [[(title, 13, accent, True, False)]]
    for line in body.split("\n"):
        runs.append([(line, 11.5, tcolor or INK, False, False)])
    text(sl, x + Inches(0.22), y + Inches(0.12), w - Inches(0.4), h - Inches(0.22), runs, space=3)


def content_slide(title, eyebrow=None):
    sl = prs.slides.add_slide(BLANK)
    rect(sl, 0, 0, SW, SH, WHITE); rect(sl, 0, 0, Inches(0.22), SH, GREEN)
    rect(sl, Inches(0.6), Inches(0.5), Inches(0.6), Inches(0.09), MINT)
    if eyebrow:
        text(sl, Inches(0.6), Inches(0.6), Inches(11.5), Inches(0.4), [[(eyebrow.upper(), 12, GREEN, True, False)]])
    text(sl, Inches(0.6), Inches(0.88), Inches(12.2), Inches(1.0), [[(title, 27, DARK, True, False)]])
    return sl


def stat_card(sl, x, y, w, value, label):
    rect(sl, x, y, w, Inches(1.55), LIGHT); rect(sl, x, y, w, Inches(0.09), GREEN)
    text(sl, x, y + Inches(0.24), w, Inches(0.8), [[(value, 30, GREEN, True, False)]], align=PP_ALIGN.CENTER)
    text(sl, x, y + Inches(0.98), w, Inches(0.5), [[(label, 12, GREY, False, False)]], align=PP_ALIGN.CENTER)


def image_slide(title, eyebrow, image, caption=None, maxw=9.6, maxh=4.7, top=1.7):
    sl = content_slide(title, eyebrow)
    path = os.path.join(BASE, image)
    pic = sl.shapes.add_picture(path, Inches(0), Inches(top), width=Inches(maxw))
    if pic.height > Inches(maxh):
        sl.shapes._spTree.remove(pic._element)
        pic = sl.shapes.add_picture(path, Inches(0), Inches(top), height=Inches(maxh))
    pic.left = int((SW - pic.width) // 2)
    if caption:
        text(sl, Inches(0.6), Inches(top + maxh + 0.15), Inches(12.1), Inches(0.5),
             [[(caption, 13, GREY, False, True)]], align=PP_ALIGN.CENTER)
    return sl


# ───── 1. Title ─────
sl = prs.slides.add_slide(BLANK)
rect(sl, 0, 0, SW, SH, DARK); rect(sl, 0, 0, SW, Inches(0.18), GREEN); rect(sl, 0, SH - Inches(0.18), SW, Inches(0.18), GREEN)
rect(sl, Inches(0.9), Inches(1.5), Inches(0.7), Inches(0.11), MINT)
text(sl, Inches(0.9), Inches(1.7), Inches(11.5), Inches(0.5), [[("SDG #3 · GOOD HEALTH AND WELL-BEING", 14, MINT, True, False)]])
text(sl, Inches(0.9), Inches(2.3), Inches(11.6), Inches(2.4), [
    [("StuntCare AI", 52, WHITE, True, False)],
    [("Deteksi Dini Risiko Stunting Balita Berbasis Random Forest", 24, LIGHT, False, False)],
    [("divalidasi pada dataset nyata Indonesia · berjalan di peramban", 22, LIGHT, False, False)],
])
text(sl, Inches(0.9), Inches(5.6), Inches(11.5), Inches(1.2), [
    [("Daniel Steffen K  ·  NIM 2602071171", 18, WHITE, True, False)],
    [("Artificial Intelligence (COMP6065001) · LA05-LEC · BINUS University", 14, MINT, False, False)],
])

# ───── 2. Masalah & kebutuhan nyata ─────
sl = content_slide("Stunting: masalah nyata & mendesak", "Latar belakang & kebutuhan")
bullets(sl, Inches(0.65), Inches(1.85), Inches(7.3), Inches(3.6), [
    "Prevalensi stunting Indonesia **21,5%** (SKI/SSGI 2023) — **1 dari 5 balita**.",
    "Masih jauh dari **target nasional 14%** (Perpres 72/2021); Riskesdas 2018: 30,8%.",
    "Dampak permanen: kecerdasan (IQ), imunitas, prestasi, produktivitas dewasa.",
    "Kerugian ekonomi **2–3% PDB/tahun** (Bank Dunia/Bappenas).",
    "Periode kritis hanya **1000 Hari Pertama Kehidupan** → telat deteksi = rugi besar.",
], size=15)
stat_card(sl, Inches(8.35), Inches(1.85), Inches(4.2), "21,5%", "Prevalensi (SKI 2023)")
stat_card(sl, Inches(8.35), Inches(3.55), Inches(4.2), "14%", "Target nasional 2024")
stat_card(sl, Inches(8.35), Inches(5.25), Inches(4.2), "2–3%", "Kerugian PDB/tahun")

# ───── 3. Kebutuhan & pengaplikasian nyata ─────
sl = content_slide("Kebutuhan & pengaplikasian yang nyata", "Identifikasi masalah")
bullets(sl, Inches(0.65), Inches(1.9), Inches(6.0), Inches(4.5), [
    "**Kesenjangan:** skrining lapangan masih manual di posyandu, 1 indikator, dan "
    "kurang tenaga gizi — terutama di daerah 3T berinternet terbatas.",
    "Belum ada alat skrining yang **murah, cepat, luring, dan privat**.",
    "**Kebutuhan ini nyata namun belum terpenuhi.**",
], size=15)
infobox(sl, Inches(6.85), Inches(1.9), Inches(5.7), Inches(4.7),
        "Siapa yang memakai (use case nyata)",
        "• Orang tua balita — skrining mandiri di rumah, bahkan tanpa internet.\n"
        "• Kader posyandu — skrining cepat & prioritas rujukan.\n"
        "• Puskesmas / Dinas Kesehatan — deteksi dini & penentuan sasaran intervensi.\n"
        "• Edukasi keluarga — asisten tanya-jawab pencegahan stunting.")

# ───── 4. Solusi ─────
sl = content_slide("Solusi: prediksi cepat, di perangkat", "Gagasan")
bullets(sl, Inches(0.65), Inches(2.0), Inches(12), Inches(3.5), [
    "Aplikasi web dengan mesin prediksi **Random Forest**.",
    "**Divalidasi pada dataset stunting balita NYATA Indonesia** (55.367 sampel).",
    "Berjalan **100% di peramban** — gratis, cepat, dapat luring, privat.",
    "Output: status gizi + tingkat keyakinan + Z-Score WHO + rekomendasi.",
], size=18)

# ───── 5. 7 faktor (prototipe) ─────
sl = content_slide("Faktor masukan model", "Fitur")
bullets(sl, Inches(0.65), Inches(1.95), Inches(5.9), Inches(3.0),
        ["**Umur** (bulan)", "**Jenis kelamin**", "**Tinggi badan** (cm) — indikator utama", "**Berat badan** (kg)"], size=16)
bullets(sl, Inches(6.7), Inches(1.95), Inches(5.9), Inches(3.0),
        ["**Jarak kehamilan** (bulan)", "**Usia ibu menikah** (tahun)", "**Gizi ibu saat hamil**"], size=16)
infobox(sl, Inches(0.65), Inches(5.2), Inches(11.9), Inches(1.5),
        "Inti vs pengembangan",
        "Model INTI (divalidasi data nyata) memakai 3 fitur: umur, jenis kelamin, tinggi badan. "
        "Prototipe PENGEMBANGAN menambah berat badan & faktor maternal (dari literatur) = 7 fitur.")

# ───── 6. Random Forest cara kerja ─────
sl = content_slide("Random Forest — cara kerja", "Inti algoritma")
bullets(sl, Inches(0.65), Inches(1.9), Inches(7.6), Inches(4.6), [
    "**Ensemble** 120 **pohon keputusan** (Breiman, 2001).",
    "Tiap pohon belajar dari **sampel acak** data (bagging) + subset fitur acak.",
    "Hasil akhir = **rata-rata probabilitas** semua pohon (soft voting).",
    "Banyak pohon → akurat & **tahan overfitting**; memberi **feature importance**.",
], size=16)
for i in range(3):
    x = Inches(8.8 + i * 1.35)
    rect(sl, x, Inches(2.6), Inches(1.05), Inches(2.4), LIGHT); rect(sl, x, Inches(2.6), Inches(1.05), Inches(0.08), GREEN)
    text(sl, x, Inches(3.45), Inches(1.05), Inches(0.6), [[(f"Pohon {i+1}", 13, GREEN, True, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
text(sl, Inches(8.8), Inches(5.15), Inches(4.0), Inches(0.5), [[("120 pohon → voting → 1 prediksi", 12, GREY, False, True)]], align=PP_ALIGN.CENTER)

# ───── 7. Random Forest — matematis ─────
sl = content_slide("Penjelasan matematis algoritma", "Inti algoritma")
def formula_box(sl, x, y, w, h, title, formula):
    rect(sl, x, y, w, h, LIGHT)
    text(sl, x + Inches(0.2), y + Inches(0.12), w - Inches(0.4), h - Inches(0.2),
         [[(title, 12, GREEN, True, False)], [(formula, 15, DARK, False, False)]], space=4)
formula_box(sl, Inches(0.65), Inches(1.8), Inches(5.9), Inches(1.4),
            "Ketidakmurnian Gini (pemilihan split)", "Gini(t) = 1 − Σ pᵢ²")
formula_box(sl, Inches(6.75), Inches(1.8), Inches(5.85), Inches(1.4),
            "Penurunan impurity saat split", "ΔI = Gini(t) − Σ (Nₖ/Nₜ)·Gini(k)")
formula_box(sl, Inches(0.65), Inches(3.4), Inches(5.9), Inches(1.4),
            "Prediksi (soft voting)", "P(c|x) = (1/T) Σ Pₜ(c|x) ; ŷ = argmax P(c|x)")
formula_box(sl, Inches(6.75), Inches(3.4), Inches(5.85), Inches(1.4),
            "Kepentingan fitur (MDI)", "Imp(f) = (1/T) Σ Σ (Nᵥ/N)·ΔIᵥ")
formula_box(sl, Inches(0.65), Inches(5.0), Inches(5.9), Inches(1.4),
            "Z-Score tinggi-untuk-umur (HAZ)", "HAZ = (X − M) / S")
formula_box(sl, Inches(6.75), Inches(5.0), Inches(5.85), Inches(1.4),
            "Metrik", "F1 = 2·P·R/(P+R) ; P=TP/(TP+FP)")

# ───── 8. Dataset real ─────
sl = content_slide("Dataset nyata Indonesia", "Data")
bullets(sl, Inches(0.65), Inches(1.9), Inches(7.2), Inches(4.6), [
    "Sumber: **\"Stunting Toddler (Balita) Detection\"** (Kaggle/GitHub), basis **WHO**.",
    "**55.367 sampel** balita Indonesia — kelas seimbang (≈ tiap kelas).",
    "Fitur: Umur, Jenis Kelamin, Tinggi Badan → Status Gizi (4 kelas).",
    "Dipakai untuk **melatih & memvalidasi** model inti pada kondisi data riil.",
], size=15)
infobox(sl, Inches(8.1), Inches(1.9), Inches(4.45), Inches(3.0),
        "Pembagian data",
        "• Latih: 44.293 sampel (80%)\n• Uji: 11.074 sampel (20%)\n• Stratified + 5-fold CV")
stat_card(sl, Inches(8.1), Inches(5.1), Inches(4.45), "55.367", "Sampel data nyata")

# ───── 9. Tahapan training step-by-step ─────
sl = content_slide("Langkah pembuatan & pelatihan model", "Proses (step-by-step)")
bullets(sl, Inches(0.65), Inches(1.8), Inches(6.0), Inches(5.0), [
    "**1.** Kumpulkan data (real 55.367 + multi-faktor 25.000).",
    "**2.** Bersihkan & seragamkan label (4 kelas).",
    "**3.** Encoding teks→angka (Label Encoding).",
    "**4.** Bagi data 80% latih : 20% uji (stratified).",
    "**5.** Inisialisasi Random Forest (120 pohon, depth 14).",
    "**6.** Latih: tiap pohon bootstrap + fitur acak.",
], size=14, gap=7)
bullets(sl, Inches(6.85), Inches(1.8), Inches(5.7), Inches(5.0), [
    "**7.** Validasi silang 5-fold.",
    "**8.** Evaluasi di data uji (akurasi, F1, confusion matrix).",
    "**9.** Analisis kepentingan fitur.",
    "**10.** Konversi model ke **ONNX**.",
    "**11.** Integrasi ke web React (Web Worker).",
], size=14, gap=7)

# ───── 10. Hasil validasi (gambar) ─────
image_slide("Hasil validasi pada dataset nyata", "Hasil",
            "real_confusion_matrix.png",
            f"Confusion matrix — akurasi {M['accuracy']}%, F1 {M['f1_macro']}%, CV {M['cv_mean']}% ± {M['cv_std']}%.",
            maxw=8.2, maxh=4.6)

# ───── 11. Feature importance + distribusi (gambar) ─────
sl = content_slide("Kepentingan fitur & distribusi data", "Hasil")
for img, x in [("real_feature_importance.png", 0.55), ("real_class_distribution.png", 6.75)]:
    p = os.path.join(BASE, img)
    pic = sl.shapes.add_picture(p, Inches(x), Inches(2.1), width=Inches(6.0))
    if pic.height > Inches(3.6):
        sl.shapes._spTree.remove(pic._element)
        pic = sl.shapes.add_picture(p, Inches(x), Inches(2.1), height=Inches(3.6))
text(sl, Inches(0.6), Inches(6.0), Inches(12.1), Inches(0.5),
     [[("Tinggi badan & umur paling berpengaruh (dihitung sendiri oleh model). Distribusi kelas seimbang.", 13, GREY, False, True)]], align=PP_ALIGN.CENTER)

# ───── 12. Pengujian alat (per-class) ─────
image_slide("Grafik pengujian alat (per kelas)", "Pengujian",
            "real_per_class_metrics.png",
            "Precision, recall, dan F1-score tiap kelas saat pengujian pada data uji nyata.",
            maxw=9.3, maxh=4.7)

# ───── 13. Benchmarking ─────
image_slide("Benchmarking algoritma", "Hasil",
            "real_benchmark.png",
            "Random Forest (99,4%) mengungguli KNN, Decision Tree, Regresi Logistik, dan Naive Bayes.",
            maxw=9.4, maxh=4.7)

# ───── 14. Arsitektur ─────
sl = content_slide("Arsitektur: inferensi di peramban", "Arsitektur")
steps = [("1. Isi data", "Pengguna mengisi form di web."),
         ("2. Web Worker", "Proses di pekerja latar (di perangkat)."),
         ("3. Random Forest", "Model ONNX menghitung dalam mikrodetik."),
         ("4. Hasil", "Status + keyakinan + rekomendasi.")]
x = Inches(0.65)
for t, d in steps:
    rect(sl, x, Inches(2.0), Inches(2.85), Inches(2.0), LIGHT); rect(sl, x, Inches(2.0), Inches(2.85), Inches(0.09), GREEN)
    text(sl, x + Inches(0.15), Inches(2.25), Inches(2.55), Inches(0.6), [[(t, 15, DARK, True, False)]])
    text(sl, x + Inches(0.15), Inches(2.85), Inches(2.55), Inches(1.0), [[(d, 12, GREY, False, False)]])
    x += Inches(3.02)
infobox(sl, Inches(0.65), Inches(4.45), Inches(11.9), Inches(1.5),
        "Teknologi", "React + Vite + Tailwind (tampilan) · model dikonversi ke ONNX · ONNX Runtime "
        "Web (WASM) menjalankan model di peramban · Web Worker agar UI tidak macet.")
text(sl, Inches(0.65), Inches(6.15), Inches(12), Inches(0.5),
     [[("Tanpa server, gratis, bisa offline, dan data tidak dikirim ke mana pun.", 13, GREY, False, True)]])

# ───── 15. Asisten edukasi ─────
sl = content_slide("Asisten edukasi stunting (chat)", "Fitur tambahan")
bullets(sl, Inches(0.65), Inches(2.0), Inches(11.9), Inches(3.5), [
    "Pengguna bisa bertanya tips **mencegah stunting & gizi balita**.",
    "Ditenagai **LLM gratis** (tanpa biaya/token), dengan cadangan basis pengetahuan lokal.",
    "Bersifat **edukasi, bukan diagnosis**; kondisi khusus diarahkan ke posyandu/dokter.",
], size=18)

# ───── 16. Demo & deploy ─────
sl = content_slide("Demo & deployment", "Implementasi")
bullets(sl, Inches(0.65), Inches(2.0), Inches(11.9), Inches(3.0), [
    "Live di **Cloudflare Pages** (statis, gratis, HTTPS otomatis).",
    "URL: **machinelearning-ai.pages.dev**",
    "Build: Root = web · Build command = npm run build · Output = dist.",
    "Repositori: github.com/steffenkwik/machinelearning-ai",
], size=18)
rect(sl, Inches(0.65), Inches(5.3), Inches(11.9), Inches(1.0), LIGHT)
text(sl, Inches(0.85), Inches(5.5), Inches(11.5), Inches(0.6),
     [[("Demo: isi data → Analisis → hasil tampil seketika (offline).", 16, DARK, True, False)]], anchor=MSO_ANCHOR.MIDDLE)

# ───── 17. Kesimpulan ─────
sl = prs.slides.add_slide(BLANK)
rect(sl, 0, 0, SW, SH, DARK); rect(sl, 0, 0, SW, Inches(0.18), GREEN)
text(sl, Inches(0.9), Inches(0.85), Inches(11.5), Inches(0.6), [[("KESIMPULAN", 16, MINT, True, False)]])
bd = [
    f"**Random Forest divalidasi pada dataset NYATA Indonesia** (55.367 sampel) → akurasi {M['accuracy']}%.",
    "Mengungguli KNN, Decision Tree, Regresi Logistik, Naive Bayes pada benchmark.",
    "Berjalan **100% di peramban** (ONNX) — gratis, cepat, offline, privat.",
    "Menjawab kebutuhan nyata (prevalensi 21,5%, target 14%) — layak sebagai skrining awal (SDG #3).",
]
tb = sl.shapes.add_textbox(Inches(0.9), Inches(1.7), Inches(11.5), Inches(3.6)); tf = tb.text_frame; tf.word_wrap = True
for i, it in enumerate(bd):
    p = tf.paragraphs[0] if i == 0 else tf.add_paragraph(); p.space_after = Pt(14)
    rb = p.add_run(); rb.text = "▸  "; rb.font.size = Pt(18); rb.font.color.rgb = MINT; rb.font.bold = True
    for j, part in enumerate(it.split("**")):
        if not part: continue
        r = p.add_run(); r.text = part; r.font.size = Pt(18); r.font.color.rgb = WHITE; r.font.bold = (j % 2 == 1)
text(sl, Inches(0.9), Inches(5.85), Inches(11.5), Inches(1.0), [
    [("Terima kasih.", 30, WHITE, True, False)],
    [("Daniel Steffen K · NIM 2602071171 · BINUS University", 14, MINT, False, False)],
])

out = os.path.join(BASE, "StuntCare_AI_Presentation.pptx")
prs.save(out)
print("Slides:", len(prs.slides._sldIdLst), "->", out)
