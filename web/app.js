/* ============================================================
   StuntCare AI — client-side inference (ONNX Runtime Web)
   Model: Random Forest (7 fitur) — parity 100% dgn scikit-learn
   ============================================================ */

// ---- WHO Child Growth Standards 2006: [median, SD] per usia (0-60 bln) ----
const HB=[[49.9,1.9],[54.7,2.0],[58.4,2.1],[61.4,2.2],[63.9,2.3],[65.9,2.3],[67.6,2.4],[69.2,2.4],[70.6,2.5],[72.0,2.5],[73.3,2.6],[74.5,2.6],[75.7,2.6],[76.9,2.7],[78.0,2.7],[79.1,2.8],[80.2,2.8],[81.2,2.8],[82.3,2.9],[83.2,2.9],[84.2,3.0],[85.1,3.0],[86.0,3.0],[86.9,3.1],[87.8,3.1],[88.0,3.2],[88.5,3.2],[89.0,3.2],[90.4,3.3],[91.2,3.3],[91.9,3.3],[92.7,3.4],[93.4,3.4],[94.1,3.4],[94.8,3.5],[95.4,3.5],[96.1,3.5],[96.7,3.6],[97.4,3.6],[98.0,3.6],[98.6,3.7],[99.2,3.7],[99.9,3.7],[100.4,3.8],[101.0,3.8],[101.6,3.8],[102.2,3.9],[102.8,3.9],[103.3,3.9],[103.9,4.0],[104.4,4.0],[105.0,4.0],[105.6,4.1],[106.1,4.1],[106.7,4.1],[107.2,4.2],[107.8,4.2],[108.3,4.2],[108.9,4.3],[109.4,4.3],[110.0,4.3]];
const HG=[[49.1,1.9],[53.7,1.9],[57.1,2.0],[59.8,2.1],[62.1,2.2],[64.0,2.2],[65.7,2.3],[67.3,2.3],[68.7,2.4],[70.1,2.4],[71.5,2.5],[72.8,2.5],[74.0,2.5],[75.2,2.6],[76.4,2.6],[77.5,2.7],[78.6,2.7],[79.7,2.7],[80.7,2.8],[81.7,2.8],[82.7,2.9],[83.7,2.9],[84.6,2.9],[85.5,3.0],[86.4,3.0],[87.4,3.0],[88.3,3.1],[89.3,3.1],[90.2,3.2],[91.2,3.2],[92.1,3.2],[93.0,3.3],[93.9,3.3],[94.8,3.3],[95.7,3.4],[96.5,3.4],[97.4,3.5],[98.2,3.5],[99.0,3.5],[99.8,3.6],[100.6,3.6],[101.4,3.6],[102.2,3.7],[102.9,3.7],[103.7,3.7],[104.4,3.8],[105.2,3.8],[105.9,3.8],[106.7,3.9],[107.4,3.9],[108.1,3.9],[108.9,4.0],[109.6,4.0],[110.3,4.0],[111.0,4.1],[111.7,4.1],[112.4,4.1],[113.1,4.2],[113.7,4.2],[114.4,4.2],[115.1,4.2]];
const WB={0:3.3,6:7.9,12:9.6,18:10.9,24:12.2,30:13.3,36:14.3,42:15.3,48:16.3,54:17.3,60:18.3};
const WG={0:3.2,6:7.3,12:8.9,18:10.2,24:11.5,30:12.7,36:13.9,42:15.0,48:16.1,54:17.2,60:18.2};

const whoH=(age,sex)=>(sex==='laki-laki'?HB:HG)[Math.min(Math.max(age|0,0),60)];
const haz=(age,sex,h)=>{const [m,s]=whoH(age,sex);return (h-m)/s;};
function whoW(age,sex){const t=sex==='laki-laki'?WB:WG;age=Math.min(age|0,60);const ks=Object.keys(t).map(Number);
  for(let i=0;i<ks.length-1;i++){if(ks[i]<=age&&age<=ks[i+1]){const lo=ks[i],hi=ks[i+1],f=(age-lo)/(hi-lo||1);return t[lo]+f*(t[hi]-t[lo]);}}return t[60];}

// ---- encoders (samakan dgn scikit-learn LabelEncoder) ----
const SEX={'laki-laki':0,'perempuan':1};
const GIZI={'Baik':0,'Buruk':1,'Sedang':2};
const CLASSES=['Normal','Severely Stunted','Stunted','Tinggi']; // urutan output ONNX [0,1,2,3]

const VERDICT={
 'Normal':{ico:'✅',cls:'v-normal',col:'#10E08C',title:'STATUS GIZI NORMAL',desc:'Pertumbuhan anak sesuai standar WHO untuk usianya.',
   reco:['Pertahankan pola makan seimbang dengan gizi lengkap','Pemeriksaan tumbuh kembang rutin di posyandu','Pastikan asupan protein, vitamin, dan mineral cukup','Berikan ASI eksklusif / MPASI bergizi','Pantau pertumbuhan setiap bulan']},
 'Stunted':{ico:'⚠️',cls:'v-stunted',col:'#FF9F40',title:'RISIKO STUNTING TERDETEKSI',desc:'Tinggi badan anak di bawah standar usianya. Perlu intervensi.',
   reco:['🏥 Segera konsultasi ke puskesmas atau dokter anak','🥗 Tingkatkan asupan protein hewani (telur, ikan, daging)','💊 Periksa kemungkinan defisiensi zat besi & zinc','🩺 Pantau tumbuh kembang setiap bulan','💧 Pastikan akses air bersih & sanitasi baik']},
 'Severely Stunted':{ico:'🚨',cls:'v-severe',col:'#FF5A6E',title:'RISIKO STUNTING BERAT',desc:'Tinggi badan sangat di bawah standar. SEGERA ke fasilitas kesehatan!',
   reco:['🚨 SEGERA bawa ke puskesmas/rumah sakit','🩺 Pemeriksaan medis lengkap diperlukan','🍽️ Program pemulihan gizi intensif','👨‍⚕️ Konsultasi ahli gizi & dokter anak','📋 Pemantauan rutin tenaga kesehatan']},
 'Tinggi':{ico:'🌟',cls:'v-tall',col:'#22D3EE',title:'TINGGI DI ATAS RATA-RATA',desc:'Tinggi badan di atas standar usianya — pertumbuhan sangat baik.',
   reco:['Pertumbuhan sangat baik, pertahankan!','Lanjutkan pola makan & gaya hidup sehat','Tetap lakukan pemeriksaan rutin','Pantau berat badan agar tetap seimbang']},
};

const FACTORS=[['📅','Umur Anak','Acuan standar pertumbuhan WHO per usia','28,7%'],['⚧','Jenis Kelamin','Standar WHO beda laki-laki & perempuan','1,3%'],['📐','Tinggi Badan','Indikator utama (Height-for-Age Z-Score)','50,6%'],['⚖️','Berat Badan','Indikator status gizi anak','9,5%'],['👶','Jarak Kehamilan','Ideal >24 bln (program BKKBN "4 Terlalu")','4,3%'],['💍','Usia Ibu Menikah','Pernikahan dini <20 thn = faktor risiko','4,2%'],['🍎','Gizi Ibu saat Hamil','KEK → BBLR → stunting','1,5%']];
const IMP=[['Tinggi Badan',50.6],['Umur',28.7],['Berat Badan',9.5],['Jarak Kehamilan',4.3],['Usia Ibu Menikah',4.2],['Gizi Ibu Hamil',1.5],['Jenis Kelamin',1.3]];
const SPEC=[['Algoritma','Random Forest Classifier'],['Jumlah Fitur','7 faktor'],['Jumlah Trees','120 trees'],['Max Depth','14 levels'],['Training Data','20.000 sampel (80%)'],['Test Accuracy','88,40%'],['F1-Score (Macro)','83,56%'],['Cross-Validation','84,11% ± 0,23%'],['Dataset Total','25.000 sampel']];
const ETH=[['🔒 Privacy','Data tidak dikirim/disimpan — inferensi 100% di browser'],['⚖️ Fairness','Disparitas <5% antar gender (1,84%)'],['🔍 Transparency','Confidence score & probabilitas selalu ditampilkan'],['🛡️ Safety','Disclaimer jelas: alat skrining, bukan diagnosis'],['🌐 Accessibility','Gratis, mobile-friendly, dapat jalan offline'],['📚 Education','Menampilkan Z-Score WHO & catatan faktor risiko']];

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const state={sex:'laki-laki',first:'Ya'};

// ---- populate static content ----
function fillStatic(){
  $('#factorGrid').innerHTML=FACTORS.map(([i,t,d,w])=>`<div class="factor"><div class="f-top"><b>${i} ${t}</b><span class="f-w">${w}</span></div><p>${d}</p></div>`).join('');
  $('#impBars').innerHTML=IMP.map(([f,v])=>`<div class="bar-item"><div class="bi-top"><b>${f}</b><span>${v.toString().replace('.',',')}%</span></div><div class="bar-track"><div class="bar-fill" style="width:${v/50.6*100}%"></div></div></div>`).join('');
  $('#specBody').innerHTML=SPEC.map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('');
  $('#ethGrid').innerHTML=ETH.map(([t,d])=>`<div class="eth"><b>${t}</b><p>${d}</p></div>`).join('');
}

// ---- tabs ----
$$('.tab').forEach(t=>t.addEventListener('click',()=>{
  $$('.tab').forEach(x=>x.classList.remove('active'));
  $$('.panel').forEach(x=>x.classList.remove('active'));
  t.classList.add('active'); $('#tab-'+t.dataset.tab).classList.add('active');
}));

// ---- segmented controls ----
$('#seg-sex').addEventListener('click',e=>{const b=e.target.closest('.seg-btn');if(!b)return;
  $$('#seg-sex .seg-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.sex=b.dataset.v;updateWho();});
$('#seg-first').addEventListener('click',e=>{const b=e.target.closest('.seg-btn');if(!b)return;
  $$('#seg-first .seg-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.first=b.dataset.v;
  $('#jarak-wrap').style.display=state.first==='Tidak'?'flex':'none';});

['umur','tinggi'].forEach(id=>$('#'+id).addEventListener('input',updateWho));
function updateWho(){const a=+$('#umur').value||0;const [m]=whoH(a,state.sex);
  $('#whoRef').innerHTML=`📊 Referensi WHO: median tinggi anak ${a} bulan (${state.sex}) = <b>${m.toFixed(1).replace('.',',')} cm</b>`;}

// ---- ONNX model ----
let session=null;
async function loadModel(){
  try{
    if(typeof ort==='undefined') throw new Error('ONNX runtime gagal dimuat');
    ort.env.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.20.1/dist/';
    session=await ort.InferenceSession.create('model.onnx',{executionProviders:['wasm']});
    setStatus('ready','Model AI siap ⚡');
    $('#predictBtn').disabled=false; $('#predictLabel').textContent='🔍 Analisis Risiko Stunting';
  }catch(err){
    console.error(err);
    setStatus('error','Model gagal dimuat');
    $('#predictLabel').textContent='⚠️ Model tidak tersedia';
  }
}
function setStatus(cls,txt){const p=$('#modelStatus');p.className='model-pill '+cls;$('#modelStatusText').textContent=txt;}

// ---- predict ----
$('#predictBtn').addEventListener('click',async()=>{
  if(!session)return;
  const umur=+$('#umur').value||0, tinggi=+$('#tinggi').value||0, berat=+$('#berat').value||0;
  const usiaIbu=+$('#usiaIbu').value||0, gizi=$('#gizi').value;
  const jarak=state.first==='Tidak'?(+$('#jarak').value||0):0;
  const feat=Float32Array.from([umur,SEX[state.sex],tinggi,berat,jarak,usiaIbu,GIZI[gizi]]);
  try{
    $('#predictLabel').textContent='⏳ Menghitung…';
    const out=await session.run({float_input:new ort.Tensor('float32',feat,[1,7])});
    const proba=Array.from(out.probabilities.data);
    render({umur,tinggi,berat,usiaIbu,gizi,jarak,proba});
    $('#predictLabel').textContent='🔍 Analisis Risiko Stunting';
  }catch(err){console.error(err);alert('Terjadi kesalahan saat menganalisis. Coba lagi.');$('#predictLabel').textContent='🔍 Analisis Risiko Stunting';}
});

function render({umur,tinggi,berat,usiaIbu,gizi,jarak,proba}){
  const idx=proba.indexOf(Math.max(...proba));
  const status=CLASSES[idx], conf=(proba[idx]*100), v=VERDICT[status];
  const z=haz(umur,state.sex,tinggi), [m]=whoH(umur,state.sex);
  const nama=($('#nama').value||'').trim();

  // probability rows sorted desc
  const order=proba.map((p,i)=>[CLASSES[i],p]).sort((a,b)=>b[1]-a[1]);
  const probaRows=order.map(([c,p])=>`<div class="proba-row"><div class="pr-top"><b>${c}</b><span>${(p*100).toFixed(1).replace('.',',')}%</span></div><div class="bar-track"><div class="bar-fill" data-w="${p*100}" style="background:${VERDICT[c].col}"></div></div></div>`).join('');

  // risk notes
  const notes=[];
  if(berat<whoW(umur,state.sex)*0.80) notes.push('⚠️ Berat badan di bawah standar usia (risiko gizi kurang)');
  if(jarak>0&&jarak<24) notes.push('⚠️ Jarak kehamilan < 24 bln (ideal >24)');
  if(usiaIbu<20) notes.push('⚠️ Ibu menikah usia dini (<20 thn)');
  if(gizi==='Buruk') notes.push('⚠️ Gizi ibu saat hamil buruk (risiko KEK)');
  else if(gizi==='Sedang') notes.push('• Gizi ibu saat hamil sedang');
  if(z<-2) notes.push('⚠️ Tinggi badan di bawah standar WHO');
  if(!notes.length) notes.push('✅ Tidak ada faktor risiko maternal signifikan');

  const dataRows=[
    ['Nama Anak',nama||'-'],
    ['Umur',`${umur} bln (${Math.floor(umur/12)} thn ${umur%12} bln)`],
    ['Jenis Kelamin',state.sex.charAt(0).toUpperCase()+state.sex.slice(1)],
    ['Tinggi Badan',`${tinggi} cm (median WHO ${m.toFixed(1).replace('.',',')})`],
    ['Berat Badan',`${berat} kg`],
    ['Z-Score (HAZ)',`${z>=0?'+':''}${z.toFixed(2).replace('.',',')} SD`],
    ['Jarak Kehamilan',jarak>0?`${jarak} bulan`:'Anak pertama'],
    ['Usia Ibu Menikah',`${usiaIbu} tahun`],
    ['Gizi Ibu Hamil',gizi],
  ].map(([a,b])=>`<tr><td>${a}</td><td>${b}</td></tr>`).join('');

  $('#resultEmpty').hidden=true;
  const el=$('#resultContent'); el.hidden=false;
  el.innerHTML=`
    <div class="verdict ${v.cls}">
      <div class="v-ico">${v.ico}</div><h2>${v.title}</h2><p>${v.desc}</p>
    </div>
    <div class="conf-ring">
      <div class="ring" style="--p:${conf};background:radial-gradient(closest-side,#081A12 78%,transparent 79% 100%),conic-gradient(${v.col} ${conf}%,rgba(255,255,255,.08) 0)"><span>${conf.toFixed(0)}%</span></div>
      <div class="conf-txt"><b>Tingkat Keyakinan AI</b><p>Model Random Forest memprediksi kategori <b style="color:${v.col}">${status}</b> dengan keyakinan ${conf.toFixed(1).replace('.',',')}%.</p></div>
    </div>
    <h4 style="font-family:'Space Grotesk';margin:.2rem 0 .5rem">📊 Probabilitas Tiap Kategori</h4>
    <div class="proba-list">${probaRows}</div>
    <h4 style="font-family:'Space Grotesk';margin:.2rem 0 .5rem">📋 Data yang Dianalisis (7 Faktor)</h4>
    <table class="data-table"><tbody>${dataRows}</tbody></table>
    <div class="notes-box"><h4>🔬 Catatan Faktor Risiko</h4><ul>${notes.map(n=>`<li>${n}</li>`).join('')}</ul></div>
    <div class="reco-box"><h4>💡 Rekomendasi Tindak Lanjut</h4><ul>${v.reco.map(r=>`<li>${r}</li>`).join('')}</ul></div>
    <p class="disclaimer">⚠️ Hasil ini alat skrining awal, BUKAN diagnosis medis. Akurasi model 88,40%. Konsultasikan dengan dokter anak / ahli gizi.</p>`;
  // animate probability bars
  requestAnimationFrame(()=>{requestAnimationFrame(()=>{el.querySelectorAll('.bar-fill').forEach(b=>{b.style.width=(b.dataset.w||0)+'%';});});});
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}

fillStatic(); updateWho(); loadModel();
