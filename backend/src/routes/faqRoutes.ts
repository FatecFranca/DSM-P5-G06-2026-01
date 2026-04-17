import { Router } from "express";
import { faqController } from "../controllers/faqController";
import { autenticar } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { criarFaqSchema, atualizarFaqSchema } from "../validations/faqValidation";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: FAQ
 *   description: Perguntas frequentes sobre diabetes
 */

/**
 * @swagger
 * /faq:
 *   get:
 *     summary: Listar FAQs
 *     tags: [FAQ]
 *     parameters:
 *       - in: query
 *         name: todos
 *         schema:
 *           type: boolean
 *         description: "Admin: true para incluir inativos"
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [DIABETES, SINTOMAS, ALIMENTACAO, EXERCICIOS, MEDICACAO, MONITORAMENTO]
 *     responses:
 *       200:
 *         description: Lista de FAQs
 */
router.get("/", autenticar, faqController.listar);

/**
 * @swagger
 * /faq/{id}:
 *   get:
 *     summary: Buscar FAQ por ID
 *     tags: [FAQ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: FAQ encontrado
 *       404:
 *         description: Não encontrado
 */
router.get("/:id", autenticar, faqController.buscarPorId);

/**
 * @swagger
 * /faq:
 *   post:
 *     summary: Criar FAQ (admin)
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pergunta, resposta, categoria]
 *             properties:
 *               pergunta: { type: string }
 *               resposta: { type: string }
 *               categoria:
 *                 type: string
 *                 enum: [DIABETES, SINTOMAS, ALIMENTACAO, EXERCICIOS, MEDICACAO, MONITORAMENTO]
 *               ordem: { type: integer }
 *               ativo: { type: boolean }
 *     responses:
 *       201:
 *         description: FAQ criado
 */
router.post("/", autenticar, validate(criarFaqSchema), faqController.criar);

/**
 * @swagger
 * /faq/{id}:
 *   put:
 *     summary: Atualizar FAQ (admin)
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ atualizado
 */
router.put("/:id", autenticar, validate(atualizarFaqSchema), faqController.atualizar);

/**
 * @swagger
 * /faq/{id}:
 *   delete:
 *     summary: Deletar FAQ (admin)
 *     tags: [FAQ]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQ deletado
 */
router.delete("/:id", autenticar, faqController.deletar);

export default router;
