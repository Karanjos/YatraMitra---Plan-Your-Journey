import { Response } from 'express';
import { prisma } from '../index';
import { AuthRequest } from '../middlewares/auth';
import { v4 as uuidv4 } from 'uuid';

export const createPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { amount, currency } = req.body;
        const userId = req.user!.id;

        // In a real app, you would call Stripe API here to create a PaymentIntent
        // const paymentIntent = await stripe.paymentIntents.create({ amount, currency });

        const payment = await prisma.payment.create({
            data: {
                amount,
                currency: currency || 'USD',
                status: 'PENDING',
                userId,
            },
        });

        res.status(201).json({ payment, clientSecret: `mock_secret_${uuidv4()}` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
    }
};

export const confirmPayment = async (req: AuthRequest, res: Response) => {
    try {
        const { paymentId, tripId } = req.body;

        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'COMPLETED', stripePaymentId: `mock_stripe_${uuidv4()}` },
        });

        // If a tripId is provided, confirm all pending bookings for that trip
        if (tripId) {
            const stops = await prisma.tripStop.findMany({ where: { tripId } });
            const stopIds = stops.map(s => s.id);

            await prisma.hotelBooking.updateMany({
                where: { tripStopId: { in: stopIds }, status: 'PENDING' },
                data: { status: 'CONFIRMED' }
            });

            await prisma.transportBooking.updateMany({
                where: { tripStopId: { in: stopIds }, status: 'PENDING' },
                data: { status: 'CONFIRMED' }
            });

            await prisma.activity.updateMany({
                where: { tripStopId: { in: stopIds }, status: 'PENDING' },
                data: { status: 'CONFIRMED' }
            });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
};
