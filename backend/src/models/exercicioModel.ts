import prisma from '../config/database';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarExercicioDto {
  usuarioId: string;
  tipo: string;
  duracao: number;
  calorias: number;
  data: string;
  hora: string;
  intensidade: 'leve' | 'moderada' | 'intensa';
  notas?: string;
}

export interface AtualizarExercicioDto {
  tipo?: string;
  duracao?: number;
  calorias?: number;
  data?: string;
  hora?: string;
  intensidade?: 'leve' | 'moderada' | 'intensa';
  notas?: string;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const exercicioModel = {
  async criar(dados: CriarExercicioDto) {
    return prisma.exercicio.create({
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.exercicio.findUnique({
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

    const [exercicios, total] = await Promise.all([
      prisma.exercicio.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: { data: 'desc' },
      }),
      prisma.exercicio.count({ where }),
    ]);

    return {
      dados: exercicios,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async atualizar(id: string, dados: AtualizarExercicioDto) {
    return prisma.exercicio.update({
      where: { id },
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async deletar(id: string) {
    return prisma.exercicio.delete({
      where: { id },
    });
  },

  async listarTodos(pagina = 1, limite = 20) {
    const offset = (pagina - 1) * limite;

    const [exercicios, total] = await Promise.all([
      prisma.exercicio.findMany({
        skip: offset,
        take: limite,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { data: 'desc' },
      }),
      prisma.exercicio.count(),
    ]);

    return {
      dados: exercicios,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },
};