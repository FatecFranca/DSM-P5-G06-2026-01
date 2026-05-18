import { Router } from 'express';
import { diagnosticoController } from '../controllers/diagnosticoController';
import { autenticar } from '../middlewares/auth';

const router = Router();

router.use(autenticar);

router.post('/', diagnosticoController.criar);
router.get('/meu', diagnosticoController.meuDiagnostico);

export default router;
