import { Response, NextFunction } from 'express';
import { glicoseModel } from '../models/glicoseModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { ContextoGlicose, StatusGlicose } from '../types';

// ─── Função auxiliar ──────────────────────────────────────────────────────────

function calcularStatus(valor: number): StatusGlicose {
  if (valor < 70) return 'BAIXO';
  if (valor <= 180) return 'NORMAL';
  if (valor <= 250) return 'ALTO';
  return 'MUITO_ALTO';
}

// ─── Glicose Controller ───────────────────────────────────────────────────────

export const glicoseController = {
  /**
   * POST /api/glicose
   * Registrar leitura
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { valor, contexto, data, hora, notas } = req.body;

      const status = calcularStatus(valor);

      const glicose = await glicoseModel.criar({
        usuarioId,
        valor,
        contexto,
        data,
        hora,
        status,
        notas,
      });

      res.status(201).json({
        success: true,
        message: 'Leitura de glicose registrada com sucesso',
        data: glicose,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/glicose
   * Listar leituras do usuário
   */
  async listarDoUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));
      const dataInicio = req.query['dataInicio'] as string | undefined;
      const dataFim = req.query['dataFim'] as string | undefined;

      const resultado = await glicoseModel.listarDoUsuario(
        usuarioId,
        pagina,
        limite,
        dataInicio,
        dataFim
      );

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/glicose/:id
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const glicose = await glicoseModel.buscarPorId(id);
      if (!glicose) {
        throw new ApiError('Leitura não encontrada', 404);
      }

      if (glicose.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para deletar', 403);
      }

      await glicoseModel.deletar(id);

      res.json({
        success: true,
        message: 'Leitura removida com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/glicose/estatisticas
   */
  async estatisticas(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const dataInicio = req.query['dataInicio'] as string | undefined;
      const dataFim = req.query['dataFim'] as string | undefined;

      const stats = await glicoseModel.estatisticas(usuarioId, dataInicio, dataFim);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/glicose/tendencia
   */
  async tendencia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const dataInicio = req.query['dataInicio'] as string | undefined;
      const dataFim = req.query['dataFim'] as string | undefined;

      const dados = await glicoseModel.tendencia(usuarioId, dataInicio, dataFim);

      res.json({
        success: true,
        data: dados,
      });
    } catch (error) {
      next(error);
    }
  },
};