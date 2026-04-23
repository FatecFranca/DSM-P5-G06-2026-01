import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import diarioRoutes from './diarioRoutes';
import adminRoutes from './adminRoutes';
import dicasRoutes from './dicasRoutes';
import faqRoutes from './faqRoutes';
import sonoRoutes from './sonoRoutes';
import metasRoutes from './metasRoutes';
import glicoseRoutes from './glicoseRoutes';
import hidratacaoRoutes from './hidratacaoRoutes';
import medicacaoRoutes from './medicacaoRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/diarios', diarioRoutes);
router.use('/admin', adminRoutes);
router.use('/dicas', dicasRoutes);
router.use('/faq', faqRoutes);
router.use('/sono', sonoRoutes);
router.use('/metas', metasRoutes);
router.use('/glicose', glicoseRoutes);
router.use('/hidratacao', hidratacaoRoutes);
router.use('/medicacao', medicacaoRoutes);

export default router;
