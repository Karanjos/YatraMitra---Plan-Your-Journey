'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { MapPin, Calendar, Clock, Navigation as NavIcon, CheckCircle, Circle } from 'lucide-react';

interface TripStop {
    id: string;
    cityName: string;
    arrivalDate: string;
    departureDate: string;
    orderIndex: number;
}

interface Trip {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    stops: TripStop[];
}

export default function TripTracking() {
    const { id } = useParams();
    const { isAuthenticated, isLoading, token } = useAuth();
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);

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
            // Sort stops by arrival date to ensure chronological order along the timeline
            const fetchedTrip = res.data;
            fetchedTrip.stops = fetchedTrip.stops.sort((a: TripStop, b: TripStop) =>
                new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime()
            );
            setTrip(fetchedTrip);
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

    if (isLoading || loading) return <div className="p-10 text-center">Loading Tracking Info...</div>;
    if (!trip) return <div className="p-10 text-center">Trip not found</div>;

    const today = new Date();
    // Normalize today for accurate date-only comparisons (ignoring time)
    today.setHours(0, 0, 0, 0);

    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    tripStart.setHours(0, 0, 0, 0);
    tripEnd.setHours(0, 0, 0, 0);

    let tripStatus = 'Upcoming';
    let statusColor = 'text-blue-600';
    let statusBg = 'bg-blue-100';

    if (today > tripEnd) {
        tripStatus = 'Completed';
        statusColor = 'text-green-600';
        statusBg = 'bg-green-100';
    } else if (today >= tripStart && today <= tripEnd) {
        tripStatus = 'Active';
        statusColor = 'text-yellow-600';
        statusBg = 'bg-yellow-100';
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navigation />

            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-gray-900">Track: {trip.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBg} ${statusColor}`}>
                                    {tripStatus}
                                </span>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 mr-1.5 text-blue-500" />
                                    {tripStart.toLocaleDateString()} to {tripEnd.toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-1.5 text-blue-500" />
                                    {trip.stops.length} Stops
                                </div>
                            </div>
                        </div>
                        <button onClick={() => router.push(`/trips/${id}`)} className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition border border-blue-200">
                            Back to Itinerary
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center">
                        <NavIcon className="h-6 w-6 mr-2 text-indigo-600" /> Journey Navigations
                    </h2>

                    <div className="relative border-l-2 border-dashed border-gray-300 ml-3 md:ml-6 space-y-10">
                        {trip.stops.map((stop, index) => {
                            const arrival = new Date(stop.arrivalDate);
                            const departure = new Date(stop.departureDate);
                            arrival.setHours(0, 0, 0, 0);
                            departure.setHours(0, 0, 0, 0);

                            let stopStatus = 'Upcoming';
                            let Icon = Circle;
                            let iconColor = 'text-gray-300';

                            if (today > departure) {
                                stopStatus = 'Completed';
                                Icon = CheckCircle;
                                iconColor = 'text-green-500';
                            } else if (today >= arrival && today <= departure) {
                                stopStatus = 'Current Location';
                                Icon = MapPin;
                                iconColor = 'text-indigo-600 fill-indigo-100';
                            }

                            return (
                                <div key={stop.id} className="relative pl-8 md:pl-10">
                                    {/* Timeline Marker */}
                                    <div className="absolute -left-[17px] bg-white rounded-full">
                                        <Icon className={`h-8 w-8 ${iconColor}`} />
                                    </div>

                                    <div className={`p-5 rounded-lg border ${stopStatus === 'Current Location' ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: iconColor.replace('text-', '').split(' ')[0] }}>
                                                    {stopStatus}
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900">{stop.cityName}</h3>
                                            </div>
                                            <div className="text-sm bg-white border border-gray-200 px-3 py-2 rounded-md shadow-sm">
                                                <div className="flex items-center text-gray-700 font-medium mb-1">
                                                    <Clock className="h-4 w-4 mr-1.5 text-gray-400" /> Arrival
                                                </div>
                                                <div className="text-gray-600">{arrival.toLocaleDateString()}</div>

                                                <div className="w-full border-t border-gray-100 my-2"></div>

                                                <div className="flex items-center text-gray-700 font-medium mb-1">
                                                    <NavIcon className="h-4 w-4 mr-1.5 text-gray-400" /> Departure
                                                </div>
                                                <div className="text-gray-600">{departure.toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* End of Journey marker */}
                        <div className="relative pl-8 md:pl-10 pb-4">
                            <div className="absolute -left-[11px] bg-white rounded-full border-4 border-gray-100">
                                <MapPin className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-gray-500 font-medium">End of Trip Details</div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
