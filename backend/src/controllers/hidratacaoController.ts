import { Response, NextFunction } from 'express';
import { hidratacaoModel } from '../models/hidratacaoModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Hidratação Controller ─────────────────────────────────────────────────────

export const hidratacaoController = {
  /**
   * POST /api/hidratacao
   * Registrar consumo de água
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { data, hora, quantidade } = req.body;

      const registro = await hidratacaoModel.criar({
        usuarioId,
        data,
        hora,
        quantidade,
      });

      res.status(201).json({
        success: true,
        message: 'Registro de hidratação criado com sucesso',
        data: registro,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/hidratacao
   * Listar registros do usuário (com filtro por data)
   */
  async listar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;

      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));

      const dataInicio = req.query['dataInicio'] as string | undefined;
      const dataFim = req.query['dataFim'] as string | undefined;

      const resultado = await hidratacaoModel.listarDoUsuario(
        usuarioId,
        pagina,
        limite,
        dataInicio,
        dataFim,
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
   * GET /api/hidratacao/hoje
   * Total consumido hoje (agregado)
   */
  async totalHoje(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;

      const hoje = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const total = await hidratacaoModel.totalDoDia(usuarioId, hoje);

      res.json({
        success: true,
        data: total,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/hidratacao/:id
   * (opcional, mas útil pra consistência)
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const registro = await hidratacaoModel.buscarPorId(id);

      if (!registro) {
        throw new ApiError('Registro de hidratação não encontrado', 404);
      }

      if (
        registro.usuarioId !== req.usuario?.id &&
        req.usuario?.perfil !== 'ADMIN'
      ) {
        throw new ApiError('Sem permissão para acessar este registro', 403);
      }

      res.json({
        success: true,
        data: registro,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/hidratacao/:id
   * (opcional, mas geralmente necessário)
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const registro = await hidratacaoModel.buscarPorId(id);

      if (!registro) {
        throw new ApiError('Registro de hidratação não encontrado', 404);
      }

      if (
        registro.usuarioId !== req.usuario?.id &&
        req.usuario?.perfil !== 'ADMIN'
      ) {
        throw new ApiError('Sem permissão para deletar este registro', 403);
      }

      await hidratacaoModel.deletar(id);

      res.json({
        success: true,
        message: 'Registro de hidratação deletado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },
};