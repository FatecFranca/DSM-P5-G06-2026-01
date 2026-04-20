import { Router } from 'express';
import { glicoseController } from '../controllers/glicoseController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarGlicoseSchema, atualizarGlicoseSchema } from '../validations/glicoseValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Glicose
 *   description: Registro e acompanhamento de glicemia do paciente
 */

/**
 * @swagger
 * /glicose:
 *   post:
 *     summary: Registrar leitura de glicose
 *     tags: [Glicose]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarGlicoseInput'
 *           example:
 *             valor: 120
 *             contexto: JEJUM
 *             data: "2026-04-19"
 *             hora: "08:30"
 *             notas: "Acordei bem"
 *     responses:
 *       201:
 *         description: Leitura registrada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarGlicoseSchema), glicoseController.criar);

/**
 * @swagger
 * /glicose:
 *   get:
 *     summary: Listar leituras de glicose do usuário autenticado
 *     tags: [Glicose]
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
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista paginada de leituras
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, glicoseController.listarDoUsuario);

/**
 * @swagger
 * /glicose/estatisticas:
 *   get:
 *     summary: Estatísticas de glicose (média e distribuição)
 *     tags: [Glicose]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Estatísticas de glicose
 *       401:
 *         description: Não autenticado
 */
router.get('/estatisticas', autenticar, glicoseController.estatisticas);

/**
 * @swagger
 * /glicose/tendencia:
 *   get:
 *     summary: Tendência de glicose (min, média e max por dia)
 *     tags: [Glicose]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dataFim
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Série temporal para gráficos
 *       401:
 *         description: Não autenticado
 */
router.get('/tendencia', autenticar, glicoseController.tendencia);

/**
 * @swagger
 * /glicose/{id}:
 *   delete:
 *     summary: Deletar leitura de glicose
 *     tags: [Glicose]
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
 *         description: Leitura deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrada
 */
router.delete('/:id', autenticar, glicoseController.deletar);

export default router;