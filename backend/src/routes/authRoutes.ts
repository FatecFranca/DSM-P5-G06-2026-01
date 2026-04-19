import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { registroSchema, loginSchema } from '../validations/userValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Registro e login de usuários
 */

/**
 * @swagger
 * /auth/registrar:
 *   post:
 *     summary: Registrar novo usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroInput'
 *           example:
 *             nome: Carlos Silva
 *             email: carlos@email.com
 *             senha: senha123
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaToken'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaErro'
 *       409:
 *         description: E-mail já cadastrado
 */
router.post('/registrar', validate(registroSchema), authController.registrar);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Fazer login e obter token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *           example:
 *             email: carlos@email.com
 *             senha: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaToken'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: E-mail ou senha inválidos
 *       403:
 *         description: Conta inativa
 */
router.post('/login', validate(loginSchema), authController.login);

export default router;
