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
router.get('/', autenticar, exercicioController.listarDoUsuario);
router.put('/:id', autenticar, exercicioController.atualizar);
router.delete('/:id', autenticar, exercicioController.deletar);

export default router;