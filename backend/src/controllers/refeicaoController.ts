import { Response, NextFunction } from 'express';
import { refeicaoModel } from '../models/refeicaoModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { TipoRefeicao } from '../types';
import { buscarAlimentos } from '../services/fatsecretService';

// ─── Refeição Controller ───────────────────────────────────────────────────────

export const refeicaoController = {
  /**
   * POST /api/refeicao
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const {
        tipo, data, hora, alimentos,
        totalCalorias, totalCarbs, totalProteinas, totalGorduras, notas,
      } = req.body;

      const registro = await refeicaoModel.criar({
        usuarioId,
        tipo: tipo as TipoRefeicao,
        data, hora, alimentos,
        totalCalorias, totalCarbs, totalProteinas, totalGorduras, notas,
      });

      res.status(201).json({
        success: true,
        message: 'Refeição registrada com sucesso',
        data: registro,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/refeicao
   */
  async listar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 50));
      const data   = req.query['data'] as string | undefined;
      const tipo   = req.query['tipo'] as TipoRefeicao | undefined;

      const resultado = await refeicaoModel.listarDoUsuario(usuarioId, pagina, limite, data, tipo);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/refeicao/buscar-alimento?q=...
   */
  async buscarAlimento(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query      = (req.query['q'] as string ?? '').trim();
      const pagina     = Math.max(0, Number(req.query['pagina']) || 0);
      const maxResults = Math.min(50, Math.max(1, Number(req.query['max']) || 20));

      if (query.length < 2) {
        throw new ApiError('Termo de busca deve ter pelo menos 2 caracteres', 400);
      }

      const resultado = await buscarAlimentos(query, pagina, maxResults);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/refeicao/:id
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id       = req.params['id'] as string;
      const registro = await refeicaoModel.buscarPorId(id);

      if (!registro) throw new ApiError('Refeição não encontrada', 404);

      if (registro.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para acessar esta refeição', 403);
      }

      res.json({ success: true, data: registro });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/refeicao/:id
   */
  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id       = req.params['id'] as string;
      const registro = await refeicaoModel.buscarPorId(id);

      if (!registro) throw new ApiError('Refeição não encontrada', 404);

      if (registro.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para atualizar esta refeição', 403);
      }

      const {
        tipo, data, hora, alimentos,
        totalCalorias, totalCarbs, totalProteinas, totalGorduras, notas,
      } = req.body;

      const updated = await refeicaoModel.atualizar(id, {
        tipo: tipo as TipoRefeicao | undefined,
        data, hora, alimentos,
        totalCalorias, totalCarbs, totalProteinas, totalGorduras, notas,
      });

      res.json({
        success: true,
        message: 'Refeição atualizada com sucesso',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/refeicao/:id
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id       = req.params['id'] as string;
      const registro = await refeicaoModel.buscarPorId(id);

      if (!registro) throw new ApiError('Refeição não encontrada', 404);

      if (registro.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para deletar esta refeição', 403);
      }

      await refeicaoModel.deletar(id);

      res.json({ success: true, message: 'Refeição deletada com sucesso' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/refeicao — admin, todos os registros
   */
  async listarTodos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(200, Math.max(1, Number(req.query['limite']) || 50));
      const tipo   = req.query['tipo'] as TipoRefeicao | undefined;

      const resultado = await refeicaoModel.listarTodos(pagina, limite, tipo);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },
};
