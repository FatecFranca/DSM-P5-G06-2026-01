import { Router } from 'express';
import { userController } from '../controllers/userController';
import { diarioController } from '../controllers/diarioController';
import { autenticar, autorizarAdmin } from '../middlewares/auth';

const router = Router();

// Todos os endpoints admin exigem autenticação + perfil ADMIN
router.use(autenticar, autorizarAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Endpoints exclusivos para administradores
 */

/**
 * @swagger
 * /admin/usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Admin]
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
 *         description: Lista paginada de usuários
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaPaginadaUsuario'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado — apenas administradores
 */
router.get('/usuarios', userController.listarUsuarios);

/**
 * @swagger
 * /admin/diarios:
 *   get:
 *     summary: Listar todas as entradas do diário de todos os usuários
 *     tags: [Admin]
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
 *         name: humor
 *         description: Filtrar por humor
 *         schema:
 *           type: string
 *           enum: [OTIMO, BOM, OK, MAL, PESSIMO]
 *     responses:
 *       200:
 *         description: Lista paginada de entradas do diário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaPaginadaDiario'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso negado — apenas administradores
 */
router.get('/diarios', diarioController.listarTodos);

export default router;
