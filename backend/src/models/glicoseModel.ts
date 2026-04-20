import prisma from '../config/database';
import { ContextoGlicose, StatusGlicose } from '../types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarGlicoseDto {
  usuarioId: string;
  valor: number;
  contexto: ContextoGlicose;
  data: string;
  hora: string;
  status: StatusGlicose;
  notas?: string;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const glicoseModel = {
  async criar(dados: CriarGlicoseDto) {
    return prisma.glicose.create({
      data: dados,
    });
  },

  async buscarPorId(id: string) {
    return prisma.glicose.findUnique({
      where: { id },
    });
  },

  async listarDoUsuario(
    usuarioId: string,
    pagina = 1,
    limite = 20,
    dataInicio?: string,
    dataFim?: string,
  ) {
    const offset = (pagina - 1) * limite;

    const where: Record<string, unknown> = { usuarioId };

    if (dataInicio || dataFim) {
      where['data'] = {
        ...(dataInicio && { gte: dataInicio }),
        ...(dataFim && { lte: dataFim }),
      };
    }

    const [glicoses, total] = await Promise.all([
      prisma.glicose.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: { data: 'desc' },
      }),
      prisma.glicose.count({ where }),
    ]);

    return {
      dados: glicoses,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async deletar(id: string) {
    return prisma.glicose.delete({
      where: { id },
    });
  },

  // ─── Estatísticas ──────────────────────────────────────────────────────────

  async estatisticas(
    usuarioId: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    const where: Record<string, unknown> = { usuarioId };

    if (dataInicio || dataFim) {
      where['data'] = {
        ...(dataInicio && { gte: dataInicio }),
        ...(dataFim && { lte: dataFim }),
      };
    }

    const registros = await prisma.glicose.findMany({ where });

    if (registros.length === 0) {
      return {
        total: 0,
        media: 0,
        percentual: {
          normal: 0,
          alto: 0,
          baixo: 0,
        },
      };
    }

    const total = registros.length;

    const media =
      registros.reduce((sum, r) => sum + r.valor, 0) / total;

    const contagem = registros.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      media: Math.round(media * 10) / 10,
      percentual: {
        normal: Math.round(((contagem['NORMAL'] ?? 0) / total) * 100),
        alto: Math.round(
          (((contagem['ALTO'] ?? 0) + (contagem['MUITO_ALTO'] ?? 0)) / total) * 100
        ),
        baixo: Math.round(((contagem['BAIXO'] ?? 0) / total) * 100),
      },
    };
  },

  // ─── Tendência (gráfico) ────────────────────────────────────────────────────

  async tendencia(
    usuarioId: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    const where: Record<string, unknown> = { usuarioId };

    if (dataInicio || dataFim) {
      where['data'] = {
        ...(dataInicio && { gte: dataInicio }),
        ...(dataFim && { lte: dataFim }),
      };
    }

    const registros = await prisma.glicose.findMany({
      where,
      orderBy: { data: 'asc' },
    });

    const agrupado: Record<
      string,
      { valores: number[] }
    > = {};

    for (const r of registros) {
      if (!agrupado[r.data]) {
        agrupado[r.data] = { valores: [] };
      }
      agrupado[r.data].valores.push(r.valor);
    }

    return Object.entries(agrupado).map(([data, { valores }]) => {
      const min = Math.min(...valores);
      const max = Math.max(...valores);
      const media =
        valores.reduce((sum, v) => sum + v, 0) / valores.length;

      return {
        data,
        min,
        max,
        media: Math.round(media * 10) / 10,
      };
    });
  },
};