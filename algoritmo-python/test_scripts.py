# =============================================================================
#  TESTES AUTOMATIZADOS — BASE DE DADOS DIABETES
#  Cobre: carregamento, pré-processamento e funções de extração de padrões
# =============================================================================

import unittest
import numpy as np
import pandas as pd
import os
import sys

# ---------------------------------------------------------------------------
# Configuração de caminho — garante que o script encontra diabetes.csv
# independentemente do diretório de execução
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH   = os.path.join(SCRIPT_DIR, 'diabetes.csv')


# =============================================================================
# FUNÇÕES REPLICADAS DOS SCRIPTS (sem efeitos colaterais / plots)
# Replicamos aqui para testar a lógica pura, isolada do fluxo principal.
# =============================================================================

def carregar_base(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def tratar_zeros_impossiveis(df: pd.DataFrame) -> pd.DataFrame:
    """Substitui zeros biologicamente impossíveis pela mediana estratificada."""
    colunas = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    df = df.copy()
    df[colunas] = df[colunas].replace(0, np.nan)
    for col in colunas:
        for classe in [0, 1]:
            mediana = df.loc[df['Outcome'] == classe, col].median()
            df.loc[(df['Outcome'] == classe) & (df[col].isna()), col] = mediana
    return df


def remover_duplicatas(df: pd.DataFrame) -> pd.DataFrame:
    return df.drop_duplicates(keep='first').reset_index(drop=True)


def remover_inconsistencias(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df[(df['Glucose'] > 0) & (df['BMI'] > 0) &
            (df['Age'] >= 1) & (df['BloodPressure'] <= 200) &
            (df['Glucose'] <= 500)]
    return df.reset_index(drop=True)


def remover_outliers_iqr(df: pd.DataFrame, colunas: list) -> pd.DataFrame:
    df = df.copy()
    for col in colunas:
        q25, q75 = np.percentile(df[col].dropna(), [25, 75])
        iqr = q75 - q25
        df = df[(df[col] >= q25 - 1.5 * iqr) & (df[col] <= q75 + 1.5 * iqr)]
    return df.reset_index(drop=True)


def normalizar_zscore(X: np.ndarray):
    """Z-score manual: retorna (X_norm, mu, sigma)."""
    mu    = np.mean(X, axis=0)
    sigma = np.std(X, axis=0, ddof=1)
    X_norm = (X - mu) / sigma
    return X_norm, mu, sigma


FEATURES = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
            'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']

COLUNAS_SEM_ZERO = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']


# =============================================================================
# SUÍTE 1 — CARREGAMENTO E ESTRUTURA DA BASE
# =============================================================================

class TestCarregamento(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.df = carregar_base(CSV_PATH)

    def test_arquivo_existe(self):
        """O arquivo diabetes.csv deve existir no diretório."""
        self.assertTrue(os.path.exists(CSV_PATH), f"Arquivo não encontrado: {CSV_PATH}")

    def test_numero_colunas(self):
        """A base deve ter exatamente 9 colunas."""
        self.assertEqual(self.df.shape[1], 9)

    def test_colunas_corretas(self):
        """Todas as colunas esperadas devem estar presentes."""
        esperadas = FEATURES + ['Outcome']
        self.assertListEqual(list(self.df.columns), esperadas)

    def test_numero_minimo_linhas(self):
        """A base deve ter pelo menos 700 amostras (original: 768)."""
        self.assertGreaterEqual(self.df.shape[0], 700)

    def test_tipos_numericos(self):
        """Todas as colunas devem ser do tipo numérico."""
        for col in self.df.columns:
            self.assertTrue(
                pd.api.types.is_numeric_dtype(self.df[col]),
                f"Coluna '{col}' não é numérica."
            )

    def test_outcome_binario(self):
        """Outcome deve conter apenas os valores 0 e 1."""
        valores_unicos = set(self.df['Outcome'].unique())
        self.assertSetEqual(valores_unicos, {0, 1})

    def test_ambas_classes_presentes(self):
        """Devem existir amostras de ambas as classes (0 e 1)."""
        self.assertGreater((self.df['Outcome'] == 0).sum(), 0)
        self.assertGreater((self.df['Outcome'] == 1).sum(), 0)

    def test_sem_nan_explicito_original(self):
        """A base original não deve ter NaN explícitos."""
        self.assertEqual(self.df.isnull().sum().sum(), 0)

    def test_valores_positivos_pregnancies(self):
        """Gestações deve ser ≥ 0 em toda a base."""
        self.assertTrue((self.df['Pregnancies'] >= 0).all())

    def test_values_age_range(self):
        """Idades devem estar entre 1 e 120 anos."""
        self.assertTrue((self.df['Age'] >= 1).all())
        self.assertTrue((self.df['Age'] <= 120).all())


# =============================================================================
# SUÍTE 2 — TRATAMENTO DE ZEROS IMPOSSÍVEIS
# =============================================================================

class TestTratamentoZeros(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.df_raw  = carregar_base(CSV_PATH)
        cls.df_trat = tratar_zeros_impossiveis(cls.df_raw)

    def test_sem_zeros_nas_colunas_criticas(self):
        """Após tratamento, colunas críticas não devem ter zeros."""
        for col in COLUNAS_SEM_ZERO:
            zeros = (self.df_trat[col] == 0).sum()
            self.assertEqual(zeros, 0, f"Ainda existem zeros em '{col}' após tratamento.")

    def test_sem_nan_apos_tratamento(self):
        """Após tratamento, não deve haver NaN nas colunas críticas."""
        for col in COLUNAS_SEM_ZERO:
            nans = self.df_trat[col].isna().sum()
            self.assertEqual(nans, 0, f"Ainda existem NaN em '{col}' após preenchimento.")

    def test_numero_linhas_preservado(self):
        """O tratamento de zeros não deve remover linhas."""
        self.assertEqual(len(self.df_raw), len(self.df_trat))

    def test_outcome_preservado(self):
        """A coluna Outcome não deve ser alterada."""
        pd.testing.assert_series_equal(
            self.df_raw['Outcome'].reset_index(drop=True),
            self.df_trat['Outcome'].reset_index(drop=True)
        )

    def test_valores_positivos_apos_tratamento(self):
        """Glicose e IMC devem ser > 0 após tratamento."""
        self.assertTrue((self.df_trat['Glucose'] > 0).all())
        self.assertTrue((self.df_trat['BMI'] > 0).all())

    def test_mediana_classe_zero_menor_que_um(self):
        """A mediana de Glicose do grupo 0 deve ser menor que a do grupo 1."""
        med_0 = self.df_trat.loc[self.df_trat['Outcome'] == 0, 'Glucose'].median()
        med_1 = self.df_trat.loc[self.df_trat['Outcome'] == 1, 'Glucose'].median()
        self.assertLess(med_0, med_1,
            "Mediana de Glicose (não diabético) deve ser menor que a do diabético.")


# =============================================================================
# SUÍTE 3 — REMOÇÃO DE DUPLICATAS E INCONSISTÊNCIAS
# =============================================================================

class TestLimpeza(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        df = carregar_base(CSV_PATH)
        df = tratar_zeros_impossiveis(df)
        cls.df_sem_dup  = remover_duplicatas(df)
        cls.df_sem_inc  = remover_inconsistencias(cls.df_sem_dup)

    def test_sem_duplicatas_exatas(self):
        """Após remoção, não deve haver linhas completamente duplicadas."""
        n_dup = self.df_sem_dup.duplicated().sum()
        self.assertEqual(n_dup, 0)

    def test_glicose_maior_que_zero(self):
        """Todas as amostras devem ter Glicose > 0."""
        self.assertTrue((self.df_sem_inc['Glucose'] > 0).all())

    def test_imc_maior_que_zero(self):
        """Todas as amostras devem ter IMC > 0."""
        self.assertTrue((self.df_sem_inc['BMI'] > 0).all())

    def test_pressao_dentro_do_limite(self):
        """Pressão arterial não deve ultrapassar 200 mmHg."""
        self.assertTrue((self.df_sem_inc['BloodPressure'] <= 200).all())

    def test_glicose_dentro_do_limite(self):
        """Glicose não deve ultrapassar 500 mg/dL."""
        self.assertTrue((self.df_sem_inc['Glucose'] <= 500).all())

    def test_tamanho_nao_aumenta_apos_limpeza(self):
        """A limpeza nunca deve aumentar o número de amostras."""
        self.assertLessEqual(len(self.df_sem_inc), len(self.df_sem_dup))

    def test_base_nao_fica_vazia(self):
        """A base não deve ficar vazia após todas as etapas de limpeza."""
        self.assertGreater(len(self.df_sem_inc), 0)

    def test_colunas_inalteradas(self):
        """As colunas não devem mudar durante a limpeza."""
        self.assertListEqual(list(self.df_sem_inc.columns), FEATURES + ['Outcome'])


# =============================================================================
# SUÍTE 4 — REMOÇÃO DE OUTLIERS (IQR)
# =============================================================================

class TestOutliers(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        df = carregar_base(CSV_PATH)
        df = tratar_zeros_impossiveis(df)
        df = remover_duplicatas(df)
        df = remover_inconsistencias(df)
        cls.df_antes  = df.copy()
        cls.df_depois = remover_outliers_iqr(df, FEATURES)

    def test_nao_aumenta_amostras(self):
        """Remoção de outliers não deve aumentar a base."""
        self.assertLessEqual(len(self.df_depois), len(self.df_antes))

    def test_nao_esvazia_base(self):
        """A base não deve ficar vazia após remoção de outliers."""
        self.assertGreater(len(self.df_depois), 0)

    def test_colunas_preservadas(self):
        """As colunas devem ser preservadas após a remoção de outliers."""
        self.assertListEqual(list(self.df_depois.columns), list(self.df_antes.columns))

    def test_sem_nan_apos_outliers(self):
        """Não deve haver NaN após remoção de outliers."""
        self.assertEqual(self.df_depois.isnull().sum().sum(), 0)

    def test_outcome_ainda_binario(self):
        """Outcome deve continuar binário (0 e 1) após remoção de outliers."""
        valores = set(self.df_depois['Outcome'].unique())
        self.assertTrue(valores.issubset({0, 1}))

    def test_valores_dentro_do_iqr(self):
        """Para cada feature, os valores devem estar dentro dos limites IQR×1.5."""
        for col in FEATURES:
            q25, q75 = np.percentile(self.df_antes[col].dropna(), [25, 75])
            iqr = q75 - q25
            lim_inf = q25 - 1.5 * iqr
            lim_sup = q75 + 1.5 * iqr
            viola_inf = (self.df_depois[col] < lim_inf).sum()
            viola_sup = (self.df_depois[col] > lim_sup).sum()
            self.assertEqual(viola_inf, 0, f"'{col}' tem valores abaixo do limite IQR.")
            self.assertEqual(viola_sup, 0, f"'{col}' tem valores acima do limite IQR.")


# =============================================================================
# SUÍTE 5 — NORMALIZAÇÃO Z-SCORE
# =============================================================================

class TestNormalizacao(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        df = carregar_base(CSV_PATH)
        df = tratar_zeros_impossiveis(df)
        df = remover_duplicatas(df)
        df = remover_inconsistencias(df)
        df = remover_outliers_iqr(df, FEATURES)
        X = df[FEATURES].values
        cls.X_norm, cls.mu, cls.sigma = normalizar_zscore(X)

    def test_shape_preservado(self):
        """A normalização deve preservar as dimensões de X."""
        df_temp = carregar_base(CSV_PATH)
        X_orig  = df_temp[FEATURES].values
        self.assertEqual(self.X_norm.shape[1], len(FEATURES))

    def test_media_proxima_de_zero(self):
        """Após normalização, a média de cada coluna deve ser ≈ 0."""
        medias = np.mean(self.X_norm, axis=0)
        for i, col in enumerate(FEATURES):
            self.assertAlmostEqual(
                medias[i], 0.0, places=8,
                msg=f"Média de '{col}' não está próxima de 0 após normalização."
            )

    def test_desvio_proximo_de_um(self):
        """Após normalização, o desvio padrão de cada coluna deve ser ≈ 1."""
        desvios = np.std(self.X_norm, axis=0, ddof=1)
        for i, col in enumerate(FEATURES):
            self.assertAlmostEqual(
                desvios[i], 1.0, places=8,
                msg=f"Desvio padrão de '{col}' não está próximo de 1 após normalização."
            )

    def test_mu_shape(self):
        """O vetor de médias deve ter tamanho igual ao número de features."""
        self.assertEqual(len(self.mu), len(FEATURES))

    def test_sigma_shape(self):
        """O vetor de desvios deve ter tamanho igual ao número de features."""
        self.assertEqual(len(self.sigma), len(FEATURES))

    def test_sigma_positivo(self):
        """Todos os desvios padrão devem ser positivos."""
        self.assertTrue((self.sigma > 0).all())

    def test_sem_nan_apos_normalizacao(self):
        """Não deve haver NaN no array normalizado."""
        self.assertFalse(np.isnan(self.X_norm).any())

    def test_sem_inf_apos_normalizacao(self):
        """Não deve haver valores infinitos no array normalizado."""
        self.assertFalse(np.isinf(self.X_norm).any())

    def test_reconstrucao(self):
        """Deve ser possível reconstruir X original a partir de X_norm."""
        X_reconstituido = self.X_norm * self.sigma + self.mu
        df_temp = carregar_base(CSV_PATH)
        df_temp = tratar_zeros_impossiveis(df_temp)
        df_temp = remover_duplicatas(df_temp)
        df_temp = remover_inconsistencias(df_temp)
        df_temp = remover_outliers_iqr(df_temp, FEATURES)
        X_orig  = df_temp[FEATURES].values
        np.testing.assert_array_almost_equal(
            X_reconstituido, X_orig, decimal=6,
            err_msg="Reconstrução de X a partir de X_norm falhou."
        )


# =============================================================================
# SUÍTE 6 — PIPELINE COMPLETO (integração ponta a ponta)
# =============================================================================

class TestPipelineCompleto(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        df = carregar_base(CSV_PATH)
        df = tratar_zeros_impossiveis(df)
        df = remover_duplicatas(df)
        df = remover_inconsistencias(df)
        df = remover_outliers_iqr(df, FEATURES)
        cls.df_final = df
        X = df[FEATURES].values
        y = df['Outcome'].values
        cls.X_norm, cls.mu, cls.sigma = normalizar_zscore(X)
        cls.y = y

    def test_base_nao_vazia(self):
        """A base final pós-pipeline não deve estar vazia."""
        self.assertGreater(len(self.df_final), 0)

    def test_minimo_amostras_uteis(self):
        """A base final deve ter pelo menos 400 amostras para ser utilizável."""
        self.assertGreaterEqual(len(self.df_final), 400,
            "Número de amostras após pré-processamento é insuficiente para modelagem.")

    def test_ambas_classes_presentes_apos_pipeline(self):
        """As duas classes (0 e 1) devem estar presentes após todo o pipeline."""
        self.assertGreater((self.y == 0).sum(), 0)
        self.assertGreater((self.y == 1).sum(), 0)

    def test_sem_nan_final(self):
        """Não deve haver NaN no DataFrame final."""
        self.assertEqual(self.df_final.isnull().sum().sum(), 0)

    def test_features_corretas(self):
        """Todas as 8 features devem estar presentes no DataFrame final."""
        for feat in FEATURES:
            self.assertIn(feat, self.df_final.columns,
                f"Feature '{feat}' ausente no DataFrame final.")

    def test_x_norm_dimensoes_corretas(self):
        """X normalizado deve ter N linhas e 8 colunas."""
        self.assertEqual(self.X_norm.shape[0], len(self.df_final))
        self.assertEqual(self.X_norm.shape[1], len(FEATURES))

    def test_y_binario(self):
        """O vetor y final deve conter apenas 0s e 1s."""
        self.assertTrue(set(np.unique(self.y)).issubset({0, 1}))

    def test_balanceamento_razoavel(self):
        """A proporção da classe minoritária deve ser >= 20% (não degenerada)."""
        prop_min = min((self.y == 0).mean(), (self.y == 1).mean())
        self.assertGreaterEqual(prop_min, 0.20,
            "A base está muito desbalanceada após o pipeline.")


# =============================================================================
# SUÍTE 7 — MODELOS DE CLASSIFICAÇÃO (smoke tests)
# =============================================================================

class TestClassificadores(unittest.TestCase):
    """
    Smoke tests: verifica que cada modelo treina e prediz sem erros,
    e que a acurácia mínima é acima do baseline aleatório (> 50%).
    """

    @classmethod
    def setUpClass(cls):
        from sklearn.model_selection import train_test_split
        from sklearn.pipeline import Pipeline
        from sklearn.preprocessing import StandardScaler
        from sklearn.linear_model import LogisticRegression
        from sklearn.tree import DecisionTreeClassifier
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.neighbors import KNeighborsClassifier
        from sklearn.naive_bayes import GaussianNB
        from sklearn.svm import SVC
        from sklearn.discriminant_analysis import LinearDiscriminantAnalysis

        df = carregar_base(CSV_PATH)
        df = tratar_zeros_impossiveis(df)
        df = remover_duplicatas(df)
        df = remover_inconsistencias(df)
        df = remover_outliers_iqr(df, FEATURES)

        X = df[FEATURES].values
        y = df['Outcome'].values

        cls.X_train, cls.X_test, cls.y_train, cls.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        cls.Pipeline   = Pipeline
        cls.Scaler     = StandardScaler
        cls.modelos    = [
            ('Logistic Regression', LogisticRegression(max_iter=1000, random_state=42)),
            ('Decision Tree',       DecisionTreeClassifier(random_state=42)),
            ('Random Forest',       RandomForestClassifier(n_estimators=50, random_state=42)),
            ('KNN',                 KNeighborsClassifier(n_neighbors=5)),
            ('Naive Bayes',         GaussianNB()),
            ('SVM',                 SVC(probability=True, random_state=42)),
            ('LDA',                 LinearDiscriminantAnalysis()),
        ]

    def _treinar_e_avaliar(self, nome, modelo):
        from sklearn.metrics import accuracy_score
        pipe = self.Pipeline([('scaler', self.Scaler()), ('clf', modelo)])
        pipe.fit(self.X_train, self.y_train)
        preds = pipe.predict(self.X_test)
        acc = accuracy_score(self.y_test, preds)
        return pipe, acc

    def test_todos_modelos_treinam_sem_erro(self):
        """Todos os classificadores devem treinar sem lançar exceção."""
        for nome, modelo in self.modelos:
            with self.subTest(modelo=nome):
                try:
                    self._treinar_e_avaliar(nome, modelo)
                except Exception as e:
                    self.fail(f"Modelo '{nome}' lançou exceção: {e}")

    def test_acuracia_acima_do_baseline(self):
        """Todos os modelos devem superar 55% de acurácia (baseline > aleatório)."""
        for nome, modelo in self.modelos:
            with self.subTest(modelo=nome):
                _, acc = self._treinar_e_avaliar(nome, modelo)
                self.assertGreater(acc, 0.55,
                    f"Modelo '{nome}' com acurácia {acc:.4f} não supera o baseline de 55%.")

    def test_predicao_binaria(self):
        """As predições devem conter apenas 0s e 1s."""
        nome, modelo = self.modelos[0]
        pipe = self.Pipeline([('scaler', self.Scaler()), ('clf', modelo)])
        pipe.fit(self.X_train, self.y_train)
        preds = pipe.predict(self.X_test)
        valores = set(np.unique(preds))
        self.assertTrue(valores.issubset({0, 1}),
            f"Predições contêm valores além de {{0, 1}}: {valores}")

    def test_shape_predicoes(self):
        """O número de predições deve igual ao tamanho do conjunto de teste."""
        nome, modelo = self.modelos[2]  # Random Forest
        pipe = self.Pipeline([('scaler', self.Scaler()), ('clf', modelo)])
        pipe.fit(self.X_train, self.y_train)
        preds = pipe.predict(self.X_test)
        self.assertEqual(len(preds), len(self.y_test))

    def test_probabilidades_entre_zero_e_um(self):
        """Probabilidades devem estar no intervalo [0, 1]."""
        nome, modelo = self.modelos[0]  # Logistic Regression
        pipe = self.Pipeline([('scaler', self.Scaler()), ('clf', modelo)])
        pipe.fit(self.X_train, self.y_train)
        probas = pipe.predict_proba(self.X_test)
        self.assertTrue((probas >= 0).all() and (probas <= 1).all())
        self.assertAlmostEqual(probas.sum(axis=1).mean(), 1.0, places=5)


# =============================================================================
# PONTO DE ENTRADA
# =============================================================================

if __name__ == '__main__':
    print("=" * 65)
    print("  EXECUTANDO TESTES — BASE DE DADOS DIABETES")
    print("=" * 65)
    loader  = unittest.TestLoader()
    suites  = [
        loader.loadTestsFromTestCase(TestCarregamento),
        loader.loadTestsFromTestCase(TestTratamentoZeros),
        loader.loadTestsFromTestCase(TestLimpeza),
        loader.loadTestsFromTestCase(TestOutliers),
        loader.loadTestsFromTestCase(TestNormalizacao),
        loader.loadTestsFromTestCase(TestPipelineCompleto),
        loader.loadTestsFromTestCase(TestClassificadores),
    ]
    suite = unittest.TestSuite(suites)
    runner = unittest.TextTestRunner(verbosity=2)
    resultado = runner.run(suite)
    print("\n" + "=" * 65)
    if resultado.wasSuccessful():
        print(f"  ✓ TODOS OS {resultado.testsRun} TESTES PASSARAM COM SUCESSO")
    else:
        print(f"  ✗ {len(resultado.failures)} falha(s) | {len(resultado.errors)} erro(s)")
        print(f"    de {resultado.testsRun} testes executados")
    print("=" * 65)
    sys.exit(0 if resultado.wasSuccessful() else 1)
