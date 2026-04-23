import { Response, NextFunction } from 'express';
import { medicacaoModel } from '../models/medicacaoModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { TipoMedicacao } from '../types';

// ─── Medicação Controller ──────────────────────────────────────────────────────

export const medicacaoController = {
  /**
   * POST /api/medicacao
   * Criar uma medicação do usuário autenticado
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { nome, dosagem, frequencia, horarios, tipo, notas, cor } = req.body;

      const registro = await medicacaoModel.criar({
        usuarioId, nome, dosagem, frequencia, horarios,
        tipo: tipo as TipoMedicacao,
        notas, cor,
      });

      res.status(201).json({
        success: true,
        message: 'Medicação criada com sucesso',
        data: registro,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/medicacao
   * Listar medicações do usuário autenticado
   */
  async listar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));
      const tipo = req.query['tipo'] as TipoMedicacao | undefined;

      const resultado = await medicacaoModel.listarDoUsuario(usuarioId, pagina, limite, tipo);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/medicacao/:id
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const registro = await medicacaoModel.buscarPorId(id);

      if (!registro) throw new ApiError('Medicação não encontrada', 404);

      if (registro.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para acessar esta medicação', 403);
      }

      res.json({ success: true, data: registro });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/medicacao/:id
   */
  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const registro = await medicacaoModel.buscarPorId(id);

      if (!registro) throw new ApiError('Medicação não encontrada', 404);

      if (registro.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para atualizar esta medicação', 403);
      }

      const { nome, dosagem, frequencia, horarios, tipo, notas, cor, tomado, ultimaTomada } = req.body;
      const updated = await medicacaoModel.atualizar(id, {
        nome, dosagem, frequencia, horarios,
        tipo: tipo as TipoMedicacao | undefined,
        notas, cor, tomado, ultimaTomada,
      });

      res.json({
        success: true,
        message: 'Medicação atualizada com sucesso',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/medicacao/:id
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const registro = await medicacaoModel.buscarPorId(id);

      if (!registro) throw new ApiError('Medicação não encontrada', 404);

      if (registro.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para deletar esta medicação', 403);
      }

      await medicacaoModel.deletar(id);

      res.json({ success: true, message: 'Medicação deletada com sucesso' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /admin/medicacao — todos os registros (admin)
   */
  async listarTodos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(200, Math.max(1, Number(req.query['limite']) || 50));
      const tipo = req.query['tipo'] as TipoMedicacao | undefined;

      const resultado = await medicacaoModel.listarTodos(pagina, limite, tipo);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },
};
