import prisma from '../config/database';
import { CategoriaMeta } from '../types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarMetaDto {
  usuarioId: string;
  titulo: string;
  descricao?: string;
  alvo: number;
  atual?: number;
  unidade: string;
  categoria: CategoriaMeta;
  prazo: string;
  concluida?: boolean;
  cor?: string;
}

export interface AtualizarMetaDto {
  titulo?: string;
  descricao?: string;
  alvo?: number;
  atual?: number;
  unidade?: string;
  categoria?: CategoriaMeta;
  prazo?: string;
  concluida?: boolean;
  cor?: string;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const metasModel = {
  async criar(dados: CriarMetaDto) {
    return prisma.meta.create({
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.meta.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async listarDoUsuario(
    usuarioId: string,
    pagina = 1,
    limite = 50,
    categoria?: CategoriaMeta,
    concluida?: boolean,
  ) {
    const offset = (pagina - 1) * limite;
    const where: Record<string, unknown> = { usuarioId };

    if (categoria) where['categoria'] = categoria;
    if (concluida !== undefined) where['concluida'] = concluida;

    const [metas, total] = await Promise.all([
      prisma.meta.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.meta.count({ where }),
    ]);

    return {
      dados: metas,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async atualizar(id: string, dados: AtualizarMetaDto) {
    return prisma.meta.update({
      where: { id },
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async deletar(id: string) {
    return prisma.meta.delete({ where: { id } });
  },

  async listarTodos(
    pagina = 1,
    limite = 50,
    categoria?: CategoriaMeta,
    concluida?: boolean,
  ) {
    const offset = (pagina - 1) * limite;
    const where: Record<string, unknown> = {};

    if (categoria) where['categoria'] = categoria;
    if (concluida !== undefined) where['concluida'] = concluida;

    const [metas, total] = await Promise.all([
      prisma.meta.findMany({
        where,
        skip: offset,
        take: limite,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.meta.count({ where }),
    ]);

    return {
      dados: metas,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },
};
