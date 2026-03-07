'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Calendar, Hotel, Plane, Activity, Plus, Trash2, Navigation as NavigationIcon, Edit2 } from 'lucide-react';

interface Booking {
    id: string;
    price: number;
    [key: string]: any;
}

interface TripStop {
    id: string;
    cityName: string;
    arrivalDate: string;
    departureDate: string;
    orderIndex: number;
    hotelBooking?: Booking | null;
    transportBooking?: Booking | null;
    activities: Booking[];
}

interface Trip {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    stops: TripStop[];
}

export default function TripDetails() {
    const { id } = useParams();
    const { isAuthenticated, isLoading, token } = useAuth();
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);

    // Form states for new stop
    const [showAddStop, setShowAddStop] = useState(false);
    const [cityName, setCityName] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [departureDate, setDepartureDate] = useState('');

    // Form states for editing trip
    const [showEditTrip, setShowEditTrip] = useState(false);
    const [editModeData, setEditModeData] = useState<{ title: string, description: string, startDate: string, endDate: string } | null>(null);

    const openEditTrip = () => {
        if (trip) {
            setEditModeData({
                title: trip.title,
                description: trip.description || '',
                startDate: new Date(trip.startDate).toISOString().slice(0, 10),
                endDate: new Date(trip.endDate).toISOString().slice(0, 10),
            });
            setShowEditTrip(true);
        }
    };

    const handleEditTrip = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/trips/${id}`, editModeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowEditTrip(false);
            fetchTrip();
        } catch (err) {
            alert('Failed to update trip');
        }
    };

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    const fetchTrip = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTrip(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && id) {
            fetchTrip();
        }
    }, [isAuthenticated, id]);

    const handleAddStop = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/trips/${id}/stops`, {
                cityName,
                arrivalDate,
                departureDate,
                orderIndex: trip?.stops.length || 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowAddStop(false);
            setCityName(''); setArrivalDate(''); setDepartureDate('');
            fetchTrip();
        } catch (err) {
            alert('Failed to add stop');
        }
    };

    const deleteStop = async (stopId: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/trips/stops/${stopId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTrip();
        } catch (err) {
            alert('Failed to delete stop');
        }
    };

    const handleCheckout = () => {
        router.push(`/checkout/${id}`);
    };

    if (isLoading || loading) return <div className="p-10 text-center">Loading...</div>;
    if (!trip) return <div className="p-10 text-center">Trip not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navigation />

            {/* Header */}
            <div className="bg-white shadow border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
                                <button onClick={openEditTrip} className="text-gray-400 hover:text-blue-600 transition">
                                    <Edit2 className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="mt-2 text-gray-600">{trip.description}</p>
                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                                {new Date(trip.startDate).toLocaleDateString()} to {new Date(trip.endDate).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => router.push(`/trips/${id}/track`)} className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 px-6 py-2 rounded-lg font-medium transition flex items-center shadow-sm">
                                <NavigationIcon className="h-4 w-4 mr-2" /> Track Trip
                            </button>
                            <button onClick={handleCheckout} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition">
                                Checkout Trip
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Itinerary Timeline */}
                <div className="space-y-8">
                    {trip.stops.map((stop, index) => (
                        <div key={stop.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex justify-between items-center">
                                <div className="flex items-center">
                                    <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold mr-4">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{stop.cityName}</h3>
                                        <p className="text-sm text-blue-600 font-medium">
                                            {new Date(stop.arrivalDate).toLocaleDateString()} - {new Date(stop.departureDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => deleteStop(stop.id)} className="text-gray-400 hover:text-red-500 transition">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Hotel Card */}
                                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 relative group hover:border-blue-300 transition cursor-pointer" onClick={() => router.push(`/trips/${id}/stops/${stop.id}/hotel`)}>
                                    <div className="flex items-center mb-3 text-indigo-600">
                                        <Hotel className="h-5 w-5 mr-2" />
                                        <h4 className="font-semibold">Hotel</h4>
                                    </div>
                                    {stop.hotelBooking ? (
                                        <div>
                                            <p className="font-medium text-gray-900">{stop.hotelBooking.hotelName}</p>
                                            <p className="text-sm text-gray-500">${stop.hotelBooking.price}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No hotel booked</p>
                                    )}
                                    <div className="mt-3 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition">
                                        {stop.hotelBooking ? 'Edit Booking →' : 'Book Hotel →'}
                                    </div>
                                </div>

                                {/* Transport Card */}
                                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 relative group hover:border-blue-300 transition cursor-pointer" onClick={() => router.push(`/trips/${id}/stops/${stop.id}/transport`)}>
                                    <div className="flex items-center mb-3 text-teal-600">
                                        <Plane className="h-5 w-5 mr-2" />
                                        <h4 className="font-semibold">Transport</h4>
                                    </div>
                                    {stop.transportBooking ? (
                                        <div>
                                            <p className="font-medium text-gray-900">{stop.transportBooking.provider}</p>
                                            <p className="text-sm text-gray-500">${stop.transportBooking.price}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No transport booked</p>
                                    )}
                                    <div className="mt-3 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition">
                                        {stop.transportBooking ? 'Edit Transport →' : 'Book Transport →'}
                                    </div>
                                </div>

                                {/* Activities Card */}
                                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 relative group hover:border-blue-300 transition cursor-pointer" onClick={() => router.push(`/trips/${id}/stops/${stop.id}/activities`)}>
                                    <div className="flex items-center mb-3 text-orange-600">
                                        <Activity className="h-5 w-5 mr-2" />
                                        <h4 className="font-semibold">Activities</h4>
                                    </div>
                                    {stop.activities && stop.activities.length > 0 ? (
                                        <div>
                                            <p className="font-medium text-gray-900">{stop.activities.length} activities planned</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No activities planned</p>
                                    )}
                                    <div className="mt-3 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition">
                                        Add Activities →
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Add Stop Button / Form */}
                    {showAddStop ? (
                        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
                            <h3 className="text-lg font-bold mb-4">Add Next Destination</h3>
                            <form onSubmit={handleAddStop} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
                                    <input type="text" required value={cityName} onChange={(e) => setCityName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 lg:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Arrival Date</label>
                                    <input type="date" required value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 lg:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
                                    <input type="date" required value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 lg:text-sm" />
                                </div>
                                <div className="col-span-1 md:col-span-4 flex justify-end gap-3 mt-2">
                                    <button type="button" onClick={() => setShowAddStop(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700">
                                        Add Destination
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <button onClick={() => setShowAddStop(true)} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 flex justify-center items-center font-medium transition cursor-pointer bg-gray-50 hover:bg-blue-50">
                            <Plus className="h-5 w-5 mr-2" />
                            Add Next Destination
                        </button>
                    )}
                </div>
            </main>

            {/* Edit Trip Modal */}
            {showEditTrip && editModeData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">Edit Trip Details</h3>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleEditTrip} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Title</label>
                                    <input type="text" required value={editModeData.title} onChange={(e) => setEditModeData({ ...editModeData, title: e.target.value })}
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                    <textarea value={editModeData.description} onChange={(e) => setEditModeData({ ...editModeData, description: e.target.value })} rows={3}
                                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                        <input type="date" required value={editModeData.startDate} onChange={(e) => setEditModeData({ ...editModeData, startDate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                        <input type="date" required value={editModeData.endDate} onChange={(e) => setEditModeData({ ...editModeData, endDate: e.target.value })}
                                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-4 border-t border-gray-100">
                                    <button type="button" onClick={() => setShowEditTrip(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 border border-transparent">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
