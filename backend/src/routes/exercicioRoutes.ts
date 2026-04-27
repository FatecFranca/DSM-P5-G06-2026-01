import { Router } from 'express';
import { exercicioController } from '../controllers/exercicioController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarExercicioSchema } from '../validations/exercicioValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Exercícios
 *   description: Registro e acompanhamento de atividades físicas
 */

/**
 * @swagger
 * /exercicios:
 *   post:
 *     summary: Registrar atividade física
 *     tags: [Exercícios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarExercicioInput'
 *           example:
 *             tipo: "Corrida"
 *             duracao: 45
 *             calorias: 300
 *             data: "2026-04-22"
 *             hora: "18:30"
 *             intensidade: MEDIA
 *             notas: "Treino leve no parque"
 *     responses:
 *       201:
 *         description: Exercício registrado com sucesso
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
 *                   $ref: '#/components/schemas/Exercicio'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarExercicioSchema), exercicioController.criar);

/**
 * @swagger
 * /exercicios:
 *   get:
 *     summary: Listar atividades do usuário autenticado
 *     tags: [Exercícios]
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
 *         description: Lista paginada de atividades físicas
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, exercicioController.listarDoUsuario);

export default router;