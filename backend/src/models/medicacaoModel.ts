import prisma from '../config/database';
import { TipoMedicacao } from '../types';

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarMedicacaoDto {
  usuarioId: string;
  nome: string;
  dosagem: string;
  frequencia: string;
  horarios: string[];
  tipo: TipoMedicacao;
  notas?: string;
  cor?: string;
}

export interface AtualizarMedicacaoDto {
  nome?: string;
  dosagem?: string;
  frequencia?: string;
  horarios?: string[];
  tipo?: TipoMedicacao;
  notas?: string;
  cor?: string;
  tomado?: boolean;
  ultimaTomada?: string | null;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const medicacaoModel = {
  async criar(dados: CriarMedicacaoDto) {
    return prisma.medicacao.create({
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.medicacao.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async listarDoUsuario(usuarioId: string, pagina = 1, limite = 20, tipo?: TipoMedicacao) {
    const offset = (pagina - 1) * limite;
    const where: Record<string, unknown> = { usuarioId };
    if (tipo) where['tipo'] = tipo;

    const [registros, total] = await Promise.all([
      prisma.medicacao.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.medicacao.count({ where }),
    ]);

    return { dados: registros, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  },

  async atualizar(id: string, dados: AtualizarMedicacaoDto) {
    return prisma.medicacao.update({
      where: { id },
      data: dados,
      include: {
        usuario: { select: { id: true, nome: true } },
      },
    });
  },

  async deletar(id: string) {
    return prisma.medicacao.delete({ where: { id } });
  },

  async listarTodos(pagina = 1, limite = 50, tipo?: TipoMedicacao) {
    const offset = (pagina - 1) * limite;
    const where: Record<string, unknown> = {};
    if (tipo) where['tipo'] = tipo;

    const [registros, total] = await Promise.all([
      prisma.medicacao.findMany({
        where,
        skip: offset,
        take: limite,
        include: {
          usuario: { select: { id: true, nome: true, email: true } },
        },
        orderBy: { criadoEm: 'desc' },
      }),
      prisma.medicacao.count({ where }),
    ]);

    return { dados: registros, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  },
};
