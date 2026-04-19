import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const mensagens = error.details.map((d) => d.message);
      res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        erros: mensagens,
      });
      return;
    }

    req.body = value;
    next();
  };
};
