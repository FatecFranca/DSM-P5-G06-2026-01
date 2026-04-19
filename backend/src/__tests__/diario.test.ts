import request from 'supertest';
import app from '../app';
import { generateToken, mockUser, mockAdmin, mockDiario, paginated } from './helpers';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    diario: {
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
const adminToken = generateToken({ id: mockAdmin.id, email: mockAdmin.email, perfil: 'ADMIN' });
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('POST /api/diarios', () => {
  it('cria entrada no diário', async () => {
    prisma.diario.create.mockResolvedValueOnce(mockDiario);

    const res = await request(app)
      .post('/api/diarios')
      .set(auth(userToken))
      .send({
        titulo: 'Test Entry',
        conteudo: 'Test content',
        humor: 'BOM',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('titulo', 'Test Entry');
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).post('/api/diarios').send({
      titulo: 'Test',
      conteudo: 'Content',
      humor: 'BOM',
    });
    expect(res.status).toBe(401);
  });

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app)
      .post('/api/diarios')
      .set(auth(userToken))
      .send({ titulo: 'Sem conteudo' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/diarios', () => {
  it('lista entradas do usuário', async () => {
    prisma.diario.findMany.mockResolvedValueOnce([mockDiario]);
    prisma.diario.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/diarios').set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.dados).toHaveLength(1);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/diarios');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/diarios/:id', () => {
  it('retorna entrada do próprio usuário', async () => {
    prisma.diario.findUnique.mockResolvedValueOnce(mockDiario);

    const res = await request(app).get(`/api/diarios/${mockDiario.id}`).set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockDiario.id);
  });

  it('retorna 404 para entrada inexistente', async () => {
    prisma.diario.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/diarios/nao-existe').set(auth(userToken));

    expect(res.status).toBe(404);
  });

  it('retorna 403 para entrada de outro usuário', async () => {
    prisma.diario.findUnique.mockResolvedValueOnce({
      ...mockDiario,
      usuarioId: 'outro-usuario',
    });

    const res = await request(app).get(`/api/diarios/${mockDiario.id}`).set(auth(userToken));

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/diarios/:id', () => {
  it('atualiza entrada do próprio usuário', async () => {
    prisma.diario.findUnique.mockResolvedValueOnce(mockDiario);
    prisma.diario.update.mockResolvedValueOnce({ ...mockDiario, titulo: 'Atualizado' });

    const res = await request(app)
      .put(`/api/diarios/${mockDiario.id}`)
      .set(auth(userToken))
      .send({ titulo: 'Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.data.titulo).toBe('Atualizado');
  });

  it('retorna 403 ao editar entrada de outro usuário', async () => {
    prisma.diario.findUnique.mockResolvedValueOnce({
      ...mockDiario,
      usuarioId: 'outro-usuario',
    });

    const res = await request(app)
      .put(`/api/diarios/${mockDiario.id}`)
      .set(auth(userToken))
      .send({ titulo: 'Atualizado' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/diarios/:id', () => {
  it('deleta entrada do próprio usuário', async () => {
    prisma.diario.findUnique.mockResolvedValueOnce(mockDiario);
    prisma.diario.delete.mockResolvedValueOnce(mockDiario);

    const res = await request(app)
      .delete(`/api/diarios/${mockDiario.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retorna 403 ao deletar entrada de outro usuário', async () => {
    prisma.diario.findUnique.mockResolvedValueOnce({
      ...mockDiario,
      usuarioId: 'outro-usuario',
    });

    const res = await request(app)
      .delete(`/api/diarios/${mockDiario.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(403);
  });
});

describe('GET /api/admin/diarios', () => {
  it('admin lista todos os diários', async () => {
    prisma.diario.findMany.mockResolvedValueOnce([mockDiario]);
    prisma.diario.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/admin/diarios').set(auth(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data.dados).toHaveLength(1);
  });

  it('retorna 403 para usuário comum', async () => {
    const res = await request(app).get('/api/admin/diarios').set(auth(userToken));
    expect(res.status).toBe(403);
  });
});
