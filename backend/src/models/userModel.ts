import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { TipoDiabetes } from '../types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarUsuarioDto {
  nome: string;
  email: string;
  senha: string;
}

export interface AtualizarUsuarioDto {
  nome?: string;
  idade?: number;
  peso?: number;
  altura?: number;
  tipoDiabetes?: TipoDiabetes;
  glicoseAlvoMin?: number;
  glicoseAlvoMax?: number;
  nomeMedico?: string | null;
  ultimaConsulta?: Date | null;
}

// ─── Campos públicos (sem senha) ───────────────────────────────────────────────

const CAMPOS_PUBLICOS = {
  id: true,
  nome: true,
  email: true,
  idade: true,
  peso: true,
  altura: true,
  tipoDiabetes: true,
  glicoseAlvoMin: true,
  glicoseAlvoMax: true,
  nomeMedico: true,
  ultimaConsulta: true,
  status: true,
  perfil: true,
  criadoEm: true,
  atualizadoEm: true,
} as const;

// ─── Model ────────────────────────────────────────────────────────────────────

export const userModel = {
  async criar(dados: CriarUsuarioDto) {
    const senhaHash = await bcrypt.hash(dados.senha, 12);

    return prisma.usuario.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha: senhaHash,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoDiabetes: true,
        status: true,
        perfil: true,
        criadoEm: true,
      },
    });
  },

  async buscarPorEmail(email: string) {
    return prisma.usuario.findUnique({ where: { email } });
  },

  async buscarPorId(id: string) {
    return prisma.usuario.findUnique({
      where: { id },
      select: CAMPOS_PUBLICOS,
    });
  },

  async atualizar(id: string, dados: AtualizarUsuarioDto) {
    return prisma.usuario.update({
      where: { id },
      data: dados,
      select: CAMPOS_PUBLICOS,
    });
  },

  async listarTodos(pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        skip: offset,
        take: limite,
        select: {
          ...CAMPOS_PUBLICOS,
          _count: { select: { diarios: true } },
        },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.usuario.count(),
    ]);

    return {
      dados: usuarios,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async verificarSenha(senha: string, hash: string) {
    return bcrypt.compare(senha, hash);
  },
};
