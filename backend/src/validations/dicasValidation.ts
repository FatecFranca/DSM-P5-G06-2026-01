import Joi from "joi";

const CATEGORIAS_VALIDAS = ['EXERCICIO', 'ALIMENTACAO', 'EMERGENCIA', 'BEM_ESTAR'] as const;

// ─── Criar dica ───────────────────────────────────────────────────────────────

export const criarDicaSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(100).required().messages({
    "string.min": "Título não pode ser vazio",
    "string.max": "Título deve ter no máximo 100 caracteres",
    "any.required": "Título é obrigatório",
  }),

  sumario: Joi.string().trim().min(1).required().messages({
    "string.min": "Sumário não pode ser vazio",
    "any.required": "Sumário é obrigatório",
  }),

  conteudo: Joi.string().trim().min(1).required().messages({
    "string.min": "Conteúdo não pode ser vazio",
    "any.required": "Conteúdo é obrigatório",
  }),

  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .required()
    .messages({
      "any.only": "Categoria inválida",
      "any.required": "Categoria é obrigatória",
    }),

  tempoLeitura: Joi.number().integer().min(1).required().messages({
    "number.base": "Tempo de leitura deve ser um número",
    "number.min": "Tempo de leitura deve ser no mínimo 1 minuto",
    "any.required": "Tempo de leitura é obrigatório",
  }),

  destaque: Joi.boolean().optional().default(false),
});

// ─── Atualizar dica ───────────────────────────────────────────────────────────

export const atualizarDicaSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(100).optional().messages({
    "string.min": "Título não pode ser vazio",
    "string.max": "Título deve ter no máximo 100 caracteres",
  }),

  sumario: Joi.string().trim().min(1).optional().messages({
    "string.min": "Sumário não pode ser vazio",
  }),

  conteudo: Joi.string().trim().min(1).optional().messages({
    "string.min": "Conteúdo não pode ser vazio",
  }),

  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .optional()
    .messages({
      "any.only": "Categoria inválida",
    }),

  tempoLeitura: Joi.number().integer().min(1).max(60).optional().messages({
    "number.base": "Tempo de leitura deve ser um número",
    "number.min": "Tempo de leitura deve ser no mínimo 1 minuto",
    "number.max": "Tempo de leitura deve ser no máximo 60 minutos",
  }),

  destaque: Joi.boolean().optional(),
})
  .min(1)
  .messages({
    "object.min": "Pelo menos um campo deve ser enviado para atualização",
  });
