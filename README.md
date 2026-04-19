# DiabetesCare — DSM-P5-G06-2026/1

Sistema completo de gerenciamento de diabetes, desenvolvido como projeto interdisciplinar do **5º semestre de DSM (Desenvolvimento de Software Multiplataforma)** pela turma de 2026/1.

**Grupo 06:** Hudson Ribeiro Barbara Junior · Gabriel Pessoni · Livia Portela

---

## Visão Geral

O **DiabetesCare** é um ecossistema de saúde digital composto por quatro módulos integrados:

| Módulo | Tecnologia | Finalidade |
|--------|-----------|-----------|
| `app/` | Expo + React Native | Aplicativo mobile para pacientes |
| `web/` | Next.js 14 | Painel administrativo para clínicos |
| `backend/` | Express + Prisma + PostgreSQL | API REST centralizada |
| `algoritmo-python/` | Python + scikit-learn | Pré-diagnóstico via ML |

---

## Arquitetura do Sistema

```
┌─────────────────┐     ┌─────────────────┐
│   App Mobile    │     │  Web Admin      │
│  (Expo/RN)      │     │  (Next.js)      │
│  :8081          │     │  :3001          │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └──────────┬────────────┘
                    │ HTTP/REST (JWT)
         ┌──────────▼────────────┐
         │     Backend API       │
         │  (Express + Prisma)   │
         │  :3000                │
         └──────────┬────────────┘
                    │
         ┌──────────▼────────────┐
         │     PostgreSQL        │
         └───────────────────────┘

         ┌───────────────────────┐
         │  Algoritmo Python     │  (standalone / análise)
         │  scikit-learn + ML    │
         └───────────────────────┘
```

---

## Requisitos Funcionais

### Paciente (App Mobile)

| RF | Descrição |
|----|-----------|
| RF01 | Registrar e visualizar leituras de glicose com contexto (jejum, pós-refeição etc.) |
| RF02 | Acompanhar evolução glicêmica por gráficos e estatísticas (média, no alvo, acima, abaixo) |
| RF03 | Registrar refeições com macronutrientes, calorias e carga glicêmica |
| RF04 | Manter diário emocional com humor, sintomas e tags |
| RF05 | Controlar ingestão hídrica diária |
| RF06 | Gerenciar medicamentos e marcar doses tomadas |
| RF07 | Definir e acompanhar metas de saúde |
| RF08 | Visualizar relatórios consolidados de saúde |
| RF09 | Realizar pré-diagnóstico de diabetes por questionário |
| RF10 | Acessar dicas e artigos educativos sobre diabetes |
| RF11 | Consultar perguntas frequentes (FAQ) |
| RF12 | Gerenciar perfil pessoal (peso, altura, tipo de diabetes, médico etc.) |
| RF13 | Receber e gerenciar notificações |
| RF14 | Passar pelo fluxo de onboarding na primeira execução |

### Clínico / Administrador (Web Admin)

| RF | Descrição |
|----|-----------|
| RF15 | Visualizar dashboard com KPIs de glicose, usuários e adesão |
| RF16 | Gerenciar pacientes com busca e filtros por status |
| RF17 | Monitorar leituras de glicose com gráficos de evolução |
| RF18 | Analisar dados alimentares e macronutrientes da base de pacientes |
| RF19 | Gerenciar dicas e conteúdo educativo |
| RF20 | Gerenciar perguntas frequentes (FAQ) |

### Backend / API

| RF | Descrição |
|----|-----------|
| RF21 | Registrar e autenticar usuários com JWT |
| RF22 | Gerenciar perfil de usuário (leitura e edição) |
| RF23 | CRUD completo de entradas de diário |
| RF24 | CRUD completo de dicas educativas |
| RF25 | CRUD completo de FAQ com controle de admin |
| RF26 | Listagem administrativa de usuários e diários com paginação |
| RF27 | Controle de acesso por perfil (USUARIO / ADMIN) |

### Algoritmo ML

| RF | Descrição |
|----|-----------|
| RF28 | Pré-processar e limpar dataset de diabetes (Pima Indians) |
| RF29 | Treinar e comparar 8 classificadores de ML |
| RF30 | Gerar métricas de avaliação (acurácia, ROC-AUC, matriz de confusão) |
| RF31 | Realizar predição de risco para novos pacientes |

---

## Pré-requisitos Globais

- **Node.js** 20 LTS ou superior
- **npm** 10+
- **PostgreSQL** 14+ (para o backend)
- **Python** 3.9+ com pip (para o algoritmo)
- **Expo Go** (app para testar no celular) ou emulador Android/iOS

---

## Como Rodar o Projeto Completo

### 1. Clone o repositório

```bash
git clone https://github.com/gpessoni/DSM-P5-G06-2026-01.git
cd DSM-P5-G06-2026-01
```

### 2. Backend (API)

```bash
cd backend
npm install
```

Crie o arquivo `.env` com base no exemplo:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/diabetesCare"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3000
NODE_ENV=development
```

Execute as migrações e suba o servidor:

```bash
npm run prisma:migrate
npm run seed        # opcional: popula o banco com dados iniciais
npm run dev
```

API disponível em: `http://localhost:3000`
Documentação Swagger: `http://localhost:3000/docs`

### 3. Web Admin

```bash
cd web
npm install
npm run dev
```

Painel disponível em: `http://localhost:3001`

### 4. App Mobile

```bash
cd app
npm install
npm run start
```

- Escaneie o QR code com o **Expo Go** (Android/iOS)
- Ou pressione `a` para Android / `i` para iOS (requer emulador)

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
├── app/                    # Aplicativo mobile (Expo + React Native)
│   ├── src/
│   │   ├── navigation/     # AppNavigator, TabNavigator
│   │   ├── screens/        # Todas as telas
│   │   ├── context/        # AppContext, AuthContext
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── data/           # Dados mockados locais
│   │   ├── theme/          # Design system (cores, tipografia)
│   │   └── types/          # Tipagem TypeScript
│   └── App.tsx
│
├── web/                    # Painel administrativo (Next.js)
│   ├── app/
│   │   ├── (admin)/        # Rotas do painel com layout compartilhado
│   │   └── login/
│   ├── components/
│   │   └── layout/         # Sidebar, Header
│   └── lib/                # mock-data, utils
│
├── backend/                # API REST (Express + Prisma)
│   ├── src/
│   │   ├── routes/         # authRoutes, userRoutes, diarioRoutes...
│   │   ├── controllers/    # Lógica de cada endpoint
│   │   ├── middlewares/    # auth, errorHandler, validate
│   │   ├── services/       # Regras de negócio
│   │   └── generated/      # Prisma Client gerado
│   └── prisma/
│       ├── schema.prisma   # Modelos do banco de dados
│       └── seed.ts         # Script de seed
│
└── algoritmo-python/       # ML para pré-diagnóstico
    ├── diabetes.csv        # Dataset (Pima Indians)
    ├── pre-processamento.py
    ├── extracao_padrao.py
    └── test_scripts.py
```

---

## Banco de Dados (Modelos Principais)

```
Usuario         — perfil, credenciais, dados clínicos, metas glicêmicas
Diario          — entradas emocionais/clínicas com humor, sintomas e tags
Dicas           — conteúdo educativo por categoria
FAQ             — perguntas frequentes com ordem e controle de visibilidade
```

---

## Documentação por Módulo

Cada módulo possui seu próprio README com detalhes de instalação, arquitetura e funcionalidades:

- [app/README.md](app/README.md) — Aplicativo mobile
- [web/README.md](web/README.md) — Painel administrativo web
- [backend/README.md](backend/README.md) — API REST e banco de dados

---

## Status do Projeto

| Módulo | Status |
|--------|--------|
| App Mobile | Funcional com dados locais (mock) |
| Web Admin | Funcional com dados locais (mock) |
| Backend API | Implementado com PostgreSQL |
| Integração App ↔ API | Em desenvolvimento |
| Integração Web ↔ API | Em desenvolvimento |
| Algoritmo ML | Funcional standalone |

---

## Equipe

| Nome | GitHub |
|------|--------|
| Gabriel Pessoni | [@gpessoni](https://github.com/gpessoni) |
| Hudson Ribeiro Barbara Junior | — |
| Livia Portela | — |

> Projeto acadêmico — Fatec · DSM · 5º Semestre · 2026/1
