import Joi from 'joi';

const CONTEXTOS_VALIDOS = [
  'JEJUM',
  'PRE_REFEICAO',
  'POS_REFEICAO',
  'ANTES_DORMIR',
  'ALEATORIA',
] as const;

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

// ─── Criar leitura de glicose ────────────────────────────────────────────────

export const criarGlicoseSchema = Joi.object({
  valor: Joi.number().integer().min(1).max(1000).required().messages({
    'number.base': 'Valor deve ser um número',
    'number.integer': 'Valor deve ser inteiro',
    'number.min': 'Valor deve ser maior que 0',
    'number.max': 'Valor muito alto (máx. 1000 mg/dL)',
    'any.required': 'Valor é obrigatório',
  }),

  contexto: Joi.string()
    .valid(...CONTEXTOS_VALIDOS)
    .required()
    .messages({
      'any.only':
        'Contexto deve ser: JEJUM, PRE_REFEICAO, POS_REFEICAO, ANTES_DORMIR ou ALEATORIA',
      'any.required': 'Contexto é obrigatório',
    }),

  data: Joi.string().pattern(DATA_REGEX).required().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
    'any.required': 'Data é obrigatória',
  }),

  hora: Joi.string().pattern(HORA_REGEX).required().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
    'any.required': 'Hora é obrigatória',
  }),

  notas: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres',
  }),
});

// ─── Atualizar leitura de glicose ────────────────────────────────────────────

export const atualizarGlicoseSchema = Joi.object({
  valor: Joi.number().integer().min(1).max(1000).optional().messages({
    'number.integer': 'Valor deve ser inteiro',
    'number.min': 'Valor deve ser maior que 0',
    'number.max': 'Valor muito alto (máx. 1000 mg/dL)',
  }),

  contexto: Joi.string()
    .valid(...CONTEXTOS_VALIDOS)
    .optional()
    .messages({
      'any.only':
        'Contexto deve ser: JEJUM, PRE_REFEICAO, POS_REFEICAO, ANTES_DORMIR ou ALEATORIA',
    }),

  data: Joi.string().pattern(DATA_REGEX).optional().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
  }),

  hora: Joi.string().pattern(HORA_REGEX).optional().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
  }),

  notas: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Notas devem ter no máximo 500 caracteres',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });