# =============================================================================
#  PRÉ-PROCESSAMENTO — BASE DE DADOS DIABETES (Pima Indians Diabetes Dataset)
#  Alvo: Outcome (0 = Não Diabético | 1 = Diabético)
# =============================================================================

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import plotly.express as px
from pandas.plotting import scatter_matrix
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# =============================================================================
# 1. CARREGAMENTO DA BASE DE DADOS
# =============================================================================

df = pd.read_csv('diabetes.csv')

# Nomes das colunas em português para facilitar interpretação
COLUNAS_PT = {
    'Pregnancies':              'Gestações',
    'Glucose':                  'Glicose',
    'BloodPressure':            'PressãoArterial',
    'SkinThickness':            'EspessuraPele',
    'Insulin':                  'Insulina',
    'BMI':                      'IMC',
    'DiabetesPedigreeFunction': 'FunçãoPedigree',
    'Age':                      'Idade',
    'Outcome':                  'Diagnóstico',
}

# Mantém os nomes originais para compatibilidade; o dicionário serve apenas
# como referência clínica durante a análise.

print("=" * 65)
print("  PRÉ-PROCESSAMENTO — BASE DE DADOS DIABETES")
print("=" * 65)

# =============================================================================
# 2. INSPEÇÃO INICIAL
# =============================================================================

print("\n[1] COLUNAS DA BASE:")
print(df.columns.tolist())

print("\n[2] PRIMEIRAS 5 AMOSTRAS:")
print(df.head())

print("\n[3] DIMENSÃO (linhas x colunas):")
print(df.shape)

print("\n[4] TIPOS DE DADOS:")
print(df.dtypes)

print("\n[5] RESUMO ESTATÍSTICO:")
print(df.describe().round(3))

# Distribuição da variável alvo
print("\n[6] DISTRIBUIÇÃO DO DIAGNÓSTICO (Outcome):")
contagem = df['Outcome'].value_counts()
print(f"  Não Diabético (0): {contagem[0]} amostras ({contagem[0]/len(df)*100:.1f}%)")
print(f"  Diabético     (1): {contagem[1]} amostras ({contagem[1]/len(df)*100:.1f}%)")

# =============================================================================
# 3. VALORES AUSENTES EXPLÍCITOS (NaN)
# =============================================================================

print("\n[7] VALORES NaN POR COLUNA:")
nulos = df.isnull().sum()
print(nulos)

if nulos.sum() == 0:
    print("  → Não há valores NaN explícitos na base.")
else:
    # Preenche com a mediana de cada coluna
    df.fillna(df.median(), inplace=True)
    print("  → Valores NaN preenchidos com a mediana de cada coluna.")

# =============================================================================
# 4. TRATAMENTO DE ZEROS BIOLOGICAMENTE IMPOSSÍVEIS
#    Glicose, Pressão Arterial, Espessura de Pele, Insulina e IMC
#    não podem ser 0 em seres humanos vivos → tratados como ausentes
# =============================================================================

COLUNAS_SEM_ZERO = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']

print("\n[8] ZEROS BIOLOGICAMENTE IMPOSSÍVEIS (antes do tratamento):")
for col in COLUNAS_SEM_ZERO:
    n_zeros = (df[col] == 0).sum()
    pct = n_zeros / len(df) * 100
    print(f"  {col:30s}: {n_zeros} zeros ({pct:.1f}%)")

# Substitui 0 por NaN nas colunas críticas
df[COLUNAS_SEM_ZERO] = df[COLUNAS_SEM_ZERO].replace(0, np.nan)

print("\n[9] PREENCHIMENTO: zeros → mediana da coluna (estratificada por Diagnóstico):")
for col in COLUNAS_SEM_ZERO:
    # Mediana por classe para manter a distribuição dos grupos
    mediana_0 = df.loc[df['Outcome'] == 0, col].median()
    mediana_1 = df.loc[df['Outcome'] == 1, col].median()
    df.loc[(df['Outcome'] == 0) & (df[col].isna()), col] = mediana_0
    df.loc[(df['Outcome'] == 1) & (df[col].isna()), col] = mediana_1
    print(f"  {col:30s}: mediana(0)={mediana_0:.2f}  |  mediana(1)={mediana_1:.2f}")

print("\n[10] VERIFICAÇÃO DE NaN APÓS TRATAMENTO:")
print(df.isnull().sum())

# =============================================================================
# 5. REMOÇÃO DE DUPLICATAS
# =============================================================================

def remover_duplicatas(df):
    '''
    Remove linhas completamente duplicadas, mantendo apenas a primeira ocorrência.
    Aplica-se sobre todas as colunas da base de dados de diabetes.
    '''
    n_antes = len(df)
    df = df.drop_duplicates(keep='first')
    n_depois = len(df)
    print(f"  Duplicatas removidas: {n_antes - n_depois} linha(s).")
    return df

print("\n[11] REMOÇÃO DE DUPLICATAS:")
df = remover_duplicatas(df)

# Detecção de duplicatas nas colunas clínicas (excluindo o diagnóstico)
COLUNAS_CLINICAS = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
                    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

df_duplicates = df[df.duplicated(subset=COLUNAS_CLINICAS, keep=False)]

if len(df_duplicates) > 0:
    print(f"\n  Amostras com dados clínicos idênticos (possíveis inconsistências):")
    print(df_duplicates)
else:
    print("  → Não existem amostras com dados clínicos duplicados.")

# =============================================================================
# 6. REMOÇÃO DE INCONSISTÊNCIAS CLÍNICAS
# =============================================================================

def delInconsistencias_diabetes(df):
    '''
    Remove amostras com combinações clinicamente inválidas:
      - Glicose ≤ 0 (já tratado, mas garante)
      - IMC ≤ 0
      - Idade < 1
      - Pressão Arterial > 200 (valor extremo improvável)
      - Glicose > 500 (valor extremo improvável)
    Mantém apenas registros clinicamente plausíveis.
    '''
    n_antes = len(df)
    df = df[df['Glucose'] > 0]
    df = df[df['BMI'] > 0]
    df = df[df['Age'] >= 1]
    df = df[df['BloodPressure'] <= 200]
    df = df[df['Glucose'] <= 500]
    n_depois = len(df)
    print(f"  Amostras inconsistentes removidas: {n_antes - n_depois}")
    return df

print("\n[12] REMOÇÃO DE INCONSISTÊNCIAS CLÍNICAS:")
df = delInconsistencias_diabetes(df)
print(f"  Base após limpeza: {df.shape[0]} amostras × {df.shape[1]} atributos")

print("\n[13] ESTATÍSTICAS APÓS LIMPEZA:")
print(df.describe().round(3))

# =============================================================================
# 7. VISUALIZAÇÃO — DISTRIBUIÇÕES E BOXPLOTS (ANTES DA NORMALIZAÇÃO)
# =============================================================================

FEATURES = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
            'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

# --- Histogramas por atributo ---
df[FEATURES].hist(figsize=(14, 10), bins=25, edgecolor='black', color='steelblue')
plt.suptitle("Distribuição dos Atributos Clínicos (Diabetes)", fontsize=16, fontweight='bold')
plt.tight_layout()
plt.show()

# --- Histograma do alvo ---
plt.figure(figsize=(6, 4))
contagem = df['Outcome'].value_counts()
cores = ['#4CAF82', '#EF4444']
plt.bar(['Não Diabético (0)', 'Diabético (1)'], contagem.values, color=cores, edgecolor='black')
plt.title("Distribuição do Diagnóstico (Outcome)", fontweight='bold')
plt.ylabel("Quantidade de Amostras")
for i, v in enumerate(contagem.values):
    plt.text(i, v + 3, str(v), ha='center', fontweight='bold')
plt.tight_layout()
plt.show()

# --- Boxplot geral ---
plt.figure(figsize=(16, 7))
df[FEATURES].boxplot()
plt.title('Boxplot dos Atributos Clínicos', fontweight='bold')
plt.xticks(rotation=20)
plt.tight_layout()
plt.show()

# --- Boxplot por atributo separado por diagnóstico ---
fig, axes = plt.subplots(2, 4, figsize=(18, 10))
for ax, col in zip(axes.flatten(), FEATURES):
    sns.boxplot(x='Outcome', y=col, data=df, ax=ax,
                palette={0: '#4CAF82', 1: '#EF4444'})
    ax.set_title(f'{col}', fontweight='bold')
    ax.set_xlabel('Diagnóstico (0=Não | 1=Sim)')
plt.suptitle("Distribuição por Atributo × Diagnóstico", fontsize=15, fontweight='bold')
plt.tight_layout()
plt.show()

# --- Scatter Matrix ---
pd.plotting.scatter_matrix(df[FEATURES], figsize=(18, 18), diagonal='kde', alpha=0.4)
plt.suptitle("Matriz de Dispersão — Atributos Clínicos", fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# --- Pairplot com diferenciação por diagnóstico ---
sns.pairplot(df[FEATURES + ['Outcome']], hue='Outcome',
             palette={0: '#4CAF82', 1: '#EF4444'}, height=2.5, plot_kws={'alpha': 0.5})
plt.suptitle("Pairplot: Atributos Clínicos por Diagnóstico", y=1.01, fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# --- Dispersão Glicose × IMC (atributos com maior poder preditivo) ---
plt.figure(figsize=(9, 6))
for outcome, cor, label in [(0, '#4CAF82', 'Não Diabético'), (1, '#EF4444', 'Diabético')]:
    subset = df[df['Outcome'] == outcome]
    plt.scatter(subset['Glucose'], subset['BMI'], c=cor, label=label, alpha=0.6, edgecolors='k', linewidths=0.3)
plt.xlabel('Glicose (mg/dL)', fontsize=12)
plt.ylabel('IMC (kg/m²)', fontsize=12)
plt.title('Dispersão: Glicose × IMC por Diagnóstico', fontweight='bold')
plt.legend()
plt.tight_layout()
plt.show()

# =============================================================================
# 8. REMOÇÃO DE OUTLIERS (IQR — apenas nas features, não no alvo)
# =============================================================================

def removeOutliers(df, colunas):
    """
    Remove outliers usando o método IQR (Interquartile Range).
    Aplica o critério de Tukey: limites = Q1 − 1.5×IQR  e  Q3 + 1.5×IQR.
    Aplica apenas nas colunas clínicas (não no alvo Outcome).
    """
    df_clean = df.copy()
    n_antes = len(df_clean)
    for col in colunas:
        q25, q75 = np.percentile(df_clean[col].dropna(), [25, 75])
        IQR = q75 - q25
        lim_inf = q25 - 1.5 * IQR
        lim_sup = q75 + 1.5 * IQR
        df_clean = df_clean[(df_clean[col] >= lim_inf) & (df_clean[col] <= lim_sup)]
    n_depois = len(df_clean)
    print(f"  Amostras removidas como outliers: {n_antes - n_depois}")
    print(f"  Base após remoção: {n_depois} amostras")
    return df_clean

print("\n[14] REMOÇÃO DE OUTLIERS (IQR, apenas features clínicas):")
df = removeOutliers(df, FEATURES)

# Boxplot após remoção
plt.figure(figsize=(16, 7))
df[FEATURES].boxplot()
plt.title("Boxplot após Remoção de Outliers", fontweight='bold')
plt.xticks(rotation=20)
plt.tight_layout()
plt.show()

sns.pairplot(df[FEATURES + ['Outcome']], hue='Outcome',
             palette={0: '#4CAF82', 1: '#EF4444'}, height=2.5, plot_kws={'alpha': 0.5})
plt.suptitle("Pairplot após Remoção de Outliers", y=1.01, fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()

# =============================================================================
# 9. ANÁLISE DE CORRELAÇÃO
# =============================================================================

print("\n[15] MATRIZ DE CORRELAÇÃO (np.corrcoef — apenas features):")
X_corr = df[FEATURES].values
correlation_np = np.corrcoef(X_corr, rowvar=False)
df_corr_np = pd.DataFrame(correlation_np, columns=FEATURES, index=FEATURES)
print(df_corr_np.round(3))

print("\n[16] MATRIZ DE CORRELAÇÃO (pandas .corr() — incluindo Outcome):")
df_correlation = df[FEATURES + ['Outcome']].corr()
print(df_correlation.round(3))

# Heatmap
plt.figure(figsize=(12, 9))
sns.heatmap(
    df_correlation,
    annot=True,
    fmt='.2f',
    cmap='coolwarm',
    center=0,
    linewidths=0.5,
    annot_kws={'size': 10}
)
plt.title('Matriz de Correlação — Atributos Clínicos × Diagnóstico', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.show()

# Correlação com o alvo ordenada
print("\n[17] CORRELAÇÃO DE CADA ATRIBUTO COM O DIAGNÓSTICO (Outcome):")
corr_alvo = df_correlation['Outcome'].drop('Outcome').sort_values(ascending=False)
print(corr_alvo.round(3))

plt.figure(figsize=(9, 5))
cores = ['#4CAF82' if v > 0 else '#EF4444' for v in corr_alvo.values]
plt.bar(corr_alvo.index, corr_alvo.values, color=cores, edgecolor='black')
plt.axhline(0, color='black', linewidth=0.8, linestyle='--')
plt.title("Correlação dos Atributos com o Diagnóstico de Diabetes", fontweight='bold')
plt.ylabel("Correlação de Pearson")
plt.xticks(rotation=20, ha='right')
plt.tight_layout()
plt.show()

# =============================================================================
# 10. NORMALIZAÇÃO (Z-SCORE)
# =============================================================================

def normalizar(X):
    """
    Normaliza os atributos usando z-score (padronização):
      X_norm = (X - μ) / σ
    Retorna: X normalizado, vetor de médias (mu), vetor de desvios (sigma).
    """
    mu    = np.mean(X, axis=0)
    sigma = np.std(X, axis=0, ddof=1)
    X_norm = (X - mu) / sigma
    return X_norm, mu, sigma

X_bruto = df[FEATURES].values

X_norm, mu, sigma = normalizar(X_bruto)

# DataFrame normalizado (mantém Outcome original)
df_norm = df.copy()
df_norm[FEATURES] = X_norm

print("\n[18] NORMALIZAÇÃO Z-SCORE:")
print(f"  Atributo        |  Média (μ)  |  Desvio (σ)")
print("  " + "-" * 48)
for i, col in enumerate(FEATURES):
    print(f"  {col:22s}  |  {mu[i]:8.3f}   |  {sigma[i]:8.3f}")

print("\n  Exemplo — Primeira amostra ANTES da normalização:")
print("  " + "  ".join([f"{col[:6]}={X_bruto[0,i]:.2f}" for i, col in enumerate(FEATURES)]))

print("\n  Exemplo — Primeira amostra APÓS normalização:")
print("  " + "  ".join([f"{col[:6]}={X_norm[0,i]:+.3f}" for i, col in enumerate(FEATURES)]))

print("\n[19] ESTATÍSTICAS APÓS NORMALIZAÇÃO (features):")
print(df_norm[FEATURES].describe().round(4))

# Histogramas após normalização
df_norm[FEATURES].hist(figsize=(14, 10), bins=25, edgecolor='black', color='darkorange')
plt.suptitle("Distribuição dos Atributos APÓS Normalização (Z-score)", fontsize=15, fontweight='bold')
plt.tight_layout()
plt.show()

# =============================================================================
# 11. DIVISÃO TREINO / TESTE
# =============================================================================

X_final = df_norm[FEATURES].values
y_final = df_norm['Outcome'].values

X_train, X_test, y_train, y_test = train_test_split(
    X_final, y_final, test_size=0.2, random_state=42, stratify=y_final
)

print("\n[20] DIVISÃO TREINO / TESTE (80% / 20%, estratificada):")
print(f"  Treino  : {X_train.shape[0]} amostras")
print(f"  Teste   : {X_test.shape[0]} amostras")
print(f"  Features: {X_train.shape[1]} atributos")
print(f"  Proporção Outcome no treino → 0: {(y_train==0).sum()} | 1: {(y_train==1).sum()}")
print(f"  Proporção Outcome no teste  → 0: {(y_test==0).sum()}  | 1: {(y_test==1).sum()}")

# =============================================================================
# 12. SUMÁRIO FINAL DO PRÉ-PROCESSAMENTO
# =============================================================================

print("\n" + "=" * 65)
print("  SUMÁRIO DO PRÉ-PROCESSAMENTO")
print("=" * 65)
print(f"  Base original          : 768 amostras × 9 atributos")
print(f"  Após tratamento de NaN : zeros impossíveis → mediana por classe")
print(f"  Após remoção duplicatas: {df.shape[0]} amostras restantes")
print(f"  Após remoção outliers  : {df.shape[0]} amostras")
print(f"  Normalização           : Z-score (μ=0, σ=1) por atributo")
print(f"  Conjunto de treino     : {X_train.shape[0]} amostras")
print(f"  Conjunto de teste      : {X_test.shape[0]} amostras")
print(f"  Alvo                   : Outcome (0=Não Diabético | 1=Diabético)")
print("=" * 65)
