import request from 'supertest';
import app from '../app';
import { generateToken, mockUser, mockFAQ } from './helpers';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    fAQ: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
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

describe('GET /api/faq', () => {
  it('lista FAQs com autenticação', async () => {
    prisma.fAQ.findMany.mockResolvedValueOnce([mockFAQ]);

    const res = await request(app).get('/api/faq').set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/api/faq');
    expect(res.status).toBe(401);
  });

  it('filtra por categoria', async () => {
    prisma.fAQ.findMany.mockResolvedValueOnce([mockFAQ]);

    const res = await request(app).get('/api/faq?categoria=DIABETES').set(auth(userToken));

    expect(res.status).toBe(200);
  });

  it('retorna 400 para categoria inválida', async () => {
    const res = await request(app).get('/api/faq?categoria=INVALIDA').set(auth(userToken));
    expect(res.status).toBe(400);
  });

  it('admin vê todos com ?todos=true', async () => {
    prisma.fAQ.findMany.mockResolvedValueOnce([mockFAQ]);

    const res = await request(app).get('/api/faq?todos=true').set(auth(adminToken));

    expect(res.status).toBe(200);
  });
});

describe('GET /api/faq/:id', () => {
  it('retorna uma FAQ por id', async () => {
    prisma.fAQ.findUnique.mockResolvedValueOnce(mockFAQ);

    const res = await request(app).get(`/api/faq/${mockFAQ.id}`).set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockFAQ.id);
  });

  it('retorna 404 para FAQ inexistente', async () => {
    prisma.fAQ.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/faq/nao-existe').set(auth(userToken));

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get(`/api/faq/${mockFAQ.id}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/faq', () => {
  it('usuário autenticado cria FAQ', async () => {
    prisma.fAQ.create.mockResolvedValueOnce(mockFAQ);

    const res = await request(app)
      .post('/api/faq')
      .set(auth(userToken))
      .send({
        pergunta: 'O que é diabetes?',
        resposta: 'É uma condição...',
        categoria: 'DIABETES',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app)
      .post('/api/faq')
      .set(auth(userToken))
      .send({ pergunta: 'Sem resposta' });

    expect(res.status).toBe(400);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).post('/api/faq').send({
      pergunta: 'Pergunta',
      resposta: 'Resposta',
      categoria: 'DIABETES',
    });

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/faq/:id', () => {
  it('atualiza FAQ existente', async () => {
    prisma.fAQ.findUnique.mockResolvedValueOnce(mockFAQ);
    prisma.fAQ.update.mockResolvedValueOnce({ ...mockFAQ, pergunta: 'Pergunta atualizada' });

    const res = await request(app)
      .put(`/api/faq/${mockFAQ.id}`)
      .set(auth(userToken))
      .send({ pergunta: 'Pergunta atualizada' });

    expect(res.status).toBe(200);
    expect(res.body.data.pergunta).toBe('Pergunta atualizada');
  });

  it('retorna 404 para FAQ inexistente', async () => {
    prisma.fAQ.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .put('/api/faq/nao-existe')
      .set(auth(userToken))
      .send({ pergunta: 'Atualizado' });

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app)
      .put(`/api/faq/${mockFAQ.id}`)
      .send({ pergunta: 'Atualizado' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/faq/:id', () => {
  it('deleta FAQ existente', async () => {
    prisma.fAQ.findUnique.mockResolvedValueOnce(mockFAQ);
    prisma.fAQ.delete.mockResolvedValueOnce(mockFAQ);

    const res = await request(app)
      .delete(`/api/faq/${mockFAQ.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retorna 404 para FAQ inexistente', async () => {
    prisma.fAQ.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .delete('/api/faq/nao-existe')
      .set(auth(userToken));

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).delete(`/api/faq/${mockFAQ.id}`);
    expect(res.status).toBe(401);
  });
});
