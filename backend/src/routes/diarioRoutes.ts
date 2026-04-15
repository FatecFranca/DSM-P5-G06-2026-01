import { Router } from 'express';
import { diarioController } from '../controllers/diarioController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarDiarioSchema, atualizarDiarioSchema } from '../validations/diarioValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Diário
 *   description: Diário emocional do paciente
 */

/**
 * @swagger
 * /diarios:
 *   post:
 *     summary: Criar nova entrada no diário
 *     tags: [Diário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarDiarioInput'
 *           example:
 *             titulo: Dia difícil com glicemia alta
 *             conteudo: Acordei me sentindo mal, glicemia estava em 280. Tomei a insulina e descansando.
 *             humor: MAL
 *             sintomas: [Cansaço, Tontura, Sede]
 *             tags: [medicação, glicose]
 *     responses:
 *       201:
 *         description: Entrada criada com sucesso
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
 *                   $ref: '#/components/schemas/Diario'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarDiarioSchema), diarioController.criar);

/**
 * @swagger
 * /diarios:
 *   get:
 *     summary: Listar entradas do diário do usuário autenticado
 *     tags: [Diário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Itens por página (máx. 100)
 *     responses:
 *       200:
 *         description: Lista de entradas do diário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaPaginadaDiario'
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, diarioController.listarDoUsuario);

/**
 * @swagger
 * /diarios/{id}:
 *   get:
 *     summary: Buscar entrada do diário por ID
 *     tags: [Diário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID da entrada
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Entrada do diário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Diario'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Entrada não encontrada
 */
router.get('/:id', autenticar, diarioController.buscarPorId);

/**
 * @swagger
 * /diarios/{id}:
 *   put:
 *     summary: Atualizar entrada do diário
 *     tags: [Diário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID da entrada
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarDiarioInput'
 *     responses:
 *       200:
 *         description: Entrada atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Entrada não encontrada
 */
router.put('/:id', autenticar, validate(atualizarDiarioSchema), diarioController.atualizar);

/**
 * @swagger
 * /diarios/{id}:
 *   delete:
 *     summary: Deletar entrada do diário
 *     tags: [Diário]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID da entrada
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Entrada deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Entrada não encontrada
 */
router.delete('/:id', autenticar, diarioController.deletar);

export default router;
