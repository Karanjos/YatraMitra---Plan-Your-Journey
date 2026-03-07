import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth';

// --- Hotel Bookings ---

export const createHotelBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { tripStopId, hotelName, address, checkIn, checkOut, price, guests } = req.body;
        const booking = await prisma.hotelBooking.create({
            data: {
                tripStopId,
                hotelName,
                address,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                price,
                guests: guests || 1,
            },
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create hotel booking' });
    }
};

// --- Transport Bookings ---

export const createTransportBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { tripStopId, type, provider, departure, arrival, price, guests } = req.body;
        const booking = await prisma.transportBooking.create({
            data: {
                tripStopId,
                type,
                provider,
                departure: new Date(departure),
                arrival: new Date(arrival),
                price,
                guests: guests || 1,
            },
        });
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create transport booking' });
    }
};

// --- Activities ---

export const createActivity = async (req: AuthRequest, res: Response) => {
    try {
        const { tripStopId, name, description, date, price, guests } = req.body;
        const activity = await prisma.activity.create({
            data: {
                tripStopId,
                name,
                description,
                date: new Date(date),
                price,
                guests: guests || 1,
            },
        });
        res.status(201).json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create activity' });
    }
};

// --- Deletions ---

export const deleteHotelBooking = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.hotelBooking.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Hotel booking deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete hotel booking' });
    }
};

export const deleteTransportBooking = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.transportBooking.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Transport booking deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete transport booking' });
    }
};

export const deleteActivity = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.activity.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'Activity deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete activity' });
    }
};

// --- Updates (Edit Flow) ---

export const updateHotelBooking = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        const { checkIn, checkOut, price, guests, hotelName, address } = req.body;

        const booking = await prisma.hotelBooking.update({
            where: { id },
            data: {
                checkIn: checkIn ? new Date(checkIn) : undefined,
                checkOut: checkOut ? new Date(checkOut) : undefined,
                price,
                guests,
                hotelName,
                address,
            },
        });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update hotel booking' });
    }
};

export const updateTransportBooking = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        const { departure, arrival, price, guests, type, provider } = req.body;

        const booking = await prisma.transportBooking.update({
            where: { id },
            data: {
                departure: departure ? new Date(departure) : undefined,
                arrival: arrival ? new Date(arrival) : undefined,
                price,
                guests,
                type,
                provider,
            },
        });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update transport booking' });
    }
};

export const updateActivity = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id;
        const { date, price, guests, name, description } = req.body;

        const activity = await prisma.activity.update({
            where: { id },
            data: {
                date: date ? new Date(date) : undefined,
                price,
                guests,
                name,
                description,
            },
        });
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update activity' });
    }
};
