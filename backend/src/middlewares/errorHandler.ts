import { Request, Response, NextFunction } from 'express';
import { Prisma } from '../generated/prisma/client';

// ─── Classe de erro customizado ────────────────────────────────────────────────

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Middleware global de erros ────────────────────────────────────────────────

interface AppError extends Error {
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Prisma: foreign key violation (usuário inválido no token)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
    res.status(401).json({
      success: false,
      message: 'Sessão inválida. Faça login novamente.',
    });
    return;
  }

  // Prisma: registro não encontrado
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Registro não encontrado.',
    });
    return;
  }

  const statusCode = err.statusCode ?? 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Erro interno do servidor'
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
