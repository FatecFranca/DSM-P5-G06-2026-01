import prisma from '../config/database';
import { QualidadeSono } from '../types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarSonoDto {
  usuarioId: string;
  data: string;
  horaDeitar: string;
  horaAcordar: string;
  duracao: number;
  qualidade: QualidadeSono;
  notas?: string;
}

export interface AtualizarSonoDto {
  data?: string;
  horaDeitar?: string;
  horaAcordar?: string;
  duracao?: number;
  qualidade?: QualidadeSono;
  notas?: string;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const sonoModel = {
  async criar(dados: CriarSonoDto) {
    return prisma.sono.create({
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.sono.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true } },
      },
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

    const [sonos, total] = await Promise.all([
      prisma.sono.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: { data: 'desc' },
      }),
      prisma.sono.count({ where }),
    ]);

    return {
      dados: sonos,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async atualizar(id: string, dados: AtualizarSonoDto) {
    return prisma.sono.update({
      where: { id },
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async deletar(id: string) {
    return prisma.sono.delete({ where: { id } });
  },

  async listarTodos(
    pagina = 1,
    limite = 20,
    qualidade?: QualidadeSono,
  ) {
    const offset = (pagina - 1) * limite;
    const where = qualidade ? { qualidade } : {};

    const [sonos, total] = await Promise.all([
      prisma.sono.findMany({
        where,
        skip: offset,
        take: limite,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { data: 'desc' },
      }),
      prisma.sono.count({ where }),
    ]);

    return {
      dados: sonos,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async estatisticasDoUsuario(usuarioId: string) {
    const sonos = await prisma.sono.findMany({
      where: { usuarioId },
      orderBy: { data: 'desc' },
      take: 30,
    });

    if (sonos.length === 0) {
      return { total: 0, mediaDuracao: 0, distribuicaoQualidade: {} };
    }

    const mediaDuracao =
      sonos.reduce((sum, s) => sum + s.duracao, 0) / sonos.length;

    const distribuicaoQualidade = sonos.reduce<Record<string, number>>(
      (acc, s) => {
        acc[s.qualidade] = (acc[s.qualidade] ?? 0) + 1;
        return acc;
      },
      {},
    );

    return {
      total: sonos.length,
      mediaDuracao: Math.round(mediaDuracao * 10) / 10,
      distribuicaoQualidade,
    };
  },
};
