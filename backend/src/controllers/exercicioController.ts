import { Response, NextFunction } from 'express';
import { exercicioModel } from '../models/exercicioModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Exercicio Controller ─────────────────────────────────────────────────────

export const exercicioController = {
  /**
   * POST /api/exercicios
   * Registrar atividade
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;

      const {
        tipo,
        duracao,
        calorias,
        data,
        hora,
        intensidade,
        notas,
      } = req.body;

      const exercicio = await exercicioModel.criar({
        usuarioId,
        tipo,
        duracao,
        calorias,
        data,
        hora,
        intensidade,
        notas,
      });

      res.status(201).json({
        success: true,
        message: 'Exercício registrado com sucesso',
        data: exercicio,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/exercicios
   * Listar atividades do usuário (com filtro por período)
   */
  async listarDoUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;

      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));

      const dataInicio = req.query['dataInicio'] as string | undefined;
      const dataFim = req.query['dataFim'] as string | undefined;

      const resultado = await exercicioModel.listarDoUsuario(
        usuarioId,
        pagina,
        limite,
        dataInicio,
        dataFim
      );

      res.json({
        success: true,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  },
};