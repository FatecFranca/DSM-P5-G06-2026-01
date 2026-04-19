import { Router } from 'express';
import { userController } from '../controllers/userController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { atualizarPerfilSchema } from '../validations/userValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Gerenciamento do perfil do usuário
 */

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Buscar perfil de um usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID do usuário
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', autenticar, userController.buscarPerfil);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualizar perfil do usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID do usuário
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarPerfilInput'
 *           example:
 *             nome: Carlos Silva
 *             idade: 42
 *             peso: 82.5
 *             altura: 175
 *             tipoDiabetes: TIPO2
 *             glicoseAlvoMin: 70
 *             glicoseAlvoMax: 180
 *             nomeMedico: Dr. João Santos
 *             ultimaConsulta: "2025-01-15"
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
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
 *                   $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', autenticar, validate(atualizarPerfilSchema), userController.atualizarPerfil);

export default router;
