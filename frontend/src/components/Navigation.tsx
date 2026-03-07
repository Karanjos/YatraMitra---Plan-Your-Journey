'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Plane, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Breadcrumb from './Breadcrumb';

export default function Navigation() {
    const { user, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                                <Plane className="h-8 w-8 text-blue-600" />
                                <span className="font-bold text-xl text-gray-900">TravelHub</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            {isAuthenticated ? (
                                <>
                                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                                        <User className="h-5 w-5 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">{user?.firstName}</span>
                                        <button
                                            onClick={handleLogout}
                                            className="ml-4 p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                                        Login
                                    </Link>
                                    <Link href="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <Breadcrumb />
        </>
    );
}
