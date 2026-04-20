import { Router } from 'express';
import { metasController } from '../controllers/metasController';
import { autenticar } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { criarMetaSchema, atualizarMetaSchema } from '../validations/metasValidation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Metas
 *   description: Gerenciamento de metas de saúde do paciente
 */

/**
 * @swagger
 * /metas:
 *   post:
 *     summary: Criar meta de saúde
 *     tags: [Metas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CriarMetaInput'
 *           example:
 *             titulo: "Glicose no Alvo"
 *             descricao: "Manter 80% das leituras entre 70-140 mg/dL"
 *             alvo: 30
 *             atual: 0
 *             unidade: "leituras"
 *             categoria: "GLICOSE"
 *             prazo: "2026-06-30"
 *             cor: "#4CAF82"
 *     responses:
 *       201:
 *         description: Meta criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', autenticar, validate(criarMetaSchema), metasController.criar);

/**
 * @swagger
 * /metas:
 *   get:
 *     summary: Listar metas do usuário autenticado
 *     tags: [Metas]
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
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [GLICOSE, PESO, EXERCICIO, AGUA, SONO, PASSOS]
 *       - in: query
 *         name: concluida
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista paginada de metas
 *       401:
 *         description: Não autenticado
 */
router.get('/', autenticar, metasController.listarDoUsuario);

/**
 * @swagger
 * /metas/{id}:
 *   get:
 *     summary: Buscar meta por ID
 *     tags: [Metas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Meta encontrada
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrada
 */
router.get('/:id', autenticar, metasController.buscarPorId);

/**
 * @swagger
 * /metas/{id}:
 *   put:
 *     summary: Atualizar meta (inclusive progresso atual)
 *     tags: [Metas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AtualizarMetaInput'
 *     responses:
 *       200:
 *         description: Meta atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrada
 */
router.put('/:id', autenticar, validate(atualizarMetaSchema), metasController.atualizar);

/**
 * @swagger
 * /metas/{id}:
 *   delete:
 *     summary: Remover meta
 *     tags: [Metas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Meta deletada com sucesso
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: Não encontrada
 */
router.delete('/:id', autenticar, metasController.deletar);

export default router;
