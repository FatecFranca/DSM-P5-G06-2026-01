# DiabetesCare Admin Web

Painel administrativo web do ecossistema **DiabetesCare**, construído com Next.js para monitorar usuários, glicose, alimentação e indicadores de saúde.

## Visão Geral

Este frontend é um painel para acompanhamento operacional e clínico com foco em:

- Visualização rápida de indicadores (KPIs)
- Acompanhamento de leituras de glicose
- Gestão de usuários
- Visualização de dados alimentares
- Navegação preparada para novos módulos (diário, metas, notificações, relatórios etc.)

> Atualmente, o projeto usa **dados mockados** em `lib/mock-data.ts` (sem backend integrado).

## Stack e Tecnologias

- **Framework:** Next.js `14.2.5` (App Router)
- **UI:** React 18 + Tailwind CSS
- **Linguagem:** TypeScript (strict)
- **Ícones:** `lucide-react`
- **Gráficos:** `recharts`
- **Helpers de classe CSS:** `clsx` + `tailwind-merge`

## Bibliotecas Utilizadas

### Dependências principais

- `next`
- `react`, `react-dom`
- `tailwindcss`, `postcss`, `autoprefixer`
- `lucide-react`
- `recharts`
- `clsx`
- `tailwind-merge`

### Dev dependencies

- `typescript`
- `@types/node`, `@types/react`, `@types/react-dom`
- `eslint`
- `eslint-config-next`

## Como rodar o frontend (`web/`)

### 1) Instalar dependências

```bash
npm install
```

### 2) Ambiente recomendado

- **Node.js 20 LTS** (recomendado para estabilidade com Next 14)

### 3) Iniciar em desenvolvimento

```bash
npm run dev
```

O projeto sobe em:

- [http://localhost:3001](http://localhost:3001)

### 4) Build de produção

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev` — sobe o servidor Next na porta `3001`
- `npm run build` — gera build de produção
- `npm run start` — inicia build em produção na porta `3001`
- `npm run lint` — executa lint do projeto

## Estrutura de Pastas

```text
web/
  app/
    layout.tsx                 # Layout raiz + metadata + globals.css
    page.tsx                   # Redirect para /dashboard
    (admin)/
      layout.tsx               # Layout administrativo (Sidebar + Header + main)
      dashboard/page.tsx       # Tela principal com KPIs, alertas e gráficos
      users/page.tsx           # Gestão de usuários
      glucose/page.tsx         # Monitoramento de glicose
      meals/page.tsx           # Gestão alimentar
  components/
    layout/
      Sidebar.tsx              # Menu lateral (desktop/mobile)
      Header.tsx               # Cabeçalho com contexto por rota
  lib/
    mock-data.ts               # Tipos e dados mockados de domínio
    utils.ts                   # Formatação, labels e helpers visuais
  app/globals.css              # Estilos globais + fonte Inter
  tailwind.config.ts           # Tema e extensão de cores
  tsconfig.json
  package.json
```

## Arquitetura de Navegação

### Roteamento

- `app/page.tsx` redireciona para `/dashboard`
- `app/(admin)/layout.tsx` aplica o shell administrativo para as páginas internas

### Layout Administrativo

O shell administrativo é composto por:

- **Sidebar (`components/layout/Sidebar.tsx`)**
  - Navegação por grupos (Visão Geral, Gestão, Conteúdo, Sistema)
  - Responsivo com versão mobile (menu hambúrguer + overlay)
- **Header (`components/layout/Header.tsx`)**
  - Título/subtítulo dinâmicos por rota
  - Campo de busca visual
  - Notificações e avatar

## Telas Implementadas

### 1) Dashboard (`/dashboard`)

Resumo executivo com:

- Banner de boas-vindas
- Cards de KPI
- Tendência de glicose (área com min/média/máx)
- Alertas recentes
- Distribuições (glicemia e tipos de diabetes)
- Calorias semanais
- Listas de últimas leituras e usuários ativos

**Dados usados:** `MOCK_USERS`, `MOCK_GLUCOSE`, `GLUCOSE_TREND`, `GLUCOSE_DISTRIBUTION`, `DIABETES_TYPE_DISTRIBUTION`, `WEEKLY_MEALS_CALORIES`.

### 2) Usuários (`/users`)

Gestão de pacientes com:

- KPIs de base de usuários
- Busca por nome/email
- Filtro por status (`all`, `active`, `inactive`)
- Tabela com tipo de diabetes, HbA1c, glicose média, aderência e status
- Cards de resumo de usuários

**Dados usados:** `MOCK_USERS`.

### 3) Glicose (`/glucose`)

Monitoramento glicêmico com:

- KPIs de desempenho glicêmico
- Gráfico de evolução (média/mín/máx + faixas de referência)
- Busca por data, valor, contexto e observações
- Filtro por status (`all`, `normal`, `high`, `very_high`, `low`)
- Tabela de leituras com contexto e status visual

**Dados usados:** `MOCK_GLUCOSE`, `GLUCOSE_TREND`.

### 4) Alimentação (`/meals`)

Gestão alimentar com:

- KPIs nutricionais
- Gráfico de calorias por dia
- Progresso de macronutrientes (carboidratos, proteínas, gorduras, calorias)
- Busca textual
- Filtro por tipo de refeição
- Lista detalhada de refeições e alimentos

**Dados usados:** `MOCK_MEALS`, `WEEKLY_MEALS_CALORIES`.

## Rotas do menu ainda não implementadas

A Sidebar já referencia rotas que ainda não têm página criada:

- `/journal`
- `/medications`
- `/goals`
- `/tips`
- `/notifications`
- `/reports`
- `/settings`

Isso facilita a evolução incremental do painel, mantendo a navegação planejada.

## Sistema de Dados (Mock)

Todo o domínio está centralizado em `lib/mock-data.ts`, com:

- Tipos de domínio (usuários, glicose, alimentação, diário, medicamentos, metas, notificações, dicas)
- Dados mock para prototipação
- Séries agregadas para gráficos (`GLUCOSE_TREND`, `WEEKLY_MEALS_CALORIES`, etc.)

### Helpers utilitários

Em `lib/utils.ts` existem funções para:

- Labels de status/tipos
- Cores por estado
- Formatação de data
- Cálculo de IMC
- Função `cn` para merge de classes Tailwind

## Design System (Tailwind)

O tema foi estendido em `tailwind.config.ts` com paleta própria:

- `primary`, `secondary`, `success`, `warning`, `danger`
- `purple`, `orange`, `teal`, `pink`
- `background`, `card`

No `globals.css`:

- Fonte `Inter`
- Reset básico de box model
- Estilo de scrollbar customizado

## Como o frontend funciona (fluxo)

1. Usuário acessa `/`
2. App redireciona para `/dashboard`
3. `layout (admin)` carrega Sidebar + Header
4. Página ativa renderiza dados mock e interações locais (filtros/busca)
5. Gráficos e tabelas atualizam em memória a partir dos filtros

## Estado atual e próximos passos

### Estado atual

- Frontend funcional para demonstração/admin UI
- Módulos principais iniciais prontos (dashboard, usuários, glicose, refeições)
- Sem autenticação real
- Sem persistência/API real

### Próximos passos recomendados

- Integrar backend (REST/GraphQL) e remover mock local
- Criar camada de serviços/API (`lib/api/*`)
- Implementar autenticação e autorização (ex.: NextAuth/JWT)
- Adicionar páginas faltantes do menu
- Adicionar testes (unitários e e2e)
- Padronizar tratamento de loading/error/empty states

## Troubleshooting

### Erro de SWC no Windows

Se aparecer erro como:

`Failed to load SWC binary for win32/x64`

Faça:

```bash
rm -rf node_modules package-lock.json
npm install
```

E prefira Node 20 LTS.

---

Se quiser, posso também criar uma versão deste README com **diagramas de arquitetura** (rotas, layout e fluxo de dados) para documentação técnica do time.
