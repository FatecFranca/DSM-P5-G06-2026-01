import Joi from 'joi';

// ─── Registro ─────────────────────────────────────────────────────────────────

export const registroSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(100).required().messages({
    'string.base': 'Nome deve ser um texto',
    'string.min': 'Nome deve ter no mínimo 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'E-mail inválido',
    'any.required': 'E-mail é obrigatório',
  }),
  senha: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter no mínimo 6 caracteres',
    'any.required': 'Senha é obrigatória',
  }),
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'E-mail inválido',
    'any.required': 'E-mail é obrigatório',
  }),
  senha: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória',
  }),
});

// ─── Atualizar perfil ─────────────────────────────────────────────────────────

export const atualizarPerfilSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(100).optional().messages({
    'string.min': 'Nome deve ter no mínimo 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
  }),
  idade: Joi.number().integer().min(1).max(120).optional().messages({
    'number.min': 'Idade deve ser maior que 0',
    'number.max': 'Idade deve ser menor que 120',
  }),
  peso: Joi.number().min(1).max(500).optional().messages({
    'number.min': 'Peso inválido',
  }),
  altura: Joi.number().min(50).max(250).optional().messages({
    'number.min': 'Altura mínima é 50 cm',
    'number.max': 'Altura máxima é 250 cm',
  }),
  tipoDiabetes: Joi.string()
    .valid('NENHUM', 'TIPO1', 'TIPO2', 'GESTACIONAL', 'PRE_DIABETES')
    .optional()
    .messages({
      'any.only': 'Tipo de diabetes inválido. Use: NENHUM, TIPO1, TIPO2, GESTACIONAL ou PRE_DIABETES',
    }),
  glicoseAlvoMin: Joi.number().min(50).max(500).optional().messages({
    'number.min': 'Glicose mínima inválida',
    'number.max': 'Glicose mínima inválida',
  }),
  glicoseAlvoMax: Joi.number().min(50).max(500).optional().messages({
    'number.min': 'Glicose máxima inválida',
    'number.max': 'Glicose máxima inválida',
  }),
  nomeMedico: Joi.string().trim().max(100).allow('', null).optional(),
  ultimaConsulta: Joi.string().isoDate().allow('', null).optional().messages({
    'string.isoDate': 'Data da última consulta deve estar no formato ISO (YYYY-MM-DD)',
  }),
})
  .min(1)
  .messages({
    'object.min': 'Pelo menos um campo deve ser enviado para atualização',
  });
