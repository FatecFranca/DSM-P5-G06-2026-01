import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel';
import { ApiError } from '../middlewares/errorHandler';

// ─── Auth Controller ───────────────────────────────────────────────────────────

export const authController = {
  /**
   * POST /api/auth/registrar
   * Cria uma nova conta de usuário
   */
  async registrar(req: Request, res: Response, next: NextFunction) {
    try {
      const { nome, email, senha } = req.body;

      const existente = await userModel.buscarPorEmail(email);
      if (existente) {
        throw new ApiError('E-mail já cadastrado', 409);
      }

      const usuario = await userModel.criar({ nome, email, senha });

      const token = gerarToken(
        usuario.id,
        usuario.email,
        usuario.perfil as string
      );

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: { usuario, token },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Autentica o usuário e retorna um JWT
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, senha } = req.body;

      const usuario = await userModel.buscarPorEmail(email);
      if (!usuario) {
        throw new ApiError('E-mail ou senha inválidos', 401);
      }

      const senhaValida = await userModel.verificarSenha(senha, usuario.senha);
      if (!senhaValida) {
        throw new ApiError('E-mail ou senha inválidos', 401);
      }

      if (usuario.status === 'INATIVO') {
        throw new ApiError('Conta inativa. Entre em contato com o suporte.', 403);
      }

      const { senha: _senha, ...usuarioSemSenha } = usuario;

      const token = gerarToken(usuario.id, usuario.email, usuario.perfil);

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: { usuario: usuarioSemSenha, token },
      });
    } catch (error) {
      next(error);
    }
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────

function gerarToken(id: string, email: string, perfil: string) {
  return jwt.sign(
    { id, email, perfil },
    process.env.JWT_SECRET as string,
    { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
  );
}
