import prisma from '../config/database';

export interface CriarDiagnosticoDto {
  usuarioId: string;
  respostas: Record<string, number>;
  pontuacao: number;
  nivelRisco: string;
  percentual: number;
  predicao: number;
  probabilidade: number;
}

export const diagnosticoModel = {
  async criar(dados: CriarDiagnosticoDto) {
    const diagnostico = await prisma.diagnostico.create({
      data: {
        usuarioId:    dados.usuarioId,
        respostas:    dados.respostas,
        pontuacao:    dados.pontuacao,
        nivelRisco:   dados.nivelRisco,
        percentual:   dados.percentual,
        predicao:     dados.predicao,
        probabilidade: dados.probabilidade,
      },
    });

    await prisma.usuario.update({
      where: { id: dados.usuarioId },
      data: { diagnosticoFeito: true },
    });

    return diagnostico;
  },

  async buscarDoUsuario(usuarioId: string) {
    return prisma.diagnostico.findFirst({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
    });
  },

  async verificarFeito(usuarioId: string): Promise<boolean> {
    const count = await prisma.diagnostico.count({ where: { usuarioId } });
    return count > 0;
  },

  async listarTodos(pagina = 1, limite = 50) {
    const skip = (pagina - 1) * limite;
    const [dados, total] = await Promise.all([
      prisma.diagnostico.findMany({
        skip,
        take: limite,
        orderBy: { criadoEm: 'desc' },
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
      }),
      prisma.diagnostico.count(),
    ]);
    return { dados, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  },
};
