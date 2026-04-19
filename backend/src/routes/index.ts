import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import diarioRoutes from './diarioRoutes';
import adminRoutes from './adminRoutes';
import dicasRoutes from './dicasRoutes';
import faqRoutes from './faqRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/diarios', diarioRoutes);
router.use('/admin', adminRoutes);
router.use('/dicas', dicasRoutes);
router.use('/faq', faqRoutes);

export default router;
