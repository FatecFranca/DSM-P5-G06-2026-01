import { Router } from 'express';
import { dicasController } from '../controllers/dicasController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarDicaSchema, atualizarDicaSchema } from '../validations/dicasValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dicas
 *   description: Dicas e artigos educativos sobre diabetes
 */

/**
 * @swagger
 * /dicas:
 *   post:
 *     summary: Criar uma nova dica
 *     tags: [Dicas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarDicaInput'
 *           example:
 *             titulo: Como o exercício afeta sua glicose
 *             sumario: Entenda por que a atividade física é essencial
 *             conteudo: Conteúdo completo em markdown
 *             categoria: EXERCICIO
 *             tempoLeitura: 4
 *             data: 2026-04-06
 *             destaque: true
 *     responses:
 *       201:
 *         description: Dica criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarDicaSchema), dicasController.criar);

/**
 * @swagger
 * /dicas:
 *   get:
 *     summary: Listar todas as dicas
 *     tags: [Dicas]
 *     responses:
 *       200:
 *         description: Lista de dicas
 */
router.get('/', autenticar, dicasController.listar);

/**
 * @swagger
 * /dicas/{id}:
 *   get:
 *     summary: Buscar dica por ID
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID da dica
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dica encontrada
 *       404:
 *         description: Dica não encontrada
 */
router.get('/:id', autenticar, dicasController.buscarPorId);

/**
 * @swagger
 * /dicas/{id}:
 *   put:
 *     summary: Atualizar uma dica
 *     tags: [Dicas]
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
 *             $ref: '#/components/schemas/AtualizarDicaInput'
 *     responses:
 *       200:
 *         description: Dica atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Dica não encontrada
 */
router.put('/:id', autenticar, validate(atualizarDicaSchema), dicasController.atualizar);

/**
 * @swagger
 * /dicas/{id}:
 *   delete:
 *     summary: Deletar uma dica
 *     tags: [Dicas]
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
 *         description: Dica deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Dica não encontrada
 */
router.delete('/:id', autenticar, dicasController.deletar);

export default router;