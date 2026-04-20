import prisma from '../config/database';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarHidratacaoDto {
  usuarioId: string;
  data: string;
  hora: string;
  quantidade: number;
}

export interface AtualizarHidratacaoDto {
  data?: string;
  hora?: string;
  quantidade?: number;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const hidratacaoModel = {
  async criar(dados: CriarHidratacaoDto) {
    return prisma.hidratacao.create({
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.hidratacao.findUnique({
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

    const [registros, total] = await Promise.all([
      prisma.hidratacao.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: { data: 'desc' },
      }),
      prisma.hidratacao.count({ where }),
    ]);

    return {
      dados: registros,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async atualizar(id: string, dados: AtualizarHidratacaoDto) {
    return prisma.hidratacao.update({
      where: { id },
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async deletar(id: string) {
    return prisma.hidratacao.delete({
      where: { id },
    });
  },

  async listarTodos(pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;

    const [registros, total] = await Promise.all([
      prisma.hidratacao.findMany({
        skip: offset,
        take: limite,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { data: 'desc' },
      }),
      prisma.hidratacao.count(),
    ]);

    return {
      dados: registros,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async totalDoDia(usuarioId: string, data: string) {
    const registros = await prisma.hidratacao.findMany({
      where: { usuarioId, data },
    });

    if (registros.length === 0) {
      return {
        total: 0,
        quantidadeRegistros: 0,
      };
    }

    const total = registros.reduce((sum, r) => sum + r.quantidade, 0);

    return {
      total,
      quantidadeRegistros: registros.length,
    };
  },
};