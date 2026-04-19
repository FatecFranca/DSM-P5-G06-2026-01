# DiabetesCare — DSM-P5-G06-2026/1

Sistema completo de gerenciamento de diabetes, desenvolvido como projeto interdisciplinar do **5º semestre de DSM (Desenvolvimento de Software Multiplataforma)** pela turma de 2026/1.

**Grupo 06:** Hudson Ribeiro Barbara Junior · Gabriel Pessoni · Livia Portela

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Requisitos Funcionais](#requisitos-funcionais)
4. [Requisitos Não Funcionais](#requisitos-não-funcionais)
5. [Banco de Dados](#banco-de-dados)
6. [Segurança](#segurança)
7. [Design System](#design-system)
8. [Pré-requisitos Globais](#pré-requisitos-globais)
9. [Como Rodar o Projeto](#como-rodar-o-projeto)
10. [Estrutura do Repositório](#estrutura-do-repositório)
11. [Documentação por Módulo](#documentação-por-módulo)
12. [Equipe](#equipe)

---

## Visão Geral

O **DiabetesCare** é um ecossistema de saúde digital voltado ao acompanhamento e gerenciamento do diabetes. A plataforma conecta pacientes (via app mobile) e profissionais de saúde (via painel web), com suporte de uma API REST centralizada e um módulo de pré-diagnóstico baseado em machine learning.

### Módulos do Ecossistema

| Módulo | Tecnologia | Finalidade | Porta |
|--------|-----------|-----------|-------|
| `app/` | Expo + React Native | Aplicativo mobile para pacientes | 8081 |
| `web/` | Next.js 14 | Painel administrativo para clínicos | 3001 |
| `backend/` | Express + Prisma + PostgreSQL | API REST centralizada | 3000 |
| `algoritmo-python/` | Python + scikit-learn | Pré-diagnóstico via ML | — |

### Contexto do Problema

O diabetes é uma das doenças crônicas mais prevalentes no Brasil e no mundo, exigindo monitoramento contínuo e disciplina no estilo de vida. Ferramentas digitais integradas — que conectem pacientes, dados clínicos e profissionais de saúde — são essenciais para melhorar a adesão ao tratamento e a qualidade de vida dos pacientes.

O DiabetesCare resolve este problema oferecendo:
- **Para pacientes:** um app mobile intuitivo para registro diário de glicose, alimentação, medicamentos, hidratação, humor e metas
- **Para clínicos e administradores:** um painel web com dashboards, alertas e gestão centralizada
- **Para análise de risco:** um algoritmo de ML treinado para identificar predisposição ao diabetes

---

## Arquitetura do Sistema

```
┌─────────────────────┐     ┌─────────────────────┐
│     App Mobile      │     │     Web Admin        │
│  Expo / React Native│     │     Next.js 14       │
│     :8081           │     │     :3001            │
└──────────┬──────────┘     └──────────┬──────────┘
           │                           │
           └─────────────┬─────────────┘
                         │ HTTP/REST + JWT
           ┌─────────────▼─────────────┐
           │        Backend API        │
           │   Express + Prisma ORM    │
           │         :3000             │
           └─────────────┬─────────────┘
                         │
           ┌─────────────▼─────────────┐
           │        PostgreSQL         │
           │    (banco relacional)     │
           └───────────────────────────┘

           ┌───────────────────────────┐
           │    Algoritmo Python       │  ← standalone
           │  scikit-learn / Pandas    │
           └───────────────────────────┘
```

### Fluxo de Dados

```
Paciente registra leitura de glicose no App
  → App envia POST /api/glucose ao Backend
  → Backend valida JWT e persiste no PostgreSQL via Prisma
  → Admin abre Web Panel → GET /api/glucose retorna dados
  → Dashboard exibe KPIs e gráficos em tempo real
```

### Decisões Arquiteturais

| Decisão | Justificativa |
|---|---|
| **App Router (Next.js 14)** | Layouts aninhados, Server Components e melhor organização de rotas |
| **React Context no mobile** | Simplicidade e sem overhead para o escopo do projeto |
| **Prisma ORM** | Migrations tipadas, autocomplete e segurança em queries |
| **JWT stateless** | Escalabilidade horizontal e sem estado de sessão no servidor |
| **Tailwind CSS** | Alta produtividade e consistência visual sem CSS personalizado |
| **Mock data no frontend** | Desenvolvimento desacoplado da API durante prototipação |
| **scikit-learn** | Biblioteca madura com vasta gama de classificadores para comparação |

---

## Requisitos Funcionais

### Paciente (App Mobile)

| ID | Descrição |
|----|-----------|
| RF01 | Registrar leituras de glicose com valor, contexto (jejum, pré/pós-refeição, antes de dormir) e notas |
| RF02 | Visualizar evolução glicêmica por gráficos e estatísticas (média, % no alvo, acima, abaixo) |
| RF03 | Registrar refeições com alimentos, macronutrientes, calorias e carga glicêmica |
| RF04 | Manter diário emocional com registro de humor, sintomas e tags personalizadas |
| RF05 | Controlar ingestão hídrica diária com meta configurável |
| RF06 | Gerenciar medicamentos e registrar doses tomadas por horário |
| RF07 | Definir e acompanhar metas de saúde por categoria (glicose, peso, exercício, água, sono, passos) |
| RF08 | Visualizar relatórios consolidados com gráficos de evolução |
| RF09 | Realizar pré-diagnóstico de diabetes por questionário interativo |
| RF10 | Acessar dicas e artigos educativos por categoria |
| RF11 | Consultar perguntas frequentes (FAQ) por categoria |
| RF12 | Gerenciar perfil pessoal (dados clínicos, metas glicêmicas, médico responsável) |
| RF13 | Receber e gerenciar notificações de lembretes e alertas |
| RF14 | Completar fluxo de onboarding guiado na primeira execução |

### Clínico / Administrador (Web Admin)

| ID | Descrição |
|----|-----------|
| RF15 | Visualizar dashboard com KPIs de glicose, usuários, metas, alertas e aderência |
| RF16 | Gerenciar pacientes com busca por nome/email e filtros por status |
| RF17 | Monitorar leituras de glicose com gráficos de tendência e filtros por status |
| RF18 | Analisar dados alimentares, calorias e macronutrientes dos pacientes |
| RF19 | Acompanhar entradas do diário emocional com distribuição de humor |
| RF20 | Gerenciar medicamentos e visualizar aderência farmacológica por paciente |
| RF21 | Acompanhar metas dos pacientes por categoria com progresso visual |
| RF22 | Gerenciar dicas e artigos educativos com destaque e métricas de engajamento |
| RF23 | Gerenciar notificações com envio, agendamento e histórico |
| RF24 | Visualizar relatórios analíticos consolidados com opção de exportação |
| RF25 | Configurar preferências do painel (perfil, notificações, segurança, aparência, sistema) |

### Backend / API

| ID | Descrição |
|----|-----------|
| RF26 | Registrar e autenticar usuários com JWT |
| RF27 | Gerenciar perfil de usuário com leitura e edição |
| RF28 | CRUD completo de entradas de diário |
| RF29 | CRUD completo de dicas educativas com controle de destaque |
| RF30 | CRUD completo de FAQ com controle de visibilidade e ordem |
| RF31 | Listagem administrativa de usuários e diários com paginação |
| RF32 | Controle de acesso por perfil (USUARIO / ADMIN) |

### Algoritmo ML

| ID | Descrição |
|----|-----------|
| RF33 | Pré-processar e limpar dataset de diabetes (Pima Indians Diabetes Dataset) |
| RF34 | Treinar e comparar 8 classificadores de machine learning |
| RF35 | Gerar métricas de avaliação (acurácia, precisão, recall, F1-Score, ROC-AUC, matriz de confusão) |
| RF36 | Realizar predição de risco de diabetes para novos pacientes |

---

## Requisitos Não Funcionais

### Desempenho

| ID | Descrição | Métrica |
|----|-----------|---------|
| RNF01 | O app mobile deve responder a interações do usuário sem travamentos perceptíveis | < 16ms por frame (60 FPS) |
| RNF02 | O painel web deve carregar a página inicial em tempo aceitável | < 3 segundos em conexão 4G |
| RNF03 | A API REST deve responder às requisições principais com baixa latência | < 500ms em ambiente de produção |
| RNF04 | Gráficos e tabelas devem renderizar com dados sem bloqueio da interface | Renderização assíncrona com indicador de carregamento |

### Usabilidade

| ID | Descrição |
|----|-----------|
| RNF05 | O app mobile deve ser utilizável sem treinamento prévio, seguindo convenções de UX mobile (iOS/Android) |
| RNF06 | O painel web deve ser responsivo, funcionando em telas a partir de 320px de largura |
| RNF07 | Todas as mensagens de erro e feedback ao usuário devem estar em português do Brasil |
| RNF08 | Paleta de cores e tipografia devem garantir contraste mínimo de 4.5:1 (WCAG AA) nas informações críticas |
| RNF09 | O fluxo de registro de glicose deve ser concluído em no máximo 3 toques/cliques |
| RNF10 | O painel administrativo deve exibir o estado vazio (sem dados) de forma orientativa em todas as listas |

### Confiabilidade

| ID | Descrição |
|----|-----------|
| RNF11 | Dados inseridos no app devem persistir durante a sessão mesmo sem conectividade (estado em memória) |
| RNF12 | A API deve retornar mensagens de erro padronizadas e códigos HTTP semanticamente corretos |
| RNF13 | O banco de dados deve utilizar migrations versionadas (Prisma Migrate) para garantir rastreabilidade de mudanças |
| RNF14 | Entradas de glicose com valores fora do intervalo fisiológico (< 20 ou > 600 mg/dL) devem ser rejeitadas com feedback visual |

### Segurança

| ID | Descrição |
|----|-----------|
| RNF15 | Toda comunicação entre frontend e backend deve ser autenticada via JWT com expiração configurável |
| RNF16 | Senhas de usuários devem ser armazenadas com hash seguro (bcrypt, mínimo 10 rounds) |
| RNF17 | Rotas administrativas devem ser protegidas por middleware de autorização com verificação de perfil (ADMIN) |
| RNF18 | Tokens JWT não devem conter dados sensíveis no payload (apenas `userId` e `role`) |
| RNF19 | A API deve implementar validação e sanitização de entrada para prevenção de injeção SQL e XSS |
| RNF20 | Dados de saúde do paciente devem ser tratados como sensíveis, seguindo os princípios da LGPD |

### Manutenibilidade

| ID | Descrição |
|----|-----------|
| RNF21 | O código deve ser 100% tipado em TypeScript em todos os módulos JavaScript/TypeScript |
| RNF22 | Componentes de UI devem ser reutilizáveis, isolados e documentados com props tipadas |
| RNF23 | A lógica de negócio do backend deve ser separada em camadas (routes → controllers → services) |
| RNF24 | Dados mockados e tipos de domínio devem ser centralizados em arquivos dedicados, sem duplicação entre módulos |
| RNF25 | Helpers e funções utilitárias devem ser funções puras e testáveis de forma isolada |

### Portabilidade

| ID | Descrição |
|----|-----------|
| RNF26 | O app mobile deve funcionar em Android 10+ e iOS 14+ sem adaptações específicas por plataforma na lógica de negócio |
| RNF27 | O painel web deve ser compatível com Chrome 90+, Firefox 88+, Safari 14+ e Edge 90+ |
| RNF28 | O backend deve ser executável em qualquer sistema operacional com Node.js 20 LTS |
| RNF29 | O algoritmo Python deve funcionar em Python 3.9+ sem dependências de sistema operacional específico |

### Escalabilidade

| ID | Descrição |
|----|-----------|
| RNF30 | A API deve ser stateless, permitindo escalonamento horizontal com múltiplas instâncias |
| RNF31 | Consultas ao banco de dados devem utilizar índices nas colunas de busca frequente (`userId`, `date`, `status`) |
| RNF32 | O painel web deve suportar paginação em todas as listagens para evitar carregamento excessivo |

---

## Banco de Dados

### Modelos Principais (Prisma Schema)

```
Usuario
  id          String   @id
  nome        String
  email       String   @unique
  senha       String   (bcrypt hash)
  perfil      Perfil   @default(USUARIO)
  peso        Float?
  altura      Float?
  tipoD       String?
  medico      String?
  metaMin     Float?
  metaMax     Float?
  createdAt   DateTime @default(now())

Diario
  id          String   @id
  usuarioId   String   (FK → Usuario)
  titulo      String
  conteudo    String
  humor       String
  sintomas    String[]
  tags        String[]
  createdAt   DateTime @default(now())

Dicas
  id          String   @id
  titulo      String
  resumo      String
  conteudo    String
  categoria   String
  destaque    Boolean  @default(false)
  tempoLeitura Int
  createdAt   DateTime @default(now())

FAQ
  id          String   @id
  pergunta    String
  resposta    String
  categoria   String
  ordem       Int
  visivel     Boolean  @default(true)
  adminId     String   (FK → Usuario)
  createdAt   DateTime @default(now())
```

### Relacionamentos

```
Usuario 1──* Diario
Usuario 1──* FAQ  (criadas pelo admin)
```

---

## Segurança

### Autenticação

O sistema usa **JWT (JSON Web Tokens)** para autenticação stateless:

```
POST /api/auth/register → cria usuário com senha em bcrypt
POST /api/auth/login    → valida credenciais, retorna { token, user }

Header nas demais rotas:
  Authorization: Bearer <token>
```

### Controle de Acesso

| Perfil | Permissões |
|---|---|
| `USUARIO` | Acesso ao próprio perfil, diário e leitura de dicas/FAQ |
| `ADMIN` | Todas as permissões + gestão de usuários, dicas e FAQ |

### Variáveis de Ambiente (Backend)

```env
DATABASE_URL    Conexão com PostgreSQL (obrigatório)
JWT_SECRET      Chave secreta para assinar tokens (obrigatório)
PORT            Porta do servidor (padrão: 3000)
NODE_ENV        Ambiente: development | production
```

> **Nunca** versionar o arquivo `.env`. O repositório inclui `.env.example` como referência.

---

## Design System

O DiabetesCare utiliza uma paleta e tokens de design unificados em ambos os frontends (mobile e web), garantindo consistência visual em todo o ecossistema.

### Paleta de Cores

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#4CAF82` | Ações principais, elementos positivos, glicose normal |
| `secondary` | `#FF6B6B` | Elementos secundários, alertas leves |
| `success` | `#10B981` | Confirmações, metas atingidas, status ativo |
| `warning` | `#F59E0B` | Avisos, glicose alta |
| `danger` | `#EF4444` | Erros, glicose muito alta, status inativo |
| `blue` | `#3B8ED0` | Informações, glicose baixa |
| `purple` | `#8B5CF6` | Diário emocional, medicamentos (insulina) |
| `orange` | `#F97316` | Metas, medicamentos (suplementos) |
| `teal` | `#14B8A6` | Hidratação, categorias neutras |
| `pink` | `#EC4899` | Diabetes gestacional, categorias especiais |
| `background` | `#F7F9FC` | Fundo geral das telas |
| `card` | `#FFFFFF` | Superfície dos cards e painéis |
| `text` | `#1A2332` | Texto principal |
| `textSecondary` | `#6B7280` | Texto secundário e labels |
| `border` | `#E5E7EB` | Bordas e divisores |

### Status Glicêmico (Semântico)

| Status | Cor | Faixa indicativa |
|--------|-----|-----------------|
| `low` (Baixo) | `#3B8ED0` | < 70 mg/dL |
| `normal` (Normal) | `#4CAF82` | 70–140 mg/dL |
| `high` (Alto) | `#F59E0B` | 141–180 mg/dL |
| `very_high` (Muito Alto) | `#EF4444` | > 180 mg/dL |

### Tipografia

- **Web:** `Inter` (Google Fonts)
- **Mobile:** Fonte do sistema (SF Pro no iOS, Roboto no Android)

### Componentes Reutilizáveis (Mobile)

`Card` · `Button` · `ScreenHeader` · `GlucoseStatusBadge` · `ProgressBar` · `EmptyState` · `GlucoseChart`

---

## Pré-requisitos Globais

| Ferramenta | Versão mínima | Uso |
|---|---|---|
| **Node.js** | 20 LTS | Backend + Web + App |
| **npm** | 10+ | Gerenciador de pacotes |
| **PostgreSQL** | 14+ | Banco de dados do backend |
| **Python** | 3.9+ | Algoritmo de ML |
| **pip** | — | Pacotes Python |
| **Expo Go** | Última | Testar app no celular físico |
| Emulador Android/iOS | — | Alternativa ao Expo Go |

---

## Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/gpessoni/DSM-P5-G06-2026-01.git
cd DSM-P5-G06-2026-01
```

### 2. Backend (API REST)

```bash
cd backend
npm install
```

Configure as variáveis de ambiente:

```bash
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL e JWT_SECRET
```

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/diabetesCare"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3000
NODE_ENV=development
```

Execute as migrations e inicie o servidor:

```bash
npm run prisma:migrate    # aplica schema no banco
npm run seed              # opcional: dados iniciais
npm run dev               # inicia em modo desenvolvimento
```

| Endpoint | URL |
|---|---|
| API REST | `http://localhost:3000` |
| Documentação Swagger | `http://localhost:3000/docs` |

### 3. Painel Web Admin

```bash
cd web
npm install
npm run dev
```

Acesse: `http://localhost:3001`

> O painel funciona com **dados mockados** em `lib/mock-data.ts` independentemente do backend.

### 4. App Mobile

```bash
cd app
npm install
npm run start
```

- Escaneie o QR code com o **Expo Go** (Android ou iOS)
- Pressione `a` para abrir no emulador Android
- Pressione `i` para abrir no simulador iOS

> O app funciona com **dados em memória** independentemente do backend.

### 5. Algoritmo Python

```bash
cd algoritmo-python
pip install numpy pandas matplotlib seaborn scikit-learn plotly
python pre-processamento.py
python extracao_padrao.py
```

---

## Estrutura do Repositório

```
DSM-P5-G06-2026-01/
│
├── app/                         # Aplicativo mobile (Expo + React Native)
│   ├── App.tsx                  # Entry point com providers
│   ├── app.json                 # Configuração Expo
│   └── src/
│       ├── navigation/          # AppNavigator (stack) + TabNavigator (abas)
│       ├── screens/             # 20+ telas organizadas por feature
│       ├── context/             # AppContext (estado global) + AuthContext
│       ├── components/          # Componentes reutilizáveis (common + charts)
│       ├── data/                # Dados mockados e bases de conteúdo
│       ├── theme/               # Design system (cores, tipografia, tokens)
│       ├── types/               # Interfaces TypeScript do domínio
│       └── utils/               # Funções auxiliares
│
├── web/                         # Painel administrativo (Next.js 14)
│   ├── app/
│   │   ├── (admin)/             # 11 páginas com layout compartilhado
│   │   └── login/               # Tela de autenticação
│   ├── components/layout/       # Sidebar + Header
│   └── lib/                     # mock-data.ts + utils.ts
│
├── backend/                     # API REST (Express + Prisma + PostgreSQL)
│   ├── src/
│   │   ├── routes/              # Definição dos endpoints REST
│   │   ├── controllers/         # Handlers das requisições HTTP
│   │   ├── middlewares/         # auth, errorHandler, validate
│   │   ├── services/            # Regras de negócio e acesso a dados
│   │   └── generated/           # Prisma Client (gerado automaticamente)
│   └── prisma/
│       ├── schema.prisma        # Modelos e relacionamentos do banco
│       └── seed.ts              # Script de seed com dados iniciais
│
└── algoritmo-python/            # Módulo de ML para pré-diagnóstico
    ├── diabetes.csv             # Dataset: Pima Indians Diabetes Database
    ├── pre-processamento.py     # Limpeza, normalização e análise exploratória
    ├── extracao_padrao.py       # Treinamento, comparação e métricas dos modelos
    └── test_scripts.py          # Scripts de teste e validação
```

---

## Endpoints da API (Resumo)

### Autenticação

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/register` | Cadastrar novo usuário | — |
| POST | `/api/auth/login` | Autenticar e obter token | — |

### Usuários

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/users/me` | Perfil do usuário autenticado | ✓ |
| PUT | `/api/users/me` | Atualizar perfil | ✓ |
| GET | `/api/users` | Listar todos os usuários | Admin |

### Diário

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/diary` | Listar entradas do usuário | ✓ |
| POST | `/api/diary` | Criar nova entrada | ✓ |
| PUT | `/api/diary/:id` | Atualizar entrada | ✓ |
| DELETE | `/api/diary/:id` | Excluir entrada | ✓ |
| GET | `/api/diary/admin/all` | Listar todos os diários | Admin |

### Dicas

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/tips` | Listar dicas visíveis | ✓ |
| POST | `/api/tips` | Criar nova dica | Admin |
| PUT | `/api/tips/:id` | Atualizar dica | Admin |
| DELETE | `/api/tips/:id` | Excluir dica | Admin |

### FAQ

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/faq` | Listar FAQs visíveis | ✓ |
| POST | `/api/faq` | Criar nova FAQ | Admin |
| PUT | `/api/faq/:id` | Atualizar FAQ | Admin |
| DELETE | `/api/faq/:id` | Excluir FAQ | Admin |

> Documentação completa disponível no Swagger: `http://localhost:3000/docs`

---

## Algoritmo de Machine Learning

### Dataset

**Pima Indians Diabetes Database** — 768 pacientes do sexo feminino com 8 features clínicas:

| Feature | Descrição |
|---------|-----------|
| `Pregnancies` | Número de gestações |
| `Glucose` | Concentração de glicose plasmática (teste oral) |
| `BloodPressure` | Pressão arterial diastólica (mm Hg) |
| `SkinThickness` | Espessura da dobra tricipital (mm) |
| `Insulin` | Insulina sérica de 2h (mu U/ml) |
| `BMI` | Índice de Massa Corporal (kg/m²) |
| `DiabetesPedigreeFunction` | Histórico familiar de diabetes |
| `Age` | Idade (anos) |
| `Outcome` | **Variável alvo** — 1: diabético, 0: não diabético |

### Modelos Comparados

| Classificador | Característica |
|---|---|
| Logistic Regression | Baseline linear interpretável |
| Decision Tree | Árvore de decisão com critério de impureza |
| Random Forest | Ensemble de árvores com bagging |
| Gradient Boosting | Boosting sequencial de weak learners |
| SVM (RBF) | Máquina de vetores de suporte com kernel radial |
| K-Nearest Neighbors | Classificação por proximidade |
| Naive Bayes | Probabilístico com independência condicional |
| MLP (Neural Network) | Rede neural multicamada |

### Métricas Avaliadas

- **Acurácia** — percentual de predições corretas
- **Precisão** — proporção de verdadeiros positivos entre os positivos preditos
- **Recall** — proporção de verdadeiros positivos entre os positivos reais
- **F1-Score** — média harmônica entre precisão e recall
- **ROC-AUC** — área sob a curva ROC
- **Matriz de confusão** — TP, TN, FP, FN

---

## Documentação por Módulo

Cada módulo possui README próprio com detalhes de instalação, arquitetura, telas e fluxos:

| Módulo | README | Conteúdo |
|--------|--------|---------|
| App Mobile | [app/README.md](app/README.md) | 20+ telas, navegação, AppContext, design system, dados mock |
| Painel Web | [web/README.md](web/README.md) | 11 páginas, componentes, Recharts, helpers, Tailwind |
| Backend API | [backend/README.md](backend/README.md) | Endpoints, Prisma schema, autenticação, deploy |

---

## Glossário

| Termo | Definição |
|-------|-----------|
| **HbA1c** | Hemoglobina glicada — indica a média de glicose nos últimos 2–3 meses. Alvo: < 7% |
| **mg/dL** | Miligramas por decilitro — unidade de medida da glicemia |
| **Glicemia de jejum** | Medição de glicose após pelo menos 8h sem comer |
| **Pós-prandial** | Medição de glicose 2h após uma refeição |
| **Hipoglicemia** | Glicose < 70 mg/dL — requer ação imediata |
| **Hiperglicemia** | Glicose acima do alvo individual — requer ajuste de tratamento |
| **IG** | Índice glicêmico — velocidade com que um alimento eleva a glicose |
| **Aderência medicamentosa** | Percentual de doses tomadas conforme prescrição |
| **Pré-diabetes** | Glicemia entre 100–125 mg/dL em jejum — risco elevado de desenvolver Tipo 2 |
| **Tipo 1** | Diabetes autoimune — produção insuficiente de insulina |
| **Tipo 2** | Diabetes de resistência à insulina — o mais prevalente |
| **Gestacional** | Diabetes diagnosticado durante a gravidez |
| **LGPD** | Lei Geral de Proteção de Dados — regulação brasileira de privacidade |

---

## Equipe

| Nome | GitHub |
|------|--------|
| Gabriel Pessoni | [@gpessoni](https://github.com/gpessoni) |
| Hudson Ribeiro Barbara Junior | — |
| Livia Portela | — |

> Projeto acadêmico — **Fatec · DSM · 5º Semestre · 2026/1**
