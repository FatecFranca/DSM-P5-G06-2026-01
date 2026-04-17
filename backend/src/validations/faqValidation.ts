import Joi from "joi";

const CATEGORIAS_FAQ = [
  "DIABETES",
  "SINTOMAS",
  "ALIMENTACAO",
  "EXERCICIOS",
  "MEDICACAO",
  "MONITORAMENTO",
] as const;

// ─── Criar FAQ ────────────────────────────────────────────────────────────────

export const criarFaqSchema = Joi.object({
  pergunta: Joi.string().trim().min(1).max(300).required().messages({
    "string.min": "Pergunta não pode ser vazia",
    "string.max": "Pergunta deve ter no máximo 300 caracteres",
    "any.required": "Pergunta é obrigatória",
  }),

  resposta: Joi.string().trim().min(1).required().messages({
    "string.min": "Resposta não pode ser vazia",
    "any.required": "Resposta é obrigatória",
  }),

  categoria: Joi.string()
    .valid(...CATEGORIAS_FAQ)
    .required()
    .messages({
      "any.only": "Categoria inválida",
      "any.required": "Categoria é obrigatória",
    }),

  ordem: Joi.number().integer().min(0).optional().default(0),

  ativo: Joi.boolean().optional().default(true),
});

// ─── Atualizar FAQ ────────────────────────────────────────────────────────────

export const atualizarFaqSchema = Joi.object({
  pergunta: Joi.string().trim().min(1).max(300).optional().messages({
    "string.min": "Pergunta não pode ser vazia",
    "string.max": "Pergunta deve ter no máximo 300 caracteres",
  }),

  resposta: Joi.string().trim().min(1).optional().messages({
    "string.min": "Resposta não pode ser vazia",
  }),

  categoria: Joi.string()
    .valid(...CATEGORIAS_FAQ)
    .optional()
    .messages({ "any.only": "Categoria inválida" }),

  ordem: Joi.number().integer().min(0).optional(),

  ativo: Joi.boolean().optional(),
})
  .min(1)
  .messages({ "object.min": "Pelo menos um campo deve ser enviado para atualização" });
