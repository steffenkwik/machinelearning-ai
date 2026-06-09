# -*- coding: utf-8 -*-
"""Instruction manual PDF + Member Contribution Statement PDF."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_CENTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    Preformatted, ListFlowable, ListItem,
)

GREEN = colors.HexColor("#039855"); DARK = colors.HexColor("#05312A")
LIGHT = colors.HexColor("#EAF7F0"); GREY = colors.HexColor("#4B5563")

ST = {
    "title": ParagraphStyle("t", fontName="Helvetica-Bold", fontSize=17, leading=21,
                            alignment=TA_CENTER, textColor=DARK, spaceAfter=3),
    "sub": ParagraphStyle("s", fontName="Helvetica", fontSize=10.5, alignment=TA_CENTER,
                          textColor=GREY, spaceAfter=12),
    "h1": ParagraphStyle("h1", fontName="Helvetica-Bold", fontSize=12.5, textColor=GREEN,
                         spaceBefore=11, spaceAfter=5),
    "body": ParagraphStyle("b", fontName="Helvetica", fontSize=10.5, leading=15,
                           alignment=TA_JUSTIFY, spaceAfter=5),
    "code": ParagraphStyle("c", fontName="Courier", fontSize=8.6, leading=11,
                           textColor=colors.HexColor("#0B2C22")),
    "cap": ParagraphStyle("cap", fontName="Helvetica-Oblique", fontSize=9, textColor=GREY,
                          alignment=TA_CENTER, spaceAfter=8),
}

def banner(canvas, doc, subtitle):
    canvas.saveState()
    canvas.setFillColor(DARK); canvas.rect(0, A4[1]-1.15*cm, A4[0], 1.15*cm, fill=1, stroke=0)
    canvas.setFillColor(colors.HexColor("#6CE9A6"))
    canvas.setFont("Helvetica-Bold", 9.5)
    canvas.drawString(2*cm, A4[1]-0.75*cm, "StuntCare AI")
    canvas.setFillColor(colors.white); canvas.setFont("Helvetica", 8.5)
    canvas.drawRightString(A4[0]-2*cm, A4[1]-0.75*cm, subtitle)
    canvas.setStrokeColor(colors.HexColor("#D1D5DB")); canvas.setLineWidth(0.5)
    canvas.line(2*cm, 1.3*cm, A4[0]-2*cm, 1.3*cm)
    canvas.setFont("Helvetica", 8.5); canvas.setFillColor(GREY)
    canvas.drawString(2*cm, 0.95*cm, "Daniel Steffen K · NIM 2602071171 · COMP6065001 · BINUS University")
    canvas.drawRightString(A4[0]-2*cm, 0.95*cm, "Hal. %d" % doc.page)
    canvas.restoreState()

def P(t, s="body"): return Paragraph(t, ST[s])
def bullets(items):
    return ListFlowable([ListItem(Paragraph(i, ST["body"]), leftIndent=14, value="•") for i in items],
                        bulletType="bullet", leftIndent=8, spaceAfter=3)
def code(t):
    p = Preformatted(t, ST["code"])
    tb = Table([[p]], colWidths=[A4[0]-4*cm])
    tb.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),LIGHT),("BOX",(0,0),(-1,-1),0.6,GREEN),
        ("LEFTPADDING",(0,0),(-1,-1),8),("TOPPADDING",(0,0),(-1,-1),6),("BOTTOMPADDING",(0,0),(-1,-1),6)]))
    return tb
def tbl(data, widths, head=True):
    t = Table(data, colWidths=widths, repeatRows=1)
    s=[("FONTNAME",(0,0),(-1,-1),"Helvetica"),("FONTSIZE",(0,0),(-1,-1),9.4),
       ("VALIGN",(0,0),(-1,-1),"MIDDLE"),("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#CBD5C9")),
       ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5),
       ("LEFTPADDING",(0,0),(-1,-1),6),("RIGHTPADDING",(0,0),(-1,-1),6),
       ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, colors.HexColor("#F4FBF7")])]
    if head: s+=[("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),colors.white),
                 ("FONTNAME",(0,0),(-1,0),"Helvetica-Bold")]
    t.setStyle(TableStyle(s)); return t

def make_doc(path, subtitle, story, title):
    doc = BaseDocTemplate(path, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm,
                          topMargin=1.6*cm, bottomMargin=1.6*cm, title=title, author="Daniel Steffen K")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="m")
    doc.addPageTemplates([PageTemplate(id="t", frames=[frame],
                          onPage=lambda c,d: banner(c,d,subtitle))])
    doc.build(story)
    print("Written:", path)

def manual(base):
    s=[]
    s.append(Spacer(1,6))
    s.append(P("Petunjuk Instalasi & Penggunaan", "title"))
    s.append(P("StuntCare AI — Aplikasi Web Deteksi Dini Stunting (React + Vite + ONNX Runtime Web)", "sub"))

    s.append(P("1. Tentang Aplikasi", "h1"))
    s.append(P("StuntCare AI adalah aplikasi web statis yang memprediksi risiko stunting balita dari 7 "
        "faktor menggunakan model Random Forest (akurasi 88,40%). Model dijalankan <b>100% di peramban</b> "
        "pengguna melalui ONNX Runtime Web, sehingga gratis, cepat, dapat luring, dan data anak tidak "
        "dikirim ke server. Tersedia pula modul opsional analisis foto (eksperimental) untuk "
        "memperkirakan proporsi tubuh."))

    s.append(P("2. Kebutuhan Sistem (Dependencies)", "h1"))
    s.append(bullets([
        "<b>Node.js</b> versi 18 atau lebih baru (disarankan 20/22) dan <b>npm</b>.",
        "Peramban modern (Chrome, Edge, Firefox, Safari) yang mendukung WebAssembly.",
        "Untuk konversi ulang model (opsional): Python 3.11+, scikit-learn, skl2onnx.",
        "Semua dependency JavaScript tercantum di <font face='Courier'>web/package.json</font> dan "
        "terpasang otomatis lewat <font face='Courier'>npm install</font> (React, Vite, TypeScript, "
        "Tailwind, onnxruntime-web, @mediapipe/tasks-vision, dll.).",
    ]))

    s.append(P("3. Struktur Proyek", "h1"))
    s.append(code(
        "machinelearning-ai/\n"
        "|- web/                       # Aplikasi web baru (yang di-deploy)\n"
        "|  |- public/                 #   model_stunting.onnx, model MediaPipe, favicon\n"
        "|  |- src/                    #   React + TypeScript\n"
        "|  |  |- inference/           #     worker.ts (ONNX di Web Worker), useModel.ts\n"
        "|  |  |- lib/                 #     who.ts, pose.ts, fusion.ts, content.ts\n"
        "|  |  |- components/          #     Hero, DetectionTab, ResultPanel, PhotoAnalysis\n"
        "|  |- scripts/                #   copy WASM saat build + unit test\n"
        "|  |- package.json\n"
        "|- 01_Stunting_ML_Training.ipynb   # Notebook pelatihan Random Forest\n"
        "|- model_stunting.pkl              # Model asli scikit-learn\n"
        "|- app.py                          # Purwarupa lama (Streamlit) - referensi\n"
        "|- dataset_stunting.csv            # Dataset 25.000 sampel"))

    s.append(P("4. Menjalankan Secara Lokal (Mode Pengembangan)", "h1"))
    s.append(code(
        "cd web\n"
        "npm install        # pasang semua dependency (sekali saja)\n"
        "npm run dev        # buka http://localhost:5173"))
    s.append(P("Perintah <font face='Courier'>npm run dev</font> otomatis menyalin runtime WASM MediaPipe "
        "dari node_modules (lihat skrip <font face='Courier'>predev</font>)."))

    s.append(P("5. Build Produksi", "h1"))
    s.append(code(
        "cd web\n"
        "npm run build      # hasil di folder web/dist\n"
        "npm run preview    # uji hasil build di http://localhost:4173\n"
        "npm run test       # (opsional) unit test detektor foto & fusion"))

    s.append(P("6. Deploy ke Cloudflare Pages", "h1"))
    s.append(P("Opsi A — hubungkan ke GitHub (otomatis tiap push). Atur pada dashboard:"))
    s.append(tbl([
        ["Pengaturan", "Nilai"],
        ["Framework preset", "Vite"],
        ["Root directory", "web"],
        ["Build command", "npm run build"],
        ["Build output directory", "dist"],
    ], [6*cm, 9*cm]))
    s.append(P("<b>Penting:</b> karena Root directory sudah <font face='Courier'>web</font>, isi output "
        "dengan <font face='Courier'>dist</font> saja — BUKAN <font face='Courier'>web/dist</font> "
        "(akan terbaca <font face='Courier'>web/web/dist</font> dan gagal).", "cap"))
    s.append(P("Opsi B — Direct Upload: jalankan <font face='Courier'>npm run build</font> lalu unggah isi "
        "folder <font face='Courier'>web/dist</font> ke Cloudflare Pages."))

    s.append(P("7. Cara Menggunakan Aplikasi", "h1"))
    s.append(bullets([
        "Buka aplikasi, isi <b>7 faktor</b> pada tab Deteksi (data anak + data ibu/kehamilan).",
        "Tekan <b>Analisis</b>; model Random Forest memproses di perangkat dan menampilkan status gizi, "
        "tingkat keyakinan, probabilitas tiap kelas, Z-Score WHO, catatan risiko, dan rekomendasi.",
        "Opsional: gunakan <b>Analisis Foto AI</b> (unggah foto atau kamera) untuk estimasi proporsi tubuh; "
        "hasilnya menyesuaikan probabilitas akhir secara terbatas (maks ±10 poin) dan transparan.",
    ]))

    s.append(P("8. Catatan Teknis", "h1"))
    s.append(bullets([
        "Model <font face='Courier'>model_stunting.pkl</font> dikonversi ke "
        "<font face='Courier'>web/public/model_stunting.onnx</font> dengan skl2onnx (parity terverifikasi).",
        "Inferensi ONNX berjalan di <b>Web Worker</b> dengan WASM single-thread agar UI tidak membeku dan "
        "tanpa perlu header COOP/COEP.",
        "Konversi ulang model (jika perlu):",
    ]))
    s.append(code(
        "from skl2onnx import to_onnx\n"
        "from skl2onnx.common.data_types import FloatTensorType\n"
        "import joblib\n"
        "m = joblib.load('model_stunting.pkl')\n"
        "onx = to_onnx(m, initial_types=[('input', FloatTensorType([None, 7]))],\n"
        "              options={id(m): {'zipmap': False}}, target_opset=15)\n"
        "open('web/public/model_stunting.onnx','wb').write(onx.SerializeToString())"))

    s.append(P("9. Purwarupa Lama (Streamlit) — Referensi", "h1"))
    s.append(P("Versi awal berbasis Streamlit (<font face='Courier'>app.py</font>) masih disertakan sebagai "
        "referensi. Menjalankannya: <font face='Courier'>pip install -r requirements.txt</font> lalu "
        "<font face='Courier'>python -m streamlit run app.py</font>. Versi web baru menggantikannya untuk "
        "deployment statis di Cloudflare."))

    s.append(P("10. Troubleshooting", "h1"))
    s.append(tbl([
        ["Masalah", "Solusi"],
        ["Build gagal: output dir not found", "Set Build output directory = dist (Root = web)"],
        ["Model lama tampil di Cloudflare", "Pastikan branch produksi = main; hard refresh (Ctrl+Shift+R)"],
        ["Kamera tidak terbuka", "Beri izin kamera; situs harus via HTTPS (Cloudflare otomatis HTTPS)"],
        ["npm install lambat/gagal", "Ulangi; pastikan koneksi internet stabil"],
    ], [6.3*cm, 8.7*cm]))
    make_doc(os.path.join(base,"Petunjuk_Instalasi_StuntCare_AI.pdf"),
             "Petunjuk Instalasi & Penggunaan", s, "Petunjuk Instalasi StuntCare AI")

def contribution(base):
    s=[]
    s.append(Spacer(1,6))
    s.append(P("Pernyataan Kontribusi Anggota", "title"))
    s.append(P("Member Contribution Statement — Proyek AOL StuntCare AI", "sub"))
    s.append(P("Dengan ini dinyatakan bahwa proyek <b>StuntCare AI — Deteksi Dini Risiko Stunting Balita "
        "Berbasis Random Forest</b> untuk mata kuliah Artificial Intelligence (COMP6065001) dikerjakan "
        "secara <b>individu</b>. Seluruh kontribusi berikut dikerjakan dan disepakati oleh penulis."))
    s.append(Spacer(1,4))
    cell = ParagraphStyle("cell", fontName="Helvetica", fontSize=8.9, leading=11.2)
    def C(t): return Paragraph(t, cell)
    rows = [
        ["No", "Tahap / Komponen", "Rincian Kontribusi", "Anggota", "%"],
        ["1", C("Perumusan masalah & studi literatur"),
            C("Identifikasi masalah stunting (SDG #3); kajian WHO 2006, BKKBN 4T, jurnal stunting"),
            C("Daniel Steffen K"), "100%"],
        ["2", C("Dataset & praproses"),
            C("Penyiapan 25.000 sampel, encoding, split 80:20, EDA"), C("Daniel Steffen K"), "100%"],
        ["3", C("Pemodelan Random Forest"),
            C("Pelatihan 120 trees, tuning, evaluasi (akurasi 88,40%), feature importance, audit fairness"),
            C("Daniel Steffen K"), "100%"],
        ["4", C("Purwarupa Streamlit"),
            C("Pengembangan aplikasi awal berbasis Python/Streamlit"), C("Daniel Steffen K"), "100%"],
        ["5", C("Rebuild aplikasi web"),
            C("Konversi model ke ONNX; React + Vite + TypeScript + Tailwind; inferensi ONNX di Web Worker (di-peramban)"),
            C("Daniel Steffen K"), "100%"],
        ["6", C("Modul analisis foto"),
            C("MediaPipe Pose + segmentation, detektor proporsi tubuh, late-fusion transparan"),
            C("Daniel Steffen K"), "100%"],
        ["7", C("Deployment"),
            C("Konfigurasi & deploy ke Cloudflare Pages"), C("Daniel Steffen K"), "100%"],
        ["8", C("Laporan & presentasi"),
            C("Penulisan laporan PKM, petunjuk instalasi, dan bahan presentasi"),
            C("Daniel Steffen K"), "100%"],
    ]
    s.append(tbl(rows, [0.85*cm, 3.3*cm, 6.85*cm, 2.7*cm, 1.3*cm]))
    s.append(Spacer(1,10))
    s.append(P("Pernyataan ini dibuat dengan sebenarnya dan disetujui oleh yang bersangkutan."))
    s.append(Spacer(1,28))
    sign = Table([
        ["", ""],
        ["Jakarta, 10 Juni 2026", ""],
        ["", ""],
        ["", ""],
        ["(Daniel Steffen K)", ""],
        ["NIM 2602071171", ""],
    ], colWidths=[7*cm, 8*cm])
    sign.setStyle(TableStyle([("FONTNAME",(0,0),(-1,-1),"Helvetica"),("FONTSIZE",(0,0),(-1,-1),10.5),
        ("LINEABOVE",(0,4),(0,4),0.7,DARK)]))
    s.append(sign)
    make_doc(os.path.join(base,"Pernyataan_Kontribusi_StuntCare_AI.pdf"),
             "Member Contribution Statement", s, "Pernyataan Kontribusi StuntCare AI")

if __name__ == "__main__":
    base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    manual(base); contribution(base)
