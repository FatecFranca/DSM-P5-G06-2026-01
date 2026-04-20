import Joi from 'joi';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ─── Criar registro de hidratação ─────────────────────────────────────────────

export const criarHidratacaoSchema = Joi.object({
  data: Joi.string().pattern(DATA_REGEX).required().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
    'any.required': 'Data é obrigatória',
  }),

  hora: Joi.string().pattern(HORA_REGEX).required().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
    'any.required': 'Hora é obrigatória',
  }),

  quantidade: Joi.number().positive().max(5000).required().messages({
    'number.base': 'Quantidade deve ser um número',
    'number.positive': 'Quantidade deve ser positiva',
    'number.max': 'Quantidade não pode ser maior que 5000 ml',
    'any.required': 'Quantidade é obrigatória',
  }),
});

// ─── Atualizar registro de hidratação ─────────────────────────────────────────

export const atualizarHidratacaoSchema = Joi.object({
  data: Joi.string().pattern(DATA_REGEX).optional().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
  }),

  hora: Joi.string().pattern(HORA_REGEX).optional().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
  }),

  quantidade: Joi.number().positive().max(5000).optional().messages({
    'number.positive': 'Quantidade deve ser positiva',
    'number.max': 'Quantidade não pode ser maior que 5000 ml',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });