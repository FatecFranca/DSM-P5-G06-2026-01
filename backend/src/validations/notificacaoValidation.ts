import Joi from 'joi';

const TIPOS_VALIDOS = [
  'GLICOSE',
  'REFEICAO',
  'MEDICAMENTO',
  'CONSULTA',
  'DICA',
  'META',
] as const;

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// ─── Criar notificação ────────────────────────────────────────────────────────

export const criarNotificacaoSchema = Joi.object({
  titulo: Joi.string().trim().max(150).required().messages({
    'string.empty': 'Título é obrigatório',
    'string.max': 'Título deve ter no máximo 150 caracteres',
    'any.required': 'Título é obrigatório',
  }),

  mensagem: Joi.string().trim().max(500).required().messages({
    'string.empty': 'Mensagem é obrigatória',
    'string.max': 'Mensagem deve ter no máximo 500 caracteres',
    'any.required': 'Mensagem é obrigatória',
  }),

  tipo: Joi.string()
    .valid(...TIPOS_VALIDOS)
    .required()
    .messages({
      'any.only': 'Tipo deve ser: GLICOSE, REFEICAO, MEDICAMENTO, CONSULTA, DICA ou META',
      'any.required': 'Tipo é obrigatório',
    }),

  data: Joi.string().pattern(DATA_REGEX).required().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
    'any.required': 'Data é obrigatória',
  }),

  hora: Joi.string().pattern(HORA_REGEX).required().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
    'any.required': 'Hora é obrigatória',
  }),
});

// ─── Atualizar notificação ────────────────────────────────────────────────────

export const atualizarNotificacaoSchema = Joi.object({
  titulo: Joi.string().trim().max(150).optional().messages({
    'string.max': 'Título deve ter no máximo 150 caracteres',
  }),

  mensagem: Joi.string().trim().max(500).optional().messages({
    'string.max': 'Mensagem deve ter no máximo 500 caracteres',
  }),

  tipo: Joi.string()
    .valid(...TIPOS_VALIDOS)
    .optional()
    .messages({
      'any.only': 'Tipo deve ser: GLICOSE, REFEICAO, MEDICAMENTO, CONSULTA, DICA ou META',
    }),

  data: Joi.string().pattern(DATA_REGEX).optional().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
  }),

  hora: Joi.string().pattern(HORA_REGEX).optional().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
  }),

  lida: Joi.boolean().optional().messages({
    'boolean.base': 'Campo lida deve ser verdadeiro ou falso',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });