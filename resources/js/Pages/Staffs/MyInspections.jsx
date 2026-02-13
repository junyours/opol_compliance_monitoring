import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import {
    ClipboardDocumentListIcon,
    EyeIcon,
    CalendarIcon,
    BuildingOfficeIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function MyInspections({ auth }) {
    const { inspectionResults } = usePage().props;
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [selectedInspection, setSelectedInspection] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    // Group inspection results by inspection date
    const groupedByDate = inspectionResults.data.reduce((groups, result) => {
        if (!result.inspection?.inspection_timestamp) return groups;
        
        const date = new Date(result.inspection.inspection_timestamp).toLocaleDateString();
        if (!groups[date]) {
            groups[date] = {
                date: date,
                timestamp: result.inspection.inspection_timestamp,
                results: [],
                totalEstablishments: 0,
                completedCount: 0,
                compliantCount: 0,
                notCompliantCount: 0,
                pendingCount: 0,
            };
        }
        
        groups[date].results.push(result);
        groups[date].totalEstablishments++;
        
        if (result.compliance_status === 'compliant') {
            groups[date].compliantCount++;
        } else if (result.compliance_status === 'not_compliant') {
            groups[date].notCompliantCount++;
        } else {
            groups[date].pendingCount++;
        }
        
        if (result.status !== 'draft') {
            groups[date].completedCount++;
        }
        
        return groups;
    }, {});

    const groupedData = Object.values(groupedByDate).sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Filter results by selected date
    const filteredResults = selectedDate 
        ? groupedData.find(group => group.date === selectedDate)?.results || []
        : [];

    // Modal handlers
    const openInspectionModal = (result) => {
        setSelectedInspection(result);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedInspection(null);
    };

    // Search functionality
    const filteredInspectionResults = React.useMemo(() => {
        if (!searchTerm) return inspectionResults.data;
        
        const lowercaseSearch = searchTerm.toLowerCase();
        return inspectionResults.data.filter((result) => {
            return (
                result.establishment?.name?.toLowerCase().includes(lowercaseSearch) ||
                result.inspection?.quarter?.toLowerCase().includes(lowercaseSearch) ||
                result.status?.toLowerCase().includes(lowercaseSearch) ||
                result.compliance_status?.toLowerCase().includes(lowercaseSearch) ||
                result.other_remarks?.toLowerCase().includes(lowercaseSearch) ||
                result.recommendations?.toLowerCase().includes(lowercaseSearch)
            );
        });
    }, [inspectionResults.data, searchTerm]);

    // Re-group filtered results by date
    const filteredGroupedByDate = React.useMemo(() => {
        return filteredInspectionResults.reduce((groups, result) => {
            if (!result.inspection?.inspection_timestamp) return groups;
            
            const date = new Date(result.inspection.inspection_timestamp).toLocaleDateString();
            if (!groups[date]) {
                groups[date] = {
                    date: date,
                    timestamp: result.inspection.inspection_timestamp,
                    results: [],
                    totalEstablishments: 0,
                    completedCount: 0,
                    compliantCount: 0,
                    notCompliantCount: 0,
                    pendingCount: 0,
                };
            }
            
            groups[date].results.push(result);
            groups[date].totalEstablishments++;
            
            if (result.compliance_status === 'compliant') {
                groups[date].compliantCount++;
            } else if (result.compliance_status === 'not_compliant') {
                groups[date].notCompliantCount++;
            } else {
                groups[date].pendingCount++;
            }
            
            if (result.status !== 'draft') {
                groups[date].completedCount++;
            }
            
            return groups;
        }, {});
    }, [filteredInspectionResults]);

    const filteredGroupedData = React.useMemo(() => 
        Object.values(filteredGroupedByDate).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        ), [filteredGroupedByDate]
    );

    // Use filtered data for display
    const displayData = searchTerm ? filteredGroupedData : groupedData;
    const displayFilteredResults = selectedDate && searchTerm
        ? filteredGroupedData.find(group => group.date === selectedDate)?.results || []
        : selectedDate && !searchTerm
        ? groupedData.find(group => group.date === selectedDate)?.results || []
        : [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            case 'reviewed':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getComplianceColor = (status) => {
        switch (status) {
            case 'compliant':
                return 'bg-green-100 text-green-800';
            case 'not_compliant':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <StaffLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Inspections</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage your inspection results
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="My Inspections" />

            {/* Search Bar */}
            <div className="bg-white shadow-lg rounded-xl border border-gray-100 mb-6">
                <div className="px-4 sm:px-6 py-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search inspections by establishment name, type, status, or remarks..."
                            className="block w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="mt-3 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Found <span className="font-medium text-gray-900">{filteredInspectionResults.length}</span> inspection{filteredInspectionResults.length !== 1 ? 's' : ''} matching "{searchTerm}"
                            </p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-lg overflow-hidden sm:rounded-xl border border-gray-100">
                {!selectedDate ? (
                    // Show date groups
                    displayData.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {displayData.map((group) => (
                                <div key={group.date} className="group">
                                    <button
                                        onClick={() => setSelectedDate(group.date)}
                                        className="w-full px-4 sm:px-6 py-4 sm:py-5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-left transition-all duration-200"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                                            <div className="flex items-center space-x-3 sm:space-x-5">
                                                <div className="flex-shrink-0">
                                                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                                        <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                        <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                            {group.date}
                                                        </p>
                                                        <span className="inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                                                            {group.completedCount}/{group.totalEstablishments} Completed
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <BuildingOfficeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-gray-400" />
                                                            <span className="font-medium">{group.totalEstablishments}</span>
                                                            <span className="ml-1 text-gray-500">Establishments</span>
                                                        </div>
                                                        <div className="flex items-center text-blue-600">
                                                            <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                                                            <span className="font-medium text-xs sm:text-sm">Click to view details</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Compliance Summary */}
                                                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
                                                        {group.compliantCount > 0 && (
                                                            <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-green-50 border border-green-200">
                                                                <CheckCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-green-600" />
                                                                <span className="text-xs sm:text-sm font-medium text-green-700">{group.compliantCount} Compliant</span>
                                                            </div>
                                                        )}
                                                        {group.notCompliantCount > 0 && (
                                                            <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-red-50 border border-red-200">
                                                                <ExclamationCircleIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-red-600" />
                                                                <span className="text-xs sm:text-sm font-medium text-red-700">{group.notCompliantCount} Not Compliant</span>
                                                            </div>
                                                        )}
                                                        {group.pendingCount > 0 && (
                                                            <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-50 border border-amber-200">
                                                                <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-amber-600" />
                                                                <span className="text-xs sm:text-sm font-medium text-amber-700">{group.pendingCount} Pending</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Recent Establishments */}
                                                    <div className="mt-3 sm:mt-4">
                                                        <p className="text-xs font-medium text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wide">Recent establishments:</p>
                                                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                                            {group.results.slice(0, 3).map((result) => (
                                                                <span key={result.id} className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                                    {result.establishment?.name || 'Unknown'}
                                                                </span>
                                                            ))}
                                                            {group.results.length > 3 && (
                                                                <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                                                    +{group.results.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center transition-colors">
                                                    <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-gray-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <ClipboardDocumentListIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No inspections found</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                You haven't completed any inspections yet. Start by checking your schedule for upcoming inspections.
                            </p>
                            <div className="flex justify-center">
                                <Link
                                    href="/staff/schedule"
                                    className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                                >
                                    <CalendarIcon className="h-5 w-5 mr-2" />
                                    View Schedule
                                </Link>
                            </div>
                        </div>
                    )
                ) : (
                    // Show detailed inspections for selected date
                    <div>
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        Back to Dates
                                    </button>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                            Inspections for {selectedDate}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Detailed view of all establishments inspected on this date
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                                        {displayFilteredResults.length} Establishments
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                            {displayFilteredResults.map((result) => (
                                <div key={result.id} className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 transition-colors duration-150">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                                        <div className="flex items-center space-x-3 sm:space-x-5">
                                            <div className="flex-shrink-0">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                    <BuildingOfficeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                    <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                        {result.establishment?.name || 'Unknown Establishment'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(result.status)}`}>
                                                            {result.status || 'draft'}
                                                        </span>
                                                        {result.compliance_status && (
                                                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getComplianceColor(result.compliance_status)}`}>
                                                                {result.compliance_status.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <ClipboardDocumentListIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                                        <span className="font-medium">{result.inspection?.quarter || 'N/A'} Inspection</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                                                        <span>Created {new Date(result.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                {result.other_remarks && (
                                                    <div className="mt-3">
                                                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                            {result.other_remarks}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                            <button
                                                onClick={() => openInspectionModal(result)}
                                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-2" />
                                                View
                                            </button>
                                            {result.status === 'draft' && (
                                                <Link
                                                    href={`/staff/inspections/${result.id}/edit`}
                                                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                                                >
                                                    Edit
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {displayData.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        {inspectionResults.prev_page_url && (
                            <Link
                                href={inspectionResults.prev_page_url}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Previous
                            </Link>
                        )}
                        {inspectionResults.next_page_url && (
                            <Link
                                href={inspectionResults.next_page_url}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                Next
                            </Link>
                        )}
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{inspectionResults.from}</span> to{' '}
                                <span className="font-medium">{inspectionResults.to}</span> of{' '}
                                <span className="font-medium">{inspectionResults.total}</span> inspection results
                                {searchTerm && (
                                    <span className="ml-2 text-blue-600">
                                        (filtered to <span className="font-medium">{filteredInspectionResults.length}</span>)
                                    </span>
                                )}
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                {inspectionResults.prev_page_url && (
                                    <Link
                                        href={inspectionResults.prev_page_url}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Link>
                                )}
                                {inspectionResults.next_page_url && (
                                    <Link
                                        href={inspectionResults.next_page_url}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                    >
                                        Next
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Inspection Detail Modal */}
            {showModal && selectedInspection && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity"
                            onClick={closeModal}
                        />

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-100">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 sm:px-6 py-4 sm:py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 sm:space-x-4">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <BuildingOfficeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-white">
                                                Inspection Details
                                            </h3>
                                            <p className="text-blue-100 text-xs sm:text-sm mt-1">
                                                Complete inspection information
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="rounded-xl text-white/80 hover:text-white hover:bg-white/20 p-1.5 sm:p-2 transition-all duration-200"
                                    >
                                        <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white px-4 sm:px-6 py-4 sm:py-6">
                                <div className="space-y-4 sm:space-y-6">
                                    {/* Establishment Info */}
                                    <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-200">
                                        <div className="flex items-center space-x-3 sm:space-x-4">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                                <BuildingOfficeIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                                    {selectedInspection.establishment?.name || 'Unknown Establishment'}
                                                </h4>
                                                <p className="text-gray-600 text-sm sm:text-base mt-1">
                                                    {selectedInspection.establishment?.address || 'No address available'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inspection Info Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Inspection Type</label>
                                            <p className="text-sm sm:text-base font-medium text-gray-900">
                                                {selectedInspection.inspection?.quarter || 'N/A'} Inspection
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Inspection Date</label>
                                            <p className="text-sm sm:text-base font-medium text-gray-900">
                                                {selectedInspection.inspection?.inspection_timestamp 
                                                    ? new Date(selectedInspection.inspection.inspection_timestamp).toLocaleDateString()
                                                    : 'No date'
                                                }
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</label>
                                            <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(selectedInspection.status)}`}>
                                                {selectedInspection.status || 'draft'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Compliance Status</label>
                                            {selectedInspection.compliance_status ? (
                                                <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium ${getComplianceColor(selectedInspection.compliance_status)}`}>
                                                    {selectedInspection.compliance_status.replace('_', ' ')}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Not assessed</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Remarks */}
                                    {selectedInspection.other_remarks && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Remarks</label>
                                            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                                    {selectedInspection.other_remarks}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {selectedInspection.recommendations && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Recommendations</label>
                                            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                                    {selectedInspection.recommendations}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Checklist Summary */}
                                    {selectedInspection.checklistResponses && selectedInspection.checklistResponses.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2 sm:mb-3">Checklist Summary</label>
                                            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 space-y-2 sm:space-y-0">
                                                    <p className="text-gray-700 font-medium text-sm sm:text-base">
                                                        {selectedInspection.checklistResponses.length} questions answered
                                                    </p>
                                                    <div className="h-2 w-full sm:w-32 bg-gray-200 rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                                                            style={{ width: `${(selectedInspection.checklistResponses.length / 10) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {selectedInspection.checklistResponses.slice(0, 3).map((response) => (
                                                        <div key={response.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                                                            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {response.checklistQuestion?.question || 'Unknown question'}
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {response.response}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {selectedInspection.checklistResponses.length > 3 && (
                                                        <p className="text-sm text-gray-500 text-center py-2">
                                                            ...and {selectedInspection.checklistResponses.length - 3} more responses
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Timestamps */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                                        <div className="text-center">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Created</label>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                {new Date(selectedInspection.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Last Updated</label>
                                            <p className="text-xs sm:text-sm text-gray-700">
                                                {new Date(selectedInspection.updated_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 sm:flex sm:flex-row-reverse border-t border-gray-200">
                                {selectedInspection.status === 'draft' && (
                                    <Link
                                        href={`/staff/inspections/${selectedInspection.id}/edit`}
                                        className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-lg px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-sm sm:text-base font-semibold text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 sm:ml-3"
                                    >
                                        Edit Inspection
                                    </Link>
                                )}
                                <button
                                    onClick={closeModal}
                                    className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 sm:px-6 py-2 sm:py-3 bg-white text-sm sm:text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 sm:ml-3"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
}
