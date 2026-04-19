import prisma from '../config/database';
import { Humor } from '../types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarDiarioDto {
  usuarioId: string;
  titulo: string;
  conteudo: string;
  humor: Humor;
  sintomas?: string[];
  tags?: string[];
}

export interface AtualizarDiarioDto {
  titulo?: string;
  conteudo?: string;
  humor?: Humor;
  sintomas?: string[];
  tags?: string[];
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const diarioModel = {
  async criar(dados: CriarDiarioDto) {
    return prisma.diario.create({
      data: {
        ...dados,
        sintomas: dados.sintomas ?? [],
        tags: dados.tags ?? [],
      },
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.diario.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async listarDoUsuario(usuarioId: string, pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;

    const [diarios, total] = await Promise.all([
      prisma.diario.findMany({
        where: { usuarioId },
        skip: offset,
        take: limite,
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.diario.count({ where: { usuarioId } }),
    ]);

    return {
      dados: diarios,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async atualizar(id: string, dados: AtualizarDiarioDto) {
    return prisma.diario.update({
      where: { id },
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async deletar(id: string) {
    return prisma.diario.delete({ where: { id } });
  },

  async listarTodos(pagina = 1, limite = 20, humor?: Humor) {
    const offset = (pagina - 1) * limite;
    const where = humor ? { humor } : {};

    const [diarios, total] = await Promise.all([
      prisma.diario.findMany({
        where,
        skip: offset,
        take: limite,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.diario.count({ where }),
    ]);

    return {
      dados: diarios,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },
};
