import request from 'supertest';
import app from '../app';
import { generateToken, mockUser, mockDica } from './helpers';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    dicas: {
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
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('GET /api/dicas', () => {
  it('lista dicas com autenticação', async () => {
    prisma.dicas.findMany.mockResolvedValueOnce([mockDica]);
    prisma.dicas.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/dicas').set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dados).toHaveLength(1);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get('/api/dicas');
    expect(res.status).toBe(401);
  });

  it('filtra por categoria válida', async () => {
    prisma.dicas.findMany.mockResolvedValueOnce([mockDica]);
    prisma.dicas.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/dicas?categoria=EXERCICIO').set(auth(userToken));

    expect(res.status).toBe(200);
  });

  it('retorna 400 para categoria inválida', async () => {
    const res = await request(app).get('/api/dicas?categoria=INVALIDA').set(auth(userToken));
    expect(res.status).toBe(400);
  });

  it('aceita paginação', async () => {
    prisma.dicas.findMany.mockResolvedValueOnce([]);
    prisma.dicas.count.mockResolvedValueOnce(0);

    const res = await request(app).get('/api/dicas?pagina=2&limite=5').set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.pagina).toBe(2);
  });
});

describe('GET /api/dicas/:id', () => {
  it('retorna uma dica por id', async () => {
    prisma.dicas.findUnique.mockResolvedValueOnce(mockDica);

    const res = await request(app).get(`/api/dicas/${mockDica.id}`).set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockDica.id);
  });

  it('retorna 404 para dica inexistente', async () => {
    prisma.dicas.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/dicas/nao-existe').set(auth(userToken));

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get(`/api/dicas/${mockDica.id}`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/dicas', () => {
  it('usuário autenticado cria dica', async () => {
    prisma.dicas.create.mockResolvedValueOnce(mockDica);

    const res = await request(app)
      .post('/api/dicas')
      .set(auth(userToken))
      .send({
        titulo: 'Nova Dica',
        sumario: 'Resumo',
        conteudo: 'Conteúdo completo',
        categoria: 'EXERCICIO',
        tempoLeitura: 3,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).post('/api/dicas').send({
      titulo: 'Nova Dica',
      sumario: 'Resumo',
      conteudo: 'Conteúdo',
      categoria: 'EXERCICIO',
      tempoLeitura: 3,
    });

    expect(res.status).toBe(401);
  });

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app)
      .post('/api/dicas')
      .set(auth(userToken))
      .send({ titulo: 'Incompleto' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/dicas/:id', () => {
  it('atualiza dica existente', async () => {
    prisma.dicas.findUnique.mockResolvedValueOnce(mockDica);
    prisma.dicas.update.mockResolvedValueOnce({ ...mockDica, titulo: 'Atualizado' });

    const res = await request(app)
      .put(`/api/dicas/${mockDica.id}`)
      .set(auth(userToken))
      .send({ titulo: 'Atualizado' });

    expect(res.status).toBe(200);
    expect(res.body.data.titulo).toBe('Atualizado');
  });

  it('retorna 404 para dica inexistente', async () => {
    prisma.dicas.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .put('/api/dicas/nao-existe')
      .set(auth(userToken))
      .send({ titulo: 'Atualizado' });

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app)
      .put(`/api/dicas/${mockDica.id}`)
      .send({ titulo: 'Atualizado' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/dicas/:id', () => {
  it('deleta dica existente', async () => {
    prisma.dicas.findUnique.mockResolvedValueOnce(mockDica);
    prisma.dicas.delete.mockResolvedValueOnce(mockDica);

    const res = await request(app)
      .delete(`/api/dicas/${mockDica.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('retorna 404 para dica inexistente', async () => {
    prisma.dicas.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .delete('/api/dicas/nao-existe')
      .set(auth(userToken));

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).delete(`/api/dicas/${mockDica.id}`);
    expect(res.status).toBe(401);
  });
});
