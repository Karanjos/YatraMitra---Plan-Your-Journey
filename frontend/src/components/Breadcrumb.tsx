'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import React from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/config';

export default function Breadcrumb() {
    const pathname = usePathname();
    const router = useRouter();
    const { token } = useAuth();

    const [breadcrumbs, setBreadcrumbs] = React.useState<{ name: string; href: string; isClickable: boolean }[]>([]);
    const [tripName, setTripName] = React.useState<string>('');

    React.useEffect(() => {
        if (!pathname || pathname === '/' || pathname === '/dashboard') {
            setBreadcrumbs([]);
            return;
        }

        const pathWithoutQuery = pathname.split('?')[0];
        const pathSegments = pathWithoutQuery.split('/').filter((v) => v.length > 0);

        const validBreadcrumbs: { name: string; href: string; isClickable: boolean }[] = [];

        let currentHref = '';
        for (let i = 0; i < pathSegments.length; i++) {
            const segment = pathSegments[i];
            currentHref += '/' + segment;

            const isId = segment.length > 20 || /^[0-9a-fA-F]{24}$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f]{4}/.test(segment);

            if (segment === 'trips') {
                validBreadcrumbs.push({ name: 'Trips', href: currentHref, isClickable: true });
            } else if (segment === 'stops') {
                // Ignore intermediate 'stops' routing segment visually
            } else if (isId) {
                const prev = i > 0 ? pathSegments[i - 1] : '';
                if (prev === 'trips') {
                    if (token && !tripName) {
                        axios.get(`${API_URL}/trips/${segment}`, { headers: { Authorization: `Bearer ${token}` } })
                            .then(res => setTripName(res.data.title))
                            .catch(console.error);
                    }

                    const idx = validBreadcrumbs.findIndex(b => b.name === 'Trips');
                    if (idx !== -1) {
                        validBreadcrumbs[idx].name = tripName || 'Trip Overview';
                        validBreadcrumbs[idx].href = currentHref;
                    }
                } else if (prev === 'checkout') {
                    const idx = validBreadcrumbs.findIndex(b => b.name === 'Checkout');
                    if (idx !== -1) {
                        validBreadcrumbs[idx].href = currentHref;
                        validBreadcrumbs[idx].isClickable = true;
                    }
                }
                // Ignore other IDs like stopId visually
            } else {
                const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
                const isClickable = segment !== 'checkout'; // Checkout root path doesn't exist without ID
                validBreadcrumbs.push({ name, href: currentHref, isClickable });
            }
        }

        setBreadcrumbs(validBreadcrumbs);
    }, [pathname, token, tripName]);

    if (breadcrumbs.length === 0) return null;

    return (
        <nav className="bg-gray-50 border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center" aria-label="Breadcrumb">
            <div className="flex items-center text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-blue-600 transition flex items-center">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Dashboard</span>
                </Link>

                {breadcrumbs.map((breadcrumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;

                    return (
                        <div key={breadcrumb.href} className="flex items-center">
                            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                            {isLast || !breadcrumb.isClickable ? (
                                <span className="font-medium text-gray-900" aria-current={isLast ? "page" : undefined}>
                                    {breadcrumb.name}
                                </span>
                            ) : (
                                <Link href={breadcrumb.href} className="hover:text-blue-600 transition">
                                    {breadcrumb.name}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
            <button
                onClick={() => router.back()}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded px-3 py-1.5 bg-white shadow-sm transition flex items-center"
            >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </button>
        </nav>
    );
}
