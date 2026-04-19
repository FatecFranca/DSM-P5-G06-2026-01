# DiabetesCare — Backend API

API REST do ecossistema **DiabetesCare**, responsável por autenticação, gerenciamento de usuários, diário emocional, dicas educativas e FAQ.

---

## Stack e Tecnologias

- **Runtime:** Node.js 20 LTS
- **Framework:** Express 4.21
- **ORM:** Prisma 7.7 (com adaptador `pg`)
- **Banco de dados:** PostgreSQL 14+
- **Linguagem:** TypeScript 6
- **Autenticação:** JWT (jsonwebtoken)
- **Hash de senhas:** bcryptjs
- **Validação:** Joi
- **Segurança HTTP:** Helmet + CORS
- **Documentação:** Swagger (swagger-jsdoc + swagger-ui-express)

---

## Pré-requisitos

- Node.js 20+
- PostgreSQL 14+ rodando localmente ou acessível via URL
- npm 10+

---

## Instalação e Execução

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz de `backend/`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/diabetesCare"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3000
NODE_ENV=development
```

### 3. Criar e migrar o banco de dados

```bash
npm run prisma:migrate
```

### 4. (Opcional) Popular o banco com dados iniciais

```bash
npm run seed
```

### 5. Iniciar o servidor em desenvolvimento

```bash
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia com ts-node-dev (hot reload) |
| `npm run build` | Compila TypeScript para `dist/` |
| `npm run start` | Inicia o build compilado |
| `npm run prisma:generate` | Gera o Prisma Client |
| `npm run prisma:migrate` | Executa migrações pendentes |
| `npm run prisma:studio` | Abre o Prisma Studio (GUI do banco) |
| `npm run seed` | Popula o banco com dados de exemplo |

---

## Endpoints da API

A documentação interativa completa está disponível via Swagger em:

```
http://localhost:3000/docs
```

### Autenticação — `/api/auth`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/auth/registrar` | Cria novo usuário | Não |
| POST | `/api/auth/login` | Login e retorno de JWT | Não |

**Exemplo de login:**
```json
POST /api/auth/login
{
  "email": "usuario@email.com",
  "senha": "senha123"
}
```
Resposta: `{ "token": "eyJ..." }`

---

### Usuários — `/api/usuarios`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/usuarios/:id` | Retorna perfil do usuário | Sim |
| PUT | `/api/usuarios/:id` | Atualiza perfil do usuário | Sim |

---

### Diário — `/api/diarios`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/diarios` | Cria entrada no diário | Sim |
| GET | `/api/diarios` | Lista entradas do usuário | Sim |
| GET | `/api/diarios/:id` | Retorna entrada específica | Sim |
| PUT | `/api/diarios/:id` | Atualiza entrada | Sim |
| DELETE | `/api/diarios/:id` | Remove entrada | Sim |

---

### Dicas — `/api/dicas`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/api/dicas` | Cria dica | Sim |
| GET | `/api/dicas` | Lista todas as dicas | Sim |
| GET | `/api/dicas/:id` | Retorna dica específica | Sim |
| PUT | `/api/dicas/:id` | Atualiza dica | Sim |
| DELETE | `/api/dicas/:id` | Remove dica | Sim |

---

### FAQ — `/api/faq`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/faq` | Lista FAQs (filtrável por categoria) | Sim |
| GET | `/api/faq/:id` | Retorna FAQ específica | Sim |
| POST | `/api/faq` | Cria FAQ | Sim + Admin |
| PUT | `/api/faq/:id` | Atualiza FAQ | Sim + Admin |
| DELETE | `/api/faq/:id` | Remove FAQ | Sim + Admin |

---

### Admin — `/api/admin`

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/admin/usuarios` | Lista todos os usuários (paginado) | Admin |
| GET | `/api/admin/diarios` | Lista todos os diários (paginado, filtrável por humor) | Admin |

---

## Banco de Dados

### Modelos (Prisma Schema)

```
Usuario
  id             UUID (PK)
  nome           String
  email          String (unique)
  senha          String (hash bcrypt)
  idade          Int?
  peso           Float?
  altura         Float?
  tipoDiabetes   Enum (NENHUM | TIPO1 | TIPO2 | GESTACIONAL | PRE_DIABETES)
  glicoseAlvoMin Float?
  glicoseAlvoMax Float?
  nomeMedico     String?
  ultimaConsulta DateTime?
  status         Enum (ATIVO | INATIVO)
  perfil         Enum (USUARIO | ADMIN)
  criadoEm       DateTime
  atualizadoEm   DateTime

Diario
  id           UUID (PK)
  usuarioId    UUID (FK → Usuario)
  titulo       String
  conteudo     String
  humor        Enum (OTIMO | BOM | OK | MAL | PESSIMO)
  sintomas     String[]
  tags         String[]
  criadoEm     DateTime
  atualizadoEm DateTime

Dicas
  id           UUID (PK)
  titulo       String
  sumario      String
  conteudo     String
  categoria    Enum (EXERCICIO | ALIMENTACAO | EMERGENCIA | BEM_ESTAR)
  tempoLeitura Int (minutos)
  destaque     Boolean
  criadoEm     DateTime
  atualizadoEm DateTime

FAQ
  id           UUID (PK)
  pergunta     String
  resposta     String
  categoria    Enum (DIABETES | SINTOMAS | ALIMENTACAO | EXERCICIOS | MEDICACAO | MONITORAMENTO)
  ordem        Int
  ativo        Boolean
  criadoEm     DateTime
  atualizadoEm DateTime
```

---

## Autenticação

Todos os endpoints protegidos exigem o header:

```
Authorization: Bearer <token>
```

O token JWT é retornado no login e tem validade configurável via `JWT_SECRET`.

---

## Segurança

- Senhas armazenadas com hash `bcryptjs` (salt rounds 10)
- JWT para autenticação stateless
- `Helmet` para headers HTTP seguros
- `CORS` configurável via variável de ambiente
- Validação de entrada com `Joi` antes de chegar nos controllers
- Controle de acesso por perfil (USUARIO / ADMIN)

---

## Estrutura de Pastas

```
backend/
  src/
    app.ts                  # Setup do Express (middlewares globais, rotas)
    server.ts               # Inicialização do servidor HTTP
    routes/
      index.ts              # Agregador de rotas
      authRoutes.ts         # /api/auth
      userRoutes.ts         # /api/usuarios
      diarioRoutes.ts       # /api/diarios
      dicasRoutes.ts        # /api/dicas
      faqRoutes.ts          # /api/faq
      adminRoutes.ts        # /api/admin
    controllers/            # Handlers de cada endpoint
    services/               # Regras de negócio
    middlewares/
      auth.ts               # Verificação JWT
      validate.ts           # Validação Joi
      errorHandler.ts       # Tratamento centralizado de erros
    errors/
      ApiError.ts           # Classe de erro customizado
    swagger/
      config.ts             # Configuração OpenAPI/Swagger
    generated/
      prisma/               # Prisma Client gerado (não editar)
  prisma/
    schema.prisma           # Definição dos modelos
    seed.ts                 # Script de seed
  .env                      # Variáveis de ambiente (não commitar)
  tsconfig.json
  package.json
```

---

## Health Check

```
GET http://localhost:3000/health
```

Retorna `200 OK` com status do servidor.

---

## Endpoints Úteis para Desenvolvimento

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000/health` | Status da API |
| `http://localhost:3000/docs` | Swagger UI interativo |
| `http://localhost:3000/docs.json` | Spec OpenAPI em JSON |
