'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Activity, Star, MapPin, Clock, Check, Info, Trash2, Users, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MOCK_ACTIVITIES = [
    { id: 'a1', name: 'Guided City Tour & Museum Walk', provider: 'CityWalkers', duration: '3 Hours', rating: 4.9, price: 45, type: 'Culture', description: 'Explore the heart of the city with an expert guide. Includes skip-the-line museum entry and a complimentary audio device.', included: ['Guide', 'Museum Entry', 'Audio Headset'], location: 'City Center' },
    { id: 'a2', name: 'Sunset Kayaking Expedition', provider: 'AquaAdventures', duration: '2.5 Hours', rating: 4.7, price: 65, type: 'Outdoor', description: 'Paddle through calm waters and watch an incredible sunset. Ideal for beginners and families.', included: ['Kayak Rental', 'Life Jacket', 'Briefing'], location: 'West Bay Dock' },
    { id: 'a3', name: 'Local Culinary Tasting Experience', provider: 'TasteTour', duration: '4 Hours', rating: 4.8, price: 110, type: 'Food', description: 'Sample the best local dishes across 5 different highly-rated neighborhood eateries. Come hungry!', included: ['All Food', '2 Beverages', 'Local Guide'], location: 'Historic District' },
];

export default function ActivityBooking() {
    const { id, stopId } = useParams();
    const router = useRouter();
    const { token } = useAuth();

    const [selectedActivity, setSelectedActivity] = useState<typeof MOCK_ACTIVITIES[0] | null>(null);
    const [date, setDate] = useState('');
    const [guests, setGuests] = useState(1);
    const [existingActivities, setExistingActivities] = useState<any[]>([]);

    const fetchActivities = () => {
        if (id && token) {
            axios.get(`http://localhost:5000/api/trips/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(res => {
                const stop = res.data.stops.find((s: any) => s.id === stopId);
                if (stop?.activities) {
                    setExistingActivities(stop.activities);
                }
            }).catch(console.error);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [id, stopId, token]);

    const handleDelete = async (activityId: string) => {
        try {
            await axios.delete(`http://localhost:5000/api/bookings/activity/${activityId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchActivities(); // Refresh list after deletion
        } catch (err) {
            alert('Failed to delete activity');
        }
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedActivity) return;

        try {
            await axios.post('http://localhost:5000/api/bookings/activity', {
                tripStopId: stopId,
                name: selectedActivity.name,
                description: selectedActivity.description,
                date: date || new Date().toISOString().slice(0, 16),
                price: selectedActivity.price * guests, // price per guest
                guests
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedActivity(null);
            setDate('');
            setGuests(1);
            fetchActivities();
            // Optional: Don't push back right away to allow multiple bookings
            // router.push(`/trips/${id}`);
        } catch (err) {
            alert('Failed to add activity');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navigation />

            <main className="max-w-5xl mx-auto px-4 py-10">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <div className="p-3 bg-orange-100 rounded-full text-orange-600 inline-flex">
                                <Activity className="h-6 w-6" />
                            </div>
                            Available Activities
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">Enhance your trip with top-rated local experiences.</p>
                    </div>
                    <button onClick={() => router.push(`/trips/${id}`)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
                        Back to Trip
                    </button>
                </div>

                {existingActivities.length > 0 && (
                    <div className="mb-10 bg-orange-50/50 rounded-xl p-6 border border-orange-100">
                        <h2 className="text-lg font-bold text-orange-900 mb-4">Currently Booked for this Stop</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {existingActivities.map((act) => (
                                <div key={act.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">{act.name}</p>
                                        <p className="text-sm text-gray-500">{new Date(act.date).toLocaleDateString()} at {new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-sm text-orange-600 font-medium mt-1">{act.guests} Guests • ${act.price}</p>
                                    </div>
                                    <button onClick={() => handleDelete(act.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Activities List */}
                    <div className="space-y-6">
                        {MOCK_ACTIVITIES.map((activity) => (
                            <div
                                key={activity.id}
                                onClick={() => setSelectedActivity(activity)}
                                className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition transform hover:-translate-y-1 hover:shadow-md ${selectedActivity?.id === activity.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">{activity.type}</div>
                                        <h3 className="text-lg font-bold text-gray-900">{activity.name}</h3>
                                    </div>
                                    <div className="flex items-center text-yellow-500 bg-yellow-50 px-2 py-1 rounded text-sm font-medium">
                                        <Star className="h-4 w-4 mr-1 fill-current" />
                                        {activity.rating}
                                    </div>
                                </div>

                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                    <MapPin className="h-4 w-4 mr-1" /> {activity.location} &nbsp; • &nbsp;
                                    <Clock className="h-4 w-4 mx-1" /> {activity.duration}
                                </div>

                                <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {activity.description}
                                </div>

                                <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                                    <div>
                                        <span className="text-2xl font-bold text-orange-600">${activity.price}</span>
                                        <span className="text-gray-500 text-sm"> / person</span>
                                    </div>
                                    <div className={`font-medium text-sm flex items-center ${selectedActivity?.id === activity.id ? 'text-orange-600' : 'text-gray-400'}`}>
                                        {selectedActivity?.id === activity.id ? <><Check className="h-4 w-4 mr-1" /> Selected</> : 'Select Activity'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Booking Form Sidebar */}
                    <div>
                        <div className="bg-white rounded-xl shadow border border-gray-200 p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Activity</h2>

                            {!selectedActivity ? (
                                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                    Please select an experience from the list to continue.
                                </div>
                            ) : (
                                <form onSubmit={handleBook} className="space-y-6">
                                    <div className="bg-orange-50 text-orange-900 p-5 rounded-lg border border-orange-100 mb-6">
                                        <p className="font-bold text-lg mb-1">{selectedActivity.name}</p>
                                        <p className="text-sm opacity-80 mb-4">Provided by {selectedActivity.provider}</p>

                                        <div className="text-sm space-y-2 border-t border-orange-200/50 pt-3">
                                            <div className="flex items-start">
                                                <Info className="h-4 w-4 mr-2 mt-0.5 opacity-70" />
                                                <span>{selectedActivity.description}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium">Includes: </span>
                                                {selectedActivity.included.join(", ")}
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
                                                <input type="number" min="1" required value={guests} onChange={(e) => setGuests(parseInt(e.target.value))}
                                                    className="pl-10 block w-full border border-gray-300 rounded-md py-3 px-3 focus:ring-orange-500 text-sm text-gray-900" />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-700">Select Date & Time</label>
                                            <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)}
                                                className="mt-1 w-full border border-gray-300 rounded-md py-3 px-3 focus:ring-orange-500 text-sm text-gray-900" />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center py-3 border-t border-b border-gray-100">
                                        <span className="font-medium text-gray-700">Total Price ({guests} Guests)</span>
                                        <span className="text-xl font-bold text-gray-900">${selectedActivity.price * guests}</span>
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        <button type="button" onClick={() => setSelectedActivity(null)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition">
                                            Cancel
                                        </button>
                                        <button type="submit" className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition shadow-sm flex items-center justify-center">
                                            <Plus className="h-4 w-4 mr-2" /> Add Experience
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
