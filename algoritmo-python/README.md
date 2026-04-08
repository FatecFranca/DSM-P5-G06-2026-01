# Algoritmos de Classificação — Diabetes

Scripts Python para pré-processamento de dados e extração de padrões aplicados à base **Pima Indians Diabetes Dataset**, com o objetivo de classificar pacientes como **diabéticos ou não diabéticos**.

---

## Arquivos do Projeto

```
algoritmo-python/
├── diabetes.csv          # Base de dados (768 amostras, 9 atributos)
├── pre-processamento.py  # Limpeza, análise exploratória e normalização
├── extracao_padrao.py    # Treinamento, avaliação e extração de padrões
├── test_scripts.py       # Testes automatizados (unittest)
└── README.md             # Este arquivo
```

---

## Base de Dados

### Origem

**Pima Indians Diabetes Dataset** — originalmente coletado pelo _National Institute of Diabetes and Digestive and Kidney Diseases_ (EUA). O dataset é amplamente utilizado como benchmark em problemas de classificação binária na área de saúde.

Fonte original: [UCI Machine Learning Repository](https://archive.ics.uci.edu/ml/datasets/Pima+Indians+Diabetes)

### Contexto Clínico

Todos os registros correspondem a **mulheres com pelo menos 21 anos de idade** de descendência Pima (grupo indígena norte-americano com alta prevalência de diabetes tipo 2). O objetivo é prever, a partir de medições clínicas, se a paciente desenvolverá diabetes dentro de 5 anos.

### Dimensões

| Campo            | Valor  |
|------------------|--------|
| Total de amostras | 768   |
| Total de atributos | 9   |
| Variável alvo    | `Outcome` (binária) |
| Classe 0 (Não Diabético) | 500 amostras (65,1%) |
| Classe 1 (Diabético)     | 268 amostras (34,9%) |

### Descrição das Colunas

| Coluna                    | Tipo    | Descrição                                                             | Unidade     |
|---------------------------|---------|-----------------------------------------------------------------------|-------------|
| `Pregnancies`             | Inteiro | Número de gestações                                                   | —           |
| `Glucose`                 | Inteiro | Concentração de glicose plasmática (teste oral de tolerância, 2h)     | mg/dL       |
| `BloodPressure`           | Inteiro | Pressão arterial diastólica                                           | mmHg        |
| `SkinThickness`           | Inteiro | Espessura da prega cutânea do tríceps                                 | mm          |
| `Insulin`                 | Inteiro | Insulina sérica (2 horas)                                             | μU/ml       |
| `BMI`                     | Float   | Índice de Massa Corporal (peso / altura²)                             | kg/m²       |
| `DiabetesPedigreeFunction`| Float   | Função de pedigree diabético (herança genética estimada)              | —           |
| `Age`                     | Inteiro | Idade da paciente                                                     | anos        |
| `Outcome`                 | Inteiro | **Variável alvo** — 0 = Não Diabético, 1 = Diabético                  | —           |

### Resumo Estatístico

| Atributo                    | Mín  | Máx   | Média  | Desvio |
|-----------------------------|------|-------|--------|--------|
| Pregnancies                 | 0    | 17    | 3,85   | 3,37   |
| Glucose                     | 0*   | 199   | 120,9  | 31,97  |
| BloodPressure               | 0*   | 122   | 69,11  | 19,36  |
| SkinThickness               | 0*   | 99    | 20,54  | 15,95  |
| Insulin                     | 0*   | 846   | 79,80  | 115,24 |
| BMI                         | 0*   | 67,1  | 31,99  | 7,88   |
| DiabetesPedigreeFunction    | 0,08 | 2,42  | 0,47   | 0,33   |
| Age                         | 21   | 81    | 33,24  | 11,76  |

> **(*) Zeros impossíveis:** Os valores `0` em Glucose, BloodPressure, SkinThickness, Insulin e BMI são fisiologicamente inviáveis (nenhum ser humano vivo teria esses valores zerados). Esses valores representam **dados ausentes codificados como zero** e são tratados na etapa de pré-processamento.

---

## Scripts

### `pre-processamento.py`

Realiza todas as etapas de preparação da base antes da modelagem.

#### Etapas executadas:

| # | Etapa | Descrição |
|---|-------|-----------|
| 1 | **Carregamento** | Lê `diabetes.csv` com `pandas.read_csv` |
| 2 | **Inspeção inicial** | Shape, tipos, `describe()`, distribuição do `Outcome` |
| 3 | **NaN explícitos** | Verifica e preenche com mediana (nenhum na base original) |
| 4 | **Zeros impossíveis** | Converte zeros em `NaN` e preenche com **mediana estratificada por classe** (evita viés na imputação) |
| 5 | **Duplicatas** | Remove linhas idênticas com `drop_duplicates` |
| 6 | **Inconsistências clínicas** | Remove registros com Glicose ≤ 0, IMC ≤ 0, Idade < 1, Pressão > 200 mmHg |
| 7 | **Visualizações (antes)** | Histogramas, boxplots por diagnóstico, scatter matrix, pairplot, dispersão Glicose × IMC |
| 8 | **Outliers (IQR)** | Remove usando critério de Tukey: Q1 − 1.5×IQR e Q3 + 1.5×IQR, apenas nas features |
| 9 | **Visualizações (depois)** | Boxplot e pairplot pós-remoção de outliers |
| 10 | **Correlação** | `np.corrcoef` + `.corr()` + heatmap + barplot de correlação com `Outcome` |
| 11 | **Normalização Z-score** | Implementada manualmente: `X_norm = (X − μ) / σ` |
| 12 | **Divisão treino/teste** | 80% treino / 20% teste, estratificada por `Outcome` |

#### Gráficos gerados:
- Histogramas de todos os atributos
- Distribuição da variável alvo (Outcome)
- Boxplots gerais e por atributo × diagnóstico
- Scatter matrix e pairplot (antes e depois da limpeza)
- Dispersão Glicose × IMC
- Heatmap de correlação
- Barplot de correlação com o alvo
- Histogramas após normalização

---

### `extracao_padrao.py`

Treina e avalia múltiplos classificadores, extrai padrões clínicos e realiza inferência.

#### Modelos utilizados:

| Modelo                    | Tipo             |
|---------------------------|------------------|
| Regressão Logística        | Linear           |
| KNN (k=5)                  | Baseado em instância |
| Árvore de Decisão (CART)   | Baseado em árvore |
| Random Forest              | Ensemble (bagging) |
| Gradient Boosting          | Ensemble (boosting) |
| LDA                        | Discriminante linear |
| Naive Bayes (Gaussiano)    | Probabilístico   |
| SVM (kernel RBF)           | Baseado em margem |

#### Etapas executadas:

| # | Etapa | Descrição |
|---|-------|-----------|
| 1 | **Pré-processamento** | Reaplica todas as etapas de limpeza (script autônomo) |
| 2 | **Divisão treino/teste** | 80/20 estratificada |
| 3 | **Validação cruzada** | 10-Fold Estratificado com `Pipeline` (Scaler → Modelo), evitando _data leakage_ |
| 4 | **Comparação de modelos** | Acurácia, F1-Score e ROC-AUC no conjunto de teste |
| 5 | **Melhor modelo** | Relatório de classificação completo + matriz de confusão ampliada |
| 6 | **Matrizes de confusão** | Grade com todos os modelos |
| 7 | **Curvas ROC** | Sobrepostas com AUC para cada modelo |
| 8 | **Importância de atributos** | Random Forest + Árvore de Decisão |
| 9 | **Regras da Árvore** | Texto das regras de decisão (profundidade 4) |
| 10 | **Análise de padrões** | Glicose, IMC e Idade versus diagnóstico com histogramas e taxas por faixa etária |
| 11 | **Inferência** | Predição para 3 novos pacientes com probabilidade estimada |

#### Gráficos gerados:
- Boxplot de acurácias por modelo (10-Fold CV)
- Matriz de confusão — melhor modelo
- Grade de matrizes de confusão — todos os modelos
- Curvas ROC sobrepostas
- Importância de atributos — Random Forest e Árvore de Decisão
- Histogramas e boxplots de Glicose e IMC por diagnóstico
- Taxa de diabetes por faixa etária

---

### `test_scripts.py`

Suíte de testes automatizados com **unittest** cobrindo todas as funções dos scripts.

#### Suítes de teste:

| Suíte | Classe | Testes | O que verifica |
|-------|--------|--------|----------------|
| 1 | `TestCarregamento` | 10 | Arquivo existe, colunas corretas, tipos, Outcome binário |
| 2 | `TestTratamentoZeros` | 6 | Zeros removidos, sem NaN, mediana estratificada |
| 3 | `TestLimpeza` | 8 | Sem duplicatas, inconsistências removidas, colunas preservadas |
| 4 | `TestOutliers` | 6 | Valores dentro do IQR, base não vazia, sem NaN |
| 5 | `TestNormalizacao` | 9 | μ ≈ 0, σ ≈ 1, reconstrução de X, sem NaN/inf |
| 6 | `TestPipelineCompleto` | 8 | Integração ponta a ponta, base utilizável, balanceamento |
| 7 | `TestClassificadores` | 5 | Todos os modelos treinam, acurácia > 55%, shape das predições |

**Total: 52 testes**

---

## Requisitos

### Python

Versão recomendada: **Python 3.9 ou superior**

### Dependências

```
numpy>=1.24
pandas>=2.0
matplotlib>=3.7
seaborn>=0.12
scikit-learn>=1.3
plotly>=5.0
```

---

## Instalação

### 1. Clone o repositório ou navegue até a pasta

```bash
cd diabetes-app/algoritmo-python
```

### 2. Crie um ambiente virtual (recomendado)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install numpy pandas matplotlib seaborn scikit-learn plotly
```

---

## Como Executar

> **Importante:** todos os comandos devem ser executados dentro da pasta `algoritmo-python/`, onde o arquivo `diabetes.csv` está localizado.

```bash
cd diabetes-app/algoritmo-python
```

### Pré-processamento

```bash
python pre-processamento.py
```

Executa todas as etapas de inspeção, limpeza, visualização e normalização da base. Ao final, exibe um sumário com o número de amostras em cada etapa.

Tempo estimado: **30–60 segundos** (depende da velocidade de renderização dos gráficos).

### Extração de Padrões

```bash
python extracao_padrao.py
```

Treina 8 classificadores, exibe métricas comparativas, gráficos de desempenho e realiza predições para novos pacientes.

Tempo estimado: **60–120 segundos**.

### Testes Automatizados

```bash
python test_scripts.py
```

Executa os 52 testes e imprime o resultado de cada um. Retorna código de saída `0` (sucesso) ou `1` (falha).

```bash
# Modo verboso (padrão do script)
python test_scripts.py

# Modo silencioso via unittest diretamente
python -m unittest test_scripts -v
```

Saída esperada em caso de sucesso:

```
==================================================================
  EXECUTANDO TESTES — BASE DE DADOS DIABETES
==================================================================
test_arquivo_existe (TestCarregamento) ... ok
test_numero_colunas (TestCarregamento) ... ok
...
----------------------------------------------------------------------
Ran 52 tests in X.XXXs

OK
==================================================================
  ✓ TODOS OS 52 TESTES PASSARAM COM SUCESSO
==================================================================
```

---

## Execução no Jupyter Notebook

Os scripts foram desenvolvidos para execução como `.py`, mas podem ser convertidos para Notebook:

```bash
# Instala o conversor
pip install jupyter nbformat

# Converte para .ipynb
jupyter nbconvert --to notebook --execute pre-processamento.py
```

Ou copie e cole o conteúdo em células de um Notebook e substitua `plt.show()` por `display(fig)` se necessário.

---

## Decisões Técnicas

### Por que imputar zeros pela mediana estratificada?

Substituir zero pela mediana **global** introduziria viés, pois a distribuição de valores como Glicose e Insulina é significativamente diferente entre diabéticos e não diabéticos. Ao calcular a mediana separadamente por classe, a imputação preserva a estrutura clínica dos grupos.

### Por que usar Pipeline (Scaler → Modelo)?

Normalizar antes da divisão treino/teste causaria **data leakage** (o modelo "veria" informações do conjunto de teste durante o treino). O `Pipeline` do scikit-learn garante que o `StandardScaler` seja ajustado apenas nos dados de treino e aplicado nos de teste.

### Por que remover outliers apenas nas features e não no Outcome?

`Outcome` é uma variável binária (0/1) — não existe conceito de outlier em variáveis categóricas. Remover amostras com base no Outcome distorceria o balanceamento das classes.

### Por que validação cruzada estratificada?

O dataset está desbalanceado (~65% não diabético vs ~35% diabético). A estratificação garante que cada fold mantenha essa proporção, produzindo estimativas de desempenho mais confiáveis e evitando folds com uma classe sub-representada.

---

## Resultados Esperados

Os valores abaixo são referências aproximadas — podem variar levemente conforme a versão do scikit-learn e o resultado da remoção de outliers.

| Modelo               | Acurácia (approx.) | ROC-AUC (approx.) |
|----------------------|--------------------|-------------------|
| Regressão Logística  | 76–79%             | 0.82–0.85         |
| Random Forest        | 78–82%             | 0.85–0.88         |
| Gradient Boosting    | 77–81%             | 0.84–0.87         |
| SVM (RBF)            | 76–80%             | 0.83–0.86         |
| LDA                  | 75–78%             | 0.81–0.84         |
| KNN (k=5)            | 72–76%             | 0.78–0.82         |
| Árvore de Decisão    | 70–75%             | 0.72–0.78         |
| Naive Bayes          | 73–76%             | 0.80–0.84         |

### Principais padrões identificados

- **Glicose** é o atributo com maior correlação com o diagnóstico positivo (r ≈ 0,47)
- **IMC ≥ 30** (obesidade) aumenta significativamente o risco de diabetes
- A taxa de diabetes cresce progressivamente com a idade, ultrapassando 50% após os 50 anos
- **Número de gestações** correlaciona-se positivamente com o diagnóstico
- A **função de pedigree** captura influência genética familiar no risco de diabetes

---


## Estrutura de Dependências por Script

| Biblioteca      | pre-processamento.py | extracao_padrao.py | test_scripts.py |
|-----------------|:--------------------:|:------------------:|:---------------:|
| numpy           | ✓                    | ✓                  | ✓               |
| pandas          | ✓                    | ✓                  | ✓               |
| matplotlib      | ✓                    | ✓                  | —               |
| seaborn         | ✓                    | ✓                  | —               |
| plotly          | ✓                    | —                  | —               |
| scikit-learn    | ✓                    | ✓                  | ✓               |

---