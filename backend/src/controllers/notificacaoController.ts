import { Response, NextFunction } from 'express';
import { notificacaoModel } from '../models/notificacaoModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Notificacao Controller ───────────────────────────────────────────────────

export const notificacaoController = {
  /**
   * GET /api/notificacoes
   * Lista notificações do usuário autenticado
   */
  async listarDoUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;

      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));

      const resultado = await notificacaoModel.listarDoUsuario(
        usuarioId,
        pagina,
        limite
      );

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/notificacoes/:id/ler
   * Marca uma notificação como lida
   */
  async marcarComoLida(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const notificacao = await notificacaoModel.buscarPorId(id);
      if (!notificacao) {
        throw new ApiError('Notificação não encontrada', 404);
      }

      if (
        notificacao.usuarioId !== req.usuario?.id &&
        req.usuario?.perfil !== 'ADMIN'
      ) {
        throw new ApiError('Sem permissão para alterar esta notificação', 403);
      }

      const atualizada = await notificacaoModel.marcarComoLida(id);

      res.json({
        success: true,
        message: 'Notificação marcada como lida',
        data: atualizada,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/notificacoes/ler-todas
   * Marca todas as notificações do usuário como lidas
   */
  async marcarTodasComoLidas(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;

      await notificacaoModel.marcarTodasComoLidas(usuarioId);

      res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas',
      });
    } catch (error) {
      next(error);
    }
  },
};