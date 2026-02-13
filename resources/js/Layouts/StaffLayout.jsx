import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import StaffSidebar from '@/Components/StaffSidebar';
import StaffTopbar from '@/Components/StaffTopbar';

export default function StaffLayout({ auth, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const page = usePage();
    
    // Get upcoming inspections count from page props
    const upcomingCount = page.props.upcomingInspections?.length || 0;

    return (
        <div className="h-screen flex overflow-hidden bg-gray-50">
            <Head title="Staff Dashboard" />

            {/* Sidebar - handles both mobile and desktop */}
            <StaffSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} upcomingCount={upcomingCount} />

            {/* Main content area */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                {/* Topbar - Fixed */}
                <StaffTopbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page header */}
                {header && (
                    <header className="bg-white shadow-sm border-b border-gray-200">
                        <div className="px-4 sm:px-6 lg:px-8">
                            <div className="py-6">
                                {header}
                            </div>
                        </div>
                    </header>
                )}

                {/* Main content - Scrollable */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
