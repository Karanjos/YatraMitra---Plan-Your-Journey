'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Plus, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { API_URL } from '@/lib/config';

interface Trip {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
}

export default function Dashboard() {
    const { isAuthenticated, isLoading, token } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        if (isAuthenticated) {
            axios.get(`${API_URL}/trips`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setTrips(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [isAuthenticated]);

    if (isLoading || loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your multi-destination itineraries.</p>
                    </div>
                    <Link
                        href="/trips/new"
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="h-5 w-5" />
                        Plan New Trip
                    </Link>
                </div>

                {trips.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No trips planned yet</h3>
                        <p className="mt-1 text-gray-500">Get started by creating a new itinerary.</p>
                        <div className="mt-6">
                            <Link
                                href="/trips/new"
                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
                            >
                                <Plus className="h-4 w-4" />
                                Create Trip
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {trips.map(trip => (
                            <Link key={trip.id} href={`/trips/${trip.id}`} className="block group">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                                    <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500 relative">
                                        <div className="absolute inset-0 bg-black bg-opacity-20 transition group-hover:bg-opacity-10" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{trip.title}</h3>
                                        {trip.description && <p className="text-sm text-gray-500 mb-4 line-clamp-2">{trip.description}</p>}
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
