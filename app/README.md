# DiabetesCare — Aplicativo Mobile

Aplicativo mobile do ecossistema **DiabetesCare**, construído com Expo + React Native para acompanhamento diário de diabetes: glicose, alimentação, diário emocional, hidratação, medicações, metas e conteúdo educativo.

---

## Stack e Tecnologias

- **Framework:** Expo SDK 54
- **UI:** React Native 0.81.5
- **Linguagem:** TypeScript
- **Navegação:** React Navigation (native-stack + bottom-tabs)
- **Ícones:** lucide-react-native
- **Gradientes:** expo-linear-gradient
- **Gráficos:** react-native-svg (componente customizado)
- **Estado global:** AppContext (React Context API)
- **Persistência local:** @react-native-async-storage/async-storage

### Dependências principais

| Pacote | Função |
|--------|--------|
| `expo` | SDK e ferramentas de desenvolvimento |
| `react-native` | Framework mobile |
| `@react-navigation/native` | Navegação entre telas |
| `@react-navigation/native-stack` | Navegação em pilha |
| `@react-navigation/bottom-tabs` | Navegação por abas |
| `react-native-gesture-handler` | Suporte a gestos |
| `react-native-safe-area-context` | Safe areas iOS/Android |
| `react-native-screens` | Otimização de telas nativas |
| `react-native-svg` | Renderização de gráficos |
| `lucide-react-native` | Ícones |
| `expo-linear-gradient` | Gradientes |

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- **Expo Go** instalado no celular (Android ou iOS) — ou emulador configurado

---

## Como Executar

```bash
cd app
npm install
npm run start
```

Scripts disponíveis:

| Script | Descrição |
|--------|-----------|
| `npm run start` | Inicia o servidor Expo (Expo Go via QR code) |
| `npm run android` | Abre no emulador Android |
| `npm run ios` | Abre no simulador iOS |
| `npm run web` | Roda versão web via Expo |

---

## Arquitetura de Navegação

### Estrutura em camadas

```
App.tsx
  └── SafeAreaProvider
        └── AppProvider (estado global)
              └── AppNavigator (root stack)
                    ├── OnboardingScreen (só na primeira execução)
                    ├── TabNavigator (abas principais)
                    │     ├── HomeTab
                    │     ├── GlucoseTab
                    │     ├── FoodTab
                    │     ├── JournalTab
                    │     └── MoreTab
                    └── Screens de detalhe/cadastro (stack)
                          ├── AddGlucose, AddFood, AddJournal
                          ├── DiagnosisScreen, DiagnosisDetailScreen
                          ├── TipsScreen, TipDetailScreen
                          ├── ProfileScreen, EditProfileScreen
                          ├── WaterScreen, MedicationsScreen
                          ├── GoalsScreen, ReportsScreen
                          ├── NotificationsScreen, SettingsScreen
                          └── FAQScreen
```

---

## Telas e Funcionalidades

### Abas Principais

#### Início (`HomeScreen`)
- Painel diário consolidado
- Status glicêmico atual e últimas leituras
- Resumo de alimentação, hidratação, medicações e metas do dia
- Atalhos rápidos para ações comuns
- Banner com dica do dia

#### Glicose (`GlucoseScreen`)
- Estatísticas: glicose média, percentual no alvo / acima / abaixo
- Gráfico de evolução por período
- Filtros: dia, semana, mês
- Histórico de leituras com contexto e status visual
- Exclusão de registros
- Acesso à tela de nova leitura

#### Alimentação (`FoodDiaryScreen`)
- Seletor de data (hoje / ontem / anteontem)
- Resumo de calorias e macronutrientes do dia
- Refeições organizadas por tipo: café da manhã, almoço, jantar, lanche
- Indicador de carga glicêmica diária
- Adição e remoção de refeições

#### Diário (`JournalScreen`)
- Registros emocionais e clínicos
- Filtro por humor (ótimo / bom / ok / mal / péssimo)
- Lista de entradas com sintomas e tags
- Criação e exclusão de registros

#### Mais (`MoreScreen`)
Hub com acesso a todos os módulos adicionais:
- Hidratação · Medicações · Metas · Relatórios
- Pré-diagnóstico · Dicas & Artigos · FAQ
- Perfil · Notificações · Configurações

---

### Telas de Cadastro e Detalhe

| Tela | Função |
|------|--------|
| `AddGlucoseScreen` | Registrar nova leitura de glicose |
| `AddFoodScreen` | Adicionar refeição ao diário alimentar |
| `AddJournalScreen` | Criar entrada no diário emocional |
| `DiagnosisScreen` | Questionário de pré-diagnóstico |
| `DiagnosisDetailScreen` | Resultado detalhado do pré-diagnóstico |
| `TipsScreen` | Lista de dicas educativas por categoria |
| `TipDetailScreen` | Conteúdo completo de uma dica |
| `ProfileScreen` | Perfil do usuário |
| `EditProfileScreen` | Editar dados pessoais e clínicos |
| `WaterScreen` | Controle de ingestão hídrica |
| `MedicationsScreen` | Lista e controle de medicamentos |
| `GoalsScreen` | Definição e acompanhamento de metas |
| `ReportsScreen` | Relatórios consolidados de saúde |
| `NotificationsScreen` | Central de notificações |
| `SettingsScreen` | Configurações do aplicativo |
| `FAQScreen` | Perguntas frequentes |

---

## Gerenciamento de Estado

Arquivo: [src/context/AppContext.tsx](src/context/AppContext.tsx)

O `AppContext` centraliza todos os dados da sessão:

| Estado | Tipo |
|--------|------|
| `user` | Perfil do usuário |
| `glucoseReadings` | Leituras de glicose |
| `meals` | Refeições registradas |
| `journals` | Entradas do diário |
| `notifications` | Notificações do sistema |
| `medications` | Lista de medicamentos |
| `water` | Registros de hidratação |
| `goals` | Metas de saúde |
| `exercises` | Atividades físicas |
| `sleep` | Registros de sono |
| `settings` | Configurações do app |
| `onboarded` | Status de onboarding |

### Ações disponíveis

```
addGlucoseReading / deleteGlucoseReading
addMeal / deleteMeal
addJournal / deleteJournal
toggleMedication
addWater / getTodayWater
updateGoal / addExercise
markNotificationRead / markAllNotificationsRead
updateUser / updateSettings
completeOnboarding
```

---

## Estrutura de Pastas

```
app/
  App.tsx                     # Entry point — providers + AppNavigator
  app.json                    # Configuração Expo
  index.ts                    # Registro do componente raiz
  src/
    navigation/
      AppNavigator.tsx        # Root stack (onboarding + tabs + modais)
      TabNavigator.tsx        # Tab bar customizada com badge
    context/
      AppContext.tsx          # Estado global da aplicação
      AuthContext.tsx         # Estado de autenticação
    screens/
      Onboarding/
      Home/
      Glucose/
      Food/
      Journal/
      More/
      Profile/
      Reports/
      Settings/
      Notifications/
      Water/
      Medications/
      Goals/
      Diagnosis/
      Tips/
      FAQ/
      Auth/
    components/
      common/                 # Button, Card, ScreenHeader, ProgressBar...
      charts/
        GlucoseChart.tsx      # Gráfico SVG de evolução glicêmica
    data/
      mockData.ts             # Dados mockados da sessão
      foodDatabase.ts         # Base de alimentos com macros
      diagnosisData.ts        # Dados do pré-diagnóstico
      faqData.ts              # Perguntas frequentes
    theme/
      colors.ts               # Paleta de cores semânticas
      index.ts                # Tokens: tipografia, espaçamento, bordas, sombras
    types/
      index.ts                # Todas as interfaces TypeScript
    utils/
      helpers.ts              # Utilitários: formatadores, cálculos
```

---

## Design System

### Tokens de tema (`src/theme/`)

- **Cores semânticas:** primária, secundária, sucesso, alerta, perigo, neutros
- **Tipografia:** tamanhos, pesos e line-heights padronizados
- **Espaçamentos:** escala consistente (4, 8, 12, 16, 24, 32...)
- **Bordas:** raios de arredondamento
- **Sombras:** elevações para cards e modais

### Componentes reutilizáveis (`src/components/common/`)

| Componente | Uso |
|-----------|-----|
| `Button` | Botões com variantes (primary, secondary, outline, ghost) |
| `Card` | Container com sombra e bordas arredondadas |
| `ScreenHeader` | Cabeçalho padrão das telas com título e ações |
| `ProgressBar` | Barra de progresso para metas e macros |
| `GlucoseStatusBadge` | Badge colorido de status glicêmico |
| `EmptyState` | Estado vazio com ícone e mensagem |

---

## Tipos TypeScript

Arquivo: [src/types/index.ts](src/types/index.ts)

Interfaces tipadas para todo o domínio:

`User` · `GlucoseReading` · `Meal` · `Food` · `DiaryEntry` · `Medication` · `Goal` · `WaterEntry` · `Exercise` · `SleepEntry` · `Notification` · `Tip` · `DiagnosisResult` · `FAQItem` · `AppSettings`

Tipos de navegação: `RootStackParamList` · `TabParamList`

---

## Fluxo de Uso

1. Usuário abre o app
2. Se for a primeira vez, passa pelo **Onboarding**
3. Após concluir, acessa as **abas principais**
4. Navega entre as telas de detalhe/cadastro pelo **Stack Navigator**
5. Todas as ações refletem no **AppContext** (memória da sessão)

> O app funciona atualmente **sem backend externo** — os dados são mantidos em memória durante a sessão via `AppContext` e dados mockados.
