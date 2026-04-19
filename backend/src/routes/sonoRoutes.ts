import { Router } from 'express';
import { sonoController } from '../controllers/sonoController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarSonoSchema, atualizarSonoSchema } from '../validations/sonoValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Sono
 *   description: Registro e acompanhamento do sono do paciente
 */

/**
 * @swagger
 * /sono:
 *   post:
 *     summary: Registrar período de sono
 *     tags: [Sono]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarSonoInput'
 *           example:
 *             data: "2026-04-19"
 *             horaDeitar: "22:30"
 *             horaAcordar: "06:00"
 *             duracao: 7.5
 *             qualidade: BOA
 *             notas: "Acordei uma vez à noite"
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
 *                   $ref: '#/components/schemas/Sono'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarSonoSchema), sonoController.criar);

/**
 * @swagger
 * /sono:
 *   get:
 *     summary: Listar registros de sono do usuário autenticado
 *     tags: [Sono]
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
 *         description: Lista paginada de registros de sono
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, sonoController.listarDoUsuario);

/**
 * @swagger
 * /sono/estatisticas:
 *   get:
 *     summary: Estatísticas de sono do usuário (últimos 30 registros)
 *     tags: [Sono]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas de sono
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
 *                       type: integer
 *                     mediaDuracao:
 *                       type: number
 *                     distribuicaoQualidade:
 *                       type: object
 *       401:
 *         description: Não autenticado
 */
router.get('/estatisticas', autenticar, sonoController.estatisticas);

/**
 * @swagger
 * /sono/{id}:
 *   get:
 *     summary: Buscar registro de sono por ID
 *     tags: [Sono]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro de sono
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrado
 */
router.get('/:id', autenticar, sonoController.buscarPorId);

/**
 * @swagger
 * /sono/{id}:
 *   put:
 *     summary: Atualizar registro de sono
 *     tags: [Sono]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarSonoInput'
 *     responses:
 *       200:
 *         description: Registro atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrado
 */
router.put('/:id', autenticar, validate(atualizarSonoSchema), sonoController.atualizar);

/**
 * @swagger
 * /sono/{id}:
 *   delete:
 *     summary: Deletar registro de sono
 *     tags: [Sono]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Registro deletado com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrado
 */
router.delete('/:id', autenticar, sonoController.deletar);

export default router;
