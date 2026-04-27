import Joi from 'joi';

const INTENSIDADES_VALIDAS = ['BAIXA', 'MEDIA', 'ALTA'] as const;

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ─── Criar exercício ──────────────────────────────────────────────────────────

export const criarExercicioSchema = Joi.object({
  tipo: Joi.string().trim().max(100).required().messages({
    'string.empty': 'Tipo de exercício é obrigatório',
    'string.max': 'Tipo deve ter no máximo 100 caracteres',
    'any.required': 'Tipo é obrigatório',
  }),

  duracao: Joi.number().positive().max(1440).required().messages({
    'number.base': 'Duração deve ser um número',
    'number.positive': 'Duração deve ser positiva',
    'number.max': 'Duração não pode ser maior que 1440 minutos',
    'any.required': 'Duração é obrigatória',
  }),

  calorias: Joi.number().min(0).required().messages({
    'number.base': 'Calorias devem ser um número',
    'number.min': 'Calorias não podem ser negativas',
    'any.required': 'Calorias são obrigatórias',
  }),

  data: Joi.string().pattern(DATA_REGEX).required().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
    'any.required': 'Data é obrigatória',
  }),

  hora: Joi.string().pattern(HORA_REGEX).required().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
    'any.required': 'Hora é obrigatória',
  }),

  intensidade: Joi.string()
    .valid(...INTENSIDADES_VALIDAS)
    .required()
    .messages({
      'any.only': 'Intensidade deve ser: BAIXA, MEDIA ou ALTA',
      'any.required': 'Intensidade é obrigatória',
    }),

  notas: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres',
  }),
});

// ─── Atualizar exercício ──────────────────────────────────────────────────────

export const atualizarExercicioSchema = Joi.object({
  tipo: Joi.string().trim().max(100).optional().messages({
    'string.max': 'Tipo deve ter no máximo 100 caracteres',
  }),

  duracao: Joi.number().positive().max(1440).optional().messages({
    'number.positive': 'Duração deve ser positiva',
    'number.max': 'Duração não pode ser maior que 1440 minutos',
  }),

  calorias: Joi.number().min(0).optional().messages({
    'number.min': 'Calorias não podem ser negativas',
  }),

  data: Joi.string().pattern(DATA_REGEX).optional().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
  }),

  hora: Joi.string().pattern(HORA_REGEX).optional().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
  }),

  intensidade: Joi.string()
    .valid(...INTENSIDADES_VALIDAS)
    .optional()
    .messages({
      'any.only': 'Intensidade deve ser: BAIXA, MEDIA ou ALTA',
    }),

  notas: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });