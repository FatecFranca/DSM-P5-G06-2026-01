"""
Script de predição de risco de diabetes.
Lê JSON do stdin com os valores clínicos mapeados das respostas do questionário,
treina o modelo com o dataset diabetes.csv e retorna a predição em JSON no stdout.

Entrada (stdin):
  {"valores": [gestacoes, glicose, pressao, pele, insulina, imc, pedigree, idade]}

Saída (stdout):
  {"predicao": 0|1, "probabilidade": 0.65}
"""

import sys
import json
import os
import numpy as np
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# ─── Carrega dataset ──────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'diabetes.csv')

FEATURES = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
            'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

df = pd.read_csv(CSV_PATH)

# Pré-processamento mínimo: zeros impossíveis → mediana
COLUNAS_SEM_ZERO = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
df[COLUNAS_SEM_ZERO] = df[COLUNAS_SEM_ZERO].replace(0, np.nan)
for col in COLUNAS_SEM_ZERO:
    mediana = df[col].median()
    df[col] = df[col].fillna(mediana)

X = df[FEATURES].values
y = df['Outcome'].values

# ─── Treinamento (Regressão Logística — rápido) ───────────────────────────────

pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('clf', LogisticRegression(max_iter=1000, random_state=42)),
])
pipeline.fit(X, y)

# ─── Leitura dos dados de entrada ────────────────────────────────────────────

entrada = json.loads(sys.stdin.read().strip())
valores = np.array(entrada['valores'], dtype=float).reshape(1, -1)

# ─── Predição ────────────────────────────────────────────────────────────────

predicao = int(pipeline.predict(valores)[0])
probabilidade = float(pipeline.predict_proba(valores)[0][1])

# ─── Saída ────────────────────────────────────────────────────────────────────

print(json.dumps({'predicao': predicao, 'probabilidade': round(probabilidade, 4)}))
