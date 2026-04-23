import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';
import { generateApiDocs } from './docs/htmlDocs';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// ─── Segurança ─────────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // desabilitado para Swagger UI funcionar
  })
);

// ─── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Documentação Swagger ──────────────────────────────────────────────────────
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { background-color: #2563eb; }
      .swagger-ui .topbar-wrapper .link span { display: none; }
      .swagger-ui .topbar-wrapper::after { content: 'DiabetesCare API'; color: white; font-size: 18px; font-weight: bold; margin-left: 12px; }
    `,
    customSiteTitle: 'DiabetesCare — Documentação da API',
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
);

// Exportar spec em JSON (útil para integração com ferramentas externas)
app.get('/docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── Documentação HTML ─────────────────────────────────────────────────────────
app.get('/documentacao', (_req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(generateApiDocs(process.env.BASE_URL ?? 'http://localhost:3000'));
});

// ─── Rota de teste deploy ───────────────────────────────────────────────────────────────
app.get('/deploy-test', (_req, res) => {
  res.json({
    success: true,
    message: 'Rota de teste para deploy funcionando 1.0.1',
    timestamp: new Date().toISOString(),
  });
});

// ─── Rotas da API ──────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API DiabetesCare funcionando',
    version: '1.0.0',
    ambiente: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// ─── Error handler (deve ser o último middleware) ──────────────────────────────
app.use(errorHandler);

export default app;
