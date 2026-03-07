'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { CreditCard, CheckCircle, ShieldCheck } from 'lucide-react';

export default function Checkout() {
    const { tripId } = useParams();
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [trip, setTrip] = useState<any>(null);
    const [total, setTotal] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isAuthenticated && tripId) {
            axios.get(`http://localhost:5000/api/trips/${tripId}`)
                .then(res => {
                    setTrip(res.data);
                    let sum = 0;
                    res.data.stops.forEach((stop: any) => {
                        if (stop.hotelBooking && stop.hotelBooking.status === 'PENDING') {
                            sum += stop.hotelBooking.price;
                        }
                        if (stop.transportBooking && stop.transportBooking.status === 'PENDING') {
                            sum += stop.transportBooking.price;
                        }
                        if (stop.activities) {
                            stop.activities.forEach((act: any) => {
                                if (act.status === 'PENDING') {
                                    sum += act.price;
                                }
                            });
                        }
                    });
                    setTotal(sum);
                })
                .catch(console.error);
        }
    }, [isAuthenticated, tripId]);

    const handleCheckout = async () => {
        setProcessing(true);
        try {
            // 1. Create Payment
            const paymentRes = await axios.post('http://localhost:5000/api/payments/create', {
                amount: total,
                currency: 'USD'
            });

            // 2. Confirm Payment and mark PENDING bookings as CONFIRMED
            await axios.post('http://localhost:5000/api/payments/confirm', {
                paymentId: paymentRes.data.payment.id,
                tripId: tripId // We added this in the backend early on
            });

            setSuccess(true);
            setProcessing(false);
        } catch (err) {
            alert('Payment failed');
            setProcessing(false);
        }
    };

    if (!trip) return <div className="p-10 text-center">Loading...</div>;

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navigation />
                <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
                    <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        Your entire trip "{trip.title}" has been booked and confirmed. Get ready for an amazing adventure!
                    </p>
                    <button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-sm transition">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-10">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-800 text-white px-8 py-6">
                        <h1 className="text-2xl font-bold">Checkout: {trip.title}</h1>
                        <p className="text-gray-300 mt-1">Review your multi-destination bookings</p>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Order Summary</h2>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {trip.stops.map((stop: any, idx: number) => (
                                    <div key={stop.id} className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-bold text-gray-900 mb-2">Stop {idx + 1}: {stop.cityName}</h3>

                                        {stop.hotelBooking && stop.hotelBooking.status === 'PENDING' && (
                                            <div className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0 pb-2 mb-2">
                                                <span className="text-gray-600">Hotel: {stop.hotelBooking.hotelName} ({stop.hotelBooking.guests} Guests)</span>
                                                <span className="font-medium">${stop.hotelBooking.price.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {stop.transportBooking && stop.transportBooking.status === 'PENDING' && (
                                            <div className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0 pb-2 mb-2">
                                                <span className="text-gray-600">Transport: {stop.transportBooking.provider} ({stop.transportBooking.guests} Guests)</span>
                                                <span className="font-medium">${stop.transportBooking.price.toFixed(2)}</span>
                                            </div>
                                        )}

                                        {stop.activities?.filter((act: any) => act.status === 'PENDING').map((act: any) => (
                                            <div key={act.id} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0 pb-2 mb-2">
                                                <span className="text-gray-600">Activity: {act.name} ({act.guests} Guests)</span>
                                                <span className="font-medium">${act.price.toFixed(2)}</span>
                                            </div>
                                        ))}

                                        {(!stop.hotelBooking || stop.hotelBooking.status !== 'PENDING') &&
                                            (!stop.transportBooking || stop.transportBooking.status !== 'PENDING') &&
                                            (!stop.activities || !stop.activities.some((act: any) => act.status === 'PENDING')) && (
                                                <p className="text-sm text-gray-400 italic">No unpaid bookings for this destination.</p>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Info</h2>

                                <div className="flex justify-between items-center mb-6 text-xl">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-bold text-gray-900">${total.toFixed(2)} USD</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 p-3 rounded text-blue-800">
                                        <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                        This is a mock checkout flow. No real credit card is required. Just click to simulate payment.
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={processing || total === 0}
                                        className={`w-full flex justify-center items-center py-4 rounded-lg font-bold text-lg shadow-sm transition
                      ${total === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    >
                                        <CreditCard className="mr-2 h-6 w-6" />
                                        {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                                    </button>
                                    {total === 0 && <p className="text-center text-sm text-red-500 mt-2">Add bookings to your trip before checking out.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
