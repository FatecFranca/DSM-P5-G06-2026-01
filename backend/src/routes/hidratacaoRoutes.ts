import { Router } from 'express';
import { hidratacaoController } from '../controllers/hidratacaoController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarHidratacaoSchema } from '../validations/hidratacaoValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hidratação
 *   description: Registro e acompanhamento do consumo de água
 */

/**
 * @swagger
 * /hidratacao:
 *   post:
 *     summary: Registrar consumo de água
 *     tags: [Hidratação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarHidratacaoInput'
 *           example:
 *             data: "2026-04-20"
 *             hora: "14:30"
 *             quantidade: 300
 *     responses:
 *       201:
 *         description: Registro criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Hidratacao'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarHidratacaoSchema), hidratacaoController.criar);

/**
 * @swagger
 * /hidratacao:
 *   get:
 *     summary: Listar registros de hidratação do usuário autenticado
 *     tags: [Hidratação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar a partir desta data (YYYY-MM-DD)
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar até esta data (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista paginada de registros de hidratação
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, hidratacaoController.listar);

/**
 * @swagger
 * /hidratacao/hoje:
 *   get:
 *     summary: Total de água consumido hoje
 *     tags: [Hidratação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total consumido no dia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 1200
 *                     quantidadeRegistros:
 *                       type: number
 *                       example: 5
 *       401:
 *         description: Não autenticado
 */
router.get('/hoje', autenticar, hidratacaoController.totalHoje);

export default router;