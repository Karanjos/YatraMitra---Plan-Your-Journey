"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const tripController_1 = require("../controllers/tripController");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate); // Protect all trip routes
router.post('/', tripController_1.createTrip);
router.get('/', tripController_1.getTrips);
router.get('/:id', tripController_1.getTripById);
router.put('/:id', tripController_1.updateTrip);
router.post('/:tripId/stops', tripController_1.addTripStop);
router.put('/stops/:id', tripController_1.updateTripStop);
router.delete('/stops/:id', tripController_1.deleteTripStop);
exports.default = router;
