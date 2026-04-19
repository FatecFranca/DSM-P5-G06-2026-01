import Joi from 'joi';

const QUALIDADES_VALIDAS = ['PESSIMA', 'RUIM', 'BOA', 'EXCELENTE'] as const;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ─── Criar registro de sono ───────────────────────────────────────────────────

export const criarSonoSchema = Joi.object({
  data: Joi.string().pattern(DATA_REGEX).required().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
    'any.required': 'Data é obrigatória',
  }),
  horaDeitar: Joi.string().pattern(HORA_REGEX).required().messages({
    'string.pattern.base': 'Hora de deitar deve estar no formato HH:MM',
    'any.required': 'Hora de deitar é obrigatória',
  }),
  horaAcordar: Joi.string().pattern(HORA_REGEX).required().messages({
    'string.pattern.base': 'Hora de acordar deve estar no formato HH:MM',
    'any.required': 'Hora de acordar é obrigatória',
  }),
  duracao: Joi.number().positive().max(24).required().messages({
    'number.base': 'Duração deve ser um número',
    'number.positive': 'Duração deve ser positiva',
    'number.max': 'Duração não pode ser maior que 24 horas',
    'any.required': 'Duração é obrigatória',
  }),
  qualidade: Joi.string()
    .valid(...QUALIDADES_VALIDAS)
    .required()
    .messages({
      'any.only': 'Qualidade deve ser: PESSIMA, RUIM, BOA ou EXCELENTE',
      'any.required': 'Qualidade é obrigatória',
    }),
  notas: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres',
  }),
});

// ─── Atualizar registro de sono ───────────────────────────────────────────────

export const atualizarSonoSchema = Joi.object({
  data: Joi.string().pattern(DATA_REGEX).optional().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
  }),
  horaDeitar: Joi.string().pattern(HORA_REGEX).optional().messages({
    'string.pattern.base': 'Hora de deitar deve estar no formato HH:MM',
  }),
  horaAcordar: Joi.string().pattern(HORA_REGEX).optional().messages({
    'string.pattern.base': 'Hora de acordar deve estar no formato HH:MM',
  }),
  duracao: Joi.number().positive().max(24).optional().messages({
    'number.positive': 'Duração deve ser positiva',
    'number.max': 'Duração não pode ser maior que 24 horas',
  }),
  qualidade: Joi.string()
    .valid(...QUALIDADES_VALIDAS)
    .optional()
    .messages({
      'any.only': 'Qualidade deve ser: PESSIMA, RUIM, BOA ou EXCELENTE',
    }),
  notas: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });
