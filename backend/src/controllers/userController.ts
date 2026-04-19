import { Response, NextFunction } from 'express';
import { userModel } from '../models/userModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

// ─── User Controller ───────────────────────────────────────────────────────────

export const userController = {
  /**
   * GET /api/usuarios/:id
   * Retorna o perfil de um usuário
   */
  async buscarPerfil(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      // Só o próprio usuário ou um admin pode ver o perfil
      if (req.usuario?.id !== id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para acessar este perfil', 403);
      }

      const usuario = await userModel.buscarPorId(id);
      if (!usuario) {
        throw new ApiError('Usuário não encontrado', 404);
      }

      res.json({ success: true, data: usuario });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/usuarios/:id
   * Atualiza o perfil do usuário
   */
  async atualizarPerfil(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      if (req.usuario?.id !== id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para editar este perfil', 403);
      }

      const existente = await userModel.buscarPorId(id);
      if (!existente) {
        throw new ApiError('Usuário não encontrado', 404);
      }

      const dados = { ...req.body };

      // Converte string ISO para Date
      if (dados.ultimaConsulta) {
        dados.ultimaConsulta = new Date(dados.ultimaConsulta);
      }

      const usuario = await userModel.atualizar(id, dados);

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: usuario,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/usuarios
   * Lista todos os usuários (somente admin)
   */
  async listarUsuarios(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query.pagina) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query.limite) || 20));

      const resultado = await userModel.listarTodos(pagina, limite);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },
};
