import { Response, NextFunction } from 'express';
import { dicasModel } from '../models/dicasModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { Categoria } from '../types';

// ─── Dicas Controller ─────────────────────────────────────────────────────────

export const dicasController = {
  /**
   * POST /api/dicas
   * Cria uma nova dica
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { titulo, sumario, conteudo, categoria, tempoLeitura, destaque } = req.body;

      const dica = await dicasModel.criar({
        titulo,
        sumario,
        conteudo,
        categoria,
        tempoLeitura,
        destaque,
      });

      res.status(201).json({
        success: true,
        message: 'Dica criada com sucesso',
        data: dica,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dicas
   * Lista todas as dicas
   */
  async listar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));
      const categoria = req.query['categoria'] as Categoria | undefined;

      const categoriasValidas: Categoria[] = [
        'EXERCICIO',
        'ALIMENTACAO',
        'EMERGENCIA',
        'BEM_ESTAR',
      ];

      if (categoria && !categoriasValidas.includes(categoria)) {
        throw new ApiError('Categoria inválida', 400);
      }

      const resultado = await dicasModel.listar(pagina, limite, categoria);

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dicas/:id
   * Busca uma dica por ID
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const dica = await dicasModel.buscarPorId(id);

      if (!dica) {
        throw new ApiError('Dica não encontrada', 404);
      }

      res.json({
        success: true,
        data: dica,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/dicas/:id
   * Atualiza uma dica
   */
  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const existente = await dicasModel.buscarPorId(id);

      if (!existente) {
        throw new ApiError('Dica não encontrada', 404);
      }

      const atualizado = await dicasModel.atualizar(id, req.body);

      res.json({
        success: true,
        message: 'Dica atualizada com sucesso',
        data: atualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/dicas/:id
   * Deleta uma dica
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const existente = await dicasModel.buscarPorId(id);

      if (!existente) {
        throw new ApiError('Dica não encontrada', 404);
      }

      await dicasModel.deletar(id);

      res.json({
        success: true,
        message: 'Dica deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },
};