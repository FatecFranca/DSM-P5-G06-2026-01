import { Router } from 'express';
import { medicacaoController } from '../controllers/medicacaoController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarMedicacaoSchema, atualizarMedicacaoSchema } from '../validations/medicacaoValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Medicacao
 *   description: Gerenciamento de medicações do usuário
 */

/**
 * @swagger
 * /medicacao:
 *   post:
 *     summary: Criar uma medicação
 *     tags: [Medicacao]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarMedicacaoInput'
 *           example:
 *             nome: "Metformina"
 *             dosagem: "500mg"
 *             frequencia: "2x ao dia"
 *             horarios: ["08:00", "20:00"]
 *             tipo: "ORAL"
 *             notas: "Tomar com alimento"
 *             cor: "#4CAF82"
 *     responses:
 *       201:
 *         description: Medicação criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarMedicacaoSchema), medicacaoController.criar);

/**
 * @swagger
 * /medicacao:
 *   get:
 *     summary: Listar medicações do usuário autenticado
 *     tags: [Medicacao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [INSULINA, ORAL, SUPLEMENTO, OUTRO]
 *     responses:
 *       200:
 *         description: Lista paginada de medicações
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, medicacaoController.listar);

/**
 * @swagger
 * /medicacao/{id}:
 *   get:
 *     summary: Buscar medicação por ID
 *     tags: [Medicacao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Medicação encontrada
 *       404:
 *         description: Não encontrada
 *       401:
 *         description: Não autenticado
 */
router.get('/:id', autenticar, medicacaoController.buscarPorId);

/**
 * @swagger
 * /medicacao/{id}:
 *   put:
 *     summary: Atualizar medicação (incluindo marcar como tomada)
 *     tags: [Medicacao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             tomado: true
 *             ultimaTomada: "2026-04-23T08:00:00"
 *     responses:
 *       200:
 *         description: Medicação atualizada
 *       404:
 *         description: Não encontrada
 *       401:
 *         description: Não autenticado
 */
router.put('/:id', autenticar, validate(atualizarMedicacaoSchema), medicacaoController.atualizar);

/**
 * @swagger
 * /medicacao/{id}:
 *   delete:
 *     summary: Deletar medicação
 *     tags: [Medicacao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deletada com sucesso
 *       404:
 *         description: Não encontrada
 *       401:
 *         description: Não autenticado
 */
router.delete('/:id', autenticar, medicacaoController.deletar);

export default router;
