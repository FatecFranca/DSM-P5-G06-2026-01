import Joi from 'joi';

const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const TIPOS_VALIDOS = ['INSULINA', 'ORAL', 'SUPLEMENTO', 'OUTRO'];

// ─── Criar medicação ──────────────────────────────────────────────────────────

export const criarMedicacaoSchema = Joi.object({
  nome: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'string.max': 'Nome pode ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório',
  }),

  dosagem: Joi.string().min(1).max(50).required().messages({
    'any.required': 'Dosagem é obrigatória',
  }),

  frequencia: Joi.string().min(1).max(100).required().messages({
    'any.required': 'Frequência é obrigatória',
  }),

  horarios: Joi.array()
    .items(Joi.string().pattern(HORA_REGEX).messages({
      'string.pattern.base': 'Cada horário deve estar no formato HH:MM',
    }))
    .min(1)
    .required()
    .messages({
      'array.min': 'Informe pelo menos um horário',
      'any.required': 'Horários são obrigatórios',
    }),

  tipo: Joi.string().valid(...TIPOS_VALIDOS).required().messages({
    'any.only': `Tipo deve ser um de: ${TIPOS_VALIDOS.join(', ')}`,
    'any.required': 'Tipo é obrigatório',
  }),

  notas: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Notas podem ter no máximo 500 caracteres',
  }),

  cor: Joi.string().max(20).optional().messages({
    'string.max': 'Cor pode ter no máximo 20 caracteres',
  }),
});

// ─── Atualizar medicação ──────────────────────────────────────────────────────

export const atualizarMedicacaoSchema = Joi.object({
  nome: Joi.string().min(1).max(100).optional(),
  dosagem: Joi.string().min(1).max(50).optional(),
  frequencia: Joi.string().min(1).max(100).optional(),
  horarios: Joi.array()
    .items(Joi.string().pattern(HORA_REGEX))
    .min(1)
    .optional(),
  tipo: Joi.string().valid(...TIPOS_VALIDOS).optional(),
  notas: Joi.string().max(500).optional().allow(''),
  cor: Joi.string().max(20).optional(),
  tomado: Joi.boolean().optional(),
  ultimaTomada: Joi.string().optional().allow(null, ''),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });
