"""
═══════════════════════════════════════════════════════════════════
APLIKASI DETEKSI DINI RISIKO STUNTING PADA BALITA (MULTI-FAKTOR)
═══════════════════════════════════════════════════════════════════
Mata Kuliah   : Artificial Intelligence (COMP6065001)
Nama          : Daniel Steffen K
NIM           : 2602071171
Kelas         : LA05-LEC
Universitas   : BINUS University
SDG #3        : Good Health and Well-being (Malnutrition monitoring in children)
═══════════════════════════════════════════════════════════════════
7 Faktor Input: Umur, Jenis Kelamin, Tinggi Badan, Berat Badan,
                Jarak Kehamilan, Usia Ibu Menikah, Gizi Ibu Saat Hamil
═══════════════════════════════════════════════════════════════════
Cara menjalankan:
    pip install -r requirements.txt
    python -m streamlit run app.py
═══════════════════════════════════════════════════════════════════
"""

import warnings
warnings.filterwarnings("ignore")  # sembunyikan peringatan versi sklearn/pandas saat demo

import streamlit as st
import pandas as pd
import numpy as np
import joblib
from datetime import datetime

st.set_page_config(
    page_title="Deteksi Dini Stunting | BINUS AI",
    page_icon="🌱", layout="wide", initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────────────────────
# CSS — robust, semua warna eksplisit, desain modern
# ─────────────────────────────────────────────────────────────
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

    .stApp { background: #eef7f1 !important; color: #15241c !important;
             font-family: 'Plus Jakarta Sans', sans-serif; }
    .main .block-container { background: #eef7f1 !important; padding-top: 1.5rem; max-width: 1200px; }
    .stApp, .stApp p, .stApp span, .stApp label, .stApp div,
    .stApp li, .stApp td, .stApp th, .stMarkdown, .stMarkdown * { color: #15241c; }

    /* LABEL INPUT */
    .stTextInput label, .stNumberInput label, .stRadio label, .stDateInput label,
    .stSelectbox label, [data-testid="stWidgetLabel"], [data-testid="stWidgetLabel"] * {
        color: #014A2F !important; font-weight: 700 !important; font-size: 0.98rem !important;
    }
    /* INPUT FIELDS */
    .stTextInput input, .stNumberInput input, .stDateInput input {
        background-color: #ffffff !important; color: #15241c !important;
        border: 2px solid #06A357 !important; border-radius: 10px !important; font-size: 1rem !important;
    }
    .stTextInput input::placeholder { color: #8a9a90 !important; }
    .stNumberInput button { background-color: #e3f5ea !important; color: #014A2F !important; border: 1px solid #06A357 !important; }
    /* SELECTBOX */
    .stSelectbox div[data-baseweb="select"] > div {
        background-color: #ffffff !important; border: 2px solid #06A357 !important;
        border-radius: 10px !important; color: #15241c !important;
    }
    .stSelectbox div[data-baseweb="select"] * { color: #15241c !important; }
    .stRadio [role="radiogroup"] label, .stRadio [role="radiogroup"] label * {
        color: #15241c !important; font-weight: 600 !important;
    }

    /* HEADER */
    .main-header {
        background: linear-gradient(135deg, #013220 0%, #06A357 55%, #2ECC71 100%);
        padding: 2.6rem 2.2rem; border-radius: 24px; margin-bottom: 1rem;
        box-shadow: 0 14px 38px rgba(1,74,47,0.34); position: relative; overflow: hidden;
    }
    .main-header::after { content:""; position:absolute; right:-40px; top:-40px;
        width:220px; height:220px; background:rgba(255,255,255,0.10); border-radius:50%; }
    .main-header::before { content:""; position:absolute; right:90px; bottom:-70px;
        width:150px; height:150px; background:rgba(255,255,255,0.06); border-radius:50%; }
    .main-header h1 { color: #fff !important; margin:0; font-size: 2.3rem; font-weight: 800; line-height:1.18;
        letter-spacing:-0.5px; text-shadow:0 2px 8px rgba(0,0,0,0.18); position:relative; }
    .main-header p { color: #e6fff1 !important; margin-top: 0.7rem; font-size: 1.08rem; position:relative; }
    .sdg-badge { display:inline-block; background:rgba(255,255,255,0.22); color:#fff !important;
        padding:6px 16px; border-radius:20px; font-size:0.84rem; font-weight:700; margin-top:1rem;
        border:1px solid rgba(255,255,255,0.35); backdrop-filter:blur(4px); position:relative; }

    /* AUTHOR RIBBON */
    .author-ribbon { background: linear-gradient(135deg, #FF8500 0%, #FFB400 100%);
        padding: 0.85rem 1.5rem; border-radius: 14px; margin-bottom: 1.6rem;
        box-shadow: 0 8px 20px rgba(255,133,0,0.30); }
    .author-ribbon span { color: #fff !important; font-weight: 700; font-size: 1rem; text-shadow:0 1px 3px rgba(0,0,0,0.15); }

    /* SIDEBAR METRIC CARDS (custom, anti-terpotong) */
    .sb-metrics { display:grid; grid-template-columns:1fr 1fr; gap:9px; margin-top:8px; }
    .sb-metric { background:rgba(255,255,255,0.09); border:1px solid rgba(255,255,255,0.18);
        border-radius:13px; padding:11px 6px; text-align:center; transition:all 0.2s; }
    .sb-metric:hover { background:rgba(255,255,255,0.15); transform:translateY(-2px); }
    .sb-val { color:#FFD37A !important; font-weight:800; font-size:1.32rem; line-height:1.05; letter-spacing:-0.5px; }
    .sb-lab { color:#cdeedd !important; font-size:0.74rem; margin-top:3px; font-weight:600; }

    /* CARDS */
    .info-card { background: #fff; padding: 1.5rem; border-radius: 16px;
        box-shadow: 0 4px 16px rgba(1,74,47,0.08); margin-bottom: 1rem; border-left: 6px solid #06A357; }
    .info-card h4 { color: #014A2F !important; margin-top: 0; font-size: 1.12rem; }
    .info-card p, .info-card li, .info-card ul { color: #2d4035 !important; font-size: 0.96rem; }

    /* SECTION CARD untuk input */
    .section-card { background:#fff; padding:1.3rem 1.5rem; border-radius:16px;
        box-shadow:0 4px 16px rgba(1,74,47,0.07); margin-bottom:1rem; }
    .section-title { color:#014A2F !important; font-weight:800; font-size:1.15rem;
        border-bottom:2px solid #e3f5ea; padding-bottom:0.5rem; margin-bottom:0.3rem; }

    /* CONTAINER BORDER (st.container(border=True)) → tampil seperti kartu */
    [data-testid="stVerticalBlockBorderWrapper"] {
        background:linear-gradient(180deg,#ffffff 0%, #fbfffc 100%) !important;
        border:1px solid #cdeedd !important; border-left:5px solid #06A357 !important;
        border-radius:16px !important; padding:1.3rem 1.5rem !important;
        box-shadow:0 6px 20px rgba(1,74,47,0.09) !important; margin-bottom:0.8rem !important;
        transition:box-shadow 0.2s, transform 0.2s !important;
    }
    [data-testid="stVerticalBlockBorderWrapper"]:hover {
        box-shadow:0 10px 28px rgba(1,74,47,0.14) !important; transform:translateY(-2px);
    }

    /* RESULT CARDS */
    .result-normal { background:linear-gradient(135deg,#28A745,#014A2F); padding:2rem; border-radius:20px; text-align:center; box-shadow:0 8px 24px rgba(40,167,69,0.32); }
    .result-warning { background:linear-gradient(135deg,#FF8500,#DC6500); padding:2rem; border-radius:20px; text-align:center; box-shadow:0 8px 24px rgba(255,133,0,0.32); }
    .result-danger { background:linear-gradient(135deg,#DC3545,#A02530); padding:2rem; border-radius:20px; text-align:center; box-shadow:0 8px 24px rgba(220,53,69,0.32); }
    .result-tall { background:linear-gradient(135deg,#014A2F,#00351F); padding:2rem; border-radius:20px; text-align:center; box-shadow:0 8px 24px rgba(1,74,47,0.32); }
    .result-normal *, .result-warning *, .result-danger *, .result-tall * { color:#fff !important; }

    /* BUTTON */
    .stButton > button { background:linear-gradient(135deg,#06A357,#014A2F) !important;
        color:#fff !important; border:none !important; padding:0.9rem 2rem !important;
        border-radius:12px !important; font-weight:800 !important; font-size:1.12rem !important;
        width:100%; transition:all 0.25s !important; box-shadow:0 6px 16px rgba(1,74,47,0.28); }
    .stButton > button:hover { transform:translateY(-3px); box-shadow:0 10px 24px rgba(1,74,47,0.4) !important; }
    .stButton > button p { color:#fff !important; }

    /* TABS */
    .stTabs [data-baseweb="tab-list"] { gap:6px; background:#e3f5ea; padding:7px; border-radius:14px; }
    .stTabs [data-baseweb="tab"] { background:transparent; border-radius:10px; padding:11px 18px; color:#014A2F !important; font-weight:700; }
    .stTabs [data-baseweb="tab"] p { color:#014A2F !important; font-weight:700; }
    .stTabs [aria-selected="true"] { background:#06A357 !important; }
    .stTabs [aria-selected="true"] p { color:#fff !important; }

    /* SIDEBAR */
    [data-testid="stSidebar"] { background:linear-gradient(180deg,#013220,#015C3A) !important; }
    [data-testid="stSidebar"] * { color:#eafaf0 !important; }
    [data-testid="stSidebar"] h1,[data-testid="stSidebar"] h2,[data-testid="stSidebar"] h3 { color:#fff !important; }
    [data-testid="stSidebar"] [data-testid="stMetricValue"] { color:#FFD37A !important; font-weight:800 !important; }
    [data-testid="stSidebar"] [data-testid="stMetricLabel"] { color:#cdeedd !important; }
    [data-testid="stSidebar"] hr { border-color:rgba(255,255,255,0.2) !important; }

    .stExpander { border:1px solid #b8e0c8 !important; border-radius:12px !important; background:#fff !important; }
    .stExpander summary, .stExpander summary * { color:#014A2F !important; font-weight:700 !important; }
    .stDataFrame, .stDataFrame * { color:#15241c !important; }
    [data-testid="stAlert"] { border-radius:12px; }
    h1,h2,h3,h4,h5 { color:#014A2F !important; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────────────────────
# WHO REFERENCE (untuk z-score tampilan)
# ─────────────────────────────────────────────────────────────
WHO_BOYS = {0:(49.9,1.9),1:(54.7,2.0),2:(58.4,2.1),3:(61.4,2.2),4:(63.9,2.3),5:(65.9,2.3),6:(67.6,2.4),7:(69.2,2.4),8:(70.6,2.5),9:(72.0,2.5),10:(73.3,2.6),11:(74.5,2.6),12:(75.7,2.6),13:(76.9,2.7),14:(78.0,2.7),15:(79.1,2.8),16:(80.2,2.8),17:(81.2,2.8),18:(82.3,2.9),19:(83.2,2.9),20:(84.2,3.0),21:(85.1,3.0),22:(86.0,3.0),23:(86.9,3.1),24:(87.8,3.1),25:(88.0,3.2),26:(88.5,3.2),27:(89.0,3.2),28:(90.4,3.3),29:(91.2,3.3),30:(91.9,3.3),31:(92.7,3.4),32:(93.4,3.4),33:(94.1,3.4),34:(94.8,3.5),35:(95.4,3.5),36:(96.1,3.5),37:(96.7,3.6),38:(97.4,3.6),39:(98.0,3.6),40:(98.6,3.7),41:(99.2,3.7),42:(99.9,3.7),43:(100.4,3.8),44:(101.0,3.8),45:(101.6,3.8),46:(102.2,3.9),47:(102.8,3.9),48:(103.3,3.9),49:(103.9,4.0),50:(104.4,4.0),51:(105.0,4.0),52:(105.6,4.1),53:(106.1,4.1),54:(106.7,4.1),55:(107.2,4.2),56:(107.8,4.2),57:(108.3,4.2),58:(108.9,4.3),59:(109.4,4.3),60:(110.0,4.3)}
WHO_GIRLS = {0:(49.1,1.9),1:(53.7,1.9),2:(57.1,2.0),3:(59.8,2.1),4:(62.1,2.2),5:(64.0,2.2),6:(65.7,2.3),7:(67.3,2.3),8:(68.7,2.4),9:(70.1,2.4),10:(71.5,2.5),11:(72.8,2.5),12:(74.0,2.5),13:(75.2,2.6),14:(76.4,2.6),15:(77.5,2.7),16:(78.6,2.7),17:(79.7,2.7),18:(80.7,2.8),19:(81.7,2.8),20:(82.7,2.9),21:(83.7,2.9),22:(84.6,2.9),23:(85.5,3.0),24:(86.4,3.0),25:(87.4,3.0),26:(88.3,3.1),27:(89.3,3.1),28:(90.2,3.2),29:(91.2,3.2),30:(92.1,3.2),31:(93.0,3.3),32:(93.9,3.3),33:(94.8,3.3),34:(95.7,3.4),35:(96.5,3.4),36:(97.4,3.5),37:(98.2,3.5),38:(99.0,3.5),39:(99.8,3.6),40:(100.6,3.6),41:(101.4,3.6),42:(102.2,3.7),43:(102.9,3.7),44:(103.7,3.7),45:(104.4,3.8),46:(105.2,3.8),47:(105.9,3.8),48:(106.7,3.9),49:(107.4,3.9),50:(108.1,3.9),51:(108.9,4.0),52:(109.6,4.0),53:(110.3,4.0),54:(111.0,4.1),55:(111.7,4.1),56:(112.4,4.1),57:(113.1,4.2),58:(113.7,4.2),59:(114.4,4.2),60:(115.1,4.2)}

def who_stats(age, sex):
    return (WHO_BOYS if sex=='laki-laki' else WHO_GIRLS)[min(int(age),60)]
def haz_zscore(age, sex, height):
    m,s = who_stats(age,sex); return (height-m)/s

# WHO median berat badan (kg) per usia — untuk catatan faktor risiko berat badan
WT_BOYS = {0:3.3,6:7.9,12:9.6,18:10.9,24:12.2,30:13.3,36:14.3,42:15.3,48:16.3,54:17.3,60:18.3}
WT_GIRLS = {0:3.2,6:7.3,12:8.9,18:10.2,24:11.5,30:12.7,36:13.9,42:15.0,48:16.1,54:17.2,60:18.2}
def who_wt(age, sex):
    tbl = WT_BOYS if sex=='laki-laki' else WT_GIRLS
    age = min(int(age),60); ks = sorted(tbl)
    for i in range(len(ks)-1):
        if ks[i] <= age <= ks[i+1]:
            lo,hi = ks[i],ks[i+1]; f = (age-lo)/(hi-lo) if hi>lo else 0
            return tbl[lo] + f*(tbl[hi]-tbl[lo])
    return tbl[60]

@st.cache_resource
def load_model():
    try:
        model = joblib.load('model_stunting.pkl')
        enc_sex = joblib.load('encoder_jenis_kelamin.pkl')
        enc_nutri = joblib.load('encoder_gizi_ibu.pkl')
        enc_status = joblib.load('encoder_status.pkl')
        return model, enc_sex, enc_nutri, enc_status
    except FileNotFoundError as e:
        st.error(f"❌ File model tidak ditemukan: {e}")
        st.info("Pastikan model_stunting.pkl, encoder_jenis_kelamin.pkl, "
                "encoder_gizi_ibu.pkl, dan encoder_status.pkl ada di folder yang sama dengan app.py")
        st.stop()
    except Exception as e:  # mis. mismatch versi library — tampilkan pesan ramah, bukan crash merah
        st.error("❌ Gagal memuat model AI.")
        st.info(f"Detail: {e}\n\nCoba jalankan ulang: pip install -r requirements.txt")
        st.stop()

model, encoder_sex, encoder_nutri, encoder_status = load_model()

# ─────────────────────────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("# 🌱 Tentang Aplikasi")
    st.markdown("---")
    st.markdown("""**Deteksi Dini Risiko Stunting Multi-Faktor**

Memprediksi risiko stunting balita dari **7 faktor penyebab** menggunakan
**Machine Learning (Random Forest)** & **WHO Child Growth Standards 2006**.""")
    st.markdown("---")
    st.markdown("### 👨‍🎓 Dibuat Oleh")
    st.markdown("""**Daniel Steffen K**  
NIM: 2602071171  
Kelas: LA05-LEC""")
    st.markdown("---")
    st.markdown("### 📚 Akademik")
    st.markdown("""**Mata Kuliah:** Artificial Intelligence (COMP6065001)  
**SDG #3:** Good Health & Well-being  
**Universitas:** BINUS University""")
    st.markdown("---")
    st.markdown("### 📊 Performa Model")
    st.markdown("""
    <div class="sb-metrics">
      <div class="sb-metric"><div class="sb-val">88.40%</div><div class="sb-lab">Accuracy</div></div>
      <div class="sb-metric"><div class="sb-val">83.56%</div><div class="sb-lab">F1-Score</div></div>
      <div class="sb-metric"><div class="sb-val">81.59%</div><div class="sb-lab">Precision</div></div>
      <div class="sb-metric"><div class="sb-val">85.93%</div><div class="sb-lab">Recall</div></div>
    </div>
    """, unsafe_allow_html=True)
    st.markdown("---")
    st.markdown("### 🧬 7 Faktor Penyebab")
    st.markdown("""1. Umur anak  
2. Jenis kelamin  
3. Tinggi badan  
4. Berat badan  
5. Jarak kehamilan  
6. Usia ibu menikah  
7. Gizi ibu saat hamil""")

# ─────────────────────────────────────────────────────────────
# HEADER + AUTHOR
# ─────────────────────────────────────────────────────────────
st.markdown("""
<div class="main-header">
    <h1>🌱 Deteksi Dini Risiko Stunting pada Balita</h1>
    <p>Sistem prediksi Machine Learning multi-faktor — menghitung 7 penyebab stunting sekaligus</p>
    <span class="sdg-badge">🎯 SDG #3 — Good Health and Well-being</span>
</div>
""", unsafe_allow_html=True)

st.markdown("""
<div class="author-ribbon">
    <span>👨‍🎓 Dibuat oleh: Daniel Steffen K &nbsp;·&nbsp; NIM 2602071171 &nbsp;·&nbsp; LA05-LEC &nbsp;·&nbsp; COMP6065001 &nbsp;·&nbsp; BINUS University</span>
</div>
""", unsafe_allow_html=True)

tab1, tab2, tab3, tab4 = st.tabs([
    "🔍 Deteksi Stunting", "📊 Tentang Project", "🧠 Cara Kerja AI", "⚖️ Etika & Privasi"
])

# ═════════════════════════════════════════════════════════════
# TAB 1: PREDIKSI (7 INPUT)
# ═════════════════════════════════════════════════════════════
with tab1:
    st.markdown("### 📋 Masukkan Data Anak & Ibu")
    st.markdown("Isi **7 faktor** berikut untuk prediksi risiko stunting yang komprehensif:")

    # Bagian 1: Data Anak
    with st.container(border=True):
        st.markdown('<div class="section-title">👶 Data Anak</div>', unsafe_allow_html=True)
        ca1, ca2 = st.columns(2)
        with ca1:
            nama_anak = st.text_input("Nama Anak (opsional)", placeholder="Contoh: Adi")
            umur = st.number_input("📅 Umur Anak (bulan)", 0, 60, 24, 1, help="Usia 0-60 bulan")
            jenis_kelamin = st.radio("⚧ Jenis Kelamin", ['laki-laki','perempuan'], horizontal=True)
        with ca2:
            tinggi = st.number_input("📐 Tinggi Badan (cm)", 30.0, 130.0, 85.0, 0.1)
            berat = st.number_input("⚖️ Berat Badan (kg)", 2.0, 30.0, 11.0, 0.1, help="Berat badan anak saat ini")

    # Bagian 2: Data Ibu / Kehamilan
    with st.container(border=True):
        st.markdown('<div class="section-title">🤰 Data Ibu &amp; Riwayat Kehamilan</div>', unsafe_allow_html=True)
        cb1, cb2, cb3 = st.columns(3)
        with cb1:
            anak_pertama = st.radio("Apakah anak pertama?", ['Ya','Tidak'], horizontal=True,
                                    help="Jika Ya, jarak kehamilan dianggap 0")
            if anak_pertama == 'Tidak':
                jarak_kehamilan = st.number_input("👶 Jarak dari anak sebelumnya (bulan)", 6, 72, 24, 1,
                                                  help="Ideal > 24 bulan")
            else:
                jarak_kehamilan = 0
                st.caption("Jarak kehamilan = 0 (anak pertama)")
        with cb2:
            usia_ibu_menikah = st.number_input("💍 Usia Ibu Saat Menikah (tahun)", 14, 45, 23, 1,
                                               help="Ideal 20-35 tahun")
        with cb3:
            gizi_ibu = st.selectbox("🍎 Gizi Ibu Saat Hamil", ['Baik','Sedang','Buruk'],
                                    help="Status gizi ibu selama kehamilan")

    ref_height, ref_sd = who_stats(umur, jenis_kelamin)
    st.info(f"📊 **Referensi WHO**: Median tinggi anak {umur} bulan ({jenis_kelamin}) = **{ref_height:.1f} cm**")

    if st.button("🔍 ANALISIS RISIKO STUNTING (7 FAKTOR)", width="stretch"):
      try:
        sex_enc = encoder_sex.transform([jenis_kelamin])[0]
        nutri_enc = encoder_nutri.transform([gizi_ibu])[0]
        input_data = pd.DataFrame({
            'Umur (bulan)': [umur],
            'Jenis_Kelamin_Enc': [sex_enc],
            'Tinggi Badan (cm)': [tinggi],
            'Berat Badan (kg)': [berat],
            'Jarak Kehamilan (bulan)': [jarak_kehamilan],
            'Usia Ibu Menikah (tahun)': [usia_ibu_menikah],
            'Gizi_Ibu_Enc': [nutri_enc],
        })
        prediction = int(model.predict(input_data)[0])
        probabilities = model.predict_proba(input_data)[0]
        status = encoder_status.inverse_transform([prediction])[0]
        confidence = probabilities[prediction] * 100
        z_score = haz_zscore(umur, jenis_kelamin, tinggi)

        st.markdown("---")
        st.markdown("### 🎯 Hasil Analisis")

        cfg_map = {
            'Normal': ('✅','result-normal','STATUS GIZI NORMAL','Pertumbuhan anak sesuai standar WHO untuk usianya.',
                ['Pertahankan pola makan seimbang dengan gizi lengkap','Pemeriksaan tumbuh kembang rutin di posyandu',
                 'Pastikan asupan protein, vitamin, dan mineral cukup','Berikan ASI eksklusif / MPASI bergizi','Pantau pertumbuhan setiap bulan']),
            'Stunted': ('⚠️','result-warning','RISIKO STUNTING TERDETEKSI','Tinggi badan anak di bawah standar usianya. Perlu intervensi.',
                ['🏥 Segera konsultasi ke puskesmas atau dokter anak','🥗 Tingkatkan asupan protein hewani (telur, ikan, daging)',
                 '💊 Periksa kemungkinan defisiensi zat besi & zinc','🩺 Pantau tumbuh kembang setiap bulan','💧 Pastikan akses air bersih & sanitasi baik']),
            'Severely Stunted': ('🚨','result-danger','RISIKO STUNTING BERAT','Tinggi badan sangat di bawah standar. SEGERA ke fasilitas kesehatan!',
                ['🚨 SEGERA bawa ke puskesmas/rumah sakit','🩺 Pemeriksaan medis lengkap diperlukan',
                 '🍽️ Program pemulihan gizi intensif','👨‍⚕️ Konsultasi ahli gizi & dokter anak','📋 Pemantauan rutin tenaga kesehatan']),
            'Tinggi': ('🌟','result-tall','TINGGI DI ATAS RATA-RATA','Tinggi badan di atas standar usianya — pertumbuhan sangat baik.',
                ['Pertumbuhan sangat baik, pertahankan!','Lanjutkan pola makan & gaya hidup sehat',
                 'Tetap lakukan pemeriksaan rutin','Pantau berat badan agar tetap seimbang']),
        }
        icon, cls, title, desc, rekom = cfg_map[status]
        st.markdown(f"""
        <div class="{cls}">
            <h1 style="margin:0;font-size:3rem;">{icon}</h1>
            <h2 style="margin:0.5rem 0;">{title}</h2>
            <p style="font-size:1.1rem;margin:0;">{desc}</p>
            <h3 style="margin-top:1rem;">Tingkat Keyakinan AI: {confidence:.1f}%</h3>
        </div>""", unsafe_allow_html=True)
        st.markdown("")

        col_a, col_b = st.columns(2)
        with col_a:
            st.markdown("#### 📋 Data yang Dianalisis (7 Faktor)")
            for k,v in {
                "Nama Anak": nama_anak if nama_anak else "-",
                "Umur": f"{umur} bulan ({umur//12} thn {umur%12} bln)",
                "Jenis Kelamin": jenis_kelamin.capitalize(),
                "Tinggi Badan": f"{tinggi} cm (median WHO {ref_height:.1f})",
                "Berat Badan": f"{berat} kg",
                "Z-Score (HAZ)": f"{z_score:+.2f} SD",
                "Jarak Kehamilan": (f"{jarak_kehamilan} bulan" if jarak_kehamilan>0 else "Anak pertama"),
                "Usia Ibu Menikah": f"{usia_ibu_menikah} tahun",
                "Gizi Ibu Saat Hamil": gizi_ibu,
            }.items():
                st.markdown(f"**{k}:** {v}")
        with col_b:
            st.markdown("#### 📊 Probabilitas Tiap Kategori")
            proba_df = pd.DataFrame({'Status': encoder_status.classes_, 'P': probabilities}).sort_values('P', ascending=False)
            for _,r in proba_df.iterrows():
                st.markdown(f"**{r['Status']}**")
                st.progress(float(r['P']), text=f"{r['P']*100:.1f}%")

            # Analisis faktor risiko
            st.markdown("#### 🔬 Catatan Faktor Risiko")
            notes = []
            if berat < who_wt(umur, jenis_kelamin) * 0.80: notes.append("⚠️ Berat badan di bawah standar usia (risiko gizi kurang)")
            if jarak_kehamilan>0 and jarak_kehamilan<24: notes.append("⚠️ Jarak kehamilan < 24 bln (ideal >24)")
            if usia_ibu_menikah<20: notes.append("⚠️ Ibu menikah usia dini (<20 thn)")
            if gizi_ibu=='Buruk': notes.append("⚠️ Gizi ibu saat hamil buruk (risiko KEK)")
            elif gizi_ibu=='Sedang': notes.append("• Gizi ibu saat hamil sedang")
            if z_score < -2: notes.append("⚠️ Tinggi badan di bawah standar WHO")
            if not notes: notes.append("✅ Tidak ada faktor risiko maternal signifikan")
            for n in notes: st.markdown(f"- {n}")

        st.markdown("---")
        st.markdown("### 💡 Rekomendasi Tindak Lanjut")
        for r in rekom: st.markdown(f"- {r}")

        st.markdown("---")
        st.warning("""⚠️ **DISCLAIMER PENTING:** Hasil ini adalah **alat skrining awal**, BUKAN diagnosis medis.
        Akurasi model 88,40% pada test set. Selalu konsultasikan dengan **dokter anak atau ahli gizi**
        untuk diagnosis dan penanganan yang tepat.""")
      except Exception as e:
        st.error("❌ Terjadi kesalahan saat menganalisis. Silakan periksa input lalu coba lagi.")
        st.info(f"Detail teknis: {e}")

# ═════════════════════════════════════════════════════════════
# TAB 2: TENTANG PROJECT
# ═════════════════════════════════════════════════════════════
with tab2:
    st.markdown("### 📊 Tentang Project Ini")
    c1,c2 = st.columns(2)
    with c1:
        st.markdown("""<div class="info-card"><h4>🎯 Masalah yang Diatasi</h4>
        <p>Prevalensi stunting Indonesia <b>19,8%</b> (SSGI 2024, Kemenkes RI) — sekitar 4,4 juta balita.
        Stunting disebabkan <b>banyak faktor</b> yang saling terkait, tidak hanya tinggi badan.</p></div>
        <div class="info-card"><h4>💡 Solusi</h4>
        <p>Web app berbasis ML yang menghitung <b>7 faktor penyebab stunting</b> sekaligus — dari data
        anak (umur, kelamin, tinggi, berat) hingga riwayat maternal (jarak kehamilan, usia ibu, gizi hamil).</p></div>""", unsafe_allow_html=True)
    with c2:
        st.markdown("""<div class="info-card"><h4>👥 Penerima Manfaat</h4>
        <ul><li><b>Orang Tua Balita</b> — monitoring mandiri di rumah</li>
        <li><b>Kader Posyandu</b> — skrining massal lebih akurat</li>
        <li><b>Dinas Kesehatan</b> — data untuk kebijakan SDG #3</li></ul></div>
        <div class="info-card"><h4>📈 Output / Produk (MVP)</h4>
        <ul><li>Web Application real-time (Streamlit)</li><li>Prediksi 4 kategori dari 7 faktor</li>
        <li>Confidence score & analisis faktor risiko</li><li>Rekomendasi tindak lanjut otomatis</li></ul></div>""", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("### 🧬 7 Faktor Penyebab Stunting yang Dihitung")
    fc1, fc2 = st.columns(2)
    factors = [
        ("📅 Umur Anak","Acuan standar pertumbuhan WHO per usia"),
        ("⚧ Jenis Kelamin","Standar WHO berbeda laki-laki & perempuan"),
        ("📐 Tinggi Badan","Indikator utama (Height-for-Age Z-Score)"),
        ("⚖️ Berat Badan","Indikator status gizi (Weight-for-Age)"),
        ("👶 Jarak Kehamilan","Jarak <24 bln tingkatkan risiko (BKKBN 4T)"),
        ("💍 Usia Ibu Menikah","Pernikahan dini <20 thn = faktor risiko"),
        ("🍎 Gizi Ibu Saat Hamil","KEK saat hamil → BBLR → stunting"),
    ]
    for i,(t,d) in enumerate(factors):
        with (fc1 if i%2==0 else fc2):
            st.markdown(f"""<div class="info-card" style="border-left-color:#FF8500;">
            <h4>{t}</h4><p>{d}</p></div>""", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("### 🎓 Kaitan dengan Learning Outcomes")
    los = {
        "LO5 — Apply learning algorithms to solve problems": "Implementasi **Random Forest** (ensemble, 120 trees) yang dilatih pada 7 faktor penyebab stunting untuk klasifikasi 4 kategori status gizi — akurasi 88,40%.",
        "LO6 — Analyze the role of Ethics in AI": "Analisis privasi data (tidak disimpan), fairness antar gender (disparitas 1,83%), transparansi (confidence score), dan safety (disclaimer medis).",
    }
    for lo, d in los.items():
        with st.expander(f"📌 {lo}"):
            st.markdown(d)

# ═════════════════════════════════════════════════════════════
# TAB 3: CARA KERJA AI
# ═════════════════════════════════════════════════════════════
with tab3:
    st.markdown("### 🧠 Bagaimana AI Bekerja?")
    st.markdown("""Aplikasi menggunakan **Random Forest Classifier** (Breiman, 2001) — ensemble **120 Decision Tree**
    yang menganalisis **7 faktor** sekaligus melalui voting mayoritas untuk prediksi akurat & stabil.""")
    cols = st.columns(4)
    steps = [("1️⃣","INPUT 7 FAKTOR","Data anak + data ibu/kehamilan"),
             ("2️⃣","PREPROCESS","Encoding kategorikal & normalisasi"),
             ("3️⃣","RANDOM FOREST","120 Decision Trees voting"),
             ("4️⃣","OUTPUT","Prediksi + confidence + analisis faktor")]
    for col,(ic,t,d) in zip(cols, steps):
        with col:
            st.markdown(f"""<div class="info-card" style="text-align:center;min-height:165px;">
            <h2 style="margin:0;">{ic}</h2><h4 style="margin:0.3rem 0;">{t}</h4><p style="font-size:0.88rem;">{d}</p></div>""", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("#### 📊 Bobot Kepentingan Tiap Faktor (Feature Importance)")
    imp_df = pd.DataFrame({
        'Faktor': ['Tinggi Badan','Umur','Berat Badan','Jarak Kehamilan','Usia Ibu Menikah','Gizi Ibu Hamil','Jenis Kelamin'],
        'Bobot (%)': [50.6, 28.67, 9.45, 4.31, 4.19, 1.52, 1.27]
    })
    st.bar_chart(imp_df.set_index('Faktor'), color="#06A357", horizontal=True)

    st.markdown("---")
    st.markdown("#### 📋 Spesifikasi Model")
    st.dataframe(pd.DataFrame({
        'Parameter': ['Algoritma','Jumlah Fitur','Jumlah Trees','Max Depth','Training Data',
                      'Test Accuracy','F1-Score (Macro)','Cross-Validation','Dataset Total'],
        'Nilai': ['Random Forest Classifier','7 faktor','120 trees','14 levels','20.000 sampel (80%)',
                  '88,40%','83,56%','84,11% ± 0,23%','25.000 sampel']
    }), width="stretch", hide_index=True)

    st.markdown("#### 📚 Referensi")
    st.markdown("""- **Breiman, L. (2001)**. Random Forests. *Machine Learning, 45(1), 5-32*.
    - **WHO (2006)**. WHO Child Growth Standards. Geneva.
    - **Apriluana & Fikawati (2018)**. Analisis Faktor Risiko Stunting pada Balita. *Media Litbangkes, 28(4)*.
    - **SSGI 2024**. Survei Status Gizi Indonesia. Kementerian Kesehatan RI.
    - **BKKBN**. Program 4 Terlalu (4T) dalam pencegahan stunting.""")

# ═════════════════════════════════════════════════════════════
# TAB 4: ETIKA
# ═════════════════════════════════════════════════════════════
with tab4:
    st.markdown("### ⚖️ Pertimbangan Etika & Privasi (LO6)")
    st.markdown("""Sebagai aplikasi AI kesehatan, project mengikuti **WHO (2021) Ethics & Governance of AI for Health**
    dan **EU Ethics Guidelines for Trustworthy AI (2019)**.""")
    ethics = [
        ("🔒","Privasi Data","Aplikasi TIDAK menyimpan data input. Semua perhitungan runtime & langsung dilupakan."),
        ("⚖️","Fairness","Akurasi laki-laki (89,30%) vs perempuan (87,46%). Disparitas 1,83% — di bawah standar industri 5%."),
        ("🔍","Transparency","Confidence score, probabilitas, & analisis faktor risiko selalu ditampilkan — bukan black-box."),
        ("🛡️","Safety","Disclaimer jelas: bukan diagnosis medis. Kasus berat diarahkan ke fasilitas kesehatan."),
        ("🌐","Accessibility","Gratis, mobile-friendly, mendukung SDG #3 Good Health & Well-being."),
        ("📚","Edukatif","Menampilkan Z-Score WHO & catatan faktor risiko agar pengguna paham konteks."),
    ]
    for ic,t,d in ethics:
        st.markdown(f"""<div class="info-card"><h4>{ic} {t}</h4><p>{d}</p></div>""", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown("#### 📊 Hasil Audit Fairness")
    st.dataframe(pd.DataFrame({
        'Kelompok': ['Laki-laki','Perempuan','Disparitas'],
        'Akurasi': ['89,30%','87,46%','1,83%'],
        'F1-Score': ['85,13%','81,92%','3,21%'],
        'Status': ['✅ Fair','✅ Fair','✅ < 5%']
    }), width="stretch", hide_index=True)

# FOOTER
st.markdown("---")
st.markdown("""<div style="text-align:center;padding:1.2rem;background:#e3f5ea;border-radius:16px;">
<p style="color:#014A2F !important;font-weight:800;margin:0;">🌱 Deteksi Dini Stunting Multi-Faktor | AOL Project — BINUS University 2026</p>
<p style="color:#2d4035 !important;font-size:0.9rem;margin:0.3rem 0 0 0;">Dibuat oleh <b>Daniel Steffen K</b> · NIM 2602071171 · COMP6065001 LA05-LEC</p>
<p style="color:#5a6b60 !important;font-size:0.78rem;margin:0.2rem 0 0 0;">7 Faktor · WHO 2006 · SSGI 2024 · Akurasi 88,40% (Excellent)</p></div>""", unsafe_allow_html=True)
