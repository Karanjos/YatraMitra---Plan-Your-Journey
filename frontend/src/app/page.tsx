'use client';

import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Map, Plane, Hotel, Compass, ArrowRight } from 'lucide-react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navigation />

      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden flex-1 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto flex-1 w-full">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 flex flex-col justify-center h-full pt-10 sm:pt-16 lg:pt-24 px-4 sm:px-6 lg:px-8">
            <main className="mx-auto max-w-7xl text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Plan the ultimate</span>{' '}
                <span className="block text-blue-600 xl:inline">multi-city adventure</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Design complex itineraries effortlessly. Combine multiple destinations, hotels, flights, and activities into a single unified booking experience.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link href={isAuthenticated ? "/dashboard" : "/register"} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition transform hover:-translate-y-1">
                    Start Planning
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </div>
                {!isAuthenticated && (
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition">
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 bg-blue-50">
          <div className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center relative shadow-inner overflow-hidden">
            {/* Decorative abstract shapes */}
            <div className="absolute top-10 left-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 opacity-20 rounded-full blur-3xl"></div>
            <Compass className="text-white opacity-90 h-48 w-48 drop-shadow-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">All-in-One Platform</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to travel
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6 relative">
                  <Map className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 bg-blue-400 opacity-20 blur-md rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Destination Routing</h3>
                <p className="text-gray-500">Add unlimited stops to your itinerary. Organize your entire journey visually.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6 relative">
                  <Hotel className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 bg-indigo-400 opacity-20 blur-md rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Stays & Transport</h3>
                <p className="text-gray-500">Book hotels, flights, trains, and rental cars seamlessly for each leg of the trip.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6 relative">
                  <Plane className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 bg-green-400 opacity-20 blur-md rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Unified Checkout</h3>
                <p className="text-gray-500">Pay for your entire multi-city itinerary in one simple, secure transaction.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
