# DiabetesCare — Painel Administrativo Web

Painel web do ecossistema **DiabetesCare**, construído com Next.js 14 para monitoramento clínico de pacientes com diabetes — visualização de glicose, alimentação, usuários e indicadores de saúde.

---

## Stack e Tecnologias

- **Framework:** Next.js 14.2.5 (App Router)
- **UI:** React 18 + Tailwind CSS
- **Linguagem:** TypeScript (strict)
- **Ícones:** lucide-react
- **Gráficos:** Recharts
- **Helpers CSS:** clsx + tailwind-merge

### Dependências principais

| Pacote | Função |
|--------|--------|
| `next` | Framework React com SSR/SSG |
| `react`, `react-dom` | Biblioteca de UI |
| `tailwindcss` | Estilização utilitária |
| `lucide-react` | Ícones |
| `recharts` | Gráficos e visualizações |
| `clsx`, `tailwind-merge` | Merge de classes CSS |

---

## Pré-requisitos

- Node.js 20 LTS ou superior
- npm 10+

---

## Como Rodar

### Desenvolvimento

```bash
cd web
npm install
npm run dev
```

Acesse: `http://localhost:3001`

### Produção

```bash
npm run build
npm run start
```

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Servidor Next.js na porta 3001 (hot reload) |
| `npm run build` | Gera build otimizado para produção |
| `npm run start` | Inicia o build de produção na porta 3001 |
| `npm run lint` | Executa ESLint no projeto |

---

## Telas Implementadas

### Dashboard (`/dashboard`)

Resumo executivo com visão geral da plataforma:

- Cards de KPI (total de usuários, glicose média, alertas ativos, adesão)
- Gráfico de tendência glicêmica (área com mínimo, média e máximo)
- Alertas recentes
- Distribuição de glicemia e tipos de diabetes
- Calorias semanais
- Últimas leituras e usuários ativos

### Usuários (`/users`)

Gestão de pacientes:

- KPIs de base de usuários (ativos, inativos, novos)
- Busca por nome ou e-mail
- Filtro por status (todos / ativos / inativos)
- Tabela com tipo de diabetes, HbA1c, glicose média, adesão e status

### Glicose (`/glucose`)

Monitoramento glicêmico:

- KPIs de desempenho (no alvo, acima, abaixo da meta)
- Gráfico de evolução com faixas de referência
- Busca por data, valor, contexto e observações
- Filtro por status (normal / alto / muito alto / baixo)
- Tabela de leituras com contexto e status visual

### Alimentação (`/meals`)

Análise alimentar:

- KPIs nutricionais (calorias médias, carboidratos, proteínas, gorduras)
- Gráfico de calorias por dia da semana
- Progresso de macronutrientes
- Busca textual e filtro por tipo de refeição
- Lista detalhada de refeições e alimentos

---

## Rotas Planejadas (em desenvolvimento)

As rotas abaixo já estão na Sidebar aguardando implementação:

- `/journal` — Diário emocional dos pacientes
- `/medications` — Acompanhamento de medicações
- `/goals` — Metas de saúde
- `/tips` — Gerenciamento de dicas educativas
- `/notifications` — Central de notificações
- `/reports` — Relatórios analíticos
- `/settings` — Configurações do sistema

---

## Estrutura de Pastas

```
web/
  app/
    layout.tsx                  # Layout raiz + fonte Inter + globals.css
    page.tsx                    # Redireciona para /dashboard
    login/
      page.tsx                  # Tela de autenticação
    (admin)/
      layout.tsx                # Shell administrativo (Sidebar + Header + main)
      dashboard/page.tsx        # Dashboard principal
      users/page.tsx            # Gestão de usuários
      glucose/page.tsx          # Monitoramento de glicose
      meals/page.tsx            # Análise alimentar
      journal/page.tsx
      medications/page.tsx
      goals/page.tsx
      tips/page.tsx
      notifications/page.tsx
      reports/page.tsx
      settings/page.tsx
  components/
    layout/
      Sidebar.tsx               # Navegação lateral (desktop + mobile)
      Header.tsx                # Cabeçalho dinâmico por rota
  lib/
    mock-data.ts                # Tipos de domínio e dados mockados
    utils.ts                    # Formatadores, labels, cores e helpers
  app/globals.css               # Estilos globais + fonte + scrollbar
  tailwind.config.ts            # Tema estendido com paleta própria
  tsconfig.json
  package.json
```

---

## Arquitetura de Layout

### Fluxo de navegação

1. Usuário acessa `/` → redireciona para `/dashboard`
2. `app/(admin)/layout.tsx` aplica o shell com **Sidebar + Header**
3. A página ativa renderiza e filtra os dados locais

### Sidebar (`components/layout/Sidebar.tsx`)

- Responsiva: versão desktop fixa + mobile com overlay e hambúrguer
- Agrupamento de links: Visão Geral · Gestão · Conteúdo · Sistema
- Destaca a rota ativa automaticamente

### Header (`components/layout/Header.tsx`)

- Título e subtítulo dinâmicos de acordo com a rota atual
- Campo de busca visual
- Ícone de notificações e avatar do usuário

---

## Sistema de Dados

> Atualmente o projeto usa **dados mockados** em `lib/mock-data.ts`. Sem integração com o backend.

### Tipos de domínio disponíveis

`MockUser` · `GlucoseReading` · `Meal` · `DiaryEntry` · `Medication` · `Goal` · `Notification` · `Tip`

### Séries para gráficos

`GLUCOSE_TREND` · `GLUCOSE_DISTRIBUTION` · `DIABETES_TYPE_DISTRIBUTION` · `WEEKLY_MEALS_CALORIES`

### Helpers em `lib/utils.ts`

- `getGlucoseStatusLabel` / `getGlucoseStatusColor` — status glicêmico
- `getDiabetesTypeLabel` — tipo de diabetes
- `formatDate` / `formatDateTime` — formatação de datas
- `calculateBMI` — cálculo de IMC
- `cn` — merge de classes Tailwind (clsx + tailwind-merge)

---

## Design System

### Paleta personalizada (`tailwind.config.ts`)

| Token | Uso |
|-------|-----|
| `primary` | Ações principais e destaque |
| `secondary` | Elementos secundários |
| `success` | Glicose no alvo, status positivo |
| `warning` | Alertas e atenção |
| `danger` | Erros e valores críticos |
| `purple`, `orange`, `teal`, `pink` | Gráficos e categorias |
| `background`, `card` | Superfícies da UI |

### Fonte

`Inter` (Google Fonts) — carregada via `globals.css`
