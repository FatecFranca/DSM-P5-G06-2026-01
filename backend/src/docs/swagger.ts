import swaggerJsDoc from 'swagger-jsdoc';

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DiabetesCare API',
      version: '1.0.0',
      description:
        'API backend do sistema de gerenciamento de diabetes **DiabetesCare**.\n\n' +
        '### Autenticação\n' +
        'Use o endpoint `/auth/registrar` ou `/auth/login` para obter um token JWT.\n' +
        'Inclua o token no header `Authorization: Bearer <token>` nas demais rotas.\n\n' +
        '### Perfis\n' +
        '- **USUARIO** — acesso ao próprio perfil e diário\n' +
        '- **ADMIN** — acesso a todos os dados (rotas `/admin/*`)',
      contact: {
        name: 'Equipe DSM-P5-G06',
      },
    },
    servers: [
      {
        url: 'http://localhost:{port}/api',
        description: 'Servidor de desenvolvimento',
        variables: {
          port: {
            default: '3000',
            description: 'Porta do servidor (configurada em .env)',
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login',
        },
      },
      schemas: {
        // ─── Inputs ──────────────────────────────────────────────────────────
        RegistroInput: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: { type: 'string', minLength: 2, maxLength: 100, example: 'Carlos Silva' },
            email: { type: 'string', format: 'email', example: 'carlos@email.com' },
            senha: { type: 'string', minLength: 6, example: 'senha123' },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', format: 'email', example: 'carlos@email.com' },
            senha: { type: 'string', example: 'senha123' },
          },
        },
        AtualizarPerfilInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            nome: { type: 'string', minLength: 2, maxLength: 100, example: 'Carlos Silva' },
            idade: { type: 'integer', minimum: 1, maximum: 120, example: 42 },
            peso: { type: 'number', minimum: 1, maximum: 500, example: 82.5 },
            altura: { type: 'number', minimum: 50, maximum: 250, example: 175 },
            tipoDiabetes: {
              type: 'string',
              enum: ['NENHUM', 'TIPO1', 'TIPO2', 'GESTACIONAL', 'PRE_DIABETES'],
              example: 'TIPO2',
            },
            glicoseAlvoMin: { type: 'number', example: 70 },
            glicoseAlvoMax: { type: 'number', example: 180 },
            nomeMedico: { type: 'string', nullable: true, example: 'Dr. João Santos' },
            ultimaConsulta: {
              type: 'string',
              format: 'date',
              nullable: true,
              example: '2025-01-15',
            },
          },
        },
        CriarDiarioInput: {
          type: 'object',
          required: ['titulo', 'conteudo', 'humor'],
          properties: {
            titulo: { type: 'string', maxLength: 100, example: 'Dia difícil hoje' },
            conteudo: {
              type: 'string',
              example: 'Glicemia esteve alta o dia todo. Me senti muito cansado.',
            },
            humor: {
              type: 'string',
              enum: ['OTIMO', 'BOM', 'OK', 'MAL', 'PESSIMO'],
              example: 'MAL',
            },
            sintomas: {
              type: 'array',
              items: { type: 'string' },
              example: ['Cansaço', 'Tontura', 'Sede'],
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              example: ['glicose', 'médico'],
            },
          },
        },
        AtualizarDiarioInput: {
          type: 'object',
          minProperties: 1,
          properties: {
            titulo: { type: 'string', maxLength: 100 },
            conteudo: { type: 'string' },
            humor: {
              type: 'string',
              enum: ['OTIMO', 'BOM', 'OK', 'MAL', 'PESSIMO'],
            },
            sintomas: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        // ─── Entidades ────────────────────────────────────────────────────────
        Usuario: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            idade: { type: 'integer', nullable: true },
            peso: { type: 'number', nullable: true },
            altura: { type: 'number', nullable: true },
            tipoDiabetes: {
              type: 'string',
              enum: ['NENHUM', 'TIPO1', 'TIPO2', 'GESTACIONAL', 'PRE_DIABETES'],
            },
            glicoseAlvoMin: { type: 'number', nullable: true },
            glicoseAlvoMax: { type: 'number', nullable: true },
            nomeMedico: { type: 'string', nullable: true },
            ultimaConsulta: { type: 'string', format: 'date-time', nullable: true },
            status: { type: 'string', enum: ['ATIVO', 'INATIVO'] },
            perfil: { type: 'string', enum: ['USUARIO', 'ADMIN'] },
            criadoEm: { type: 'string', format: 'date-time' },
            atualizadoEm: { type: 'string', format: 'date-time' },
          },
        },
        Diario: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            usuarioId: { type: 'string', format: 'uuid' },
            titulo: { type: 'string' },
            conteudo: { type: 'string' },
            humor: {
              type: 'string',
              enum: ['OTIMO', 'BOM', 'OK', 'MAL', 'PESSIMO'],
            },
            sintomas: { type: 'array', items: { type: 'string' } },
            tags: { type: 'array', items: { type: 'string' } },
            criadoEm: { type: 'string', format: 'date-time' },
            atualizadoEm: { type: 'string', format: 'date-time' },
            usuario: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                nome: { type: 'string' },
              },
            },
          },
        },
        // ─── Respostas ────────────────────────────────────────────────────────
        RespostaToken: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login realizado com sucesso' },
            data: {
              type: 'object',
              properties: {
                usuario: { $ref: '#/components/schemas/Usuario' },
                token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
              },
            },
          },
        },
        RespostaPaginadaUsuario: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                dados: { type: 'array', items: { $ref: '#/components/schemas/Usuario' } },
                total: { type: 'integer' },
                pagina: { type: 'integer' },
                limite: { type: 'integer' },
                totalPaginas: { type: 'integer' },
              },
            },
          },
        },
        RespostaPaginadaDiario: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                dados: { type: 'array', items: { $ref: '#/components/schemas/Diario' } },
                total: { type: 'integer' },
                pagina: { type: 'integer' },
                limite: { type: 'integer' },
                totalPaginas: { type: 'integer' },
              },
            },
          },
        },
        RespostaErro: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Dados inválidos' },
            erros: {
              type: 'array',
              items: { type: 'string' },
              example: ['Nome é obrigatório', 'E-mail inválido'],
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsDoc(options);
