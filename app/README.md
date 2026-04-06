# DiabetesCare App (Mobile)

Aplicativo mobile do **DiabetesCare** construído com Expo + React Native, com foco em acompanhamento diário de diabetes: glicose, alimentação, diário emocional, hidratação, medicações, metas e conteúdo educativo.

## Visão Geral

O app é organizado em:

- **Onboarding** inicial
- **Navegação por abas** (Início, Glicose, Alimentos, Diário, Mais)
- **Fluxos complementares em Stack** (cadastros, detalhes e telas utilitárias)
- **Estado global** via `AppContext`
- **Dados mockados locais** para prototipação (`src/data/mockData.ts`)

> Atualmente, o app funciona sem backend externo: os dados são mantidos em memória durante a sessão.

---

## Stack e Tecnologias

- **Framework mobile:** Expo SDK `54`
- **UI:** React Native `0.81.5`
- **Linguagem:** TypeScript
- **Navegação:** React Navigation (`native-stack` + `bottom-tabs`)
- **Safe area:** `react-native-safe-area-context`
- **Ícones:** `lucide-react-native`
- **Gradientes:** `expo-linear-gradient`
- **SVG/Charts:** `react-native-svg` + componente gráfico customizado
- **Status bar:** `expo-status-bar`

### Dependências principais

- `expo`
- `react`, `react-native`
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `react-native-gesture-handler`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-svg`
- `lucide-react-native`
- `expo-linear-gradient`
- `@react-native-async-storage/async-storage` (instalado)
- `zustand` (instalado, não é o estado principal atual)

---

## Como Executar

Dentro da pasta `app/`:

```bash
npm install
npm run start
```

Scripts disponíveis:

- `npm run start` — inicia Expo
- `npm run android` — abre no Android
- `npm run ios` — abre no iOS
- `npm run web` — roda versão web via Expo

---

## Arquitetura de Navegação

### Entrada

Arquivo: `App.tsx`

Fluxo de providers:

1. `SafeAreaProvider`
2. `AppProvider` (contexto global)
3. `AppNavigator`

### Navegador raiz (Stack)

Arquivo: `src/navigation/AppNavigator.tsx`

Rotas principais do stack:

- `Onboarding` (aparece se `onboarded === false`)
- `Main` (tabs)
- `AddGlucose`
- `AddFood`
- `AddJournal`
- `DiagnosisDetail`
- `TipDetail`
- `EditProfile`
- `Profile`
- `Reports`
- `Settings`
- `Notifications`
- `Water`
- `Medications`
- `Goals`
- `FAQ`
- `Diagnosis`
- `Tips`

### Navegação por abas

Arquivo: `src/navigation/TabNavigator.tsx`

Abas:

- `HomeTab` (Início)
- `GlucoseTab` (Glicose)
- `FoodTab` (Alimentos)
- `JournalTab` (Diário)
- `MoreTab` (Mais)

Possui **tab bar customizada** com badge de notificações no item "Mais".

---

## Telas e Módulos

## Abas principais

### 1) Início (`HomeScreen`)

- Painel consolidado do dia
- Status glicêmico e últimos registros
- Resumo de alimentação, hidratação, medicações e metas
- Atalhos rápidos para ações comuns
- Banner com dica do dia

### 2) Glicose (`GlucoseScreen`)

- Estatísticas de glicose (média, no alvo, acima, abaixo)
- Gráfico de evolução
- Filtros por período
- Lista de leituras com status e exclusão
- Acesso para registrar nova leitura

### 3) Alimentação (`FoodDiaryScreen`)

- Diário alimentar por data (hoje/ontem/anteontem)
- Resumo de calorias/macros
- Refeições por tipo (café/almoço/jantar/lanche)
- Cadastro e remoção de refeições
- Indicador de carga glicêmica diária

### 4) Diário (`JournalScreen`)

- Registros emocionais e clínicos
- Filtro por humor
- Lista de entradas com sintomas/tags
- Criação e exclusão de registros

### 5) Mais (`MoreScreen`)

Hub com acesso para:

- Hidratação
- Medicações
- Metas
- Relatórios
- Pré-diagnóstico
- Dicas & Artigos
- FAQ
- Perfil
- Notificações
- Configurações

## Telas complementares (Stack)

- **Onboarding**
  - `OnboardingScreen`
- **Glicose**
  - `AddGlucoseScreen`
- **Alimentação**
  - `AddFoodScreen`
- **Diário**
  - `AddJournalScreen`
- **Pré-diagnóstico**
  - `DiagnosisScreen`
  - `DiagnosisDetailScreen`
- **Conteúdo educativo**
  - `TipsScreen`
  - `TipDetailScreen`
- **Perfil**
  - `ProfileScreen`
  - `EditProfileScreen`
- **Saúde e suporte**
  - `WaterScreen`
  - `MedicationsScreen`
  - `GoalsScreen`
  - `ReportsScreen`
  - `NotificationsScreen`
  - `SettingsScreen`
  - `FAQScreen`

---

## Gerenciamento de Estado

Arquivo: `src/context/AppContext.tsx`

O `AppContext` centraliza:

- usuário
- leituras de glicose
- refeições
- diário
- notificações
- medicações
- água
- metas
- exercícios
- sono
- configurações
- status de onboarding

### Ações principais expostas

- `addGlucoseReading`, `deleteGlucoseReading`
- `addMeal`, `deleteMeal`
- `addJournal`, `deleteJournal`
- `markNotificationRead`, `markAllNotificationsRead`
- `toggleMedication`
- `addWater`, `getTodayWater`
- `updateSettings`, `updateUser`
- `completeOnboarding`
- `updateGoal`, `addExercise`

---

## Estrutura de Pastas

```text
app/
  App.tsx
  app.json
  index.ts
  src/
    navigation/
      AppNavigator.tsx
      TabNavigator.tsx
    context/
      AppContext.tsx
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
    components/
      common/
      charts/
    data/
      mockData.ts
      foodDatabase.ts
      diagnosisData.ts
      faqData.ts
    theme/
      colors.ts
      index.ts
    types/
      index.ts
    utils/
      helpers.ts
```

---

## Design System

Pastas:

- `src/theme/colors.ts`
- `src/theme/index.ts`

Define tokens de:

- cores semânticas
- tipografia
- espaçamentos
- bordas
- sombras

Componentes reutilizáveis em `src/components/common`:

- `Card`
- `Button`
- `ScreenHeader`
- `ProgressBar`
- `GlucoseStatusBadge`
- `EmptyState`

Gráfico:

- `src/components/charts/GlucoseChart.tsx`

---

## Tipagem e Domínio

Arquivo: `src/types/index.ts`

Modelos tipados para:

- usuário
- glicose
- alimentação
- diário
- pré-diagnóstico
- FAQ
- notificações
- medicações
- metas
- exercícios
- sono
- dicas
- configurações
- tipos de navegação (`RootStackParamList`, `TabParamList`)

---

## Dados Mockados

Arquivos:

- `src/data/mockData.ts`
- `src/data/foodDatabase.ts`
- `src/data/diagnosisData.ts`
- `src/data/faqData.ts`

Uso atual:

- alimentar as telas sem depender de API
- acelerar validação visual/UX
- facilitar testes manuais de fluxo

---

## Fluxo de Uso do App

1. Usuário abre o app
2. Se não onboarded, entra em onboarding
3. Após concluir, vai para `Main` (tabs)
4. Usuário navega pelas abas e abre telas complementares via stack
5. Ações de cadastro/edição refletem no `AppContext` local

---
