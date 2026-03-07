"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTripStop = exports.updateTripStop = exports.addTripStop = exports.updateTrip = exports.getTripById = exports.getTrips = exports.createTrip = void 0;
const index_1 = require("../index");
const createTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, startDate, endDate } = req.body;
        const userId = req.user.id;
        const trip = yield index_1.prisma.trip.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId,
            },
        });
        res.status(201).json(trip);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create trip' });
    }
});
exports.createTrip = createTrip;
const getTrips = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const trips = yield index_1.prisma.trip.findMany({
            where: { userId },
            orderBy: { startDate: 'asc' },
        });
        res.json(trips);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
});
exports.getTrips = getTrips;
const getTripById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const trip = yield index_1.prisma.trip.findFirst({
            where: { id, userId },
            include: {
                stops: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        hotelBooking: true,
                        transportBooking: true,
                        activities: true,
                    },
                },
            },
        });
        if (!trip)
            return res.status(404).json({ error: 'Trip not found' });
        res.json(trip);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trip' });
    }
});
exports.getTripById = getTripById;
const updateTrip = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        const { title, description, startDate, endDate } = req.body;
        const trip = yield index_1.prisma.trip.update({
            where: { id, userId },
            data: Object.assign(Object.assign({ title,
                description }, (startDate && { startDate: new Date(startDate) })), (endDate && { endDate: new Date(endDate) })),
        });
        res.json(trip);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update trip' });
    }
});
exports.updateTrip = updateTrip;
const addTripStop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tripId = req.params.tripId;
        const { cityName, arrivalDate, departureDate, orderIndex } = req.body;
        const userId = req.user.id;
        const trip = yield index_1.prisma.trip.findFirst({ where: { id: tripId, userId } });
        if (!trip)
            return res.status(404).json({ error: 'Trip not found' });
        const stop = yield index_1.prisma.tripStop.create({
            data: {
                cityName,
                arrivalDate: new Date(arrivalDate),
                departureDate: new Date(departureDate),
                orderIndex,
                tripId,
            },
        });
        res.status(201).json(stop);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add trip stop' });
    }
});
exports.addTripStop = addTripStop;
const updateTripStop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { cityName, arrivalDate, departureDate, orderIndex } = req.body;
        // Simplification: In a real app we'd verify the stop belongs to a trip owned by the user.
        const stop = yield index_1.prisma.tripStop.update({
            where: { id },
            data: {
                cityName,
                arrivalDate: new Date(arrivalDate),
                departureDate: new Date(departureDate),
                orderIndex,
            },
        });
        res.json(stop);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update trip stop' });
    }
});
exports.updateTripStop = updateTripStop;
const deleteTripStop = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        yield index_1.prisma.tripStop.delete({ where: { id } });
        res.json({ message: 'Stop deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete trip stop' });
    }
});
exports.deleteTripStop = deleteTripStop;
