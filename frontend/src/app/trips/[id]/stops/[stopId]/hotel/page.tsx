'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Hotel, Star, MapPin, Check, Info, Trash2, Edit2, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/config';

const MOCK_HOTELS = [
    { id: 'h1', name: 'Grand Plaza Hotel', address: '123 Central Ave, Downtown', rating: 4.8, price: 250, amenities: ['Pool', 'Spa', 'Free WiFi'], description: 'A luxury 5-star hotel in the heart of downtown. Enjoy panoramic city views from our rooftop terrace.', roomType: 'Deluxe King Suite', cancellationPolicy: 'Free cancellation up to 48 hours before check-in.' },
    { id: 'h2', name: 'Sunset Resort & Suites', address: '45 Beachfront Drive', rating: 4.5, price: 180, amenities: ['Beach Access', 'Breakfast Included'], description: 'Relaxing beachfront property featuring a private beach and oceanfront balcony rooms.', roomType: 'Oceanview Double', cancellationPolicy: 'Non-refundable.' },
    { id: 'h3', name: 'Metro Inn Budget', address: '89 Station Road', rating: 3.9, price: 85, amenities: ['Free Parking', 'WiFi'], description: 'Affordable, clean, and conveniently located right next to the central train station for easy commuting.', roomType: 'Standard Twin Room', cancellationPolicy: 'Free cancellation up to 24 hours before check-in.' },
];

export default function HotelBooking() {
    const { id, stopId } = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const [selectedHotel, setSelectedHotel] = useState<typeof MOCK_HOTELS[0] | null>(null);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [existingBooking, setExistingBooking] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (id && token) {
            axios.get(`${API_URL}/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                const stop = res.data.stops.find((s: any) => s.id === stopId);
                if (stop?.hotelBooking) {
                    setExistingBooking(stop.hotelBooking);
                    setCheckIn(new Date(stop.hotelBooking.checkIn).toISOString().slice(0, 10));
                    setCheckOut(new Date(stop.hotelBooking.checkOut).toISOString().slice(0, 10));
                    setGuests(stop.hotelBooking.guests || 1);
                    const hotelMatch = MOCK_HOTELS.find(h => h.name === stop.hotelBooking.hotelName);
                    if (hotelMatch) setSelectedHotel(hotelMatch);
                }
            }).catch(console.error);
        }
    }, [id, stopId, token]);

    const handleDelete = async () => {
        if (!existingBooking) return;
        try {
            await axios.delete(`${API_URL}/bookings/hotel/${existingBooking.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push(`/trips/${id}`);
        } catch (err) {
            alert('Failed to delete booking');
        }
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHotel) return;

        try {
            const data = {
                tripStopId: stopId,
                hotelName: selectedHotel.name,
                address: selectedHotel.address,
                checkIn,
                checkOut,
                price: selectedHotel.price * guests, // total price based on guests
                guests
            };

            if (isEditing && existingBooking) {
                await axios.put(`${API_URL}/bookings/hotel/${existingBooking.id}`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/bookings/hotel`, data, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            router.push(`/trips/${id}`);
        } catch (err) {
            alert('Failed to book hotel');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navigation />

            <main className="max-w-4xl mx-auto px-4 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600 inline-flex">
                            <Hotel className="h-6 w-6" />
                        </div>
                        Available Hotels
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg">Select a place to stay for this destination.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Hotel List */}
                    <div className="space-y-4">
                        {MOCK_HOTELS.map((hotel) => (
                            <div
                                key={hotel.id}
                                onClick={() => {
                                    setSelectedHotel(hotel);
                                    if (existingBooking && hotel.name !== existingBooking.hotelName) {
                                        setIsEditing(true);
                                    }
                                }}
                                className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-md ${selectedHotel?.id === hotel.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-bold text-gray-900">{hotel.name}</h3>
                                    <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded text-sm font-medium">
                                        <Star className="h-4 w-4 mr-1 fill-current" />
                                        {hotel.rating}
                                    </div>
                                </div>
                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {hotel.address}
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {hotel.amenities.map(am => (
                                        <span key={am} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{am}</span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                    <div>
                                        <span className="text-2xl font-bold text-indigo-600">${hotel.price}</span>
                                        <span className="text-gray-500 text-sm"> / night</span>
                                    </div>
                                    <div className={`font-medium text-sm flex items-center ${selectedHotel?.id === hotel.id ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        {selectedHotel?.id === hotel.id ? <><Check className="h-4 w-4 mr-1" /> Selected</> : 'Select'}
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
                                        <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {!selectedHotel ? (
                                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    Please select a hotel from the list to continue.
                                </div>
                            ) : (
                                <form onSubmit={handleBook} className="space-y-6">
                                    <div className="bg-indigo-50 text-indigo-800 p-5 rounded-lg border border-indigo-100 mb-6">
                                        <p className="font-bold text-lg mb-1">{selectedHotel.name}</p>
                                        <p className="text-sm opacity-80 mb-4">{selectedHotel.roomType}</p>

                                        <div className="text-sm space-y-3 border-t border-indigo-200/50 pt-3">
                                            <div className="flex items-start">
                                                <Info className="h-4 w-4 mr-2 mt-0.5 opacity-70" />
                                                <span className="text-indigo-900 leading-relaxed">{selectedHotel.description}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-indigo-900 block mb-1">Cancellation Policy:</span>
                                                <span className="text-indigo-800/80">{selectedHotel.cancellationPolicy}</span>
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
                                                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 text-sm text-gray-900" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Check In Date</label>
                                            <input type="date" required disabled={!isEditing && existingBooking} value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 text-sm text-gray-900" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Check Out Date</label>
                                            <input type="date" required disabled={!isEditing && existingBooking} value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-indigo-500 text-sm text-gray-900" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-t border-b border-gray-100">
                                        <span className="font-medium text-gray-700">Total Price ({guests} Guests)</span>
                                        <span className="text-xl font-bold text-gray-900">${selectedHotel.price * guests}</span>
                                    </div>

                                    {(!existingBooking || isEditing) && (
                                        <div className="flex gap-4 pt-4 border-t">
                                            <button type="button" onClick={() => isEditing ? setIsEditing(false) : router.back()} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition">
                                                Cancel
                                            </button>
                                            <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
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
