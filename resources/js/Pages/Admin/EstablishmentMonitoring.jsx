import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    ChartBarIcon, 
    BuildingOfficeIcon, 
    CheckCircleIcon, 
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    EyeIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function EstablishmentMonitoring({ auth }) {
    const { barangays, summary, filters } = usePage().props;
    const [expandedBarangays, setExpandedBarangays] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [searchTerms, setSearchTerms] = useState({});

    const handleFilterChange = (key, value) => {
        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        
        router.get(
            route('admin.monitoring.index'),
            Object.fromEntries(params),
            { preserveState: true }
        );
    };

    const toggleBarangayExpansion = (barangay) => {
        const newExpanded = new Set(expandedBarangays);
        if (newExpanded.has(barangay)) {
            newExpanded.delete(barangay);
        } else {
            newExpanded.add(barangay);
        }
        setExpandedBarangays(newExpanded);
    };

    const handleSearchChange = (barangay, searchTerm) => {
        setSearchTerms(prev => ({
            ...prev,
            [barangay]: searchTerm
        }));
    };

    const filterEstablishments = (establishments, searchTerm) => {
        if (!searchTerm || searchTerm.trim() === '') {
            return establishments;
        }
        
        const term = searchTerm.toLowerCase();
        return establishments.filter(establishment => 
            establishment.name.toLowerCase().includes(term) ||
            establishment.address?.toLowerCase().includes(term) ||
            establishment.type_of_business?.toLowerCase().includes(term)
        );
    };

    const getStatusBadge = (status) => {
        // Handle compliance status first
        if (status === 'non-compliant') {
            return (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm">
                    <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                    Non-Complaint
                </span>
            );
        } else if (status === 'compliant') {
            return (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                    <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                    Complaint
                </span>
            );
        }
        
        // Handle other status types
        const statusConfig = {
            'draft': { color: 'bg-gray-100 text-gray-800 border border-gray-200', icon: ExclamationCircleIcon },
            'submitted': { color: 'bg-blue-100 text-blue-800 border border-blue-200', icon: CheckCircleIcon },
            'reviewed': { color: 'bg-amber-100 text-amber-800 border border-amber-200', icon: ExclamationCircleIcon },
            'approved': { color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', icon: CheckCircleIcon }
        };
        
        const config = statusConfig[status] || statusConfig['draft'];
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.color} shadow-sm`}>
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        if (percentage >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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
                            <BuildingOfficeIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Establishment Monitoring</h2>
                            <p className="text-sm text-gray-500">Track inspection compliance and progress</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <FunnelIcon className="w-4 h-4 mr-2" />
                        Filters
                    </button>
                </div>
            }
        >
            <Head title="Establishment Monitoring" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Filters */}
                {showFilters && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Options</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quarter
                                </label>
                                <select
                                    value={filters.quarter || ''}
                                    onChange={(e) => handleFilterChange('quarter', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500"
                                >
                                    <option value="">All Quarters</option>
                                    {filters.available_quarters.map((quarter) => (
                                        <option key={quarter} value={quarter}>
                                            {quarter}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    min="2020"
                                    max={new Date().getFullYear() + 1}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.from_date || ''}
                                    onChange={(e) => handleFilterChange('from_date', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    value={filters.to_date || ''}
                                    onChange={(e) => handleFilterChange('to_date', e.target.value)}
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => router.get(route('admin.monitoring.index'))}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <BuildingOfficeIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600">Total Establishments</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.total_establishments}</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <CheckCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600">Inspected</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.total_inspected}</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <ExclamationCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.total_pending}</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <ChartBarIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">{summary.overall_percentage}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                    </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Overall Inspection Progress</h3>
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getProgressColor(summary.overall_percentage)}`}></div>
                                <span className="text-sm font-medium text-gray-600">{summary.overall_percentage}%</span>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div 
                                    className={`${getProgressColor(summary.overall_percentage)} h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                                    style={{ width: `${summary.overall_percentage}%` }}
                                >
                                    <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{summary.total_inspected}</span> of <span className="font-semibold text-gray-900">{summary.total_establishments}</span> establishments inspected
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                    80%+
                                </span>
                                <span className="flex items-center">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                                    60-79%
                                </span>
                                <span className="flex items-center">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                                    40-59%
                                </span>
                                <span className="flex items-center">
                                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                    &lt;40%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Barangay-wise Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Barangay-wise Inspection Status</h3>
                            <div className="text-sm text-gray-600">
                                {barangays.length} barangays • {summary.total_establishments} total establishments
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {barangays.map((barangay) => (
                            <div key={barangay.barangay} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                {/* Barangay Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                                            <BuildingOfficeIcon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-md font-bold text-gray-900">{barangay.barangay}</h4>
                                            <div className="flex space-x-2 mt-1">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                    Total: {barangay.total_establishments}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                    Inspected: {barangay.inspected_establishments}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                    Pending: {barangay.pending_establishments}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">{barangay.inspection_percentage}%</p>
                                            <p className="text-xs text-gray-500">Complete</p>
                                        </div>
                                        <button
                                            onClick={() => toggleBarangayExpansion(barangay.barangay)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                        >
                                            {expandedBarangays.has(barangay.barangay) ? (
                                                <ChevronUpIcon className="w-5 h-5" />
                                            ) : (
                                                <ChevronDownIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative">
                                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                        <div 
                                            className={`${getProgressColor(barangay.inspection_percentage)} h-2 rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
                                            style={{ width: `${barangay.inspection_percentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedBarangays.has(barangay.barangay) && (
                                    <div className="mt-4 space-y-4">
                                        {/* Search Bar */}
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="relative">
                                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Search establishments by name, address, or business type..."
                                                    value={searchTerms[barangay.barangay] || ''}
                                                    onChange={(e) => handleSearchChange(barangay.barangay, e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>

                                        {/* Completed Inspections */}
                                        {(() => {
                                            const filteredInspected = filterEstablishments(barangay.inspected_details || [], searchTerms[barangay.barangay]);
                                            return filteredInspected.length > 0 ? (
                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <h5 className="text-sm font-semibold text-green-800 mb-3 flex items-center">
                                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                                    Completed Inspections ({barangay.inspected_details.length})
                                                </h5>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-green-200">
                                                        <thead className="bg-green-100">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Establishment</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Business Type</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Address</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Quarter</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Inspection Date</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Inspector</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Status</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Compliance Status</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-green-100">
                                                            {filteredInspected.map((establishment) => (
                                                                <tr key={establishment.id} className="hover:bg-green-50">
                                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                                        {establishment.name}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                                            {establishment.business_type?.name || 'N/A'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                                        {establishment.address}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                                        {establishment.quarter}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                                        {formatDate(establishment.inspection_date)}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                                        {establishment.inspector}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        {getStatusBadge(establishment.status)}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        {establishment.compliance_status === 'not_compliant' ? (
                                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm">
                                                                                <ExclamationCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                                                                                Non-Complaint
                                                                            </span>
                                                                        ) : establishment.compliance_status === 'compliant' ? (
                                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                                                                                <CheckCircleIcon className="w-3.5 h-3.5 mr-1.5" />
                                                                                Complaint
                                                                            </span>
                                                                        ) : (
                                                                            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200 shadow-sm">
                                                                                {establishment.compliance_status ? establishment.compliance_status.replace('_', ' ').charAt(0).toUpperCase() + establishment.compliance_status.replace('_', ' ').slice(1) : 'Unknown'}
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm">
                                                                        <button
                                                                            onClick={() => router.get(`/admin/inspection-results/${establishment.inspection_id}`)}
                                                                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                                                                        >
                                                                            <EyeIcon className="w-3.5 h-3.5 mr-1" />
                                                                            View Details
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            ) : null;
                                        })()}{/* Pending Inspections */}
                                        {(() => {
                                            const filteredPending = filterEstablishments(barangay.pending_details || [], searchTerms[barangay.barangay]);
                                            return filteredPending.length > 0 ? (
                                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                                <h5 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center">
                                                    <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                                                    Pending Inspections ({barangay.pending_details.length})
                                                </h5>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-yellow-200">
                                                        <thead className="bg-yellow-100">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Establishment</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Business Type</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Address</th>
                                                                <th className="px-4 py-2 text-left text-xs font-medium text-yellow-700 uppercase">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-yellow-100">
                                                            {filteredPending.map((establishment) => (
                                                                <tr key={establishment.id} className="hover:bg-yellow-50">
                                                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                                        {establishment.name}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                                            {establishment.business_type?.name || 'N/A'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-sm text-gray-600">
                                                                        {establishment.address}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                            Pending
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            ) : null;
                                        })()}

                                        {/* No results message */}
                                        {(() => {
                                            const searchTerm = searchTerms[barangay.barangay];
                                            const hasSearchTerm = searchTerm && searchTerm.trim() !== '';
                                            const filteredInspected = filterEstablishments(barangay.inspected_details || [], searchTerm);
                                            const filteredPending = filterEstablishments(barangay.pending_details || [], searchTerm);
                                            const hasResults = filteredInspected.length > 0 || filteredPending.length > 0;
                                            
                                            if (hasSearchTerm && !hasResults) {
                                                return (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                                                        <p className="text-sm text-gray-500">No establishments found matching "{searchTerm}"</p>
                                                    </div>
                                                );
                                            }
                                            
                                            if ((!barangay.inspected_details || barangay.inspected_details.length === 0) && 
                                                (!barangay.pending_details || barangay.pending_details.length === 0)) {
                                                return (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                                                        <p className="text-sm text-gray-500">No establishments found for this barangay.</p>
                                                    </div>
                                                );
                                            }
                                            
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
