import { Router } from 'express';
import { notificacaoController } from '../controllers/notificacaoController';
import { autenticar } from '../middlewares/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notificações
 *   description: Gerenciamento de notificações do usuário
 */

/**
 * @swagger
 * /notificacoes:
 *   get:
 *     summary: Listar notificações do usuário autenticado
 *     tags: [Notificações]
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
 *     responses:
 *       200:
 *         description: Lista paginada de notificações
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
 *                     dados:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notificacao'
 *                     total:
 *                       type: integer
 *                     naoLidas:
 *                       type: integer
 *                     pagina:
 *                       type: integer
 *                     limite:
 *                       type: integer
 *                     totalPaginas:
 *                       type: integer
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, notificacaoController.listarDoUsuario);

/**
 * @swagger
 * /notificacoes/{id}/ler:
 *   patch:
 *     summary: Marcar uma notificação como lida
 *     tags: [Notificações]
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
 *         description: Notificação marcada como lida
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
 *                   $ref: '#/components/schemas/Notificacao'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrado
 */
router.patch('/:id/ler', autenticar, notificacaoController.marcarComoLida);

/**
 * @swagger
 * /notificacoes/ler-todas:
 *   patch:
 *     summary: Marcar todas as notificações como lidas
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas as notificações marcadas como lidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Não autenticado
 */
router.patch('/ler-todas', autenticar, notificacaoController.marcarTodasComoLidas);

export default router;