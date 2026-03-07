import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { createPayment, confirmPayment } from '../controllers/paymentController';

const router = Router();

router.use(authenticate);

router.post('/create', createPayment);
router.post('/confirm', confirmPayment);

export default router;
