import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import diarioRoutes from './diarioRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', userRoutes);
router.use('/diarios', diarioRoutes);
router.use('/admin', adminRoutes);

export default router;
