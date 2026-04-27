import Joi from 'joi';

const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const HORA_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const TIPOS_VALIDOS    = ['CAFE_MANHA', 'ALMOCO', 'JANTAR', 'LANCHE'];
const CATEGORIAS_VALIDAS = ['bom', 'moderado', 'ruim'];

const alimentoSchema = Joi.object({
  id:              Joi.string().required(),
  nome:            Joi.string().min(1).max(200).required(),
  marca:           Joi.string().max(100).optional().allow(''),
  calorias:        Joi.number().min(0).required(),
  carboidratos:    Joi.number().min(0).required(),
  proteinas:       Joi.number().min(0).required(),
  gorduras:        Joi.number().min(0).required(),
  categoria:       Joi.string().valid(...CATEGORIAS_VALIDAS).required(),
  porcao:          Joi.string().max(100).required(),
  fatsecretId:     Joi.string().optional().allow(''),
  indiceGlicemico: Joi.number().min(0).optional(),
});

// ─── Criar refeição ───────────────────────────────────────────────────────────

export const criarRefeicaoSchema = Joi.object({
  tipo: Joi.string().valid(...TIPOS_VALIDOS).required().messages({
    'any.required': 'Tipo de refeição é obrigatório',
    'any.only':     `Tipo deve ser: ${TIPOS_VALIDOS.join(', ')}`,
  }),
  data: Joi.string().pattern(DATA_REGEX).required().messages({
    'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
    'any.required':        'Data é obrigatória',
  }),
  hora: Joi.string().pattern(HORA_REGEX).required().messages({
    'string.pattern.base': 'Hora deve estar no formato HH:MM',
    'any.required':        'Hora é obrigatória',
  }),
  alimentos: Joi.array().items(alimentoSchema).min(1).required().messages({
    'array.min':    'Informe pelo menos um alimento',
    'any.required': 'Alimentos são obrigatórios',
  }),
  totalCalorias:  Joi.number().min(0).required(),
  totalCarbs:     Joi.number().min(0).required(),
  totalProteinas: Joi.number().min(0).required(),
  totalGorduras:  Joi.number().min(0).required(),
  notas: Joi.string().max(500).optional().allow(''),
});

// ─── Atualizar refeição ───────────────────────────────────────────────────────

export const atualizarRefeicaoSchema = Joi.object({
  tipo:           Joi.string().valid(...TIPOS_VALIDOS).optional(),
  data:           Joi.string().pattern(DATA_REGEX).optional(),
  hora:           Joi.string().pattern(HORA_REGEX).optional(),
  alimentos:      Joi.array().items(alimentoSchema).min(1).optional(),
  totalCalorias:  Joi.number().min(0).optional(),
  totalCarbs:     Joi.number().min(0).optional(),
  totalProteinas: Joi.number().min(0).optional(),
  totalGorduras:  Joi.number().min(0).optional(),
  notas:          Joi.string().max(500).optional().allow('', null),
})
  .min(1)
  .messages({ 'object.min': 'Pelo menos um campo deve ser enviado para atualização' });
