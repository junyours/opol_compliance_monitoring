import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    UserIcon,
    DocumentTextIcon,
    ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function StaffSidebar({ isOpen, onClose, upcomingCount = 0 }) {
    const { url } = usePage();
    const { auth } = usePage().props;

    const navigation = [
        { name: 'Dashboard', href: '/staff/dashboard', icon: HomeIcon },
        { name: 'My Inspection', href: '/staff/inspections', icon: ClipboardDocumentListIcon },
        { name: 'Schedule', href: '/staff/schedule', icon: CalendarIcon },
        { name: 'Profile', href: '/staff/profile', icon: UserIcon },
    ];

    const isActive = (href) => {
        return url === href || url.startsWith(href + '/');
    };

    return (
        <>
            {/* Mobile sidebar - only shown on mobile when isOpen is true */}
            {isOpen && (
                <>
                    {/* Mobile backdrop */}
                    <div 
                        className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                        onClick={onClose}
                    />
                    
                    {/* Mobile sidebar */}
                    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden">
                        <div className="flex flex-col h-full">
                            {/* Logo */}
                            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <div className="flex items-center">
                                    <img src="/images/logo.png" alt="MENRO Logo" className="h-8 w-auto" />
                                    <div className="ml-3">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Municipal Environment and Natural Resources Office</span>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>


                            {/* Navigation */}
                            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    const showBadge = item.name === 'Schedule' && upcomingCount > 0;
                                    
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`
                                                group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                                                ${isActive(item.href)
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400'
                                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                                }
                                            `}
                                        >
                                            <div className="flex items-center">
                                                <Icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`} />
                                                {item.name}
                                            </div>
                                            {showBadge && (
                                                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                                    {upcomingCount}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Bottom Section */}
                            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                                {/* Logout moved to user dropdown */}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Desktop sidebar - always visible on desktop screens */}
            <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="flex flex-col w-64">
                    <div className="flex flex-col h-full">
                        {/* Logo */}
                        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex items-center">
                                <img src="/images/logo.png" alt="MENRO Logo" className="h-8 w-auto" />
                                <div className="ml-3">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Municipal Environment and Natural Resources Office</span>
                                </div>
                            </div>
                        </div>


                        {/* Navigation */}
                        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const showBadge = item.name === 'Schedule' && upcomingCount > 0;
                                
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`
                                            group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                                            ${isActive(item.href)
                                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700 dark:border-blue-400'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center">
                                            <Icon className={`mr-3 h-5 w-5 ${isActive(item.href) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'}`} />
                                            {item.name}
                                        </div>
                                        {showBadge && (
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                                                {upcomingCount}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Bottom Section */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                            {/* Logout moved to user dropdown */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
