import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import {
    ClipboardDocumentListIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';

export default function StaffDashboard({ auth }) {
    const { staff, stats, todayInspections, upcomingInspections, recentInspections } = usePage().props;

    const statCards = [
        {
            name: 'Total Inspections',
            value: stats.total_inspections,
            icon: ClipboardDocumentListIcon,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            name: 'Pending Tasks',
            value: stats.pending_tasks,
            icon: ClockIcon,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
            textColor: 'text-yellow-600 dark:text-yellow-400',
        },
        {
            name: 'Completed Tasks',
            value: stats.completed_tasks,
            icon: CheckCircleIcon,
            color: 'bg-green-500',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
        },
        {
            name: 'Upcoming Inspections',
            value: stats.upcoming_inspections,
            icon: CalendarIcon,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400',
        },
    ];

    return (
        <StaffLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {auth.user.name}!</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Here's your personal inspection overview.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Staff Dashboard" />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.name} className={`${stat.bgColor} overflow-hidden rounded-lg shadow`}>
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                                            <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Inspections */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            My Recent Inspections
                        </h3>
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {recentInspections.length > 0 ? (
                                    recentInspections.map((inspection) => (
                                        <li key={inspection.id} className="py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {inspection.quarter} Inspection
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(inspection.inspection_timestamp).toLocaleDateString()} at {' '}
                                                        {new Date(inspection.inspection_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {inspection.notes && (
                                                        <p className="text-sm text-gray-400 mt-1">{inspection.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <ClipboardDocumentListIcon className="h-4 w-4 text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    No recent inspections
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Your completed inspections will appear here
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="mt-6">
                            <a
                                href="/staff/inspections"
                                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                View all my inspections
                            </a>
                        </div>
                    </div>
                </div>

                {/* Upcoming Schedule */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            My Upcoming Schedule
                        </h3>
                        <div className="flow-root">
                            <ul className="-my-5 divide-y divide-gray-200">
                                {upcomingInspections.length > 0 ? (
                                    upcomingInspections.slice(0, 3).map((inspection) => (
                                        <li key={inspection.id} className="py-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <CalendarIcon className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {inspection.quarter} Inspection
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(inspection.inspection_timestamp).toLocaleDateString()} at {' '}
                                                        {new Date(inspection.inspection_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    {inspection.notes && (
                                                        <p className="text-sm text-gray-400 mt-1">{inspection.notes}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <li className="py-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    No upcoming inspections
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Your scheduled inspections will appear here
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                )}
                            </ul>
                        </div>
                        <div className="mt-6">
                            <a
                                href="/staff/schedule"
                                className="w-full flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                View Schedule
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <a
                                href="/staff/inspections/create"
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                                New Inspection
                            </a>
                            <a
                                href="/staff/schedule"
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                View Schedule
                            </a>
                            <a
                                href="/staff/reports"
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <CheckCircleIcon className="h-4 w-4 mr-2" />
                                Generate Report
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}