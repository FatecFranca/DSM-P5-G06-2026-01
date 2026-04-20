import Joi from 'joi';

const CATEGORIAS_VALIDAS = ['GLICOSE', 'PESO', 'EXERCICIO', 'AGUA', 'SONO', 'PASSOS'] as const;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const COR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// ─── Criar meta ───────────────────────────────────────────────────────────────

export const criarMetaSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(100).required().messages({
    'string.min': 'Título é obrigatório',
    'string.max': 'Título deve ter no máximo 100 caracteres',
    'any.required': 'Título é obrigatório',
  }),
  descricao: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
  }),
  alvo: Joi.number().positive().required().messages({
    'number.base': 'Alvo deve ser um número',
    'number.positive': 'Alvo deve ser positivo',
    'any.required': 'Alvo é obrigatório',
  }),
  atual: Joi.number().min(0).optional().default(0).messages({
    'number.base': 'Atual deve ser um número',
    'number.min': 'Atual não pode ser negativo',
  }),
  unidade: Joi.string().trim().min(1).max(20).required().messages({
    'string.min': 'Unidade é obrigatória',
    'string.max': 'Unidade deve ter no máximo 20 caracteres',
    'any.required': 'Unidade é obrigatória',
  }),
  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .required()
    .messages({
      'any.only': 'Categoria deve ser: GLICOSE, PESO, EXERCICIO, AGUA, SONO ou PASSOS',
      'any.required': 'Categoria é obrigatória',
    }),
  prazo: Joi.string().pattern(DATA_REGEX).required().messages({
    'string.pattern.base': 'Prazo deve estar no formato YYYY-MM-DD',
    'any.required': 'Prazo é obrigatório',
  }),
  concluida: Joi.boolean().optional().default(false),
  cor: Joi.string().pattern(COR_REGEX).optional().default('#4CAF82').messages({
    'string.pattern.base': 'Cor deve ser um hex válido (ex: #4CAF82)',
  }),
});

// ─── Atualizar meta ───────────────────────────────────────────────────────────

export const atualizarMetaSchema = Joi.object({
  titulo: Joi.string().trim().min(1).max(100).optional().messages({
    'string.max': 'Título deve ter no máximo 100 caracteres',
  }),
  descricao: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Descrição deve ter no máximo 500 caracteres',
  }),
  alvo: Joi.number().positive().optional().messages({
    'number.positive': 'Alvo deve ser positivo',
  }),
  atual: Joi.number().min(0).optional().messages({
    'number.min': 'Atual não pode ser negativo',
  }),
  unidade: Joi.string().trim().min(1).max(20).optional().messages({
    'string.max': 'Unidade deve ter no máximo 20 caracteres',
  }),
  categoria: Joi.string()
    .valid(...CATEGORIAS_VALIDAS)
    .optional()
    .messages({
      'any.only': 'Categoria deve ser: GLICOSE, PESO, EXERCICIO, AGUA, SONO ou PASSOS',
    }),
  prazo: Joi.string().pattern(DATA_REGEX).optional().messages({
    'string.pattern.base': 'Prazo deve estar no formato YYYY-MM-DD',
  }),
  concluida: Joi.boolean().optional(),
  cor: Joi.string().pattern(COR_REGEX).optional().messages({
    'string.pattern.base': 'Cor deve ser um hex válido (ex: #4CAF82)',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });
