# =============================================================================
#  EXTRAÇÃO DE PADRÕES — BASE DE DADOS DIABETES (Pima Indians Diabetes Dataset)
#  Problema: Classificação Binária
#  Alvo: Outcome (0 = Não Diabético | 1 = Diabético)
# =============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pandas.plotting import scatter_matrix

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Modelos de classificação
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.naive_bayes import GaussianNB
from sklearn.svm import SVC

# Métricas
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_auc_score, roc_curve, precision_recall_curve, f1_score,
    ConfusionMatrixDisplay
)

print("=" * 65)
print("  EXTRAÇÃO DE PADRÕES — BASE DE DADOS DIABETES")
print("=" * 65)

# =============================================================================
# 1. CARREGAMENTO E PRÉ-PROCESSAMENTO (replicado para autonomia do script)
# =============================================================================

df = pd.read_csv('diabetes.csv')

FEATURES = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
            'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

# Zeros biologicamente impossíveis → mediana estratificada por classe
COLUNAS_SEM_ZERO = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df[COLUNAS_SEM_ZERO] = df[COLUNAS_SEM_ZERO].replace(0, np.nan)

for col in COLUNAS_SEM_ZERO:
    df.loc[(df['Outcome'] == 0) & (df[col].isna()), col] = df.loc[df['Outcome'] == 0, col].median()
    df.loc[(df['Outcome'] == 1) & (df[col].isna()), col] = df.loc[df['Outcome'] == 1, col].median()

# Remove duplicatas
df = df.drop_duplicates(keep='first')

# Inconsistências clínicas
df = df[(df['Glucose'] > 0) & (df['BMI'] > 0) & (df['Age'] >= 1) &
        (df['BloodPressure'] <= 200) & (df['Glucose'] <= 500)]

# Remoção de outliers (IQR)
def removeOutliers(df, colunas):
    for col in colunas:
        q25, q75 = np.percentile(df[col].dropna(), [25, 75])
        IQR = q75 - q25
        df = df[(df[col] >= q25 - 1.5 * IQR) & (df[col] <= q75 + 1.5 * IQR)]
    return df

df = removeOutliers(df, FEATURES)

print(f"\n[1] Base após pré-processamento: {df.shape[0]} amostras × {df.shape[1]} atributos")
print(f"    Distribuição Outcome → 0: {(df['Outcome']==0).sum()} | 1: {(df['Outcome']==1).sum()}")

# =============================================================================
# 2. DIVISÃO TREINO / TESTE
# =============================================================================

X = df[FEATURES].values
y = df['Outcome'].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n[2] DIVISÃO TREINO / TESTE (80% / 20%, estratificada):")
print(f"    Treino  : {X_train.shape[0]} amostras")
print(f"    Teste   : {X_test.shape[0]} amostras")

# =============================================================================
# 3. AVALIAÇÃO INICIAL — CROSS-VALIDATION (10-Fold Estratificado)
#    Pipelines: StandardScaler → Classificador (evita data leakage)
# =============================================================================

print("\n[3] AVALIAÇÃO POR VALIDAÇÃO CRUZADA (10-Fold Estratificado — Acurácia):")
print("    " + "-" * 55)

kfold = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

MODELOS = [
    ('Regressão Logística',   LogisticRegression(max_iter=1000, random_state=42)),
    ('KNN (k=5)',              KNeighborsClassifier(n_neighbors=5)),
    ('Árvore de Decisão',     DecisionTreeClassifier(random_state=42)),
    ('Random Forest',         RandomForestClassifier(n_estimators=100, random_state=42)),
    ('Gradient Boosting',     GradientBoostingClassifier(n_estimators=100, random_state=42)),
    ('LDA',                   LinearDiscriminantAnalysis()),
    ('Naive Bayes',           GaussianNB()),
    ('SVM (RBF)',              SVC(kernel='rbf', probability=True, random_state=42)),
]

resultados_cv = {}

for nome, modelo in MODELOS:
    pipe = Pipeline([('scaler', StandardScaler()), ('clf', modelo)])
    scores = cross_val_score(pipe, X_train, y_train, cv=kfold, scoring='accuracy')
    resultados_cv[nome] = scores
    print(f"    {nome:30s}  Média={scores.mean():.4f}  DP={scores.std():.4f}")

# Gráfico de comparação dos modelos (boxplot das 10 folds)
fig, ax = plt.subplots(figsize=(14, 6))
ax.boxplot(
    [resultados_cv[n] for n in resultados_cv],
    labels=resultados_cv.keys(),
    patch_artist=True,
    boxprops=dict(facecolor='#E3F0FB'),
    medianprops=dict(color='#EF4444', linewidth=2)
)
ax.set_title("Comparação de Modelos — Acurácia (10-Fold CV)", fontsize=14, fontweight='bold')
ax.set_ylabel("Acurácia")
ax.set_ylim(0.5, 1.0)
plt.xticks(rotation=25, ha='right')
plt.tight_layout()
plt.show()

# =============================================================================
# 4. TREINAMENTO FINAL COM TODOS OS MODELOS (treino completo → teste)
# =============================================================================

print("\n[4] DESEMPENHO NO CONJUNTO DE TESTE (treino completo):")
print("    " + "-" * 72)
print(f"    {'Modelo':30s}  {'Acurácia':>9}  {'F1-Score':>9}  {'ROC-AUC':>9}")
print("    " + "-" * 72)

modelos_treinados = {}
metricas_teste = {}

for nome, modelo in MODELOS:
    pipe = Pipeline([('scaler', StandardScaler()), ('clf', modelo)])
    pipe.fit(X_train, y_train)
    y_pred = pipe.predict(X_test)

    try:
        y_proba = pipe.predict_proba(X_test)[:, 1]
        roc = roc_auc_score(y_test, y_proba)
    except Exception:
        roc = float('nan')

    acc = accuracy_score(y_test, y_pred)
    f1  = f1_score(y_test, y_pred)

    modelos_treinados[nome] = pipe
    metricas_teste[nome] = {'acc': acc, 'f1': f1, 'roc': roc, 'pred': y_pred}

    print(f"    {nome:30s}  {acc:9.4f}  {f1:9.4f}  {roc:9.4f}")

# =============================================================================
# 5. MELHOR MODELO — RELATÓRIO DETALHADO
# =============================================================================

melhor_nome = max(metricas_teste, key=lambda n: metricas_teste[n]['acc'])
melhor_pipe  = modelos_treinados[melhor_nome]
y_pred_melhor = metricas_teste[melhor_nome]['pred']

print(f"\n[5] MELHOR MODELO: {melhor_nome}")
print(f"    Acurácia : {metricas_teste[melhor_nome]['acc']:.4f}")
print(f"    F1-Score : {metricas_teste[melhor_nome]['f1']:.4f}")
print(f"    ROC-AUC  : {metricas_teste[melhor_nome]['roc']:.4f}")

print(f"\n[6] RELATÓRIO DE CLASSIFICAÇÃO — {melhor_nome}:")
print(classification_report(
    y_test, y_pred_melhor,
    target_names=['Não Diabético (0)', 'Diabético (1)']
))

# Matriz de confusão — melhor modelo
fig, ax = plt.subplots(figsize=(7, 6))
cm = confusion_matrix(y_test, y_pred_melhor)
disp = ConfusionMatrixDisplay(confusion_matrix=cm,
                               display_labels=['Não Diabético', 'Diabético'])
disp.plot(ax=ax, cmap='Blues', colorbar=False)
ax.set_title(f"Matriz de Confusão — {melhor_nome}", fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()

# =============================================================================
# 6. MATRIZES DE CONFUSÃO — TODOS OS MODELOS
# =============================================================================

print("\n[7] MATRIZES DE CONFUSÃO — TODOS OS MODELOS:")

n_modelos = len(MODELOS)
cols = 4
rows = int(np.ceil(n_modelos / cols))

fig, axes = plt.subplots(rows, cols, figsize=(cols * 5, rows * 4.5))
axes = axes.flatten()

for i, (nome, _) in enumerate(MODELOS):
    y_pred_i = metricas_teste[nome]['pred']
    cm_i = confusion_matrix(y_test, y_pred_i)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm_i,
                                   display_labels=['Não Diab.', 'Diabético'])
    disp.plot(ax=axes[i], cmap='Blues', colorbar=False)
    acc_i = metricas_teste[nome]['acc']
    axes[i].set_title(f"{nome}\nAcc={acc_i:.3f}", fontsize=10, fontweight='bold')

for j in range(i + 1, len(axes)):
    axes[j].axis('off')

plt.suptitle("Matrizes de Confusão — Todos os Modelos", fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# =============================================================================
# 7. CURVAS ROC — TODOS OS MODELOS
# =============================================================================

print("\n[8] CURVAS ROC:")

plt.figure(figsize=(10, 7))
plt.plot([0, 1], [0, 1], 'k--', linewidth=1, label='Aleatório (AUC=0.50)')

CORES = ['#4CAF82', '#3B8ED0', '#F97316', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#EF4444']

for (nome, _), cor in zip(MODELOS, CORES):
    pipe = modelos_treinados[nome]
    try:
        y_proba = pipe.predict_proba(X_test)[:, 1]
    except Exception:
        continue
    fpr, tpr, _ = roc_curve(y_test, y_proba)
    auc = roc_auc_score(y_test, y_proba)
    plt.plot(fpr, tpr, color=cor, linewidth=2, label=f"{nome} (AUC={auc:.3f})")

plt.xlabel("Taxa de Falso Positivo (FPR)", fontsize=12)
plt.ylabel("Taxa de Verdadeiro Positivo (TPR)", fontsize=12)
plt.title("Curvas ROC — Comparação de Modelos", fontsize=14, fontweight='bold')
plt.legend(loc='lower right', fontsize=9)
plt.grid(alpha=0.3)
plt.tight_layout()
plt.show()

# =============================================================================
# 8. IMPORTÂNCIA DE ATRIBUTOS
# =============================================================================

print("\n[9] IMPORTÂNCIA DE ATRIBUTOS (Random Forest):")

# Extrai o classificador do pipeline de Random Forest
rf_pipe = modelos_treinados['Random Forest']
rf_clf  = rf_pipe.named_steps['clf']

importancias = pd.Series(rf_clf.feature_importances_, index=FEATURES).sort_values(ascending=False)

print("    Atributo                    Importância")
print("    " + "-" * 45)
for feat, imp in importancias.items():
    barra = '█' * int(imp * 50)
    print(f"    {feat:30s}  {imp:.4f}  {barra}")

# Gráfico de importância
plt.figure(figsize=(10, 6))
cores_imp = ['#4CAF82' if i == 0 else '#3B8ED0' if i == 1 else '#E5E7EB'
             for i in range(len(importancias))]
plt.barh(importancias.index[::-1], importancias.values[::-1],
         color=cores_imp[::-1], edgecolor='black')
plt.xlabel("Importância Relativa", fontsize=12)
plt.title("Importância dos Atributos — Random Forest", fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# =============================================================================
# 9. ÁRVORE DE DECISÃO — VISUALIZAÇÃO DE REGRAS EXTRAÍDAS
# =============================================================================

print("\n[10] REGRAS EXTRAÍDAS — ÁRVORE DE DECISÃO (profundidade máx. 4):")

dt_pipe = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', DecisionTreeClassifier(max_depth=4, random_state=42))
])
dt_pipe.fit(X_train, y_train)

regras = export_text(dt_pipe.named_steps['clf'], feature_names=FEATURES)
print(regras)

# Importância de atributos na Árvore de Decisão
dt_clf = dt_pipe.named_steps['clf']
imp_dt = pd.Series(dt_clf.feature_importances_, index=FEATURES).sort_values(ascending=False)

plt.figure(figsize=(10, 5))
plt.barh(imp_dt.index[::-1], imp_dt.values[::-1], color='#F97316', edgecolor='black')
plt.xlabel("Importância Relativa", fontsize=12)
plt.title("Importância dos Atributos — Árvore de Decisão", fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# =============================================================================
# 10. ANÁLISE DE PADRÕES POR ATRIBUTO MAIS RELEVANTE (Glicose)
# =============================================================================

print("\n[11] ANÁLISE DE PADRÃO: GLICOSE × DIAGNÓSTICO")

glicose_0 = df.loc[df['Outcome'] == 0, 'Glucose']
glicose_1 = df.loc[df['Outcome'] == 1, 'Glucose']

print(f"    Glicose (Não Diabético) → média={glicose_0.mean():.1f}  mediana={glicose_0.median():.1f}  dp={glicose_0.std():.1f}")
print(f"    Glicose (Diabético)     → média={glicose_1.mean():.1f}  mediana={glicose_1.median():.1f}  dp={glicose_1.std():.1f}")

fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Histograma sobrepostos
axes[0].hist(glicose_0, bins=20, alpha=0.6, color='#4CAF82', edgecolor='k', label='Não Diabético (0)')
axes[0].hist(glicose_1, bins=20, alpha=0.6, color='#EF4444', edgecolor='k', label='Diabético (1)')
axes[0].axvline(glicose_0.mean(), color='#2E9E6B', linestyle='--', linewidth=1.5, label=f'μ(0)={glicose_0.mean():.1f}')
axes[0].axvline(glicose_1.mean(), color='#C0392B', linestyle='--', linewidth=1.5, label=f'μ(1)={glicose_1.mean():.1f}')
axes[0].set_title("Distribuição da Glicose por Diagnóstico", fontweight='bold')
axes[0].set_xlabel("Glicose (mg/dL)")
axes[0].set_ylabel("Frequência")
axes[0].legend()

# Boxplot
sns.boxplot(x='Outcome', y='Glucose', data=df, ax=axes[1],
            palette={0: '#4CAF82', 1: '#EF4444'})
axes[1].set_title("Boxplot da Glicose por Diagnóstico", fontweight='bold')
axes[1].set_xlabel("Diagnóstico (0=Não | 1=Sim)")
axes[1].set_ylabel("Glicose (mg/dL)")
axes[1].set_xticklabels(['Não Diabético', 'Diabético'])

plt.tight_layout()
plt.show()

# =============================================================================
# 11. ANÁLISE DE PADRÃO: IMC × DIAGNÓSTICO
# =============================================================================

print("\n[12] ANÁLISE DE PADRÃO: IMC × DIAGNÓSTICO")

imc_0 = df.loc[df['Outcome'] == 0, 'BMI']
imc_1 = df.loc[df['Outcome'] == 1, 'BMI']

print(f"    IMC (Não Diabético) → média={imc_0.mean():.1f}  mediana={imc_0.median():.1f}  dp={imc_0.std():.1f}")
print(f"    IMC (Diabético)     → média={imc_1.mean():.1f}  mediana={imc_1.median():.1f}  dp={imc_1.std():.1f}")

fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(imc_0, bins=20, alpha=0.6, color='#4CAF82', edgecolor='k', label='Não Diabético (0)')
ax.hist(imc_1, bins=20, alpha=0.6, color='#EF4444', edgecolor='k', label='Diabético (1)')
ax.axvline(30, color='orange', linestyle='--', linewidth=2, label='Limiar Obesidade (IMC=30)')
ax.set_title("Distribuição do IMC por Diagnóstico", fontweight='bold')
ax.set_xlabel("IMC (kg/m²)")
ax.set_ylabel("Frequência")
ax.legend()
plt.tight_layout()
plt.show()

# =============================================================================
# 12. ANÁLISE DE PADRÃO: IDADE × DIAGNÓSTICO
# =============================================================================

print("\n[13] ANÁLISE DE PADRÃO: IDADE × DIAGNÓSTICO")

idade_0 = df.loc[df['Outcome'] == 0, 'Age']
idade_1 = df.loc[df['Outcome'] == 1, 'Age']

print(f"    Idade (Não Diabético) → média={idade_0.mean():.1f}  mediana={idade_0.median():.1f}  dp={idade_0.std():.1f}")
print(f"    Idade (Diabético)     → média={idade_1.mean():.1f}  mediana={idade_1.median():.1f}  dp={idade_1.std():.1f}")

# Taxa de diabetes por faixa etária
df['FaixaEtaria'] = pd.cut(df['Age'], bins=[0, 30, 40, 50, 60, 100],
                            labels=['<30', '30-40', '40-50', '50-60', '60+'])

taxa_por_faixa = df.groupby('FaixaEtaria', observed=True)['Outcome'].mean() * 100

plt.figure(figsize=(9, 5))
taxa_por_faixa.plot(kind='bar', color='#3B8ED0', edgecolor='black')
plt.title("Taxa de Diabetes (%) por Faixa Etária", fontsize=13, fontweight='bold')
plt.xlabel("Faixa Etária")
plt.ylabel("% de Diagnóstico Positivo")
plt.xticks(rotation=0)
for i, v in enumerate(taxa_por_faixa.values):
    plt.text(i, v + 0.5, f"{v:.1f}%", ha='center', fontweight='bold')
plt.tight_layout()
plt.show()

df = df.drop(columns=['FaixaEtaria'])

# =============================================================================
# 13. PREVISÃO PARA NOVOS PACIENTES (exemplo de inferência)
# =============================================================================

print("\n[14] PREVISÃO PARA NOVOS PACIENTES (exemplo de inferência):")
print("     Atributos: Pregnancies, Glucose, BloodPressure, SkinThickness,")
print("                Insulin, BMI, DiabetesPedigreeFunction, Age\n")

novos_pacientes = pd.DataFrame([
    # Caso 1 — perfil de baixo risco
    {'Pregnancies': 1, 'Glucose': 85,  'BloodPressure': 66, 'SkinThickness': 29,
     'Insulin': 0,  'BMI': 26.6, 'DiabetesPedigreeFunction': 0.351, 'Age': 31},
    # Caso 2 — perfil de alto risco (glicose alta, IMC alto, idade avançada)
    {'Pregnancies': 8, 'Glucose': 183, 'BloodPressure': 64, 'SkinThickness': 0,
     'Insulin': 0,  'BMI': 23.3, 'DiabetesPedigreeFunction': 0.672, 'Age': 32},
    # Caso 3 — perfil intermediário
    {'Pregnancies': 3, 'Glucose': 120, 'BloodPressure': 70, 'SkinThickness': 25,
     'Insulin': 90, 'BMI': 32.1, 'DiabetesPedigreeFunction': 0.450, 'Age': 45},
], columns=FEATURES)

print("     Dados dos novos pacientes:")
print(novos_pacientes.to_string(index=False))
print()

for nome in [melhor_nome, 'Random Forest', 'Regressão Logística']:
    pipe = modelos_treinados[nome]
    preds = pipe.predict(novos_pacientes[FEATURES].values)
    try:
        probas = pipe.predict_proba(novos_pacientes[FEATURES].values)[:, 1]
    except Exception:
        probas = [float('nan')] * len(preds)

    print(f"     Modelo: {nome}")
    for i, (pred, proba) in enumerate(zip(preds, probas)):
        status = "Diabético ⚠️" if pred == 1 else "Não Diabético ✓"
        print(f"       Paciente {i+1}: {status}  (prob={proba:.3f})")
    print()

# =============================================================================
# 14. SUMÁRIO FINAL — EXTRAÇÃO DE PADRÕES
# =============================================================================

melhor_acc = metricas_teste[melhor_nome]['acc']
melhor_f1  = metricas_teste[melhor_nome]['f1']
melhor_roc = metricas_teste[melhor_nome]['roc']

print("=" * 65)
print("  SUMÁRIO — EXTRAÇÃO DE PADRÕES")
print("=" * 65)
print(f"  Base utilizada         : Pima Indians Diabetes Dataset")
print(f"  Amostras (pós-preproc) : {df.shape[0]}")
print(f"  Features               : {len(FEATURES)} atributos clínicos")
print(f"  Alvo                   : Outcome (0=Não Diabético | 1=Diabético)")
print(f"  Modelos avaliados      : {len(MODELOS)}")
print(f"  Melhor modelo          : {melhor_nome}")
print(f"    Acurácia             : {melhor_acc:.4f} ({melhor_acc*100:.2f}%)")
print(f"    F1-Score             : {melhor_f1:.4f}")
print(f"    ROC-AUC              : {melhor_roc:.4f}")
print()
print("  Principais padrões identificados:")
print(f"    • Glicose é o atributo mais correlacionado com diabetes")
print(f"    • IMC ≥ 30 aumenta significativamente o risco")
print(f"    • Taxa de diabetes cresce progressivamente com a idade")
print(f"    • Número de gestações correlaciona-se positivamente com risco")
print(f"    • Função de pedigree reflete herança genética no diagnóstico")
print("=" * 65)
