import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import {
    createTrip,
    getTrips,
    getTripById,
    updateTrip,
    addTripStop,
    updateTripStop,
    deleteTripStop
} from '../controllers/tripController';

const router = Router();

router.use(authenticate); // Protect all trip routes

router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);

router.post('/:tripId/stops', addTripStop);
router.put('/stops/:id', updateTripStop);
router.delete('/stops/:id', deleteTripStop);

export default router;
