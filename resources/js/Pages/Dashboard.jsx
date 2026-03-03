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
    MapPinIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
    FireIcon,
    ShieldCheckIcon,
    ChartPieIcon
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
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
                            <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                                <SparklesIcon className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard</h2>
                            <p className="text-sm text-gray-500 font-medium">Welcome back, <span className="text-blue-600 font-semibold">{auth.user.name}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex items-center space-x-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 px-4 py-2">
                            <div className="flex items-center space-x-2">
                                <ClockIcon className="w-4 h-4 text-blue-500" />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-medium">Current Time</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(currentTime)}</p>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="w-4 h-4 text-purple-500" />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 font-medium">Today</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatDate(currentTime)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="w-full px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Enhanced Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <BuildingOfficeIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                    <FireIcon className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-bold text-green-600">+{stats.recentGrowth}%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Establishments</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalEstablishments}</p>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                                    <span>Growing steadily</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                    </div>

                    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <ClipboardDocumentCheckIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                    <ArrowTrendingUpIcon className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-bold text-blue-600">+8.2%</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Inspections</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalInspections}</p>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />
                                    <span>On track</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    </div>

                    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <UsersIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center space-x-1 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                                    <UserGroupIcon className="w-3 h-3 text-purple-600" />
                                    <span className="text-xs font-bold text-purple-600">Active</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Total Staff</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stats.totalStaff}</p>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <ShieldCheckIcon className="w-4 h-4 text-purple-500 mr-1" />
                                    <span>All departments</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    </div>

                    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        <div className="relative p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                    <ChartPieIcon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                                    <SparklesIcon className="w-3 h-3 text-amber-600" />
                                    <span className="text-xs font-bold text-amber-600">New</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">Compliance Rate</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {Math.round((stats.compliantEstablishments / stats.totalEstablishments) * 100)}%
                                </p>
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                    <FireIcon className="w-4 h-4 text-amber-500 mr-1" />
                                    <span>Excellent progress</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500"></div>
                    </div>
                </div>

                {/* Enhanced Compliance Status Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                    <ChartPieIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Compliance Status</h3>
                            </div>
                            <select 
                                value={selectedPeriod} 
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                className="text-sm border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium shadow-sm"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <div className="space-y-6">
                            <div className="group">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Compliant</span>
                                    </div>
                                    <span className="text-sm font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">{stats.compliantEstablishments}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                                        style={{ width: `${(stats.compliantEstablishments / stats.totalEstablishments) * 100}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {Math.round((stats.compliantEstablishments / stats.totalEstablishments) * 100)}% of total establishments
                                </p>
                            </div>
                            <div className="group">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Non-Compliant</span>
                                    </div>
                                    <span className="text-sm font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">{stats.nonCompliantEstablishments}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-red-500 to-pink-500 h-4 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                                        style={{ width: `${(stats.nonCompliantEstablishments / stats.totalEstablishments) * 100}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    {Math.round((stats.nonCompliantEstablishments / stats.totalEstablishments) * 100)}% require attention
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admin/establishments" className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                                    <div className="p-3 bg-blue-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">Establishments</span>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                            </Link>
                            <Link href="/admin/monitoring" className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                                    <div className="p-3 bg-green-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <ChartBarIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-green-700 dark:text-green-300">Monitoring</span>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-green-200 dark:bg-green-800 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                            </Link>
                            <Link
    href={route('admin.category.checklist')}
    className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
>
    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
        <div className="p-3 bg-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
            <DocumentTextIcon className="w-6 h-6 text-white" />
        </div>
        <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Checklist</span>
    </div>
    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
</Link>
                            <Link href="/admin/inspection" className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl p-6 hover:from-amber-100 hover:to-amber-200 dark:hover:from-amber-900/30 dark:hover:to-amber-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                                    <div className="p-3 bg-amber-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Category</span>
                                </div>
                                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-200 dark:bg-amber-800 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                            </Link>
                            <Link href="/admin/notice-to-comply" className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg col-span-2">
                                <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                                    <div className="p-3 bg-red-500 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-red-700 dark:text-red-300">Notice to Comply</span>
                                </div>
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-red-200 dark:bg-red-800 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
                            </Link>
                        </div>
                    </div>
                </div>
                {/* Enhanced Recent Activities & Upcoming Inspections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Activities */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl animate-pulse">
                                    <BellIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activities</h3>
                            </div>
                            <div className="flex items-center space-x-1 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                                <span className="text-xs font-bold text-blue-600">Live</span>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                            {recentActivities.map((activity, index) => (
                                <div key={activity.id} className="group relative flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                    <div className={`relative p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 ${
                                        activity.type === 'inspection' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                                        activity.type === 'establishment' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                        activity.type === 'staff' ? 'bg-gradient-to-br from-purple-500 to-pink-600' :
                                        'bg-gradient-to-br from-red-500 to-orange-600'
                                    }`}>
                                        {activity.type === 'inspection' && <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />}
                                        {activity.type === 'establishment' && <BuildingOfficeIcon className="w-5 h-5 text-white" />}
                                        {activity.type === 'staff' && <UsersIcon className="w-5 h-5 text-white" />}
                                        {activity.type === 'complaint' && <ExclamationCircleIcon className="w-5 h-5 text-white" />}
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{activity.message}</p>
                                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center">
                                                <MapPinIcon className="w-3 h-3 mr-1" />
                                                {activity.establishment}
                                            </span>
                                            <span className="flex items-center">
                                                <ClockIcon className="w-3 h-3 mr-1" />
                                                {activity.time}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRightIcon className="w-4 h-4 text-blue-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Inspections */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl">
                                    <CalendarIcon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Inspections</h3>
                            </div>
                            <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                                <CalendarIcon className="w-3 h-3 text-amber-600" />
                                <span className="text-xs font-bold text-amber-600">Scheduled</span>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar">
                            {upcomingInspections.map((inspection, index) => (
                                <div key={inspection.id} className="group relative flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl hover:from-amber-50 hover:to-amber-100 dark:hover:from-amber-900/20 dark:hover:to-amber-800/20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
                                    <div className={`relative p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300 ${
                                        inspection.type === 'routine' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                                        inspection.type === 'follow-up' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                        'bg-gradient-to-br from-red-500 to-pink-600'
                                    }`}>
                                        <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300">{inspection.establishment}</p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                                                <CalendarIcon className="w-3 h-3 mr-1 text-blue-500" />
                                                {inspection.date}
                                            </span>
                                            <span className="flex items-center bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                                                <ClockIcon className="w-3 h-3 mr-1 text-green-500" />
                                                {inspection.time}
                                            </span>
                                            <span className="flex items-center bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
                                                <UserGroupIcon className="w-3 h-3 mr-1 text-purple-500" />
                                                {inspection.inspector}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowRightIcon className="w-4 h-4 text-amber-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Enhanced Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group relative bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 text-white overflow-hidden transform hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-blue-100 mb-2">Compliance Rate</p>
                                <p className="text-4xl font-bold mb-3">
                                    {Math.round((stats.compliantEstablishments / stats.totalEstablishments) * 100)}%
                                </p>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-blue-100 font-medium">Excellent Performance</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-xl animate-pulse"></div>
                                <CheckCircleIcon className="relative w-16 h-16 text-blue-200" />
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute -top-4 -left-4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 text-white overflow-hidden transform hover:-translate-y-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-green-100 mb-2">Inspection Rate</p>
                                <p className="text-4xl font-bold mb-3">
                                    {Math.round((stats.totalInspections / stats.totalEstablishments) * 100)}%
                                </p>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-green-100 font-medium">Above Target</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-xl animate-pulse"></div>
                                <ArrowTrendingUpIcon className="relative w-16 h-16 text-green-200" />
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                        <div className="absolute -top-4 -left-4 w-16 h-16 bg-white opacity-10 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-track {
                    background: #374151;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #6b7280;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
