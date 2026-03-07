'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import React from 'react';

export default function Breadcrumb() {
    const pathname = usePathname();
    const [breadcrumbs, setBreadcrumbs] = React.useState<{ name: string; href: string }[]>([]);

    React.useEffect(() => {
        if (!pathname || pathname === '/') {
            setBreadcrumbs([]);
            return;
        }

        const pathWithoutQuery = pathname.split('?')[0];
        const pathSegments = pathWithoutQuery.split('/').filter((v) => v.length > 0);

        const breadcrumbArray = pathSegments.map((segment, index) => {
            const href = '/' + pathSegments.slice(0, index + 1).join('/');

            // Format the segment to be more readable
            let name = segment.replace(/-/g, ' ');
            // If it's a dynamic ID (looks like an ObjectId or UUID), just say "Details" or similar, 
            // but for a better UX, we'll try to capitalize. Realistically we might need to fetch names, 
            // but static formatting works for now.
            if (name.length > 20 || /^[0-9a-fA-F]{24}$/.test(name)) {
                name = "Details";
            } else {
                name = name.charAt(0).toUpperCase() + name.slice(1);
            }

            return { name, href };
        });

        setBreadcrumbs(breadcrumbArray);
    }, [pathname]);

    if (breadcrumbs.length === 0) return null;

    return (
        <nav className="bg-gray-50 border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8" aria-label="Breadcrumb">
            <div className="max-w-7xl mx-auto flex items-center text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-blue-600 transition flex items-center">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Dashboard</span>
                </Link>

                {breadcrumbs.map((breadcrumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const isUnclickable = /^\/trips\/[^\/]+\/stops(\/[^\/]+)?$/.test(breadcrumb.href);

                    return (
                        <div key={breadcrumb.href} className="flex items-center">
                            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                            {isLast || isUnclickable ? (
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
        </nav>
    );
}
