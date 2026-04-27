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

  /**
   * GET /api/admin/notificacoes
   * Lista todas as notificações de todos os usuários (admin)
   */
  async listarTodas(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(200, Math.max(1, Number(req.query['limite']) || 50));
      const tipo = req.query['tipo'] as string | undefined;
      const lida =
        req.query['lida'] === 'true' ? true :
        req.query['lida'] === 'false' ? false :
        undefined;

      const resultado = await notificacaoModel.listarTodas(pagina, limite, tipo, lida);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/admin/notificacoes
   * Admin cria notificação para um usuário específico ou para todos
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { usuarioId, todos, titulo, mensagem, tipo, data, hora } = req.body as {
        usuarioId?: string;
        todos?: boolean;
        titulo: string;
        mensagem: string;
        tipo: string;
        data: string;
        hora: string;
      };

      if (todos) {
        const criadas = await notificacaoModel.criarParaTodos({ titulo, mensagem, tipo, data, hora });
        return res.status(201).json({
          success: true,
          message: `${criadas.length} notificação(ões) enviada(s) para todos os usuários`,
          data: criadas,
        });
      }

      if (!usuarioId) {
        throw new ApiError('usuarioId é obrigatório quando "todos" não for verdadeiro', 400);
      }

      const notificacao = await notificacaoModel.criar({ usuarioId, titulo, mensagem, tipo, data, hora });

      return res.status(201).json({
        success: true,
        message: 'Notificação criada com sucesso',
        data: notificacao,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/admin/notificacoes/:id
   * Admin deleta uma notificação
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const notificacao = await notificacaoModel.buscarPorId(id);
      if (!notificacao) {
        throw new ApiError('Notificação não encontrada', 404);
      }

      await notificacaoModel.deletar(id);

      res.json({ success: true, message: 'Notificação deletada com sucesso' });
    } catch (error) {
      next(error);
    }
  },
};