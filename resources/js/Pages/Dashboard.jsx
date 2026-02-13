import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    ChartBarIcon,
    BuildingOfficeIcon,
    UsersIcon,
    ClipboardDocumentCheckIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ArrowRightIcon,
    CalendarIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    BellIcon,
    UserGroupIcon,
    MapPinIcon
} from '@heroicons/react/24/outline';

export default function Dashboard({ auth }) {
    const { stats, recentActivities, upcomingInspections } = usePage().props;
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedPeriod, setSelectedPeriod] = useState('week');

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                            <p className="text-sm text-gray-500">Welcome back, {auth.user.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Current Time</p>
                            <p className="text-sm font-medium text-gray-900">{formatTime(currentTime)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Today</p>
                            <p className="text-sm font-medium text-gray-900">{formatDate(currentTime)}</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="w-full px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <BuildingOfficeIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Establishments</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEstablishments}</p>
                                    <div className="flex items-center mt-1">
                                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-xs text-green-600">+{stats.recentGrowth}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Inspections</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInspections}</p>
                                    <div className="flex items-center mt-1">
                                        <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                                        <span className="text-xs text-green-600">+8.2%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <UsersIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Staff</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStaff}</p>
                                    <div className="flex items-center mt-1">
                                        <UserGroupIcon className="w-4 h-4 text-purple-500 mr-1" />
                                        <span className="text-xs text-purple-600">All staff members</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                    </div>
                </div>

                {/* Compliance Status Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Compliance Status</h3>
                            <select 
                                value={selectedPeriod} 
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Compliant</span>
                                    <span className="text-sm font-bold text-green-600">{stats.compliantEstablishments}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div 
                                        className="bg-green-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.compliantEstablishments / stats.totalEstablishments) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Non-Compliant</span>
                                    <span className="text-sm font-bold text-red-600">{stats.nonCompliantEstablishments}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                    <div 
                                        className="bg-red-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.nonCompliantEstablishments / stats.totalEstablishments) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Link href="/admin/establishments" className="flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200">
                                <BuildingOfficeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Establishments</span>
                            </Link>
                            <Link href="/admin/monitoring" className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200">
                                <ChartBarIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-300">Monitoring</span>
                            </Link>
                            <Link href="/admin/checklist" className="flex items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200">
                                <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Checklist</span>
                            </Link>
                            <Link href="/admin/inspection" className="flex items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors duration-200">
                                <ClipboardDocumentCheckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Inspections</span>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Recent Activities & Upcoming Inspections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activities */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activities</h3>
                            <BellIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className={`p-2 rounded-lg ${
                                        activity.type === 'inspection' ? 'bg-green-100 dark:bg-green-900/30' :
                                        activity.type === 'establishment' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                        activity.type === 'staff' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                        'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                        {activity.type === 'inspection' && <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-600 dark:text-green-400" />}
                                        {activity.type === 'establishment' && <BuildingOfficeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                                        {activity.type === 'staff' && <UsersIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                                        {activity.type === 'complaint' && <ExclamationCircleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.establishment} • {activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Inspections */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upcoming Inspections</h3>
                            <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {upcomingInspections.map((inspection) => (
                                <div key={inspection.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className={`p-2 rounded-lg ${
                                        inspection.type === 'routine' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                        inspection.type === 'follow-up' ? 'bg-amber-100 dark:bg-amber-900/30' :
                                        'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{inspection.establishment}</p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            <span className="flex items-center">
                                                <CalendarIcon className="w-3 h-3 mr-1" />
                                                {inspection.date}
                                            </span>
                                            <span className="flex items-center">
                                                <ClockIcon className="w-3 h-3 mr-1" />
                                                {inspection.time}
                                            </span>
                                            <span className="flex items-center">
                                                <UserGroupIcon className="w-3 h-3 mr-1" />
                                                {inspection.inspector}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-100">Compliance Rate</p>
                                <p className="text-2xl font-bold">
                                    {Math.round((stats.compliantEstablishments / stats.totalEstablishments) * 100)}%
                                </p>
                            </div>
                            <CheckCircleIcon className="w-8 h-8 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-100">Inspection Rate</p>
                                <p className="text-2xl font-bold">
                                    {Math.round((stats.totalInspections / stats.totalEstablishments) * 100)}%
                                </p>
                            </div>
                            <ArrowTrendingUpIcon className="w-8 h-8 text-green-200" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
