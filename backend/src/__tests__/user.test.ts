import request from 'supertest';
import app from '../app';
import { generateToken, mockUser, mockAdmin } from './helpers';

jest.mock('../config/database', () => ({
  __esModule: true,
  default: {
    usuario: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const prisma = require('../config/database').default;

const userToken = generateToken({ id: mockUser.id, email: mockUser.email, perfil: 'USUARIO' });
const adminToken = generateToken({ id: mockAdmin.id, email: mockAdmin.email, perfil: 'ADMIN' });
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

const publicUser = {
  id: mockUser.id,
  nome: mockUser.nome,
  email: mockUser.email,
  perfil: 'USUARIO',
  status: 'ATIVO',
  tipoDiabetes: null,
  idade: null,
  peso: null,
  altura: null,
  glicoseAlvoMin: null,
  glicoseAlvoMax: null,
  nomeMedico: null,
  ultimaConsulta: null,
  criadoEm: new Date(),
  atualizadoEm: new Date(),
};

describe('GET /api/usuarios/:id', () => {
  it('retorna dados do próprio usuário', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(publicUser);

    const res = await request(app)
      .get(`/api/usuarios/${mockUser.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(mockUser.id);
    expect(res.body.data).not.toHaveProperty('senha');
  });

  it('retorna 403 ao tentar acessar dados de outro usuário', async () => {
    const res = await request(app)
      .get('/api/usuarios/outro-usuario-id')
      .set(auth(userToken));

    expect(res.status).toBe(403);
  });

  it('admin pode acessar dados de qualquer usuário', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(publicUser);

    const res = await request(app)
      .get(`/api/usuarios/${mockUser.id}`)
      .set(auth(adminToken));

    expect(res.status).toBe(200);
  });

  it('retorna 404 para usuário inexistente', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(null);

    const res = await request(app)
      .get(`/api/usuarios/${mockUser.id}`)
      .set(auth(userToken));

    expect(res.status).toBe(404);
  });

  it('retorna 401 sem autenticação', async () => {
    const res = await request(app).get(`/api/usuarios/${mockUser.id}`);
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/usuarios/:id', () => {
  it('usuário atualiza seu próprio perfil', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(publicUser);
    prisma.usuario.update.mockResolvedValueOnce({ ...publicUser, nome: 'Novo Nome' });

    const res = await request(app)
      .put(`/api/usuarios/${mockUser.id}`)
      .set(auth(userToken))
      .send({ nome: 'Novo Nome' });

    expect(res.status).toBe(200);
    expect(res.body.data.nome).toBe('Novo Nome');
  });

  it('retorna 403 ao tentar editar outro usuário', async () => {
    const res = await request(app)
      .put('/api/usuarios/outro-usuario-id')
      .set(auth(userToken))
      .send({ nome: 'Novo Nome' });

    expect(res.status).toBe(403);
  });

  it('admin pode atualizar dados de qualquer usuário', async () => {
    prisma.usuario.findUnique.mockResolvedValueOnce(publicUser);
    prisma.usuario.update.mockResolvedValueOnce({ ...publicUser, nome: 'Nome Editado' });

    const res = await request(app)
      .put(`/api/usuarios/${mockUser.id}`)
      .set(auth(adminToken))
      .send({ nome: 'Nome Editado' });

    expect(res.status).toBe(200);
  });

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app)
      .put(`/api/usuarios/${mockUser.id}`)
      .set(auth(userToken))
      .send({ idade: -1 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/usuarios', () => {
  it('admin lista todos os usuários', async () => {
    prisma.usuario.findMany.mockResolvedValueOnce([{ ...publicUser, _count: { diarios: 2 } }]);
    prisma.usuario.count.mockResolvedValueOnce(1);

    const res = await request(app).get('/api/admin/usuarios').set(auth(adminToken));

    expect(res.status).toBe(200);
    expect(res.body.data.dados).toHaveLength(1);
  });

  it('retorna 403 para usuário comum', async () => {
    const res = await request(app).get('/api/admin/usuarios').set(auth(userToken));
    expect(res.status).toBe(403);
  });

  it('retorna 401 sem token', async () => {
    const res = await request(app).get('/api/admin/usuarios');
    expect(res.status).toBe(401);
  });
});
