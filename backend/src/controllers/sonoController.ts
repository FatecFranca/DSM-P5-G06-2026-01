import { Response, NextFunction } from 'express';
import { sonoModel } from '../models/sonoModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { QualidadeSono } from '../types';

// ─── Sono Controller ──────────────────────────────────────────────────────────

export const sonoController = {
  /**
   * POST /api/sono
   * Registra um novo período de sono para o usuário autenticado
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { data, horaDeitar, horaAcordar, duracao, qualidade, notas } = req.body;

      const sono = await sonoModel.criar({
        usuarioId,
        data,
        horaDeitar,
        horaAcordar,
        duracao,
        qualidade,
        notas,
      });

      res.status(201).json({
        success: true,
        message: 'Registro de sono criado com sucesso',
        data: sono,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sono
   * Lista os registros de sono do usuário autenticado (paginado, com filtro por período)
   */
  async listarDoUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));
      const dataInicio = req.query['dataInicio'] as string | undefined;
      const dataFim = req.query['dataFim'] as string | undefined;

      const resultado = await sonoModel.listarDoUsuario(
        usuarioId,
        pagina,
        limite,
        dataInicio,
        dataFim,
      );

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sono/estatisticas
   * Retorna métricas de sono (média, distribuição de qualidade) do usuário
   */
  async estatisticas(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const stats = await sonoModel.estatisticasDoUsuario(usuarioId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sono/:id
   * Busca um registro específico de sono
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const sono = await sonoModel.buscarPorId(id);
      if (!sono) {
        throw new ApiError('Registro de sono não encontrado', 404);
      }

      if (sono.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para acessar este registro', 403);
      }

      res.json({ success: true, data: sono });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/sono/:id
   * Atualiza um registro de sono
   */
  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const sono = await sonoModel.buscarPorId(id);
      if (!sono) {
        throw new ApiError('Registro de sono não encontrado', 404);
      }

      if (sono.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para editar este registro', 403);
      }

      const atualizado = await sonoModel.atualizar(id, req.body);

      res.json({
        success: true,
        message: 'Registro de sono atualizado com sucesso',
        data: atualizado,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/sono/:id
   * Deleta um registro de sono
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const sono = await sonoModel.buscarPorId(id);
      if (!sono) {
        throw new ApiError('Registro de sono não encontrado', 404);
      }

      if (sono.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para deletar este registro', 403);
      }

      await sonoModel.deletar(id);

      res.json({
        success: true,
        message: 'Registro de sono deletado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/sono
   * Lista todos os registros de sono de todos os usuários (somente admin)
   */
  async listarTodos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 20));
      const qualidade = req.query['qualidade'] as QualidadeSono | undefined;

      const validas: QualidadeSono[] = ['PESSIMA', 'RUIM', 'BOA', 'EXCELENTE'];
      if (qualidade && !validas.includes(qualidade)) {
        throw new ApiError('Qualidade inválida. Use: PESSIMA, RUIM, BOA ou EXCELENTE', 400);
      }

      const resultado = await sonoModel.listarTodos(pagina, limite, qualidade);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },
};
