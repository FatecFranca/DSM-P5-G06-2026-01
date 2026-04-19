import request from 'supertest';
import app from '../app';
import { mockUser } from './helpers';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../config/database').default;

describe('POST /api/auth/registrar', () => {
  it('cria usuário e retorna token', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(null);
    prisma.usuario.create.mockResolvedValueOnce({
      id: mockUser.id,
      nome: 'Test User',
      email: 'new@example.com',
      perfil: 'USUARIO',
      status: 'ATIVO',
      tipoDiabetes: null,
      criadoEm: new Date(),
    });

    const res = await request(app).post('/api/auth/registrar').send({
      nome: 'Test User',
      email: 'new@example.com',
      senha: 'senha123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.usuario).toHaveProperty('email', 'new@example.com');
  });

  it('retorna 409 quando e-mail já existe', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(mockUser);

    const res = await request(app).post('/api/auth/registrar').send({
      nome: 'Test',
      email: 'test@example.com',
      senha: 'senha123',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/já cadastrado/i);
  });

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app).post('/api/auth/registrar').send({
      email: 'invalid',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  it('autentica e retorna token', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('senha123', 1);

    prisma.usuario.findUnique.mockResolvedValueOnce({
      ...mockUser,
      senha: hash,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: mockUser.email,
      senha: 'senha123',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.usuario).not.toHaveProperty('senha');
  });

  it('retorna 401 para e-mail não encontrado', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@example.com',
      senha: 'senha123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('retorna 401 para senha errada', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('senha-correta', 1);
    prisma.usuario.findUnique.mockResolvedValueOnce({ ...mockUser, senha: hash });

    const res = await request(app).post('/api/auth/login').send({
      email: mockUser.email,
      senha: 'senha-errada',
    });

    expect(res.status).toBe(401);
  });

  it('retorna 403 para conta inativa', async () => {
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.hash('senha123', 1);
    prisma.usuario.findUnique.mockResolvedValueOnce({
      ...mockUser,
      status: 'INATIVO',
      senha: hash,
    });

    const res = await request(app).post('/api/auth/login').send({
      email: mockUser.email,
      senha: 'senha123',
    });

    expect(res.status).toBe(403);
  });
});
