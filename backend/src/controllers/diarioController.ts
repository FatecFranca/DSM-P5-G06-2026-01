import { Response, NextFunction } from 'express';
import { diarioModel } from '../models/diarioModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { Humor } from '../types';

// ─── Diário Controller ─────────────────────────────────────────────────────────

export const diarioController = {
  /**
   * POST /api/diarios
   * Cria uma nova entrada no diário do usuário autenticado
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { titulo, conteudo, humor, sintomas, tags } = req.body;

      const diario = await diarioModel.criar({
        usuarioId,
        titulo,
        conteudo,
        humor,
        sintomas,
        tags,
      });

      res.status(201).json({
        success: true,
        message: 'Entrada do diário criada com sucesso',
        data: diario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/diarios
   * Lista todas as entradas do diário do usuário autenticado
   */
  async listarDoUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));

      const resultado = await diarioModel.listarDoUsuario(usuarioId, pagina, limite);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/diarios/:id
   * Busca uma entrada específica do diário
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const diario = await diarioModel.buscarPorId(id);
      if (!diario) {
        throw new ApiError('Entrada do diário não encontrada', 404);
      }

      // Só o dono ou admin pode acessar
      if (diario.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para acessar esta entrada', 403);
      }

      res.json({ success: true, data: diario });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/diarios/:id
   * Atualiza uma entrada do diário
   */
  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const diario = await diarioModel.buscarPorId(id);
      if (!diario) {
        throw new ApiError('Entrada do diário não encontrada', 404);
      }

      if (diario.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para editar esta entrada', 403);
      }

      const atualizado = await diarioModel.atualizar(id, req.body);

      res.json({
        success: true,
        message: 'Entrada do diário atualizada com sucesso',
        data: atualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/diarios/:id
   * Deleta uma entrada do diário
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const diario = await diarioModel.buscarPorId(id);
      if (!diario) {
        throw new ApiError('Entrada do diário não encontrada', 404);
      }

      if (diario.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para deletar esta entrada', 403);
      }

      await diarioModel.deletar(id);

      res.json({
        success: true,
        message: 'Entrada do diário deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/diarios
   * Lista todas as entradas de todos os usuários (somente admin)
   */
  async listarTodos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));
      const humor = req.query['humor'] as Humor | undefined;

      const validos: Humor[] = ['OTIMO', 'BOM', 'OK', 'MAL', 'PESSIMO'];
      if (humor && !validos.includes(humor)) {
        throw new ApiError('Humor inválido. Use: OTIMO, BOM, OK, MAL ou PESSIMO', 400);
      }

      const resultado = await diarioModel.listarTodos(pagina, limite, humor);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },
};
