import { Response, NextFunction } from "express";
import { faqModel, CategoriaFAQ } from "../models/faqModel";
import { ApiError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth";

// ─── FAQ Controller ───────────────────────────────────────────────────────────

export const faqController = {
  /**
   * POST /api/faq
   * Cria uma nova entrada no FAQ (admin)
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { pergunta, resposta, categoria, ordem, ativo } = req.body;

      const faq = await faqModel.criar({ pergunta, resposta, categoria, ordem, ativo });

      res.status(201).json({
        success: true,
        message: "FAQ criado com sucesso",
        data: faq,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/faq
   * Lista FAQs (público: apenas ativos; admin: todos se ?todos=true)
   */
  async listar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const todos = req.query["todos"] === "true";
      const categoria = req.query["categoria"] as CategoriaFAQ | undefined;

      const CATEGORIAS_VALIDAS: CategoriaFAQ[] = [
        "DIABETES",
        "SINTOMAS",
        "ALIMENTACAO",
        "EXERCICIOS",
        "MEDICACAO",
        "MONITORAMENTO",
      ];

      if (categoria && !CATEGORIAS_VALIDAS.includes(categoria)) {
        throw new ApiError("Categoria inválida", 400);
      }

      // Admin pode ver todos; usuário comum só vê ativos
      const apenasAtivos = !todos || req.usuario?.perfil !== "ADMIN";

      const faqs = await faqModel.listar(apenasAtivos, categoria);

      res.json({ success: true, data: faqs });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/faq/:id
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;
      const faq = await faqModel.buscarPorId(id);

      if (!faq) throw new ApiError("FAQ não encontrado", 404);

      res.json({ success: true, data: faq });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/faq/:id
   * Atualiza (admin)
   */
  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;

      const existente = await faqModel.buscarPorId(id);
      if (!existente) throw new ApiError("FAQ não encontrado", 404);

      const atualizado = await faqModel.atualizar(id, req.body);

      res.json({
        success: true,
        message: "FAQ atualizado com sucesso",
        data: atualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/faq/:id
   * Deleta (admin)
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params["id"] as string;

      const existente = await faqModel.buscarPorId(id);
      if (!existente) throw new ApiError("FAQ não encontrado", 404);

      await faqModel.deletar(id);

      res.json({ success: true, message: "FAQ deletado com sucesso" });
    } catch (error) {
      next(error);
    }
  },
};
