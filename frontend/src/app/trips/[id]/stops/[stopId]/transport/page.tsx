'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Plane, Star, Clock, Check, Info, Briefcase, Trash2, Edit2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MOCK_FLIGHTS = [
    { id: 'f1', provider: 'AirFrance', departureTime: '08:00', arrivalTime: '10:30', duration: '2h 30m', rating: 4.6, price: 150, type: 'Flight', class: 'Economy', baggage: '1 Cabin Bag, 1 Checked Bag (23kg)', boardingGate: 'G12', description: 'Direct flight with standard economy seating and complimentary snacks.' },
    { id: 'f2', provider: 'EuroRail Fast', departureTime: '09:15', arrivalTime: '12:45', duration: '3h 30m', rating: 4.8, price: 95, type: 'Train', class: 'First Class', baggage: 'Unlimited', boardingGate: 'Platform 3', description: 'High-speed rail journey with spacious seating, free Wi-Fi, and a dining car.' },
    { id: 'f3', provider: 'BudgetAir', departureTime: '14:00', arrivalTime: '16:45', duration: '2h 45m', rating: 3.5, price: 65, type: 'Flight', class: 'Economy Basic', baggage: '1 Personal Item Only', boardingGate: 'TBD', description: 'Low-cost carrier. Baggage and seat selection cost extra.' },
];

export default function TransportBooking() {
    const { id, stopId } = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const [selectedTransport, setSelectedTransport] = useState<typeof MOCK_FLIGHTS[0] | null>(null);
    const [departure, setDeparture] = useState('');
    const [arrival, setArrival] = useState('');
    const [guests, setGuests] = useState(1);
    const [existingBooking, setExistingBooking] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id && token) {
            axios.get(`http://localhost:5000/api/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                const stop = res.data.stops.find((s: any) => s.id === stopId);
                if (stop?.transportBooking) {
                    setExistingBooking(stop.transportBooking);
                    setDeparture(new Date(stop.transportBooking.departure).toISOString().slice(0, 16));
                    setArrival(new Date(stop.transportBooking.arrival).toISOString().slice(0, 16));
                    setGuests(stop.transportBooking.guests || 1);
                    const transportMatch = MOCK_FLIGHTS.find(t => t.provider === stop.transportBooking.provider);
                    if (transportMatch) setSelectedTransport(transportMatch);
                }
            }).catch(console.error);
        }
    }, [id, stopId, token]);

    const handleDelete = async () => {
        if (!existingBooking) return;
        try {
            await axios.delete(`http://localhost:5000/api/bookings/transport/${existingBooking.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push(`/trips/${id}`);
        } catch (err) {
            alert('Failed to delete transport');
        }
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTransport) return;

        try {
            const data = {
                tripStopId: stopId,
                type: selectedTransport.type,
                provider: selectedTransport.provider,
                departure: departure || new Date().toISOString().slice(0, 16),
                arrival: arrival || new Date().toISOString().slice(0, 16),
                price: selectedTransport.price * guests, // price per guest
                guests
            };

            if (isEditing && existingBooking) {
                await axios.put(`http://localhost:5000/api/bookings/transport/${existingBooking.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:5000/api/bookings/transport', data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            router.push(`/trips/${id}`);
        } catch (err) {
            alert('Failed to book transport');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-3 bg-teal-100 rounded-full text-teal-600 inline-flex">
                            <Plane className="h-6 w-6" />
                        </div>
                        Available Transport
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Select flights, trains, or buses for this journey.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Transport List */}
                    <div className="space-y-4">
                        {MOCK_FLIGHTS.map((transport) => (
                            <div
                                key={transport.id}
                                onClick={() => {
                                    setSelectedTransport(transport);
                                    if (existingBooking && transport.provider !== existingBooking.provider) {
                                        setIsEditing(true);
                                    }
                                }}
                                className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-md ${selectedTransport?.id === transport.id ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{transport.type}</div>
                                        <h3 className="text-lg font-bold text-gray-900">{transport.provider}</h3>
                                    </div>
                                    <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded text-sm font-medium">
                                        <Star className="h-4 w-4 mr-1 fill-current" />
                                        {transport.rating}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">{transport.departureTime}</div>
                                        <div className="text-xs text-gray-500">Depart</div>
                                    </div>
                                    <div className="flex flex-col items-center flex-1 px-4">
                                        <div className="text-xs text-gray-400 mb-1 flex items-center"><Clock className="h-3 w-3 mr-1" /> {transport.duration}</div>
                                        <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-1 text-gray-400">
                                                <Plane className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">{transport.arrivalTime}</div>
                                        <div className="text-xs text-gray-500">Arrive</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-2xl font-bold text-teal-600">${transport.price}</span>
                                    </div>
                                    <div className={`font-medium text-sm flex items-center ${selectedTransport?.id === transport.id ? 'text-teal-600' : 'text-gray-400'}`}>
                                        {selectedTransport?.id === transport.id ? <><Check className="h-4 w-4 mr-1" /> Selected</> : 'Select'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Booking Form Sidebar */}
                    <div>
                        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 sticky top-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {isEditing ? 'Edit Booking' : (existingBooking && !isEditing ? 'Current Booking' : 'Confirm Booking')}
                                </h2>
                                {existingBooking && !isEditing && (
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsEditing(true)} className="p-2 text-teal-600 hover:bg-teal-50 rounded-full transition">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!selectedTransport ? (
                                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    Please select transport from the list to continue.
                                </div>
                            ) : (
                                <form onSubmit={handleBook} className="space-y-6">
                                    <div className="bg-teal-50 text-teal-800 p-5 rounded-lg border border-teal-100 mb-6">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-bold text-lg">{selectedTransport.provider}</p>
                                            <span className="text-sm font-semibold bg-teal-200/50 px-2 py-0.5 rounded">{selectedTransport.class}</span>
                                        </div>
                                        <p className="text-sm opacity-80 mb-4">{selectedTransport.type} • {selectedTransport.duration}</p>

                                        <div className="text-sm space-y-3 border-t border-teal-200/50 pt-3">
                                            <div className="flex items-start">
                                                <Info className="h-4 w-4 mr-2 mt-0.5 opacity-70" />
                                                <span className="text-teal-900 leading-relaxed">{selectedTransport.description}</span>
                                            </div>
                                            <div className="flex items-start">
                                                <Briefcase className="h-4 w-4 mr-2 mt-0.5 opacity-70" />
                                                <span className="text-teal-900 leading-relaxed">{selectedTransport.baggage}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-teal-900 block mb-1">Boarding Info:</span>
                                                <span className="text-teal-800/80">{selectedTransport.boardingGate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Guests</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <input type="number" min="1" required disabled={!isEditing && existingBooking} value={guests} onChange={(e) => setGuests(parseInt(e.target.value))}
                                                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-teal-500 text-sm text-gray-900" />
                                            </div>
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700">Departure Time</label>
                                            <input type="datetime-local" required disabled={!isEditing && existingBooking} value={departure} onChange={(e) => setDeparture(e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-teal-500 text-sm text-gray-900" />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="block text-sm font-medium text-gray-700">Arrival Time</label>
                                            <input type="datetime-local" required disabled={!isEditing && existingBooking} value={arrival} onChange={(e) => setArrival(e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-teal-500 text-sm text-gray-900" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-t border-b border-gray-100 mt-6">
                                        <span className="font-medium text-gray-700">Total Price ({guests} Guests)</span>
                                        <span className="text-xl font-bold text-gray-900">${selectedTransport.price * guests}</span>
                                    </div>

                                    {(!existingBooking || isEditing) && (
                                        <div className="flex gap-4 pt-4 border-t">
                                            <button type="button" onClick={() => isEditing ? setIsEditing(false) : router.back()} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition">
                                                Cancel
                                            </button>
                                            <button type="submit" className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition shadow-sm">
                                                {isEditing ? 'Save Changes' : 'Book Now'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
