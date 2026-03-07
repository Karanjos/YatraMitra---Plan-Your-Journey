import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
    createHotelBooking, deleteHotelBooking, updateHotelBooking,
    createTransportBooking, deleteTransportBooking, updateTransportBooking,
    createActivity, deleteActivity, updateActivity
} from '../controllers/bookingController';

const router = Router();

router.use(authenticate);

router.post('/hotel', createHotelBooking);
router.put('/hotel/:id', updateHotelBooking);
router.delete('/hotel/:id', deleteHotelBooking);

router.post('/transport', createTransportBooking);
router.put('/transport/:id', updateTransportBooking);
router.delete('/transport/:id', deleteTransportBooking);

router.post('/activity', createActivity);
router.put('/activity/:id', updateActivity);
router.delete('/activity/:id', deleteActivity);

export default router;
