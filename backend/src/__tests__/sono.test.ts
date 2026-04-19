import request from 'supertest';
import app from '../app';
import { generateToken, mockUser, mockSono, paginated } from './helpers';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    sono: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../config/database').default;

const userToken = generateToken({ id: mockUser.id, email: mockUser.email, perfil: 'USUARIO' });
const adminToken = generateToken({ id: 'admin-id-1', email: 'admin@example.com', perfil: 'ADMIN' });
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('POST /api/sono', () => {
  it('cria registro de sono', async () => {
    prisma.sono.create.mockResolvedValueOnce(mockSono);

    const res = await request(app)
      .post('/api/sono')
      .set(auth(userToken))
      .send({
        data: '2026-04-19',
        horaDeitar: '22:30',
        horaAcordar: '06:30',
        duracao: 8,
        qualidade: 'BOA',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ qualidade: 'BOA' });
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).post('/api/sono').send({
      data: '2026-04-19',
      horaDeitar: '22:30',
      horaAcordar: '06:30',
      duracao: 8,
      qualidade: 'BOA',
    });

    expect(res.status).toBe(401);
  });

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app)
      .post('/api/sono')
      .set(auth(userToken))
      .send({ data: '2026-04-19' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/sono', () => {
  it('lista registros de sono do usuário', async () => {
    prisma.sono.findMany.mockResolvedValueOnce([mockSono]);
    prisma.sono.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/sono').set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dados).toHaveLength(1);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/sono');
    expect(res.status).toBe(401);
  });

  it('aceita filtros de data', async () => {
    prisma.sono.findMany.mockResolvedValueOnce([]);
    prisma.sono.count.mockResolvedValueOnce(0);

    const res = await request(app)
      .get('/api/sono?dataInicio=2026-04-01&dataFim=2026-04-30')
      .set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.dados).toHaveLength(0);
  });
});

describe('GET /api/sono/estatisticas', () => {
  it('retorna estatísticas de sono', async () => {
    prisma.sono.findMany.mockResolvedValueOnce([mockSono]);

    const res = await request(app).get('/api/sono/estatisticas').set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('mediaDuracao');
    expect(res.body.data).toHaveProperty('distribuicaoQualidade');
  });
});

describe('GET /api/sono/:id', () => {
  it('retorna registro do próprio usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce(mockSono);

    const res = await request(app).get(`/api/sono/${mockSono.id}`).set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockSono.id);
  });

  it('retorna 404 para registro inexistente', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/sono/nao-existe').set(auth(userToken));

    expect(res.status).toBe(404);
  });

  it('retorna 403 para registro de outro usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce({
      ...mockSono,
      usuarioId: 'outro-usuario-id',
    });

    const res = await request(app).get(`/api/sono/${mockSono.id}`).set(auth(userToken));

    expect(res.status).toBe(403);
  });

  it('admin pode ver registro de qualquer usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce({
      ...mockSono,
      usuarioId: 'outro-usuario-id',
    });

    const res = await request(app).get(`/api/sono/${mockSono.id}`).set(auth(adminToken));

    expect(res.status).toBe(200);
  });
});

describe('PUT /api/sono/:id', () => {
  it('atualiza registro do próprio usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce(mockSono);
    prisma.sono.update.mockResolvedValueOnce({ ...mockSono, qualidade: 'EXCELENTE' });

    const res = await request(app)
      .put(`/api/sono/${mockSono.id}`)
      .set(auth(userToken))
      .send({ qualidade: 'EXCELENTE' });

    expect(res.status).toBe(200);
    expect(res.body.data.qualidade).toBe('EXCELENTE');
  });

  it('retorna 403 ao tentar editar registro de outro usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce({
      ...mockSono,
      usuarioId: 'outro-usuario-id',
    });

    const res = await request(app)
      .put(`/api/sono/${mockSono.id}`)
      .set(auth(userToken))
      .send({ qualidade: 'EXCELENTE' });

    expect(res.status).toBe(403);
  });

  it('retorna 404 para registro inexistente', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .put('/api/sono/nao-existe')
      .set(auth(userToken))
      .send({ qualidade: 'BOA' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/sono/:id', () => {
  it('deleta registro do próprio usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce(mockSono);
    prisma.sono.delete.mockResolvedValueOnce(mockSono);

    const res = await request(app)
      .delete(`/api/sono/${mockSono.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retorna 403 ao tentar deletar registro de outro usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce({
      ...mockSono,
      usuarioId: 'outro-usuario-id',
    });

    const res = await request(app)
      .delete(`/api/sono/${mockSono.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(403);
  });

  it('admin pode deletar registro de qualquer usuário', async () => {
    prisma.sono.findUnique.mockResolvedValueOnce({
      ...mockSono,
      usuarioId: 'outro-usuario-id',
    });
    prisma.sono.delete.mockResolvedValueOnce(mockSono);

    const res = await request(app)
      .delete(`/api/sono/${mockSono.id}`)
      .set(auth(adminToken));

    expect(res.status).toBe(200);
  });
});

describe('GET /api/admin/sono', () => {
  it('admin lista todos os registros', async () => {
    prisma.sono.findMany.mockResolvedValueOnce([mockSono]);
    prisma.sono.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/admin/sono').set(auth(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data.dados).toHaveLength(1);
  });

  it('retorna 403 para usuário comum', async () => {
    const res = await request(app).get('/api/admin/sono').set(auth(userToken));
    expect(res.status).toBe(403);
  });

  it('filtra por qualidade', async () => {
    prisma.sono.findMany.mockResolvedValueOnce([mockSono]);
    prisma.sono.count.mockResolvedValueOnce(1);

    const res = await request(app)
      .get('/api/admin/sono?qualidade=BOA')
      .set(auth(adminToken));

    expect(res.status).toBe(200);
  });

  it('retorna 400 para qualidade inválida', async () => {
    const res = await request(app)
      .get('/api/admin/sono?qualidade=INVALIDA')
      .set(auth(adminToken));

    expect(res.status).toBe(400);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/admin/sono');
    expect(res.status).toBe(401);
  });
});

describe('Paginação GET /api/sono', () => {
  it('respeita parâmetros de paginação', async () => {
    const dados = Array.from({ length: 5 }, (_, i) => ({ ...mockSono, id: `sono-${i}` }));
    prisma.sono.findMany.mockResolvedValueOnce(dados);
    prisma.sono.count.mockResolvedValueOnce(20);

    const res = await request(app)
      .get('/api/sono?pagina=2&limite=5')
      .set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.pagina).toBe(2);
    expect(res.body.data.limite).toBe(5);
  });
});
