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
exports.deleteActivity = exports.deleteTransportBooking = exports.deleteHotelBooking = exports.createActivity = exports.createTransportBooking = exports.createHotelBooking = void 0;
const index_1 = require("../index");
// --- Hotel Bookings ---
const createHotelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripStopId, hotelName, address, checkIn, checkOut, price } = req.body;
        const booking = yield index_1.prisma.hotelBooking.create({
            data: {
                tripStopId,
                hotelName,
                address,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                price,
            },
        });
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create hotel booking' });
    }
});
exports.createHotelBooking = createHotelBooking;
// --- Transport Bookings ---
const createTransportBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripStopId, type, provider, departure, arrival, price } = req.body;
        const booking = yield index_1.prisma.transportBooking.create({
            data: {
                tripStopId,
                type,
                provider,
                departure: new Date(departure),
                arrival: new Date(arrival),
                price,
            },
        });
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create transport booking' });
    }
});
exports.createTransportBooking = createTransportBooking;
// --- Activities ---
const createActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tripStopId, name, description, date, price } = req.body;
        const activity = yield index_1.prisma.activity.create({
            data: {
                tripStopId,
                name,
                description,
                date: new Date(date),
                price,
            },
        });
        res.status(201).json(activity);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create activity' });
    }
});
exports.createActivity = createActivity;
// --- Deletions ---
const deleteHotelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield index_1.prisma.hotelBooking.delete({ where: { id: req.params.id } });
        res.json({ message: 'Hotel booking deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete hotel booking' });
    }
});
exports.deleteHotelBooking = deleteHotelBooking;
const deleteTransportBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield index_1.prisma.transportBooking.delete({ where: { id: req.params.id } });
        res.json({ message: 'Transport booking deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete transport booking' });
    }
});
exports.deleteTransportBooking = deleteTransportBooking;
const deleteActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield index_1.prisma.activity.delete({ where: { id: req.params.id } });
        res.json({ message: 'Activity deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete activity' });
    }
});
exports.deleteActivity = deleteActivity;
