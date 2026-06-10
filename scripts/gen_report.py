# -*- coding: utf-8 -*-
"""Generate the PKM-AI format report PDF for StuntCare AI (revisi pasca-dosen)."""
import os, json
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Image, Table,
    TableStyle, PageBreak, Preformatted,
)
from PIL import Image as PImage

GREEN = colors.HexColor("#039855"); DARK = colors.HexColor("#05312A")
LIGHT = colors.HexColor("#EAF7F0"); GREY = colors.HexColor("#4B5563")
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
M = json.load(open(os.path.join(BASE, "real_metrics.json")))

S = {
    "title": ParagraphStyle("title", fontName="Times-Bold", fontSize=15, leading=19,
                            alignment=TA_CENTER, textColor=DARK, spaceAfter=8),
    "author": ParagraphStyle("author", fontName="Times-Roman", fontSize=11, alignment=TA_CENTER, spaceAfter=2),
    "small": ParagraphStyle("small", fontName="Times-Italic", fontSize=10, alignment=TA_CENTER, textColor=GREY, spaceAfter=2),
    "h1": ParagraphStyle("h1", fontName="Times-Bold", fontSize=12.5, leading=16, textColor=GREEN, spaceBefore=12, spaceAfter=5),
    "h2": ParagraphStyle("h2", fontName="Times-Bold", fontSize=11.5, leading=15, textColor=DARK, spaceBefore=7, spaceAfter=3),
    "body": ParagraphStyle("body", fontName="Times-Roman", fontSize=11.5, leading=15, alignment=TA_JUSTIFY, spaceAfter=6, firstLineIndent=18),
    "bodync": ParagraphStyle("bodync", fontName="Times-Roman", fontSize=11.5, leading=15, alignment=TA_JUSTIFY, spaceAfter=6),
    "abstract": ParagraphStyle("abstract", fontName="Times-Roman", fontSize=10.5, leading=14, alignment=TA_JUSTIFY, spaceAfter=6),
    "formula": ParagraphStyle("formula", fontName="Times-Italic", fontSize=11, leading=16, alignment=TA_CENTER, spaceAfter=6, textColor=DARK),
    "caption": ParagraphStyle("caption", fontName="Times-Italic", fontSize=9.5, alignment=TA_CENTER, textColor=GREY, spaceAfter=8, spaceBefore=2),
    "code": ParagraphStyle("code", fontName="Courier", fontSize=7.8, leading=9.6, textColor=colors.HexColor("#0B2C22")),
    "ref": ParagraphStyle("ref", fontName="Times-Roman", fontSize=10.5, leading=13.5, alignment=TA_JUSTIFY, leftIndent=18, firstLineIndent=-18, spaceAfter=4),
}

def P(t, s="body"): return Paragraph(t, S[s])

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(GREEN); canvas.setLineWidth(1.4)
    canvas.line(2*cm, A4[1]-1.55*cm, A4[0]-2*cm, A4[1]-1.55*cm)
    canvas.setFont("Times-Italic", 8); canvas.setFillColor(GREY)
    canvas.drawString(2*cm, A4[1]-1.42*cm, "StuntCare AI — Deteksi Dini Risiko Stunting Balita Berbasis Random Forest")
    canvas.setStrokeColor(colors.HexColor("#D1D5DB")); canvas.setLineWidth(0.5)
    canvas.line(2*cm, 1.4*cm, A4[0]-2*cm, 1.4*cm)
    canvas.setFont("Times-Roman", 9); canvas.setFillColor(GREY)
    canvas.drawString(2*cm, 1.0*cm, "Daniel Steffen K · NIM 2602071171 · COMP6065001 · BINUS University")
    canvas.drawRightString(A4[0]-2*cm, 1.0*cm, "Hal. %d" % doc.page)
    canvas.restoreState()

def code_block(text):
    t = Table([[Preformatted(text, S["code"])]], colWidths=[A4[0]-4*cm])
    t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),LIGHT),("BOX",(0,0),(-1,-1),0.6,GREEN),
        ("LEFTPADDING",(0,0),(-1,-1),7),("RIGHTPADDING",(0,0),(-1,-1),7),
        ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)]))
    return t

def table(data, col_widths, head=True):
    t = Table(data, colWidths=col_widths, repeatRows=1 if head else 0)
    st=[("FONTNAME",(0,0),(-1,-1),"Times-Roman"),("FONTSIZE",(0,0),(-1,-1),9.6),
        ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#CBD5C9")),
        ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4),
        ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
        ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, colors.HexColor("#F4FBF7")])]
    if head: st+=[("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Times-Bold")]
    t.setStyle(TableStyle(st)); return t

def img(path, max_w=15.0, max_h=8.5):
    iw, ih = PImage.open(os.path.join(BASE, path)).size
    w = max_w*cm; h = w*ih/iw
    if h > max_h*cm: h = max_h*cm; w = h*iw/ih
    return Image(os.path.join(BASE, path), width=w, height=h)

def two_img(a, b, w=7.4, h=6.0):
    t = Table([[img(a, w, h), img(b, w, h)]], colWidths=[(w+0.2)*cm, (w+0.2)*cm])
    t.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("ALIGN",(0,0),(-1,-1),"CENTER")]))
    return t

def build(out_path):
    story = []
    story.append(P("StuntCare AI: Deteksi Dini Risiko Stunting Balita Berbasis Random Forest "
                   "dengan Validasi Dataset Nyata dan Inferensi di Peramban", "title"))
    story.append(P("Daniel Steffen K<super>1)</super>", "author"))
    story.append(P("<sup>1</sup>Program Studi Computer Science, BINUS University, Jakarta", "small"))
    story.append(P("Penulis korespondensi: daniel.k@binus.ac.id · NIM 2602071171 · Kelas LA05-LEC", "small"))
    story.append(Spacer(1, 8))

    # ---------- Abstrak ----------
    story.append(P("ABSTRAK", "h2"))
    story.append(P(
        "Stunting masih menjadi masalah gizi kronis utama di Indonesia dengan prevalensi 21,5% "
        "(SKI/SSGI 2023) — sekitar satu dari lima balita — dan masih jauh dari target nasional 14% "
        "(Perpres 72/2021). Kajian ini membangun aplikasi deteksi dini risiko stunting menggunakan "
        "algoritma <b>Random Forest</b>. Model divalidasi pada <b>dataset stunting balita nyata "
        "Indonesia</b> sebanyak 55.367 sampel (berbasis WHO Child Growth Standards) dan mencapai "
        f"akurasi {M['accuracy']}%, F1-score makro {M['f1_macro']}%, serta validasi silang "
        f"{M['cv_mean']}% ± {M['cv_std']}%, mengungguli Decision Tree, KNN, Regresi Logistik, dan "
        "Naive Bayes pada benchmark. Sebagai pengembangan, dibangun pula prototipe multi-faktor "
        "(7 faktor anak dan maternal) untuk mengintegrasikan faktor risiko dari literatur. Model "
        "dikemas menjadi aplikasi web yang menjalankan inferensi 100% di peramban pengguna (ONNX "
        "Runtime Web), sehingga gratis, cepat, dapat luring, dan menjaga privasi. Disimpulkan bahwa "
        "pendekatan ini layak dan akurat sebagai alat skrining awal untuk mendukung SDG #3.",
        "abstract"))
    story.append(P("<b>Kata kunci:</b> stunting, Random Forest, dataset nyata, WHO Child Growth "
                   "Standards, inferensi di peramban, SDG #3.", "abstract"))

    story.append(P("ABSTRACT", "h2"))
    story.append(P(
        "Stunting remains a major chronic malnutrition problem in Indonesia (21.5% prevalence, SKI "
        "2023). This work builds an early stunting-risk screening application using a <b>Random "
        f"Forest</b> classifier. The model is validated on a <b>real Indonesian toddler stunting "
        f"dataset</b> of 55,367 samples (WHO-based), reaching {M['accuracy']}% accuracy, "
        f"{M['f1_macro']}% macro F1, and {M['cv_mean']}% ± {M['cv_std']}% cross-validation, "
        "outperforming Decision Tree, KNN, Logistic Regression, and Naive Bayes. A multi-factor "
        "prototype (seven child and maternal factors) extends the approach with literature-based "
        "risk factors. The model runs entirely in the user's browser via ONNX Runtime Web — free, "
        "fast, offline-capable, and privacy-preserving — supporting SDG #3.",
        "abstract"))
    story.append(P("<b>Keywords:</b> stunting, Random Forest, real dataset, WHO Child Growth "
                   "Standards, in-browser inference, SDG #3.", "abstract"))

    # ---------- Pendahuluan ----------
    story.append(P("Pendahuluan", "h1"))
    story.append(P(
        "Stunting adalah gangguan pertumbuhan akibat kekurangan gizi kronis yang ditandai tinggi "
        "badan menurut umur (Height-for-Age Z-Score/HAZ) di bawah −2 SD menurut WHO Child Growth "
        "Standards (2006). Berdasarkan Survei Kesehatan Indonesia (SKI/SSGI) 2023, prevalensi "
        "stunting nasional sebesar <b>21,5%</b> — turun tipis dari 21,6% (2022) namun masih jauh di "
        "atas <b>target nasional 14%</b> pada 2024 (Perpres No. 72 Tahun 2021) dan ambang WHO 20%. "
        "Riskesdas 2018 bahkan mencatat 30,8%. Artinya sekitar <b>satu dari lima balita</b> "
        "Indonesia (jutaan anak) masih berisiko."))
    story.append(P("<b>Kebutuhan nyata.</b> Dampak stunting bersifat permanen dan lintas generasi: "
        "gangguan perkembangan kognitif (penurunan IQ), daya tahan tubuh lemah, prestasi belajar "
        "rendah, hingga menurunnya produktivitas dan pendapatan saat dewasa (diperkirakan 10–20% "
        "lebih rendah). Bank Dunia dan Bappenas memperkirakan kerugian ekonomi akibat stunting "
        "mencapai <b>2–3% PDB per tahun</b>. Karena periode kritis hanya pada <b>1000 Hari Pertama "
        "Kehidupan</b>, keterlambatan deteksi sangat merugikan."))
    story.append(P("<b>Kesenjangan yang nyata.</b> Skrining di lapangan umumnya masih manual di "
        "posyandu, menilai satu indikator, dan rentan kekurangan tenaga gizi—terutama di daerah "
        "tertinggal, terdepan, dan terluar (3T) dengan akses internet terbatas. Belum tersedia alat "
        "bantu yang murah, cepat, dapat dipakai luring, dan menjaga privasi. <b>Kebutuhan akan alat "
        "skrining dini yang akurat, gratis, dan mudah diakses sangat nyata namun belum terpenuhi.</b>"))
    story.append(P("<b>Pengaplikasian nyata.</b> Sistem ini ditujukan untuk: (1) orang tua balita — "
        "skrining mandiri di rumah, bahkan tanpa internet; (2) kader posyandu — skrining cepat dan "
        "prioritas rujukan; (3) puskesmas/dinas kesehatan — deteksi dini dan penentuan sasaran "
        "intervensi. Fokus kajian adalah membangun model Random Forest yang divalidasi pada data "
        "nyata Indonesia, lalu menjadikannya aplikasi web ringan yang berjalan di perangkat pengguna."))

    # ---------- Metode ----------
    story.append(P("Metode", "h1"))
    story.append(P("1. Sumber Data dan Dataset", "h2"))
    story.append(P(
        "Digunakan dua sumber data. <b>(a) Dataset nyata</b> — \"Stunting Toddler (Balita) Detection\" "
        "berbasis kondisi anak Indonesia dan WHO Child Growth Standards, sebanyak "
        "<b>55.367 sampel</b> dengan fitur Umur (bulan), Jenis Kelamin, dan Tinggi Badan "
        "(cm) serta label Status Gizi empat kelas. Dataset ini dipakai untuk <b>melatih dan "
        "memvalidasi</b> model inti pada kondisi data riil. <b>(b) Dataset multi-faktor</b> — disusun "
        "mengacu WHO 2006 dan literatur (SSGI, BKKBN) untuk prototipe 7 faktor (menambah berat badan "
        "dan faktor maternal: jarak kehamilan, usia ibu menikah, gizi ibu saat hamil) karena faktor "
        "maternal belum tersedia pada dataset publik. Kedua sumber dinyatakan terbuka demi "
        "transparansi."))
    story.append(Spacer(1,2))
    story.append(table([
        ["Aspek", "Dataset Nyata (validasi)", "Dataset Multi-Faktor (prototipe)"],
        ["Jumlah", "55.367 sampel", "25.000 sampel"],
        ["Fitur", "3 (umur, kelamin, tinggi)", "7 (anak + maternal)"],
        ["Kelas", "Normal, Stunted, Sev. Stunted, Tinggi", "sama (4 kelas)"],
        ["Sumber", "Kaggle/GitHub, basis WHO", "WHO 2006 + literatur"],
    ], [2.6*cm, 6.0*cm, 6.4*cm]))
    story.append(P("Tabel 1. Dua sumber data yang digunakan.", "caption"))

    story.append(P("2. Algoritma Random Forest — Penjelasan Matematis", "h2"))
    story.append(P(
        "Random Forest (Breiman, 2001) adalah <i>ensemble</i> dari T pohon keputusan yang dilatih "
        "dengan <i>bootstrap aggregating</i> (bagging). Tiap pohon ke-t dilatih pada sampel "
        "<i>bootstrap</i> D<sub>t</sub> (penarikan acak dengan pengembalian dari data latih), dan "
        "pada setiap simpul hanya dipertimbangkan subset acak m fitur (umumnya m = √p, dengan p "
        "jumlah fitur). Pemilihan split memaksimalkan penurunan ketidakmurnian (impurity)."))
    story.append(P("Ketidakmurnian Gini pada simpul t (C kelas, p<sub>i</sub> proporsi kelas i):", "bodync"))
    story.append(P("Gini(t) = 1 − Σ<sub>i=1..C</sub> p<sub>i</sub><super>2</super>", "formula"))
    story.append(P("Penurunan ketidakmurnian saat simpul dipecah menjadi anak kiri (L) dan kanan (R):", "bodync"))
    story.append(P("ΔI = Gini(t) − (N<sub>L</sub>/N<sub>t</sub>)·Gini(L) − (N<sub>R</sub>/N<sub>t</sub>)·Gini(R)", "formula"))
    story.append(P("Prediksi akhir memakai rata-rata probabilitas seluruh pohon (<i>soft voting</i>); "
        "P<sub>t</sub>(c|x) adalah proporsi kelas c pada daun yang dicapai x di pohon t:", "bodync"))
    story.append(P("P(c|x) = (1/T) Σ<sub>t=1..T</sub> P<sub>t</sub>(c|x) &nbsp;;&nbsp; "
                   "ŷ = arg max<sub>c</sub> P(c|x)", "formula"))
    story.append(P("Kepentingan fitur (<i>Mean Decrease in Impurity</i>) — total penurunan impurity "
        "yang disumbang fitur f di seluruh simpul dan pohon, lalu dinormalkan:", "bodync"))
    story.append(P("Imp(f) = (1/T) Σ<sub>t</sub> Σ<sub>v∈t: split(v)=f</sub> (N<sub>v</sub>/N)·ΔI<sub>v</sub>", "formula"))
    story.append(P("Random Forest dipilih karena tahan <i>overfitting</i> (rata-rata banyak pohon), "
        "menangani fitur numerik dan kategorikal tanpa penskalaan, cepat saat inferensi, dan "
        "memberikan kepentingan fitur sehingga model dapat ditafsirkan (penting di ranah kesehatan)."))

    story.append(P("3. Z-Score WHO (HAZ) dan Metrik Evaluasi", "h2"))
    story.append(P("Status gizi mengacu Z-score tinggi-untuk-umur; X tinggi anak, M median WHO, S "
                   "standar deviasi untuk usia dan jenis kelamin yang sama:", "bodync"))
    story.append(P("HAZ = (X − M) / S &nbsp;→&nbsp; HAZ < −3: Severely Stunted; −3..−2: Stunted; "
                   "−2..+2: Normal; > +2: Tinggi", "formula"))
    story.append(P("Kinerja diukur dengan (TP/TN/FP/FN per kelas):", "bodync"))
    story.append(P("Akurasi = (TP+TN)/Total ; Precision = TP/(TP+FP) ; Recall = TP/(TP+FN) ; "
                   "F1 = 2·P·R/(P+R)", "formula"))
    story.append(P("Nilai <i>macro</i> adalah rata-rata metrik antar kelas (memberi bobot sama pada "
                   "tiap kelas), dan validasi silang 5-fold menguji kestabilan model.", "bodync"))

    story.append(P("4. Tahapan Pembuatan & Pelatihan (Step-by-step)", "h2"))
    story.append(P("Proses pelatihan model dilakukan berurutan sebagai berikut:", "bodync"))
    story.append(P(
        "1) <b>Pengumpulan data</b> (dataset nyata 55.367 + dataset multi-faktor 25.000). "
        "2) <b>Pembersihan</b> & penyeragaman label menjadi 4 kelas. "
        "3) <b>Encoding</b> variabel kategorikal dengan <i>Label Encoding</i> (lihat Tabel 2). "
        "4) <b>Pembagian data</b> 80% latih : 20% uji secara <i>stratified</i>. "
        "5) <b>Inisialisasi</b> Random Forest (Tabel 3). "
        "6) <b>Pelatihan</b>: tiap pohon dibangun dari sampel bootstrap dengan subset fitur acak, "
        "tumbuh hingga batas kedalaman/sampel daun. "
        "7) <b>Validasi silang</b> 5-fold pada data latih. "
        "8) <b>Evaluasi</b> pada data uji (akurasi, precision, recall, F1, confusion matrix). "
        "9) <b>Analisis kepentingan fitur</b>. "
        "10) <b>Konversi</b> model ke format <b>ONNX</b> agar dapat berjalan di peramban. "
        "11) <b>Integrasi</b> ke aplikasi web React (inferensi di Web Worker).", "bodync"))
    story.append(Spacer(1,2))
    story.append(table([
        ["Variabel", "Pemetaan Label Encoding"],
        ["Jenis Kelamin", "laki-laki → 0 ; perempuan → 1"],
        ["Gizi Ibu (prototipe)", "Baik → 0 ; Buruk → 1 ; Sedang → 2"],
        ["Status Gizi (label)", "Normal → 0 ; Severely Stunted → 1 ; Stunted → 2 ; Tinggi → 3"],
    ], [4.0*cm, 11.0*cm]))
    story.append(P("Tabel 2. Encoding variabel kategorikal.", "caption"))
    story.append(table([
        ["Parameter", "Nilai", "Parameter", "Nilai"],
        ["n_estimators", "120 pohon", "max_features", "sqrt"],
        ["max_depth", "14", "class_weight", "balanced"],
        ["min_samples_leaf", "6", "min_samples_split", "12"],
        ["random_state", "42", "library", "scikit-learn"],
    ], [3.6*cm, 3.6*cm, 3.6*cm, 2.2*cm]))
    story.append(P("Tabel 3. Hiperparameter Random Forest.", "caption"))
    story.append(P("Kutipan inti kode pelatihan (Python, scikit-learn):", "bodync"))
    story.append(code_block(
        "from sklearn.ensemble import RandomForestClassifier\n"
        "rf = RandomForestClassifier(n_estimators=120, max_depth=14,\n"
        "        min_samples_leaf=6, min_samples_split=12, max_features='sqrt',\n"
        "        class_weight='balanced', random_state=42, n_jobs=-1)\n"
        "rf.fit(X_train, y_train)            # bagging 120 pohon\n"
        "proba = rf.predict_proba(X_test)    # soft voting -> probabilitas"))

    story.append(P("5. Rekayasa Aplikasi Web (Inferensi di Peramban)", "h2"))
    story.append(P(
        "Model `.pkl` dikonversi ke <b>ONNX</b> (skl2onnx; kesetaraan hasil terverifikasi dengan "
        "galat maksimum 3,4×10⁻⁷). Aplikasi dibangun dengan <b>React + Vite + TypeScript + Tailwind "
        "CSS</b>; inferensi dijalankan oleh <b>ONNX Runtime Web (WebAssembly)</b> di dalam "
        "<b>Web Worker</b> agar antarmuka tidak membeku. Seluruh perhitungan terjadi di perangkat "
        "pengguna sehingga aplikasi gratis, cepat, dapat luring, dan data tidak dikirim ke server. "
        "Ditambahkan pula asisten edukasi tanya-jawab tentang pencegahan stunting."))

    # ---------- Hasil ----------
    story.append(PageBreak())
    story.append(P("Hasil dan Pembahasan", "h1"))
    story.append(P("1. Validasi pada Dataset Nyata Indonesia", "h2"))
    story.append(P(
        "Model dilatih pada 44.293 sampel dan diuji pada 11.074 sampel data "
        f"nyata. Random Forest mencapai <b>akurasi {M['accuracy']}%</b>, precision makro "
        f"{M['precision_macro']}%, recall makro {M['recall_macro']}%, F1-score makro "
        f"{M['f1_macro']}%, dan validasi silang 5-fold {M['cv_mean']}% ± {M['cv_std']}%. Distribusi "
        "kelas dataset relatif seimbang (Gambar 1), sehingga metrik tidak bias."))
    story.append(img("real_class_distribution.png", 13.5, 6.2))
    story.append(P("Gambar 1. Distribusi kelas pada dataset nyata (55.367 sampel).", "caption"))
    story.append(two_img("real_confusion_matrix.png", "real_feature_importance.png", 7.3, 6.0))
    story.append(P("Gambar 2 (kiri). Confusion matrix model pada data uji nyata. "
                   "Gambar 3 (kanan). Kepentingan fitur (data nyata).", "caption"))
    story.append(P(
        "Confusion matrix (Gambar 2) menunjukkan kesalahan klasifikasi sangat kecil dan hanya "
        "terjadi pada batas antar kelas bertetangga. Kepentingan fitur (Gambar 3) menempatkan "
        "<b>tinggi badan</b> dan <b>umur</b> sebagai faktor dominan — konsisten dengan definisi HAZ. "
        "Metrik per kelas saat pengujian disajikan pada Gambar 4."))
    story.append(img("real_per_class_metrics.png", 13.5, 6.0))
    story.append(P("Gambar 4. Precision, recall, dan F1-score per kelas saat pengujian alat.", "caption"))

    story.append(P("2. Benchmarking Algoritma", "h2"))
    b = M["benchmark"]
    story.append(table([
        ["Algoritma", "Akurasi (%)", "F1-Score Makro (%)"],
        ["Random Forest", f"{b['Random Forest']['acc']}", f"{b['Random Forest']['f1']}"],
        ["K-Nearest Neighbors", f"{b['KNN (k=7)']['acc']}", f"{b['KNN (k=7)']['f1']}"],
        ["Decision Tree", f"{b['Decision Tree']['acc']}", f"{b['Decision Tree']['f1']}"],
        ["Regresi Logistik", f"{b['Logistic Reg.']['acc']}", f"{b['Logistic Reg.']['f1']}"],
        ["Naive Bayes", f"{b['Naive Bayes']['acc']}", f"{b['Naive Bayes']['f1']}"],
    ], [6.0*cm, 4.5*cm, 4.5*cm]))
    story.append(P("Tabel 4. Perbandingan algoritma pada dataset nyata.", "caption"))
    story.append(img("real_benchmark.png", 13.5, 6.5))
    story.append(P("Gambar 5. Benchmarking algoritma — Random Forest unggul.", "caption"))
    story.append(P(
        "Random Forest mengungguli seluruh pembanding, mengonfirmasi pemilihan algoritma. Decision "
        "Tree dan KNN mendekati namun lebih rendah; Regresi Logistik (model linier) tidak mampu "
        "menangkap batas keputusan non-linier WHO; Naive Bayes terburuk karena asumsi independensi "
        "antar fitur tidak terpenuhi."))

    story.append(P("3. Prototipe Multi-Faktor (7 Faktor)", "h2"))
    story.append(P(
        "Sebagai pengembangan, model 7 faktor (menambah berat badan dan faktor maternal) mencapai "
        "akurasi 88,40%, F1 makro 83,56%, dan cross-validation 87,31% ± 0,42%. Akurasinya lebih "
        "rendah dari model inti karena memasukkan faktor risiko maternal yang menambah keragaman; "
        "model ini menjadi dasar fitur interaktif aplikasi. Confusion matrix dan kepentingan fiturnya "
        "ditunjukkan pada Gambar 6."))
    story.append(two_img("confusion_matrix.png", "feature_importance.png", 7.3, 5.8))
    story.append(P("Gambar 6. Prototipe 7-faktor: confusion matrix (kiri) & feature importance (kanan).", "caption"))
    story.append(P(
        "Seluruh model dijalankan di peramban via ONNX (kesetaraan hasil galat < 1×10⁻⁶), waktu "
        "inferensi mikrodetik, tanpa server, dan data tidak meninggalkan perangkat — mendukung "
        "privasi sekaligus aksesibilitas."))

    # ---------- Kesimpulan ----------
    story.append(P("Kesimpulan", "h1"))
    story.append(P(
        f"Kajian ini membangun StuntCare AI berbasis Random Forest yang divalidasi pada <b>dataset "
        f"stunting balita nyata Indonesia</b> (55.367 sampel) dengan akurasi {M['accuracy']}% dan "
        "mengungguli algoritma pembanding, membuktikan pendekatan bekerja pada kondisi data riil. "
        "Model dijalankan sepenuhnya di peramban melalui konversi ONNX sehingga gratis, cepat, dapat "
        "luring, dan menjaga privasi. Dengan kebutuhan nyata yang mendesak (prevalensi 21,5%, target "
        "14%, kerugian ekonomi 2–3% PDB) serta keterbatasan akses skrining, aplikasi ini layak "
        "sebagai alat skrining awal yang akurat dan mudah diakses untuk mendukung SDG #3. "
        "Pengembangan lanjutan: melengkapi data faktor maternal nyata dan validasi klinis lapangan."))

    story.append(P("Ucapan Terima Kasih", "h1"))
    story.append(P("Penulis berterima kasih kepada dosen pengampu mata kuliah Artificial Intelligence "
                   "(COMP6065001) dan BINUS University atas bimbingan dalam penyusunan proyek ini, "
                   "serta kepada penyedia dataset publik yang menjadi dasar validasi."))

    story.append(P("Kontribusi Penulis", "h1"))
    story.append(P("Proyek dikerjakan secara individu oleh <b>Daniel Steffen K (NIM 2602071171)</b>: "
        "perumusan masalah dan studi literatur, pengumpulan & validasi dataset nyata, pelatihan dan "
        "evaluasi model Random Forest, benchmarking, pembangunan aplikasi web (React + ONNX Runtime "
        "Web), serta penulisan laporan dan bahan presentasi."))

    story.append(P("Daftar Pustaka", "h1"))
    refs = [
        "Breiman, L. 2001. Random Forests. Machine Learning, 45(1): 5–32.",
        "World Health Organization. 2006. WHO Child Growth Standards: Length/height-for-age. Geneva: WHO.",
        "Kementerian Kesehatan RI. 2023. Survei Kesehatan Indonesia (SKI) 2023: Hasil Status Gizi "
        "Balita. Jakarta: Badan Kebijakan Pembangunan Kesehatan.",
        "Kementerian Kesehatan RI. 2018. Riset Kesehatan Dasar (Riskesdas) 2018. Jakarta: Balitbangkes.",
        "Pemerintah Republik Indonesia. 2021. Peraturan Presiden No. 72 Tahun 2021 tentang Percepatan "
        "Penurunan Stunting. Jakarta.",
        "Apriluana, G. dan Fikawati, S. 2018. Analisis Faktor Risiko terhadap Kejadian Stunting pada "
        "Balita. Media Litbangkes, 28(4): 247–256.",
        "World Bank. 2018. Tackling Indonesia's Stunting: Investing in the Early Years. Jakarta: World Bank.",
        "Rendi Putra. 2023. Stunting Toddler (Balita) Detection Dataset. Kaggle. URL: "
        "https://www.kaggle.com/datasets/rendiputra/stunting-balita-detection-121k-rows (diakses 2026).",
        "ONNX Runtime Developers. 2024. ONNX Runtime Web. URL: https://onnxruntime.ai/ (diakses 2026).",
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
    build(os.path.join(BASE, "Laporan_PKM_StuntCare_AI.pdf"))
