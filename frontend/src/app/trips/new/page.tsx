'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/config';

export default function NewTrip() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();
    const { isAuthenticated, isLoading, token } = useAuth();

    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) {
        router.push('/login');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/trips`, {
                title,
                description,
                startDate,
                endDate
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            router.push(`/trips/${res.data.id}`);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create trip');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-6">Plan a New Trip</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="text-red-600 bg-red-50 p-3 rounded">{error}</div>}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Trip Title</label>
                                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="e.g. Summer in Europe" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                                    <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Create Trip & Add Destinations
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
