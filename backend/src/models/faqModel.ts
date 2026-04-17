import prisma from "../config/database";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoriaFAQ =
  | "DIABETES"
  | "SINTOMAS"
  | "ALIMENTACAO"
  | "EXERCICIOS"
  | "MEDICACAO"
  | "MONITORAMENTO";

export interface CriarFaqDto {
  pergunta: string;
  resposta: string;
  categoria: CategoriaFAQ;
  ordem?: number;
  ativo?: boolean;
}

export interface AtualizarFaqDto {
  pergunta?: string;
  resposta?: string;
  categoria?: CategoriaFAQ;
  ordem?: number;
  ativo?: boolean;
}

// ─── Model ────────────────────────────────────────────────────────────────────

export const faqModel = {
  async criar(dados: CriarFaqDto) {
    return prisma.fAQ.create({
      data: {
        ...dados,
        ordem: dados.ordem ?? 0,
        ativo: dados.ativo ?? true,
      },
    });
  },

  async buscarPorId(id: string) {
    return prisma.fAQ.findUnique({ where: { id } });
  },

  async atualizar(id: string, dados: AtualizarFaqDto) {
    return prisma.fAQ.update({ where: { id }, data: dados });
  },

  async deletar(id: string) {
    return prisma.fAQ.delete({ where: { id } });
  },

  async listar(apenasAtivos = false, categoria?: CategoriaFAQ) {
    const where: Record<string, unknown> = {};
    if (apenasAtivos) where["ativo"] = true;
    if (categoria) where["categoria"] = categoria;

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ categoria: "asc" }, { ordem: "asc" }, { criadoEm: "asc" }],
    });

    return faqs;
  },
};
