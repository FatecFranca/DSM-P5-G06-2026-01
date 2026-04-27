import prisma from '../config/database';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarNotificacaoDto {
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  data: string;
  hora: string;
}

export interface AtualizarNotificacaoDto {
  titulo?: string;
  mensagem?: string;
  tipo?: string;
  data?: string;
  hora?: string;
  lida?: boolean;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const notificacaoModel = {
  async criar(dados: CriarNotificacaoDto) {
    return prisma.notificacao.create({
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.notificacao.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async listarDoUsuario(
    usuarioId: string,
    pagina = 1,
    limite = 20
  ) {
    const offset = (pagina - 1) * limite;

    const where = { usuarioId };

    const [notificacoes, total, naoLidas] = await Promise.all([
      prisma.notificacao.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: [
          { lida: 'asc' }, // não lidas primeiro 👀
          { data: 'desc' },
          { hora: 'desc' },
        ],
      }),
      prisma.notificacao.count({ where }),
      prisma.notificacao.count({
        where: {
          usuarioId,
          lida: false,
        },
      }),
    ]);

    return {
      dados: notificacoes,
      total,
      naoLidas,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },

  async marcarComoLida(id: string) {
    return prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });
  },

  async marcarTodasComoLidas(usuarioId: string) {
    return prisma.notificacao.updateMany({
      where: {
        usuarioId,
        lida: false,
      },
      data: {
        lida: true,
      },
    });
  },

  async deletar(id: string) {
    return prisma.notificacao.delete({
      where: { id },
    });
  },
};