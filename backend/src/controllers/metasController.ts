import { Response, NextFunction } from 'express';
import { metasModel } from '../models/metasModel';
import { ApiError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { CategoriaMeta } from '../types';

// ─── Metas Controller ─────────────────────────────────────────────────────────

export const metasController = {
  /**
   * POST /api/metas
   * Cria uma nova meta para o usuário autenticado
   */
  async criar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const { titulo, descricao, alvo, atual, unidade, categoria, prazo, concluida, cor } = req.body;

      const meta = await metasModel.criar({
        usuarioId,
        titulo,
        descricao,
        alvo,
        atual,
        unidade,
        categoria,
        prazo,
        concluida,
        cor,
      });

      res.status(201).json({
        success: true,
        message: 'Meta criada com sucesso',
        data: meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/metas
   * Lista as metas do usuário autenticado
   */
  async listarDoUsuario(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const usuarioId = req.usuario!.id;
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 50));
      const categoria = req.query['categoria'] as CategoriaMeta | undefined;
      const concluidaRaw = req.query['concluida'] as string | undefined;

      const categoriasValidas: CategoriaMeta[] = ['GLICOSE', 'PESO', 'EXERCICIO', 'AGUA', 'SONO', 'PASSOS'];
      if (categoria && !categoriasValidas.includes(categoria)) {
        throw new ApiError('Categoria inválida', 400);
      }

      const concluida =
        concluidaRaw === 'true' ? true : concluidaRaw === 'false' ? false : undefined;

      const resultado = await metasModel.listarDoUsuario(usuarioId, pagina, limite, categoria, concluida);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/metas/:id
   * Busca uma meta por ID
   */
  async buscarPorId(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const meta = await metasModel.buscarPorId(id);
      if (!meta) {
        throw new ApiError('Meta não encontrada', 404);
      }

      if (meta.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para acessar esta meta', 403);
      }

      res.json({ success: true, data: meta });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/metas/:id
   * Atualiza uma meta (inclusive progresso atual)
   */
  async atualizar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const meta = await metasModel.buscarPorId(id);
      if (!meta) {
        throw new ApiError('Meta não encontrada', 404);
      }

      if (meta.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para editar esta meta', 403);
      }

      const atualizada = await metasModel.atualizar(id, req.body);

      res.json({
        success: true,
        message: 'Meta atualizada com sucesso',
        data: atualizada,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/metas/:id
   * Remove uma meta
   */
  async deletar(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const meta = await metasModel.buscarPorId(id);
      if (!meta) {
        throw new ApiError('Meta não encontrada', 404);
      }

      if (meta.usuarioId !== req.usuario?.id && req.usuario?.perfil !== 'ADMIN') {
        throw new ApiError('Sem permissão para deletar esta meta', 403);
      }

      await metasModel.deletar(id);

      res.json({
        success: true,
        message: 'Meta deletada com sucesso',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/metas
   * Lista todas as metas de todos os usuários (somente admin)
   */
  async listarTodos(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pagina = Math.max(1, Number(req.query['pagina']) || 1);
      const limite = Math.min(100, Math.max(1, Number(req.query['limite']) || 50));
      const categoria = req.query['categoria'] as CategoriaMeta | undefined;
      const concluidaRaw = req.query['concluida'] as string | undefined;

      const categoriasValidas: CategoriaMeta[] = ['GLICOSE', 'PESO', 'EXERCICIO', 'AGUA', 'SONO', 'PASSOS'];
      if (categoria && !categoriasValidas.includes(categoria)) {
        throw new ApiError('Categoria inválida', 400);
      }

      const concluida =
        concluidaRaw === 'true' ? true : concluidaRaw === 'false' ? false : undefined;

      const resultado = await metasModel.listarTodos(pagina, limite, categoria, concluida);

      res.json({ success: true, data: resultado });
    } catch (error) {
      next(error);
    }
  },
};
