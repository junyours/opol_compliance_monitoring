import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import {
    CalendarIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ClipboardDocumentCheckIcon,
    UserIcon,
    BuildingOfficeIcon,
    MapPinIcon,
    ChevronRightIcon,
    BellIcon,
} from '@heroicons/react/24/outline';

export default function Schedule({ auth }) {
    const { inspections, groupedInspections, upcomingInspections, todayInspections, staff, stats } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusColor = (inspection) => {
        const now = new Date();
        const inspectionDate = new Date(inspection.inspection_timestamp);
        
        if (inspectionDate < now) {
            return 'bg-gray-100 text-gray-800'; // Completed
        } else if (inspectionDate.toDateString() === now.toDateString()) {
            return 'bg-blue-100 text-blue-800'; // Today
        } else {
            return 'bg-green-100 text-green-800'; // Upcoming
        }
    };

    const getStatusText = (inspection) => {
        const now = new Date();
        const inspectionDate = new Date(inspection.inspection_timestamp);
        
        if (inspectionDate < now) {
            return 'Completed';
        } else if (inspectionDate.toDateString() === now.toDateString()) {
            return 'Today';
        } else {
            return 'Upcoming';
        }
    };

    const filteredInspections = inspections.filter(inspection => {
        const matchesSearch = inspection.quarter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             inspection.notes?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        const now = new Date();
        const inspectionDate = new Date(inspection.inspection_timestamp);
        
        switch (filter) {
            case 'today':
                return inspectionDate.toDateString() === now.toDateString();
            case 'upcoming':
                return inspectionDate > now;
            case 'completed':
                return inspectionDate < now;
            default:
                return true;
        }
    });

    const handleInspectionClick = (inspectionId) => {
        router.get(`/staff/schedule/${inspectionId}/create`);
    };

    const statCards = [
        { name: 'Total Inspections', value: stats.total, icon: CalendarIcon, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
        { name: 'Today', value: stats.today, icon: ClockIcon, color: 'bg-orange-500', bgColor: 'bg-orange-50' },
        { name: 'Upcoming', value: stats.upcoming, icon: ExclamationTriangleIcon, color: 'bg-green-500', bgColor: 'bg-green-50' },
        { name: 'Completed', value: stats.completed, icon: CheckCircleIcon, color: 'bg-gray-500', bgColor: 'bg-gray-50' },
    ];

    return (
        <StaffLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Inspection Schedule</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage your inspection assignments and track progress
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <UserIcon className="w-4 h-4" />
                        <span>{staff?.name || 'Staff Member'}</span>
                    </div>
                </div>
            }
        >
            <Head title="Schedule" />
            
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex items-center">
                                        <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
                                            <Icon className={`h-6 w-6 ${stat.color.replace('bg-', 'text-')}`} />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Today's Inspections */}
                    {todayInspections.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200">
                                <div className="flex items-center">
                                    <BellIcon className="w-5 h-5 text-white mr-2" />
                                    <h2 className="text-lg font-semibold text-white">Today's Inspections</h2>
                                    <span className="ml-3 bg-white bg-opacity-20 text-white text-sm px-2 py-1 rounded-full">
                                        {todayInspections.length} scheduled
                                    </span>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {todayInspections.map((inspection) => (
                                    <div 
                                        key={inspection.id} 
                                        className="p-6 hover:bg-blue-50 cursor-pointer transition-colors duration-200 group"
                                        onClick={() => handleInspectionClick(inspection.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold text-gray-900">
                                                        {inspection.quarter} Inspection
                                                    </p>
                                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                                        <ClockIcon className="w-4 h-4 mr-1" />
                                                        {new Date(inspection.inspection_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    {inspection.notes && (
                                                        <p className="text-sm text-gray-400 mt-1">{inspection.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    Today
                                                </span>
                                                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Inspections</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Search by quarter or notes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="lg:w-64">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Filter Status</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <select
                                        className="block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg appearance-none bg-white"
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                    >
                                        <option value="all">All Inspections</option>
                                        <option value="today">Today</option>
                                        <option value="upcoming">Upcoming</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* All Inspections Grouped by Month */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">All Inspections</h2>
                            <span className="text-sm text-gray-500">
                                {filteredInspections.length} of {inspections.length} inspections
                            </span>
                        </div>
                        <div className="space-y-6">
                            {Object.entries(groupedInspections).map(([month, monthInspections]) => {
                                const filteredMonthInspections = monthInspections.filter(inspection => filteredInspections.includes(inspection));
                                if (filteredMonthInspections.length === 0) return null;
                                
                                return (
                                    <div key={month} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-semibold text-gray-900">{month}</h3>
                                                <span className="text-sm text-gray-500">
                                                    {filteredMonthInspections.length} inspection{filteredMonthInspections.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-gray-200">
                                            {filteredMonthInspections.map((inspection) => (
                                                <div 
                                                    key={inspection.id} 
                                                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                                                    onClick={() => handleInspectionClick(inspection.id)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex-shrink-0">
                                                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                                                    getStatusText(inspection) === 'Today' ? 'bg-blue-100' :
                                                                    getStatusText(inspection) === 'Upcoming' ? 'bg-green-100' :
                                                                    'bg-gray-100'
                                                                } group-hover:scale-105 transition-transform`}>
                                                                    <CalendarIcon className={`h-6 w-6 ${
                                                                        getStatusText(inspection) === 'Today' ? 'text-blue-600' :
                                                                        getStatusText(inspection) === 'Upcoming' ? 'text-green-600' :
                                                                        'text-gray-600'
                                                                    }`} />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="text-base font-semibold text-gray-900">
                                                                    {inspection.quarter} Inspection
                                                                </p>
                                                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                                                    <ClockIcon className="w-4 h-4 mr-1" />
                                                                    {new Date(inspection.inspection_timestamp).toLocaleDateString()} at {' '}
                                                                    {new Date(inspection.inspection_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </div>
                                                                {inspection.notes && (
                                                                    <p className="text-sm text-gray-400 mt-1">{inspection.notes}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inspection)}`}>
                                                                {getStatusText(inspection)}
                                                            </span>
                                                            <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {filteredInspections.length === 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CalendarIcon className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No inspections found</h3>
                            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria to find the inspections you're looking for.</p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilter('all');
                                }}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
}