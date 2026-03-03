import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    BuildingOfficeIcon,
    CalendarIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    DocumentArrowDownIcon,
    MagnifyingGlassIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    AdjustmentsHorizontalIcon as FilterIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    UserGroupIcon,
    TagIcon,
    ChartBarIcon,
    XMarkIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function EstablishmentReports({ auth }) {
    const { flash } = usePage().props;
    const [reportData, setReportData] = useState({
        establishments: [],
        summary: {
            total_establishments: 0,
            active_establishments: 0,
            total_inspections: 0,
            overall_compliance_rate: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        quarter: '',
        year: new Date().getFullYear(),
        establishment_id: '',
        status: 'active'
    });
    const [expandedEstablishments, setExpandedEstablishments] = useState(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedEstablishment, setSelectedEstablishment] = useState(null);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/admin/reports/establishments/data?${params.toString()}`);
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error('Error fetching establishment report data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReportData();
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleShowDetails = (establishment) => {
        setSelectedEstablishment(establishment);
        setShowDetailsModal(true);
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedEstablishment(null);
    };

    const handleExportReport = () => {
        const params = new URLSearchParams(filters);
        window.open(`/admin/reports/establishments/export?${params.toString()}`, '_blank');
    };

    const resetFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            quarter: '',
            year: new Date().getFullYear(),
            establishment_id: '',
            status: 'active'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getComplianceColor = (rate) => {
        if (rate >= 90) return 'text-green-600 bg-green-100';
        if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    const getResponseColor = (response) => {
        if (!response) return 'bg-gray-100 text-gray-800 border-gray-200';
        
        const responseStr = response.toLowerCase().trim();
        
        // Check for N/A responses
        if (responseStr === 'n/a' || 
            responseStr === 'na' || 
            responseStr.includes('not applicable')) {
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
        
        // Check for positive responses
        const positiveIndicators = ['yes', 'compliant', 'pass', 'positive', 'ok', 'okay', 'approved', 'satisfactory'];
        if (positiveIndicators.some(indicator => responseStr.includes(indicator))) {
            return 'bg-green-100 text-green-800 border-green-200';
        }
        
        // Check for negative responses
        const negativeIndicators = ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory'];
        if (negativeIndicators.some(indicator => responseStr.includes(indicator))) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    const filteredEstablishments = reportData.establishments.filter(establishment => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            establishment.name?.toLowerCase().includes(searchLower) ||
            establishment.address?.toLowerCase().includes(searchLower) ||
            establishment.proponent?.toLowerCase().includes(searchLower) ||
            establishment.business_type?.toLowerCase().includes(searchLower)
        );
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 opacity-10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-400 to-teal-400 rounded-full opacity-20 blur-2xl"></div>
                    
                    <div className="relative flex items-center justify-between p-6">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                                <div className="relative p-4 bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm">
                                    <BuildingOfficeIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                    Establishment Reports
                                </h1>
                                <p className="text-lg text-gray-600 mt-2">Comprehensive establishment compliance and inspection data</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleExportReport}
                                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5 group-hover:animate-bounce" />
                                <span className="font-semibold">Export Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Establishment Reports" />

            <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-green-50/30 min-h-screen">
                <div className="w-full space-y-8">
                    {/* Flash Messages */}
                    {flash && flash.success && (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-10"></div>
                            <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-500 rounded-xl shadow-lg">
                                        <CheckCircleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-green-800 font-bold text-lg">{flash.success}</p>
                                        <p className="text-green-600 text-sm">Operation completed successfully</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Total Establishments</p>
                                        <p className="text-4xl font-bold text-white">
                                            {reportData.summary.total_establishments}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <BuildingOfficeIcon className="w-4 h-4" />
                                            <span>All registered</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <BuildingOfficeIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Active Establishments</p>
                                        <p className="text-4xl font-bold text-white">
                                            {reportData.summary.active_establishments}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>Currently operational</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <CheckCircleIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Total Inspections</p>
                                        <p className="text-4xl font-bold text-white">
                                            {reportData.summary.total_inspections}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <ChartBarIcon className="w-4 h-4" />
                                            <span>Completed inspections</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <ChartBarIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-purple-400 via-pink-500 to-purple-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Compliance Rate</p>
                                        <p className="text-4xl font-bold text-white">
                                            {reportData.summary.overall_compliance_rate}%
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <TagIcon className="w-4 h-4" />
                                            <span>Overall performance</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <TagIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-30"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <FilterIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Filters</h3>
                                            <p className="text-blue-100 text-sm">Refine your establishment data</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={resetFilters}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                                    >
                                        <FunnelIcon className="w-4 h-4" />
                                        <span>Clear All</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <BuildingOfficeIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Establishment
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search or select establishment..."
                                                value={filters.establishment_id ? 
                                                    (reportData.establishments.find(e => e.id === filters.establishment_id)?.name || '') 
                                                    : ''
                                                }
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (value === '') {
                                                        handleFilterChange('establishment_id', '');
                                                    } else {
                                                        // Find matching establishment
                                                        const matched = reportData.establishments.find(e => 
                                                            e.name.toLowerCase().includes(value.toLowerCase())
                                                        );
                                                        if (matched) {
                                                            handleFilterChange('establishment_id', matched.id);
                                                        }
                                                    }
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                                list="establishment-list"
                                            />
                                            <MagnifyingGlassIcon className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                                            <datalist id="establishment-list">
                                                {reportData.establishments.map(establishment => (
                                                    <option key={establishment.id} value={establishment.name}>
                                                        {establishment.name}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </div>
                                        {filters.establishment_id && (
                                            <button
                                                onClick={() => handleFilterChange('establishment_id', '')}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                Clear selection
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Date From
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={filters.date_from}
                                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                            />
                                            <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Date To
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={filters.date_to}
                                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                            />
                                            <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <ChartBarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Quarter
                                        </label>
                                        <select
                                            value={filters.quarter}
                                            onChange={(e) => handleFilterChange('quarter', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                        >
                                            <option value="">All Quarters</option>
                                            <option value="Q1">Q1 (Jan-Mar)</option>
                                            <option value="Q2">Q2 (Apr-Jun)</option>
                                            <option value="Q3">Q3 (Jul-Sep)</option>
                                            <option value="Q4">Q4 (Oct-Dec)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 opacity-50"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search establishments by name, address, proponent, or business type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Establishments Table */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-30"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900">Establishment Inspection Details</h3>
                                <p className="text-sm text-gray-600 mt-1">Click on any establishment to view detailed inspection responses</p>
                            </div>
                            
                            <div className="overflow-x-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                                        <span className="ml-3 text-gray-600">Loading establishment data...</span>
                                    </div>
                                ) : filteredEstablishments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No establishments found</h3>
                                        <p className="text-sm text-gray-500">Try adjusting your filters or search criteria</p>
                                    </div>
                                ) : (
                                    <table className="w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Establishment
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Business Type
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Address
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Inspections
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Compliance Rate
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredEstablishments.map((establishment) => (
                                                <React.Fragment key={establishment.id}>
                                                    <tr className="hover:bg-gray-50 transition-colors duration-150">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                                                                    {establishment.name?.charAt(0)?.toUpperCase() || 'E'}
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {establishment.name}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {establishment.proponent}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                                {establishment.business_type || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm text-gray-900">
                                                                {establishment.address || 'N/A'}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {establishment.Barangay || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {establishment.inspection_count || 0}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                inspections
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getComplianceColor(establishment.compliance_rate || 0)}`}>
                                                                {establishment.compliance_rate || 0}%
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                establishment.status === 'active' 
                                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                            }`}>
                                                                {establishment.status || 'unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <button
                                                                onClick={() => handleShowDetails(establishment)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                                                            >
                                                                <EyeIcon className="w-4 h-4 mr-1" />
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                            </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Inspection Details Modal */}
                    {showDetailsModal && selectedEstablishment && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-screen items-start justify-center p-4 pt-8">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
                                
                                <div className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[85vh] overflow-y-auto">
                                    <div className="bg-gradient-to-r from-green-500 to-blue-500 px-6 py-4 rounded-t-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <BuildingOfficeIcon className="w-6 h-6 text-white mr-3" />
                                                <h3 className="text-lg font-semibold text-white">Inspection Details</h3>
                                            </div>
                                            <button
                                                onClick={handleCloseModal}
                                                className="text-white hover:text-gray-200 transition-colors"
                                            >
                                                <XMarkIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        {/* Establishment Info */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-3">{selectedEstablishment.name}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium text-gray-600">Business Type:</span>
                                                    <span className="ml-2 text-gray-900">{selectedEstablishment.business_type}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Address:</span>
                                                    <span className="ml-2 text-gray-900">{selectedEstablishment.address}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Contact:</span>
                                                    <span className="ml-2 text-gray-900">{selectedEstablishment.contact_number}</span>
                                                </div>
                                                <div>
                                                    <span className="font-medium text-gray-600">Last Inspection:</span>
                                                    <span className="ml-2 text-gray-900">{formatDate(selectedEstablishment.last_inspection_date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inspection Questions & Responses */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-lg font-semibold text-gray-900">Inspection Questions & Responses</h4>
                                                <div className="text-sm text-gray-500">
                                                    {selectedEstablishment.inspection_count} inspection(s) found
                                                </div>
                                            </div>
                                            
                                            {selectedEstablishment.inspection_responses && selectedEstablishment.inspection_responses.length > 0 ? (
                                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                                    {selectedEstablishment.inspection_responses.map((response, index) => (
                                                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-gray-900 mb-2">
                                                                        {response.category_name || 'Uncategorized'} &gt; <span className="text-blue-600 font-bold">{response.question_text || 'No question'}</span>
                                                                    </div>
                                                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getResponseColor(response.response)}`}>
                                                                        {response.response || 'No response'}
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-gray-500 ml-4">
                                                                    {formatDate(response.inspection_date)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                                    <div className="text-sm text-gray-500">
                                                        No inspection responses found for this establishment
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
