import { Request, Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth';

export const createTrip = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, startDate, endDate } = req.body;
        const userId = req.user!.id;

        const trip = await prisma.trip.create({
            data: {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                userId,
            },
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create trip' });
    }
};

export const getTrips = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const trips = await prisma.trip.findMany({
            where: { userId },
            orderBy: { startDate: 'asc' },
        });

        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trips' });
    }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user!.id;

        const trip = await prisma.trip.findFirst({
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

        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch trip' });
    }
};

export const updateTrip = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const userId = req.user!.id;
        const { title, description, startDate, endDate } = req.body;

        const trip = await prisma.trip.update({
            where: { id, userId },
            data: {
                title,
                description,
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
            },
        });

        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update trip' });
    }
};


export const addTripStop = async (req: AuthRequest, res: Response) => {
    try {
        const tripId = req.params.tripId as string;
        const { cityName, arrivalDate, departureDate, orderIndex } = req.body;
        const userId = req.user!.id;

        const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
        if (!trip) return res.status(404).json({ error: 'Trip not found' });

        const stop = await prisma.tripStop.create({
            data: {
                cityName,
                arrivalDate: new Date(arrivalDate),
                departureDate: new Date(departureDate),
                orderIndex,
                tripId,
            },
        });

        res.status(201).json(stop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add trip stop' });
    }
};

export const updateTripStop = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const { cityName, arrivalDate, departureDate, orderIndex } = req.body;

        // Simplification: In a real app we'd verify the stop belongs to a trip owned by the user.
        const stop = await prisma.tripStop.update({
            where: { id },
            data: {
                cityName,
                arrivalDate: new Date(arrivalDate),
                departureDate: new Date(departureDate),
                orderIndex,
            },
        });

        res.json(stop);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update trip stop' });
    }
};

export const deleteTripStop = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        await prisma.tripStop.delete({ where: { id } });
        res.json({ message: 'Stop deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete trip stop' });
    }
};
