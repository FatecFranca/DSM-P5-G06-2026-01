import { Router } from 'express';
import { refeicaoController } from '../controllers/refeicaoController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarRefeicaoSchema, atualizarRefeicaoSchema } from '../validations/refeicaoValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Refeicao
 *   description: Diário alimentar — registro de refeições e busca de alimentos
 */

/**
 * @swagger
 * /refeicao/buscar-alimento:
 *   get:
 *     summary: Buscar alimentos via FatSecret
 *     tags: [Refeicao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *         description: Termo de busca (mín. 2 caracteres)
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 0 }
 *       - in: query
 *         name: max
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Lista de alimentos encontrados
 *       400:
 *         description: Termo de busca inválido
 *       401:
 *         description: Não autenticado
 */
router.get('/buscar-alimento', autenticar, refeicaoController.buscarAlimento);

/**
 * @swagger
 * /refeicao:
 *   post:
 *     summary: Registrar uma refeição
 *     tags: [Refeicao]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             tipo: "ALMOCO"
 *             data: "2026-04-27"
 *             hora: "12:30"
 *             alimentos:
 *               - id: "36421"
 *                 nome: "Arroz Branco Cozido"
 *                 calorias: 130
 *                 carboidratos: 28
 *                 proteinas: 2.5
 *                 gorduras: 0.3
 *                 categoria: "moderado"
 *                 porcao: "100g"
 *             totalCalorias: 130
 *             totalCarbs: 28
 *             totalProteinas: 2.5
 *             totalGorduras: 0.3
 *             notas: "Sem sal"
 *     responses:
 *       201:
 *         description: Refeição registrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarRefeicaoSchema), refeicaoController.criar);

/**
 * @swagger
 * /refeicao:
 *   get:
 *     summary: Listar refeições do usuário autenticado
 *     tags: [Refeicao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limite
 *         schema: { type: integer, default: 50 }
 *       - in: query
 *         name: data
 *         schema: { type: string }
 *         description: Filtrar por data (YYYY-MM-DD)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [CAFE_MANHA, ALMOCO, JANTAR, LANCHE]
 *     responses:
 *       200:
 *         description: Lista paginada de refeições
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, refeicaoController.listar);

/**
 * @swagger
 * /refeicao/{id}:
 *   get:
 *     summary: Buscar refeição por ID
 *     tags: [Refeicao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Refeição encontrada
 *       404:
 *         description: Não encontrada
 *       401:
 *         description: Não autenticado
 */
router.get('/:id', autenticar, refeicaoController.buscarPorId);

/**
 * @swagger
 * /refeicao/{id}:
 *   put:
 *     summary: Atualizar refeição
 *     tags: [Refeicao]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Refeição atualizada
 *       404:
 *         description: Não encontrada
 *       401:
 *         description: Não autenticado
 */
router.put('/:id', autenticar, validate(atualizarRefeicaoSchema), refeicaoController.atualizar);

/**
 * @swagger
 * /refeicao/{id}:
 *   delete:
 *     summary: Deletar refeição
 *     tags: [Refeicao]
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
router.delete('/:id', autenticar, refeicaoController.deletar);

export default router;
