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
exports.confirmPayment = exports.createPayment = void 0;
const index_1 = require("../index");
const uuid_1 = require("uuid");
const createPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency } = req.body;
        const userId = req.user.id;
        // In a real app, you would call Stripe API here to create a PaymentIntent
        // const paymentIntent = await stripe.paymentIntents.create({ amount, currency });
        const payment = yield index_1.prisma.payment.create({
            data: {
                amount,
                currency: currency || 'USD',
                status: 'PENDING',
                userId,
            },
        });
        res.status(201).json({ payment, clientSecret: `mock_secret_${(0, uuid_1.v4)()}` });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
    }
});
exports.createPayment = createPayment;
const confirmPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentId } = req.body;
        // In a real app, verify Stripe webhook/success event
        const payment = yield index_1.prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'COMPLETED', stripePaymentId: `mock_stripe_${(0, uuid_1.v4)()}` },
        });
        res.json(payment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});
exports.confirmPayment = confirmPayment;
