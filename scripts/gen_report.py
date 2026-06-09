# -*- coding: utf-8 -*-
"""Generate the PKM-AI format report PDF for StuntCare AI."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Image, Table,
    TableStyle, PageBreak, Preformatted, ListFlowable, ListItem,
)
import os

GREEN = colors.HexColor("#039855")
DARK = colors.HexColor("#05312A")
LIGHT = colors.HexColor("#EAF7F0")
GREY = colors.HexColor("#4B5563")

def styles():
    base = ParagraphStyle("body", fontName="Times-Roman", fontSize=11.5, leading=15,
                          alignment=TA_JUSTIFY, spaceAfter=6, firstLineIndent=18)
    return {
        "title": ParagraphStyle("title", fontName="Times-Bold", fontSize=15, leading=19,
                                 alignment=TA_CENTER, textColor=DARK, spaceAfter=8),
        "author": ParagraphStyle("author", fontName="Times-Roman", fontSize=11,
                                  alignment=TA_CENTER, spaceAfter=2),
        "small": ParagraphStyle("small", fontName="Times-Italic", fontSize=10,
                                 alignment=TA_CENTER, textColor=GREY, spaceAfter=2),
        "h1": ParagraphStyle("h1", fontName="Times-Bold", fontSize=12.5, leading=16,
                             textColor=GREEN, spaceBefore=12, spaceAfter=5),
        "h2": ParagraphStyle("h2", fontName="Times-Bold", fontSize=11.5, leading=15,
                             textColor=DARK, spaceBefore=7, spaceAfter=3),
        "body": base,
        "bodync": ParagraphStyle("bodync", parent=base, firstLineIndent=0),
        "abstract": ParagraphStyle("abstract", parent=base, fontSize=10.5, leading=14),
        "caption": ParagraphStyle("caption", fontName="Times-Italic", fontSize=9.5,
                                   alignment=TA_CENTER, textColor=GREY, spaceAfter=8, spaceBefore=2),
        "code": ParagraphStyle("code", fontName="Courier", fontSize=7.6, leading=9.4,
                               textColor=colors.HexColor("#0B2C22")),
        "ref": ParagraphStyle("ref", fontName="Times-Roman", fontSize=10.5, leading=13.5,
                              alignment=TA_JUSTIFY, leftIndent=18, firstLineIndent=-18, spaceAfter=4),
    }

S = styles()

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GREEN); canvas.setLineWidth(1.4)
    canvas.line(2*cm, A4[1]-1.55*cm, A4[0]-2*cm, A4[1]-1.55*cm)
    canvas.setFont("Times-Italic", 8); canvas.setFillColor(GREY)
    canvas.drawString(2*cm, A4[1]-1.42*cm, "StuntCare AI — Deteksi Dini Risiko Stunting Balita Berbasis Random Forest")
    canvas.setStrokeColor(colors.HexColor("#D1D5DB")); canvas.setLineWidth(0.5)
    canvas.line(2*cm, 1.4*cm, A4[0]-2*cm, 1.4*cm)
    canvas.setFont("Times-Roman", 9); canvas.setFillColor(GREY)
    canvas.drawString(2*cm, 1.0*cm, "Daniel Steffen K · NIM 2602071171 · COMP6065001 — Artificial Intelligence · BINUS University")
    canvas.drawRightString(A4[0]-2*cm, 1.0*cm, "Hal. %d" % doc.page)
    canvas.restoreState()

def code_block(text):
    p = Preformatted(text, S["code"])
    t = Table([[p]], colWidths=[A4[0]-4*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT),
        ("BOX", (0,0), (-1,-1), 0.6, GREEN),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
    ]))
    return t

def table(data, col_widths, head=True):
    t = Table(data, colWidths=col_widths, repeatRows=1 if head else 0)
    st = [
        ("FONTNAME",(0,0),(-1,-1),"Times-Roman"),("FONTSIZE",(0,0),(-1,-1),9.6),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),
        ("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#CBD5C9")),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, colors.HexColor("#F4FBF7")]),
    ]
    if head:
        st += [("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),colors.white),
               ("FONTNAME",(0,0),(-1,0),"Times-Bold")]
    t.setStyle(TableStyle(st))
    return t

def P(t, s="body"): return Paragraph(t, S[s])

def bullets(items, indent=8):
    return ListFlowable([ListItem(Paragraph(i, S["bodync"]), leftIndent=14, value="•") for i in items],
                        bulletType="bullet", start="•", leftIndent=indent, spaceAfter=2)

def img(path, max_w=15.0, max_h=8.5):
    from PIL import Image as PImage
    iw, ih = PImage.open(path).size
    w = max_w*cm; h = w*ih/iw
    if h > max_h*cm:
        h = max_h*cm; w = h*iw/ih
    return Image(path, width=w, height=h)

def build(out_path, base_dir):
    story = []
    # ---- Title block ----
    story.append(P("StuntCare AI: Deteksi Dini Risiko Stunting Balita Multi-Faktor "
                   "Berbasis Random Forest dengan Inferensi di Peramban", "title"))
    story.append(P("Daniel Steffen K<super>1)</super>", "author"))
    story.append(P("<sup>1</sup>Program Studi Computer Science, BINUS University, Jakarta", "small"))
    story.append(P("Penulis korespondensi: daniel.k@binus.ac.id · NIM 2602071171 · Kelas LA05-LEC", "small"))
    story.append(Spacer(1, 8))

    # ---- Abstrak ID ----
    story.append(P("ABSTRAK", "h2"))
    story.append(P(
        "Stunting masih menjadi masalah gizi kronis utama di Indonesia dengan prevalensi 19,8% "
        "(SSGI 2024) dan disebabkan banyak faktor yang saling terkait, bukan hanya tinggi badan. "
        "Tujuan kajian ini adalah membangun aplikasi deteksi dini risiko stunting yang menganalisis "
        "tujuh faktor penyebab sekaligus dan mudah diakses masyarakat. Metode yang digunakan adalah "
        "klasifikasi <b>Random Forest</b> (ensemble 120 pohon keputusan) yang dilatih pada 25.000 "
        "sampel data anak dan ibu, lalu dikemas menjadi aplikasi web statis. Untuk kebutuhan deployment "
        "dan privasi, model scikit-learn dikonversi ke format ONNX dan dijalankan sepenuhnya di "
        "peramban pengguna (on-device) memakai ONNX Runtime Web di dalam Web Worker. Hasil pengujian "
        "menunjukkan akurasi 88,40%, F1-score makro 83,56%, validasi silang 87,31% ± 0,42%, serta "
        "disparitas antar gender 1,83% (di bawah ambang 5%). Aplikasi berjalan cepat, gratis, dapat "
        "luring, dan data tidak dikirim ke server. Disimpulkan bahwa pendekatan ini layak sebagai alat "
        "skrining awal yang akurat dan menjunjung privasi, mendukung SDG #3 Good Health and Well-being.",
        "abstract"))
    story.append(P("<b>Kata kunci:</b> stunting, Random Forest, machine learning, inferensi di peramban, "
                   "ONNX, WHO Child Growth Standards.", "abstract"))

    # ---- Abstract EN ----
    story.append(P("ABSTRACT", "h2"))
    story.append(P(
        "Stunting remains a major chronic malnutrition problem in Indonesia (19.8% prevalence, SSGI 2024) "
        "and is driven by many interrelated factors, not height alone. This work builds an early "
        "stunting-risk screening application that jointly analyses seven causal factors and is easy for "
        "the public to access. We use a <b>Random Forest</b> classifier (an ensemble of 120 decision trees) "
        "trained on 25,000 child-and-mother records, packaged as a static web application. For deployment "
        "and privacy, the scikit-learn model is converted to ONNX and runs entirely in the user's browser "
        "(on-device) via ONNX Runtime Web inside a Web Worker. The model reaches 88.40% accuracy, 83.56% "
        "macro F1, 87.31% ± 0.42% cross-validation, and a 1.83% gender disparity (below the 5% threshold). "
        "The app is fast, free, offline-capable, and sends no data to any server, making it a feasible, "
        "privacy-preserving screening tool that supports SDG #3.",
        "abstract"))
    story.append(P("<b>Keywords:</b> stunting, Random Forest, machine learning, in-browser inference, ONNX, "
                   "WHO Child Growth Standards.", "abstract"))

    # ---- Pendahuluan ----
    story.append(P("Pendahuluan", "h1"))
    story.append(P(
        "Stunting adalah kondisi gagal tumbuh pada balita akibat kekurangan gizi kronis, yang ditandai "
        "dengan tinggi badan menurut umur (Height-for-Age Z-Score/HAZ) di bawah −2 standar deviasi "
        "menurut WHO Child Growth Standards 2006. Berdasarkan Survei Status Gizi Indonesia (SSGI) 2024, "
        "prevalensi stunting nasional mencapai 19,8%, atau sekitar 4,4 juta balita. Dampaknya bersifat "
        "jangka panjang: gangguan perkembangan kognitif, daya tahan tubuh yang lemah, dan menurunnya "
        "produktivitas di masa dewasa."))
    story.append(P(
        "Permasalahan utama adalah bahwa stunting dipengaruhi <b>banyak faktor yang saling terkait</b> — "
        "tidak hanya tinggi badan anak. Faktor maternal seperti jarak kehamilan yang terlalu dekat "
        "(program 4 Terlalu BKKBN), pernikahan dini, dan status gizi ibu saat hamil (risiko Kurang Energi "
        "Kronis/KEK yang berujung Berat Badan Lahir Rendah/BBLR) turut berkontribusi. Solusi skrining yang "
        "ada di lapangan umumnya masih manual (pengukuran posyandu) dan menilai satu indikator saja, "
        "sehingga belum mengintegrasikan banyak faktor secara cepat dan objektif."))
    story.append(P(
        "Fokus kajian ini adalah membangun sistem prediksi berbasis <i>machine learning</i> yang "
        "menggabungkan <b>tujuh faktor</b> penyebab stunting menjadi satu prediksi terpadu, serta "
        "menjadikannya aplikasi web yang ringan, gratis, dan menjaga privasi data anak. Kontribusi "
        "utama meliputi: (1) model Random Forest tujuh fitur dengan akurasi 88,40%; (2) arsitektur "
        "inferensi yang berjalan 100% di perangkat pengguna; dan (3) modul opsional analisis foto untuk "
        "memperkirakan proporsi tubuh secara eksperimental dan transparan."))

    # ---- Metode ----
    story.append(P("Metode", "h1"))
    story.append(P("1. Dataset dan Praproses", "h2"))
    story.append(P(
        "Kajian menggunakan dataset 25.000 sampel berisi tujuh fitur masukan dan satu label status gizi "
        "dengan empat kelas: <i>Normal, Stunted, Severely Stunted,</i> dan <i>Tinggi</i>. Variabel "
        "kategorikal (jenis kelamin dan gizi ibu) dikodekan dengan <i>Label Encoding</i>. Data dibagi "
        "menjadi 80% latih (20.000) dan 20% uji (5.000) secara acak terstratifikasi. Tujuh fitur masukan "
        "ditunjukkan pada Tabel 1."))
    story.append(Spacer(1,3))
    story.append(table([
        ["No", "Fitur", "Tipe", "Keterangan"],
        ["1", "Umur (bulan)", "Numerik", "0–60 bulan, acuan standar WHO"],
        ["2", "Jenis Kelamin", "Kategorikal", "Laki-laki / Perempuan"],
        ["3", "Tinggi Badan (cm)", "Numerik", "Indikator utama (HAZ)"],
        ["4", "Berat Badan (kg)", "Numerik", "Indikator Weight-for-Age"],
        ["5", "Jarak Kehamilan (bln)", "Numerik", "Ideal >24 bln (BKKBN 4T)"],
        ["6", "Usia Ibu Menikah (thn)", "Numerik", "Dini <20 thn = risiko"],
        ["7", "Gizi Ibu Saat Hamil", "Kategorikal", "Baik / Sedang / Buruk"],
    ], [1.0*cm, 4.2*cm, 2.6*cm, 5.2*cm]))
    story.append(P("Tabel 1. Tujuh faktor masukan model.", "caption"))

    story.append(P("2. Algoritma Random Forest", "h2"))
    story.append(P(
        "Algoritma inti adalah <b>Random Forest Classifier</b> (Breiman, 2001), yaitu <i>ensemble</i> dari "
        "banyak pohon keputusan (<i>decision tree</i>) yang dilatih dengan teknik <i>bootstrap aggregating</i> "
        "(bagging). Setiap pohon dilatih pada subsampel data yang diambil acak dengan pengembalian, dan pada "
        "setiap percabangan hanya sebagian fitur yang dipertimbangkan secara acak. Prediksi akhir diperoleh "
        "dengan merata-ratakan distribusi probabilitas seluruh pohon (<i>soft voting</i>), sehingga "
        "menghasilkan klasifikasi yang akurat dan stabil terhadap <i>overfitting</i>."))
    story.append(P(
        "Random Forest dipilih karena beberapa alasan teknis: (1) tahan terhadap <i>overfitting</i> melalui "
        "rata-rata banyak pohon; (2) menangani campuran fitur numerik dan kategorikal tanpa perlu "
        "penskalaan; (3) menyediakan <i>feature importance</i> sehingga model dapat ditafsirkan (penting "
        "untuk transparansi di ranah kesehatan); dan (4) cepat saat inferensi. Konfigurasi model "
        "ditunjukkan pada Tabel 2."))
    story.append(Spacer(1,3))
    story.append(table([
        ["Parameter", "Nilai", "Parameter", "Nilai"],
        ["Algoritma", "Random Forest", "Jumlah pohon", "120 trees"],
        ["Kedalaman maks.", "14 level", "Jumlah fitur", "7"],
        ["Data latih", "20.000 (80%)", "Data uji", "5.000 (20%)"],
        ["Library", "scikit-learn 1.9", "Voting", "Soft (rata-rata proba)"],
    ], [3.6*cm, 3.7*cm, 3.6*cm, 2.1*cm]))
    story.append(P("Tabel 2. Konfigurasi model Random Forest.", "caption"))
    story.append(P("Kutipan inti pelatihan model (Python, scikit-learn):", "bodync"))
    story.append(code_block(
        "from sklearn.ensemble import RandomForestClassifier\n"
        "rf = RandomForestClassifier(n_estimators=120, max_depth=14,\n"
        "                            random_state=42, n_jobs=-1)\n"
        "rf.fit(X_train, y_train)          # 7 fitur -> 4 kelas status gizi\n"
        "proba = rf.predict_proba(X_test)  # distribusi probabilitas tiap kelas"))

    story.append(P("3. Rekayasa Perangkat Lunak: dari Streamlit ke Web Statis + ONNX", "h2"))
    story.append(P(
        "Purwarupa awal dibangun dengan <b>Streamlit</b> (Python). Meskipun fungsional, pendekatan ini "
        "memiliki dua kelemahan: tampilan saat demo terbatas, dan—yang paling krusial—Streamlit "
        "membutuhkan <i>server</i> Python sehingga <b>tidak dapat di-deploy pada Cloudflare Pages</b> yang "
        "bersifat statis. Oleh karena itu aplikasi dibangun ulang sebagai web statis modern dengan tetap "
        "mempertahankan model 88,40% yang sama."))
    story.append(P("Langkah-langkah migrasi:", "bodync"))
    story.append(bullets([
        "<b>Konversi model:</b> model <i>.pkl</i> scikit-learn diubah ke <b>ONNX</b> memakai skl2onnx; "
        "kesetaraan hasil (parity) diverifikasi terhadap scikit-learn dengan galat maksimum hanya "
        "3,4×10⁻⁷ dan nol perbedaan kelas pada 3.000 sampel acak.",
        "<b>Frontend baru:</b> React + Vite + TypeScript + Tailwind CSS dengan komponen bergaya shadcn/ui; "
        "empat tab (Deteksi, Tentang, Cara Kerja AI, Etika & Privasi).",
        "<b>Inferensi di peramban:</b> ONNX Runtime Web (WebAssembly) menjalankan model langsung di "
        "perangkat pengguna, dijalankan di dalam <b>Web Worker</b> agar utas utama tidak membeku "
        "(memperbaiki dialog “Page Unresponsive” pada versi sebelumnya). WASM dipaksa "
        "<i>single-thread</i> sehingga tidak memerlukan header COOP/COEP dan tetap mudah di-deploy.",
        "<b>Privasi & luring:</b> seluruh perhitungan terjadi di perangkat; data anak tidak dikirim ke "
        "server, dan aplikasi dapat berjalan luring setelah pemuatan pertama.",
    ]))
    story.append(P("Kutipan inti inferensi di peramban (TypeScript, di dalam Web Worker):", "bodync"))
    story.append(code_block(
        "import * as ort from \"onnxruntime-web/wasm\";\n"
        "const session = await ort.InferenceSession.create(modelUrl);\n"
        "const x = new ort.Tensor(\"float32\", Float32Array.from(fitur7), [1, 7]);\n"
        "const out = await session.run({ input: x });\n"
        "const probabilitas = Array.from(out[\"probabilities\"].data); // 4 kelas"))

    story.append(P("4. Modul Opsional Analisis Foto (Eksperimental)", "h2"))
    story.append(P(
        "Sebagai pengayaan, ditambahkan modul opsional yang memperkirakan <b>proporsi tubuh</b> "
        "(kurus/normal/gemuk) dari foto memakai MediaPipe Pose (33 titik tubuh) beserta <i>segmentation "
        "mask</i>. Karena stunting adalah masalah tinggi-untuk-umur yang tidak dapat diukur dari foto 2D, "
        "sinyal foto <b>tidak</b> dijadikan fitur Random Forest (yang akan memerlukan pelatihan ulang "
        "berdata-foto). Sebaliknya, digunakan <i>late-fusion</i> yang transparan: ketebalan tiap "
        "anggota tubuh diukur dari siluet lalu dinormalisasi terhadap panjang tulang (bersifat "
        "<i>scale-</i> dan <i>pose-invariant</i>), kemudian hanya menggeser probabilitas akhir secara "
        "terbatas (maksimum ±10 poin) dengan menampilkan nilai sebelum→sesudah."))

    # ---- Hasil dan Pembahasan ----
    story.append(PageBreak())
    story.append(P("Hasil dan Pembahasan", "h1"))
    story.append(P("1. Performa Model", "h2"))
    story.append(P(
        "Model dievaluasi pada 5.000 sampel uji. Tabel 3 merangkum metrik yang dicapai. Akurasi 88,40% "
        "melampaui ambang “Excellent” (≥85%) pada rubrik penilaian."))
    story.append(table([
        ["Metrik", "Skor", "Metrik", "Skor"],
        ["Accuracy", "88,40%", "Recall (macro)", "85,93%"],
        ["Precision (macro)", "81,59%", "F1-Score (macro)", "83,56%"],
        ["Cross-Validation (5-fold)", "87,31% ± 0,42%", "Disparitas gender", "1,83%"],
    ], [4.3*cm, 3.0*cm, 4.0*cm, 1.7*cm]))
    story.append(P("Tabel 3. Ringkasan performa model pada data uji.", "caption"))

    story.append(P("2. Matriks Konfusi dan Kepentingan Fitur", "h2"))
    story.append(P(
        "Gambar 1 menampilkan matriks konfusi; kesalahan klasifikasi sebagian besar terjadi antar kelas "
        "bertetangga (mis. <i>Stunted</i> vs <i>Severely Stunted</i>), yang wajar karena batasnya kontinu. "
        "Gambar 2 menunjukkan bahwa <b>tinggi badan (50,6%)</b> dan <b>umur (28,7%)</b> mendominasi "
        "kepentingan fitur — konsisten dengan definisi HAZ — sementara faktor maternal berkontribusi lebih "
        "kecil namun tetap bermakna untuk konteks risiko."))
    cm_img, fi_img = os.path.join(base_dir,"confusion_matrix.png"), os.path.join(base_dir,"feature_importance.png")
    two = Table([[img(cm_img, 7.0, 6.0), img(fi_img, 7.4, 6.0)]], colWidths=[7.6*cm, 7.6*cm])
    two.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("ALIGN",(0,0),(-1,-1),"CENTER")]))
    story.append(two)
    story.append(P("Gambar 1 (kiri). Matriks konfusi. &nbsp;&nbsp; Gambar 2 (kanan). Feature importance 7 faktor.", "caption"))
    story.append(img(os.path.join(base_dir,"eda_distribusi.png"), 15.0, 7.5))
    story.append(P("Gambar 3. Eksplorasi distribusi data (EDA).", "caption"))

    story.append(P("3. Keadilan (Fairness) dan Etika", "h2"))
    story.append(P(
        "Audit keadilan antar gender menghasilkan disparitas akurasi 1,83% (laki-laki 89,30% vs perempuan "
        "87,46%) — di bawah ambang industri 5%. Aplikasi juga menampilkan <i>confidence score</i>, "
        "probabilitas tiap kelas, Z-Score WHO, dan catatan faktor risiko, sehingga bersifat transparan dan "
        "tidak menjadi “kotak hitam”. Disclaimer medis ditampilkan jelas: hasil merupakan skrining "
        "awal, bukan diagnosis."))

    story.append(P("4. Hasil Rebuild dan Inferensi di Peramban", "h2"))
    story.append(P(
        "Migrasi berhasil mempertahankan akurasi identik sekaligus memperbaiki keterbatasan deployment. "
        "Tabel 4 merangkum karakteristik aplikasi hasil rebuild."))
    story.append(table([
        ["Aspek", "Hasil"],
        ["Akurasi vs scikit-learn (ONNX)", "Identik (galat maks. 3,4×10⁻⁷)"],
        ["Transfer pertama (gzip)", "± 5 MB (model + runtime), di-cache setelahnya"],
        ["Waktu inferensi", "Mikrodetik; berjalan di Web Worker (UI tidak membeku)"],
        ["Privasi", "100% di perangkat; data tidak dikirim ke server"],
        ["Deployment", "Cloudflare Pages (statis, gratis); dapat luring"],
    ], [6.0*cm, 9.0*cm]))
    story.append(P("Tabel 4. Karakteristik aplikasi hasil rebuild.", "caption"))
    story.append(P(
        "Modul analisis foto diuji unit pada tubuh sintetis kurus/normal/gemuk dan terbukti membedakan "
        "ketiganya secara monoton serta tak bergantung posisi (berdiri, duduk, berbaring). Temuan ini "
        "menegaskan kelayakan pendekatan <i>late-fusion</i> yang jujur, sekaligus mengakui keterbatasannya "
        "(foto 2D tidak mengukur tinggi absolut)."))

    # ---- Kesimpulan ----
    story.append(P("Kesimpulan", "h1"))
    story.append(P(
        "Kajian ini berhasil membangun StuntCare AI, aplikasi deteksi dini risiko stunting multi-faktor "
        "berbasis Random Forest dengan akurasi 88,40% (kategori Excellent), F1-score makro 83,56%, dan "
        "disparitas gender 1,83%. Inovasi utama adalah menjalankan model asli sepenuhnya di peramban "
        "pengguna melalui konversi ke ONNX, sehingga aplikasi gratis, cepat, dapat luring, dan menjaga "
        "privasi data anak—mengatasi keterbatasan purwarupa Streamlit yang memerlukan server. Secara umum, "
        "pendekatan ini layak diterapkan sebagai alat skrining awal yang akurat, transparan, dan mudah "
        "diakses untuk mendukung penurunan prevalensi stunting (SDG #3). Pengembangan lanjutan mencakup "
        "validasi klinis modul foto dan kalibrasi ambang proporsi tubuh dengan data berlabel nyata."))

    # ---- Ucapan terima kasih ----
    story.append(P("Ucapan Terima Kasih", "h1"))
    story.append(P(
        "Penulis mengucapkan terima kasih kepada dosen pengampu mata kuliah Artificial Intelligence "
        "(COMP6065001) dan BINUS University atas bimbingan dan dukungan dalam penyusunan proyek ini."))

    # ---- Kontribusi penulis ----
    story.append(P("Kontribusi Penulis", "h1"))
    story.append(P(
        "Proyek ini dikerjakan secara individu oleh <b>Daniel Steffen K (NIM 2602071171)</b>, yang "
        "bertanggung jawab penuh atas keseluruhan tahap: perumusan masalah dan studi literatur, penyiapan "
        "dataset, pelatihan dan evaluasi model Random Forest, pengembangan purwarupa Streamlit, "
        "pembangunan ulang aplikasi web (React + Vite + ONNX Runtime Web), pengembangan modul analisis "
        "foto, deployment, serta penulisan laporan dan bahan presentasi."))

    # ---- Daftar pustaka ----
    story.append(P("Daftar Pustaka", "h1"))
    refs = [
        "Breiman, L. 2001. Random Forests. Machine Learning, 45(1): 5–32.",
        "World Health Organization. 2006. WHO Child Growth Standards: Length/height-for-age, weight-for-age. "
        "Geneva: WHO.",
        "Apriluana, G. dan Fikawati, S. 2018. Analisis Faktor-Faktor Risiko terhadap Kejadian Stunting pada "
        "Balita. Media Litbangkes, 28(4): 247–256.",
        "Kementerian Kesehatan RI. 2024. Survei Status Gizi Indonesia (SSGI) 2024. Jakarta: Badan Kebijakan "
        "Pembangunan Kesehatan, Kemenkes RI.",
        "Badan Kependudukan dan Keluarga Berencana Nasional (BKKBN). 2017. Program “4 Terlalu” dalam "
        "Pencegahan Risiko Kehamilan dan Stunting. Jakarta: BKKBN.",
        "Bazarevsky, V., Grishchenko, I., Raveendran, K., dkk. 2020. BlazePose: On-device Real-time Body Pose "
        "Tracking. arXiv:2006.10204.",
        "ONNX Runtime Developers. 2024. ONNX Runtime Web: Run ONNX models in the browser. URL: "
        "https://onnxruntime.ai/docs/tutorials/web/ (diakses 2026).",
    ]
    for i, r in enumerate(refs, 1):
        story.append(Paragraph(f"[{i}] {r}", S["ref"]))

    doc = BaseDocTemplate(out_path, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
                          topMargin=1.9*cm, bottomMargin=1.7*cm,
                          title="Laporan PKM StuntCare AI", author="Daniel Steffen K")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="t", frames=[frame], onPage=header_footer)])
    doc.build(story)
    print("Report written:", out_path)

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    build(os.path.join(base, "Laporan_PKM_StuntCare_AI.pdf"), base)
