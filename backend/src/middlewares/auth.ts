import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { JwtPayload } from '../types';

// ─── Request autenticado ───────────────────────────────────────────────────────

export interface AuthRequest extends Request {
  usuario?: JwtPayload;
}

// ─── Middleware de autenticação ────────────────────────────────────────────────

export const autenticar = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new ApiError('Token de autenticação não fornecido', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    req.usuario = decoded;
    next();
  } catch {
    next(new ApiError('Token inválido ou expirado', 401));
  }
};

// ─── Middleware de autorização (Admin) ────────────────────────────────────────

export const autorizarAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (req.usuario?.perfil !== 'ADMIN') {
    return next(new ApiError('Acesso negado. Apenas administradores.', 403));
  }
  next();
};
