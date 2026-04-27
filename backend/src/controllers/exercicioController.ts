import { Response, NextFunction } from 'express';
import { exercicioModel } from '../models/exercicioModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── Exercicio Controller ─────────────────────────────────────────────────────

export const exercicioController = {
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { tipo, duracao, calorias, data, hora, intensidade, notas } = req.body;

      const exercicio = await exercicioModel.criar({
        usuarioId, tipo, duracao, calorias, data, hora, intensidade, notas,
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

  async listarDoUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));
      const dataInicio = req.query['dataInicio'] as string | undefined;
      const dataFim = req.query['dataFim'] as string | undefined;

      const resultado = await exercicioModel.listarDoUsuario(
        usuarioId, pagina, limite, dataInicio, dataFim
      );

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const exercicio = await exercicioModel.buscarPorId(id);
      if (!exercicio) throw new ApiError('Exercício não encontrado', 404);

      if (exercicio.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para alterar este exercício', 403);
      }

      const { tipo, duracao, calorias, data, hora, intensidade, notas } = req.body;
      const atualizado = await exercicioModel.atualizar(id, {
        tipo, duracao, calorias, data, hora, intensidade, notas,
      });

      res.json({ success: true, message: 'Exercício atualizado', data: atualizado });
    } catch (error) {
      next(error);
    }
  },

  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const exercicio = await exercicioModel.buscarPorId(id);
      if (!exercicio) throw new ApiError('Exercício não encontrado', 404);

      if (exercicio.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para deletar este exercício', 403);
      }

      await exercicioModel.deletar(id);
      res.json({ success: true, message: 'Exercício deletado' });
    } catch (error) {
      next(error);
    }
  },

  async listarTodos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(200, Math.max(1, Number(req.query['limite']) || 50));
      const resultado = await exercicioModel.listarTodos(pagina, limite);
      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },
};
