# -*- coding: utf-8 -*-
"""Train & validate the Random Forest on the REAL Indonesian stunting dataset,
benchmark against other algorithms, and produce result/testing graphics.

Dataset: "Stunting Toddler (Balita) Detection" (Indonesia, berbasis WHO Child
Growth Standards) — fitur: Umur (bulan), Jenis Kelamin, Tinggi Badan (cm) →
Status Gizi (Normal / Stunted / Severely Stunted / Tinggi).
"""
import json, warnings, joblib
warnings.filterwarnings("ignore")
import numpy as np, pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (accuracy_score, f1_score, precision_score, recall_score,
                             confusion_matrix, classification_report, precision_recall_fscore_support)

GREEN = "#039855"; sns.set_style("whitegrid")
ORDER = ["Normal", "Stunted", "Severely Stunted", "Tinggi"]  # display order
LABELMAP = {"normal": "Normal", "stunted": "Stunted",
            "severely stunted": "Severely Stunted", "tinggi": "Tinggi"}

df = pd.read_csv("dataset_stunting_real.csv")
df["Status Gizi"] = df["Status Gizi"].str.strip().str.lower().map(LABELMAP)
df = df.dropna(subset=["Status Gizi"])
print("Dataset real:", df.shape)

le_sex = LabelEncoder(); df["Jenis_Kelamin_Enc"] = le_sex.fit_transform(df["Jenis Kelamin"])
le_status = LabelEncoder(); df["Status_Enc"] = le_status.fit_transform(df["Status Gizi"])
classes = list(le_status.classes_)

FEATURES = ["Umur (bulan)", "Jenis_Kelamin_Enc", "Tinggi Badan (cm)"]
X = df[FEATURES]; y = df["Status_Enc"]
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
print(f"Train {len(Xtr)} | Test {len(Xte)}")

rf = RandomForestClassifier(n_estimators=120, max_depth=14, min_samples_leaf=6,
                            min_samples_split=12, max_features="sqrt",
                            class_weight="balanced", random_state=42, n_jobs=-1)
rf.fit(Xtr, ytr)
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
cv = cross_val_score(rf, Xtr, ytr, cv=skf, scoring="accuracy")
yp = rf.predict(Xte)

acc = accuracy_score(yte, yp) * 100
f1 = f1_score(yte, yp, average="macro") * 100
prec = precision_score(yte, yp, average="macro") * 100
rec = recall_score(yte, yp, average="macro") * 100
cvm, cvs = cv.mean() * 100, cv.std() * 100
print(f"RF real → Acc {acc:.2f}  F1 {f1:.2f}  CV {cvm:.2f}±{cvs:.2f}")

# ---- Benchmark vs other algorithms ----
models = {
    "Random Forest": rf,
    "Decision Tree": DecisionTreeClassifier(max_depth=14, random_state=42),
    "Logistic Reg.": LogisticRegression(max_iter=1000),
    "KNN (k=7)": KNeighborsClassifier(n_neighbors=7),
    "Naive Bayes": GaussianNB(),
}
bench = {}
for name, m in models.items():
    if name != "Random Forest":
        m.fit(Xtr, ytr)
    p = m.predict(Xte)
    bench[name] = {"acc": accuracy_score(yte, p) * 100, "f1": f1_score(yte, p, average="macro") * 100}
    print(f"  {name:16s} acc {bench[name]['acc']:.2f}  f1 {bench[name]['f1']:.2f}")

idx_order = [classes.index(c) for c in ORDER]

# ---- 1) Confusion matrix (real) ----
cm = confusion_matrix(yte, yp)
cm_disp = cm[np.ix_(idx_order, idx_order)]
plt.figure(figsize=(7, 5.6))
sns.heatmap(cm_disp, annot=True, fmt="d", cmap="Greens",
            xticklabels=ORDER, yticklabels=ORDER, annot_kws={"size": 12, "weight": "bold"})
plt.title("Confusion Matrix — Random Forest (Dataset Real)", fontweight="bold")
plt.ylabel("Aktual"); plt.xlabel("Prediksi"); plt.tight_layout()
plt.savefig("real_confusion_matrix.png", dpi=130, bbox_inches="tight"); plt.close()

# ---- 2) Feature importance (real) ----
fi = pd.Series(rf.feature_importances_ * 100, index=["Tinggi Badan", "Umur", "Jenis Kelamin"]
               if False else ["Umur", "Jenis Kelamin", "Tinggi Badan"]).sort_values()
plt.figure(figsize=(7.5, 4))
plt.barh(fi.index, fi.values, color=GREEN)
for i, v in enumerate(fi.values):
    plt.text(v + 0.5, i, f"{v:.1f}%", va="center", fontweight="bold")
plt.title("Feature Importance — Dataset Real", fontweight="bold")
plt.xlabel("Kontribusi (%)"); plt.xlim(0, max(fi.values) * 1.18); plt.tight_layout()
plt.savefig("real_feature_importance.png", dpi=130, bbox_inches="tight"); plt.close()

# ---- 3) Class distribution ----
dist = df["Status Gizi"].value_counts().reindex(ORDER)
plt.figure(figsize=(7.5, 4))
bars = plt.bar(ORDER, dist.values, color=["#28A745", "#FF8500", "#DC3545", "#014A2F"])
for b, v in zip(bars, dist.values):
    plt.text(b.get_x() + b.get_width() / 2, v + 150, f"{v:,}", ha="center", fontweight="bold", fontsize=9)
plt.title("Distribusi Kelas — Dataset Real (55.367 sampel)", fontweight="bold")
plt.ylabel("Jumlah sampel"); plt.tight_layout()
plt.savefig("real_class_distribution.png", dpi=130, bbox_inches="tight"); plt.close()

# ---- 4) Benchmark bar chart ----
names = list(bench.keys())
accs = [bench[n]["acc"] for n in names]; f1s = [bench[n]["f1"] for n in names]
xpos = np.arange(len(names)); w = 0.38
plt.figure(figsize=(8.5, 4.6))
plt.bar(xpos - w / 2, accs, w, label="Accuracy", color=GREEN)
plt.bar(xpos + w / 2, f1s, w, label="F1-Score (macro)", color="#FF8500")
for i, (a, f) in enumerate(zip(accs, f1s)):
    plt.text(i - w / 2, a + 0.4, f"{a:.1f}", ha="center", fontsize=8, fontweight="bold")
    plt.text(i + w / 2, f + 0.4, f"{f:.1f}", ha="center", fontsize=8, fontweight="bold")
plt.xticks(xpos, names, rotation=15); plt.ylim(0, 105)
plt.title("Benchmarking Algoritma — Dataset Real", fontweight="bold")
plt.ylabel("Skor (%)"); plt.legend(); plt.tight_layout()
plt.savefig("real_benchmark.png", dpi=130, bbox_inches="tight"); plt.close()

# ---- 5) Per-class metrics (testing graphic) ----
pr, rc, f1c, sup = precision_recall_fscore_support(yte, yp, labels=idx_order)
xpos = np.arange(len(ORDER)); w = 0.26
plt.figure(figsize=(8.5, 4.6))
plt.bar(xpos - w, pr * 100, w, label="Precision", color="#06A357")
plt.bar(xpos, rc * 100, w, label="Recall", color="#2ECC71")
plt.bar(xpos + w, f1c * 100, w, label="F1-Score", color="#FF8500")
plt.xticks(xpos, ORDER); plt.ylim(0, 105)
plt.title("Metrik per Kelas — Pengujian Model (Dataset Real)", fontweight="bold")
plt.ylabel("Skor (%)"); plt.legend(); plt.tight_layout()
plt.savefig("real_per_class_metrics.png", dpi=130, bbox_inches="tight"); plt.close()

joblib.dump(rf, "model_stunting_real.pkl", compress=9)

metrics = {
    "n_samples": int(len(df)), "n_train": int(len(Xtr)), "n_test": int(len(Xte)),
    "features": ["Umur (bulan)", "Jenis Kelamin", "Tinggi Badan (cm)"],
    "classes": ORDER,
    "accuracy": round(acc, 2), "f1_macro": round(f1, 2),
    "precision_macro": round(prec, 2), "recall_macro": round(rec, 2),
    "cv_mean": round(cvm, 2), "cv_std": round(cvs, 2),
    "benchmark": {n: {"acc": round(v["acc"], 2), "f1": round(v["f1"], 2)} for n, v in bench.items()},
    "class_distribution": {c: int(dist[c]) for c in ORDER},
    "report": classification_report(yte, yp, target_names=[classes[i] for i in range(len(classes))], digits=3),
}
json.dump(metrics, open("real_metrics.json", "w"), indent=2)
print("Saved graphics + real_metrics.json + model_stunting_real.pkl")
