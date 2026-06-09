# -*- coding: utf-8 -*-
"""Generate the StuntCare AI presentation deck (16:9)."""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

DARK = RGBColor(0x05, 0x31, 0x2A)
GREEN = RGBColor(0x03, 0x98, 0x55)
MINT = RGBColor(0x6C, 0xE9, 0xA6)
LIGHT = RGBColor(0xEA, 0xF7, 0xF0)
INK = RGBColor(0x15, 0x24, 0x1C)
GREY = RGBColor(0x4B, 0x55, 0x63)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
SW, SH = prs.slide_width, prs.slide_height
BLANK = prs.slide_layouts[6]

def rect(sl, x, y, w, h, color, line=None):
    s = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, x, y, w, h)
    s.fill.solid(); s.fill.fore_color.rgb = color
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line; s.line.width = Pt(1)
    s.shadow.inherit = False
    return s

def text(sl, x, y, w, h, runs, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, space=6):
    """runs: list of paragraphs; each paragraph is list of (txt,size,color,bold,italic)."""
    tb = sl.shapes.add_textbox(x, y, w, h); tf = tb.text_frame
    tf.word_wrap = True; tf.vertical_anchor = anchor
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.space_after = Pt(space)
        for (txt, size, color, bold, italic) in para:
            r = p.add_run(); r.text = txt; f = r.font
            f.size = Pt(size); f.color.rgb = color; f.bold = bold; f.italic = italic
            f.name = "Calibri"
    return tb

def bullets(sl, x, y, w, h, items, size=18, color=INK, gap=10):
    tb = sl.shapes.add_textbox(x, y, w, h); tf = tb.text_frame; tf.word_wrap = True
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap)
        rb = p.add_run(); rb.text = "▸  "; rb.font.size = Pt(size); rb.font.color.rgb = GREEN; rb.font.bold = True
        # support bold lead via "**"
        seg = it.split("**")
        for j, part in enumerate(seg):
            if not part: continue
            r = p.add_run(); r.text = part; r.font.size = Pt(size)
            r.font.color.rgb = color; r.font.bold = (j % 2 == 1); r.font.name = "Calibri"
    return tb

def content_slide(title, eyebrow=None):
    sl = prs.slides.add_slide(BLANK)
    rect(sl, 0, 0, SW, SH, WHITE)
    rect(sl, 0, 0, Inches(0.22), SH, GREEN)            # left accent
    rect(sl, Inches(0.6), Inches(0.55), Inches(0.6), Inches(0.09), MINT)
    if eyebrow:
        text(sl, Inches(0.6), Inches(0.66), Inches(11), Inches(0.4),
             [[(eyebrow.upper(), 12, GREEN, True, False)]])
    text(sl, Inches(0.6), Inches(0.95), Inches(12.1), Inches(1.0),
         [[(title, 30, DARK, True, False)]])
    return sl

def stat_card(sl, x, y, w, value, label):
    rect(sl, x, y, w, Inches(1.7), LIGHT)
    rect(sl, x, y, w, Inches(0.09), GREEN)
    text(sl, x, y+Inches(0.28), w, Inches(0.8), [[(value, 34, GREEN, True, False)]], align=PP_ALIGN.CENTER)
    text(sl, x, y+Inches(1.08), w, Inches(0.5), [[(label, 13, GREY, False, False)]], align=PP_ALIGN.CENTER)

# ---------------- Slide 1: Title ----------------
sl = prs.slides.add_slide(BLANK)
rect(sl, 0, 0, SW, SH, DARK)
rect(sl, 0, 0, SW, Inches(0.18), GREEN)
rect(sl, 0, SH-Inches(0.18), SW, Inches(0.18), GREEN)
rect(sl, Inches(0.9), Inches(1.5), Inches(0.7), Inches(0.11), MINT)
text(sl, Inches(0.9), Inches(1.7), Inches(11.5), Inches(0.5),
     [[("SDG #3 · GOOD HEALTH AND WELL-BEING", 14, MINT, True, False)]])
text(sl, Inches(0.9), Inches(2.3), Inches(11.6), Inches(2.2), [
    [("StuntCare AI", 54, WHITE, True, False)],
    [("Deteksi Dini Risiko Stunting Balita Multi-Faktor", 26, LIGHT, False, False)],
    [("berbasis Random Forest dengan Inferensi di Peramban", 26, LIGHT, False, False)],
])
text(sl, Inches(0.9), Inches(5.5), Inches(11.5), Inches(1.3), [
    [("Daniel Steffen K  ·  NIM 2602071171", 18, WHITE, True, False)],
    [("Artificial Intelligence (COMP6065001) · LA05-LEC · BINUS University", 14, MINT, False, False)],
])

# ---------------- Slide 2: Masalah ----------------
sl = content_slide("Stunting: masalah gizi kronis multi-faktor", "Latar belakang")
bullets(sl, Inches(0.7), Inches(2.2), Inches(7.4), Inches(4.5), [
    "Prevalensi stunting Indonesia **19,8%** (SSGI 2024) — ±4,4 juta balita.",
    "Definisi: tinggi-untuk-umur **(HAZ) < −2 SD** (WHO 2006).",
    "Dampak jangka panjang: kognitif, imunitas, produktivitas.",
    "Penyebabnya **banyak faktor** — bukan hanya tinggi badan: jarak kehamilan, "
    "usia ibu menikah, gizi ibu saat hamil (KEK → BBLR).",
    "Skrining lapangan masih manual & satu indikator saja.",
], size=18)
stat_card(sl, Inches(8.5), Inches(2.4), Inches(4.2), "19,8%", "Prevalensi nasional (SSGI 2024)")
stat_card(sl, Inches(8.5), Inches(4.4), Inches(4.2), "7", "Faktor penyebab dianalisis")

# ---------------- Slide 3: Solusi ----------------
sl = content_slide("Solusi: prediksi 7 faktor, langsung di perangkat", "Gagasan")
bullets(sl, Inches(0.7), Inches(2.2), Inches(11.9), Inches(4.5), [
    "Aplikasi web yang menggabungkan **7 faktor** menjadi satu prediksi terpadu.",
    "Mesin prediksi: **Random Forest** (akurasi 88,40%, kategori Excellent).",
    "Berjalan **100% di peramban** pengguna — gratis, cepat, dapat luring.",
    "**Privasi**: data anak tidak dikirim ke server (penting untuk etika kesehatan).",
    "Output: status gizi + tingkat keyakinan + Z-Score WHO + rekomendasi tindak lanjut.",
], size=19)

# ---------------- Slide 4: 7 Faktor ----------------
sl = content_slide("Tujuh faktor masukan model", "Fitur")
left = ["**Tinggi badan** (cm) — indikator utama (HAZ)",
        "**Umur** (bulan) — acuan standar WHO",
        "**Berat badan** (kg) — Weight-for-Age",
        "**Jenis kelamin** — standar L/P berbeda"]
right = ["**Jarak kehamilan** (bln) — ideal >24 (BKKBN 4T)",
         "**Usia ibu menikah** (thn) — dini <20 = risiko",
         "**Gizi ibu saat hamil** — Baik/Sedang/Buruk (KEK)"]
bullets(sl, Inches(0.7), Inches(2.3), Inches(6.0), Inches(4.2), left, size=18)
bullets(sl, Inches(6.9), Inches(2.3), Inches(6.0), Inches(4.2), right, size=18)

# ---------------- Slide 5: Random Forest cara kerja (EMPHASIS) ----------------
sl = content_slide("Random Forest — bagaimana ia bekerja", "Inti algoritma")
bullets(sl, Inches(0.7), Inches(2.1), Inches(7.5), Inches(4.6), [
    "**Ensemble** dari **120 pohon keputusan** (Breiman, 2001).",
    "**Bagging**: tiap pohon dilatih pada subsampel acak (bootstrap), tiap "
    "percabangan memakai sebagian fitur acak.",
    "Prediksi akhir = **rata-rata probabilitas** semua pohon (soft voting).",
    "Hasil: akurat & **tahan overfitting**.",
    "Dipilih karena: menangani fitur numerik+kategorikal tanpa scaling, dan "
    "memberi **feature importance** (dapat ditafsirkan/transparan).",
], size=17)
# simple "forest" motif (decision trees)
for i in range(3):
    x = Inches(8.6 + i*1.45)
    rect(sl, x, Inches(2.7), Inches(1.15), Inches(2.6), LIGHT)
    rect(sl, x, Inches(2.7), Inches(1.15), Inches(0.08), GREEN)
    text(sl, x, Inches(3.5), Inches(1.15), Inches(0.6),
         [[(f"Tree {i+1}", 15, GREEN, True, False)]], align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
text(sl, Inches(8.6), Inches(5.45), Inches(4.05), Inches(0.6),
     [[("120 pohon → voting → 1 prediksi", 13, GREY, False, True)]], align=PP_ALIGN.CENTER)

# ---------------- Slide 6: RF training + config ----------------
sl = content_slide("Random Forest — pelatihan & konfigurasi", "Inti algoritma")
bullets(sl, Inches(0.7), Inches(2.1), Inches(6.0), Inches(4.5), [
    "Dataset **25.000 sampel** · split **80:20**.",
    "**120 trees**, max depth **14**, scikit-learn.",
    "Encoding kategorikal (Label Encoding).",
    "4 kelas: Normal, Stunted, Severely Stunted, Tinggi.",
], size=18)
box = rect(sl, Inches(6.9), Inches(2.2), Inches(5.8), Inches(2.5), DARK)
text(sl, Inches(7.1), Inches(2.4), Inches(5.5), Inches(2.2), [
    [("rf = RandomForestClassifier(", 13, MINT, False, False)],
    [("      n_estimators=120,", 13, WHITE, False, False)],
    [("      max_depth=14)", 13, WHITE, False, False)],
    [("rf.fit(X_train, y_train)", 13, WHITE, False, False)],
    [("rf.predict_proba(X_test)", 13, MINT, False, False)],
])
text(sl, Inches(6.9), Inches(4.95), Inches(5.8), Inches(0.5),
     [[("Kode inti pelatihan (Python / scikit-learn)", 12, GREY, False, True)]])

# ---------------- Slide 7: Performa ----------------
sl = content_slide("Performa model (data uji 5.000 sampel)", "Hasil")
stat_card(sl, Inches(0.7), Inches(2.3), Inches(2.85), "88,40%", "Accuracy (Excellent ≥85%)")
stat_card(sl, Inches(3.75), Inches(2.3), Inches(2.85), "83,56%", "F1-Score (macro)")
stat_card(sl, Inches(6.8), Inches(2.3), Inches(2.85), "87,31%", "Cross-Validation (5-fold)")
stat_card(sl, Inches(9.85), Inches(2.3), Inches(2.85), "1,83%", "Disparitas gender (<5%)")
bullets(sl, Inches(0.7), Inches(4.6), Inches(12), Inches(2.0), [
    "Precision 81,59% · Recall 85,93% (macro).",
    "Kesalahan utama antar kelas **bertetangga** (Stunted ↔ Severely Stunted) — wajar, batas kontinu.",
], size=17)

# ---------------- Slide 8: Feature importance ----------------
sl = content_slide("Faktor paling berpengaruh (feature importance)", "Hasil")
fi = [("Tinggi badan", 50.6), ("Umur", 28.7), ("Berat badan", 9.5),
      ("Jarak kehamilan", 4.3), ("Usia ibu menikah", 4.2), ("Gizi ibu hamil", 1.5), ("Jenis kelamin", 1.3)]
y = Inches(2.25); maxw = 8.5
for name, val in fi:
    text(sl, Inches(0.7), y, Inches(3.0), Inches(0.35), [[(name, 14, INK, False, False)]], anchor=MSO_ANCHOR.MIDDLE)
    rect(sl, Inches(3.8), y+Inches(0.05), Inches(maxw*val/50.6), Inches(0.28), GREEN)
    text(sl, Inches(3.8+maxw*val/50.6+0.1), y, Inches(1.2), Inches(0.35),
         [[(f"{val}%", 13, GREY, True, False)]], anchor=MSO_ANCHOR.MIDDLE)
    y += Inches(0.62)
text(sl, Inches(0.7), Inches(6.7), Inches(12), Inches(0.5),
     [[("Tinggi badan & umur mendominasi — konsisten dengan definisi HAZ.", 14, GREY, False, True)]])

# ---------------- Slide 9: Fairness & Etika ----------------
sl = content_slide("Keadilan, transparansi & privasi (LO6)", "Etika")
bullets(sl, Inches(0.7), Inches(2.2), Inches(11.9), Inches(4.5), [
    "**Fairness**: disparitas akurasi gender 1,83% (< ambang 5%).",
    "**Transparansi**: confidence, probabilitas tiap kelas, Z-Score, catatan risiko — bukan kotak hitam.",
    "**Privasi**: inferensi di perangkat; data tidak dikirim ke server.",
    "**Keamanan**: disclaimer jelas — skrining awal, BUKAN diagnosis medis.",
    "**Jujur**: modul foto diberi label eksperimental & pengaruhnya dibatasi.",
], size=18)

# ---------------- Slide 10: Streamlit -> Web modern ----------------
sl = content_slide("Dari Streamlit ke web modern", "Rekayasa perangkat lunak")
bullets(sl, Inches(0.7), Inches(2.1), Inches(11.9), Inches(4.6), [
    "Purwarupa awal: **Streamlit** (Python) — UI demo terbatas & butuh **server**.",
    "Streamlit **tidak bisa** di Cloudflare Pages (statis) → perlu dibangun ulang.",
    "Solusi: konversi model **.pkl → ONNX** (parity terverifikasi, galat 3,4×10⁻⁷).",
    "Frontend baru: **React + Vite + TypeScript + Tailwind** (komponen shadcn-style).",
    "Bug “Page Unresponsive” diperbaiki: inferensi dipindah ke **Web Worker**.",
], size=18)

# ---------------- Slide 11: Arsitektur ----------------
sl = content_slide("Arsitektur: inferensi di peramban", "Arsitektur")
steps = [("1. Input 7 faktor", "Form data anak + ibu"),
         ("2. Web Worker", "ONNX Runtime Web (WASM)"),
         ("3. Random Forest", "Inferensi mikrodetik di perangkat"),
         ("4. Output", "Status + keyakinan + rekomendasi")]
x = Inches(0.7)
for t, d in steps:
    rect(sl, x, Inches(2.6), Inches(2.85), Inches(2.0), LIGHT)
    rect(sl, x, Inches(2.6), Inches(2.85), Inches(0.09), GREEN)
    text(sl, x+Inches(0.15), Inches(2.85), Inches(2.55), Inches(0.8), [[(t, 16, DARK, True, False)]])
    text(sl, x+Inches(0.15), Inches(3.5), Inches(2.55), Inches(1.0), [[(d, 13, GREY, False, False)]])
    x += Inches(3.05)
bullets(sl, Inches(0.7), Inches(5.0), Inches(12), Inches(1.8), [
    "WASM single-thread → tanpa header COOP/COEP, mudah di-deploy & **luring**.",
    "Transfer pertama ±5 MB (model+runtime), lalu di-cache.",
], size=16)

# ---------------- Slide 12: Foto ----------------
sl = content_slide("Modul opsional: Analisis Foto AI (eksperimental)", "Pengayaan")
bullets(sl, Inches(0.7), Inches(2.2), Inches(11.9), Inches(4.5), [
    "**MediaPipe Pose** (33 titik) + **segmentation mask**, berjalan di perangkat.",
    "Mengukur **ketebalan/panjang** tiap anggota tubuh → estimasi proporsi (kurus/normal/gemuk).",
    "Bersifat **scale- & pose-invariant** (berdiri, duduk, berbaring).",
    "**Jujur**: foto 2D tak bisa ukur tinggi → bukan fitur RF; hanya **late-fusion** transparan (maks ±10 poin, tampil sebelum→sesudah).",
    "Random Forest **tidak dilatih ulang** — tidak ada klaim palsu.",
], size=17)

# ---------------- Slide 13: Demo & deploy ----------------
sl = content_slide("Demo & deployment", "Implementasi")
bullets(sl, Inches(0.7), Inches(2.2), Inches(11.9), Inches(3.0), [
    "Live di **Cloudflare Pages** (statis, gratis, HTTPS otomatis).",
    "URL: **machinelearning-ai.pages.dev**",
    "Build: Root = web · Build command = npm run build · Output = dist.",
    "Repositori: github.com/steffenkwik/machinelearning-ai",
], size=18)
rect(sl, Inches(0.7), Inches(5.4), Inches(11.9), Inches(1.1), LIGHT)
text(sl, Inches(0.9), Inches(5.6), Inches(11.5), Inches(0.8),
     [[("Demo langsung: isi 7 faktor → Analisis → hasil tampil seketika (offline).", 16, DARK, True, False)]],
     anchor=MSO_ANCHOR.MIDDLE)

# ---------------- Slide 14: Kesimpulan ----------------
sl = prs.slides.add_slide(BLANK)
rect(sl, 0, 0, SW, SH, DARK)
rect(sl, 0, 0, SW, Inches(0.18), GREEN)
text(sl, Inches(0.9), Inches(0.9), Inches(11.5), Inches(0.6), [[("KESIMPULAN", 16, MINT, True, False)]])
bullets_dark = [
    "**Random Forest 88,40%** (Excellent) menggabungkan 7 faktor penyebab stunting.",
    "Model asli berjalan **100% di peramban** via ONNX — gratis, cepat, luring, privat.",
    "Mengatasi keterbatasan Streamlit & bug freeze; transparan dan etis (SDG #3).",
    "Layak sebagai **alat skrining awal**; lanjutan: validasi klinis modul foto.",
]
tb = sl.shapes.add_textbox(Inches(0.9), Inches(1.8), Inches(11.5), Inches(3.6)); tf = tb.text_frame; tf.word_wrap=True
for i, it in enumerate(bullets_dark):
    p = tf.paragraphs[0] if i==0 else tf.add_paragraph(); p.space_after = Pt(14)
    rb=p.add_run(); rb.text="▸  "; rb.font.size=Pt(19); rb.font.color.rgb=MINT; rb.font.bold=True
    for j,part in enumerate(it.split("**")):
        if not part: continue
        r=p.add_run(); r.text=part; r.font.size=Pt(19); r.font.color.rgb=WHITE; r.font.bold=(j%2==1)
text(sl, Inches(0.9), Inches(5.9), Inches(11.5), Inches(1.0), [
    [("Terima kasih.", 30, WHITE, True, False)],
    [("Daniel Steffen K · NIM 2602071171 · BINUS University", 14, MINT, False, False)],
])

base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(base, "StuntCare_AI_Presentation.pptx")
prs.save(out)
print("Slides:", len(prs.slides._sldIdLst), "->", out)
