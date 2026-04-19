import Joi from 'joi';

const HUMORES_VALIDOS = ['OTIMO', 'BOM', 'OK', 'MAL', 'PESSIMO'] as const;

// ─── Criar entrada ────────────────────────────────────────────────────────────

export const criarDiarioSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Título não pode ser vazio',
    'string.max': 'Título deve ter no máximo 100 caracteres',
    'any.required': 'Título é obrigatório',
  }),
  conteudo: Joi.string().trim().min(1).required().messages({
    'string.min': 'Conteúdo não pode ser vazio',
    'any.required': 'Conteúdo é obrigatório',
  }),
  humor: Joi.string()
    .valid(...HUMORES_VALIDOS)
    .required()
    .messages({
      'any.only': 'Humor deve ser: OTIMO, BOM, OK, MAL ou PESSIMO',
      'any.required': 'Humor é obrigatório',
    }),
  sintomas: Joi.array()
    .items(Joi.string().trim().max(50))
    .default([])
    .optional(),
  tags: Joi.array()
    .items(Joi.string().trim().max(30))
    .default([])
    .optional(),
});

// ─── Atualizar entrada ────────────────────────────────────────────────────────

export const atualizarDiarioSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(100).optional().messages({
    'string.min': 'Título não pode ser vazio',
    'string.max': 'Título deve ter no máximo 100 caracteres',
  }),
  conteudo: Joi.string().trim().min(1).optional().messages({
    'string.min': 'Conteúdo não pode ser vazio',
  }),
  humor: Joi.string()
    .valid(...HUMORES_VALIDOS)
    .optional()
    .messages({
      'any.only': 'Humor deve ser: OTIMO, BOM, OK, MAL ou PESSIMO',
    }),
  sintomas: Joi.array().items(Joi.string().trim().max(50)).optional(),
  tags: Joi.array().items(Joi.string().trim().max(30)).optional(),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });
