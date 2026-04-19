import prisma from "../config/database";
import { Categoria } from "../types";

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CriarDicaDto {
  titulo: string;
  sumario: string;
  conteudo: string;
  categoria: Categoria;
  tempoLeitura: number;
  destaque?: boolean;
}

export interface AtualizarDicaDto {
  titulo?: string;
  sumario?: string;
  conteudo?: string;
  categoria?: Categoria;
  tempoLeitura?: number;
  destaque?: boolean;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const dicasModel = {
  async criar(dados: CriarDicaDto) {
    return prisma.dicas.create({
      data: {
        ...dados,
        destaque: dados.destaque ?? false,
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.dicas.findUnique({
      where: { id },
    });
  },

  async atualizar(id: string, dados: AtualizarDicaDto) {
    return prisma.dicas.update({
      where: { id },
      data: dados,
    });
  },

  async deletar(id: string) {
    return prisma.dicas.delete({
      where: { id },
    });
  },

  async listar(pagina = 1, limite = 20, categoria?: Categoria) {
    const offset = (pagina - 1) * limite;

    const where = categoria ? { categoria } : {};

    const [dicas, total] = await Promise.all([
      prisma.dicas.findMany({
        where,
        skip: offset,
        take: limite,
        orderBy: { criadoEm: "desc" },
      }),
      prisma.dicas.count({ where }),
    ]);

    return {
      dados: dicas,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  },
};