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
    ChartBarIcon,
    DocumentTextIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';

// Add custom CSS animations
const customStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateX(-20px);
  }
  to { 
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes scaleIn {
  from { 
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to { 
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.animate-scaleIn {
  animation: scaleIn 0.2s ease-out;
}
`;

export default function MyInspections({ auth }) {
    const { inspectionResults } = usePage().props;
    const [selectedDate, setSelectedDate] = React.useState(null);
    const [selectedInspection, setSelectedInspection] = React.useState(null);
    const [showModal, setShowModal] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    // Inject custom styles
    React.useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = customStyles;
        document.head.appendChild(styleElement);
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

    // Format date as "Month Day Year"
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Group inspection results by inspection date
    const groupedByDate = inspectionResults.data.reduce((groups, result) => {
        if (!result.inspection?.inspection_timestamp) return groups;
        
        const formattedDate = formatDate(result.inspection.inspection_timestamp);
        if (!groups[formattedDate]) {
            groups[formattedDate] = {
                date: formattedDate,
                timestamp: result.inspection.inspection_timestamp,
                results: [],
                totalEstablishments: 0,
                completedCount: 0,
                compliantCount: 0,
                notCompliantCount: 0,
                pendingCount: 0,
            };
        }
        
        groups[formattedDate].results.push(result);
        groups[formattedDate].totalEstablishments++;
        
        if (result.compliance_status === 'compliant') {
            groups[formattedDate].compliantCount++;
        } else if (result.compliance_status === 'not_compliant') {
            groups[formattedDate].notCompliantCount++;
        } else {
            groups[formattedDate].pendingCount++;
        }
        
        if (result.status !== 'draft') {
            groups[formattedDate].completedCount++;
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

    // Enhanced search functionality
    const filteredInspectionResults = React.useMemo(() => {
        if (!searchTerm) return inspectionResults.data;
        
        const lowercaseSearch = searchTerm.toLowerCase();
        return inspectionResults.data.filter((result) => {
            // Search in establishment name
            const establishmentName = result.establishment?.name?.toLowerCase() || '';
            
            // Search in establishment address
            const establishmentAddress = result.establishment?.address?.toLowerCase() || '';
            
            // Search in inspection quarter/type
            const inspectionType = result.inspection?.quarter?.toLowerCase() || '';
            
            // Search in status
            const status = result.status?.toLowerCase() || '';
            
            // Search in compliance status
            const complianceStatus = result.compliance_status?.toLowerCase().replace('_', ' ') || '';
            
            // Search in remarks
            const remarks = result.other_remarks?.toLowerCase() || '';
            
            // Search in recommendations
            const recommendations = result.recommendations?.toLowerCase() || '';
            
            // Search in formatted date
            const formattedDate = result.inspection?.inspection_timestamp 
                ? formatDate(result.inspection.inspection_timestamp).toLowerCase()
                : '';
            
            // Search in created date
            const createdDate = result.created_at 
                ? new Date(result.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }).toLowerCase()
                : '';
            
            return (
                establishmentName.includes(lowercaseSearch) ||
                establishmentAddress.includes(lowercaseSearch) ||
                inspectionType.includes(lowercaseSearch) ||
                status.includes(lowercaseSearch) ||
                complianceStatus.includes(lowercaseSearch) ||
                remarks.includes(lowercaseSearch) ||
                recommendations.includes(lowercaseSearch) ||
                formattedDate.includes(lowercaseSearch) ||
                createdDate.includes(lowercaseSearch)
            );
        });
    }, [inspectionResults.data, searchTerm]);

    // Re-group filtered results by date
    const filteredGroupedByDate = React.useMemo(() => {
        return filteredInspectionResults.reduce((groups, result) => {
            if (!result.inspection?.inspection_timestamp) return groups;
            
            const formattedDate = formatDate(result.inspection.inspection_timestamp);
            if (!groups[formattedDate]) {
                groups[formattedDate] = {
                    date: formattedDate,
                    timestamp: result.inspection.inspection_timestamp,
                    results: [],
                    totalEstablishments: 0,
                    completedCount: 0,
                    compliantCount: 0,
                    notCompliantCount: 0,
                    pendingCount: 0,
                };
            }
            
            groups[formattedDate].results.push(result);
            groups[formattedDate].totalEstablishments++;
            
            if (result.compliance_status === 'compliant') {
                groups[formattedDate].compliantCount++;
            } else if (result.compliance_status === 'not_compliant') {
                groups[formattedDate].notCompliantCount++;
            } else {
                groups[formattedDate].pendingCount++;
            }
            
            if (result.status !== 'draft') {
                groups[formattedDate].completedCount++;
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

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">Total Inspections</p>
                            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{inspectionResults.total || 0}</p>
                        </div>
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                            <ClipboardDocumentListIcon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="bg-white shadow-xl rounded-2xl border border-gray-100 mb-6 sm:mb-8">
                <div className="px-6 sm:px-8 py-5 sm:py-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by establishment name, address, date, status, compliance, remarks, or recommendations..."
                            className="block w-full pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border border-gray-200 rounded-xl text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 animate-fadeIn">
                            <p className="text-sm text-blue-800">
                                Found <span className="font-semibold text-blue-900">{filteredInspectionResults.length}</span> inspection{filteredInspectionResults.length !== 1 ? 's' : ''} matching "{searchTerm}"
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

            <div className="bg-white shadow-xl overflow-hidden sm:rounded-2xl border border-gray-100">
                {!selectedDate ? (
                    // Show date groups
                    displayData.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {displayData.map((group, index) => (
                                <div key={group.date} className="group animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                                    <button
                                        onClick={() => setSelectedDate(group.date)}
                                        className="w-full px-6 sm:px-8 py-5 sm:py-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 text-left transition-all duration-300 group-hover:shadow-sm"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                                            <div className="flex items-center space-x-4 lg:space-x-6">
                                                <div className="flex-shrink-0">
                                                    <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                                                        <CalendarIcon className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                        <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                                            {group.date}
                                                        </p>
                                                        <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-sm lg:text-base font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                                                            {group.completedCount}/{group.totalEstablishments} Completed
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 lg:mt-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
                                                        <div className="flex items-center">
                                                            <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                                                            <span className="font-semibold">{group.totalEstablishments}</span>
                                                            <span className="ml-1 text-gray-500">Establishments</span>
                                                        </div>
                                                        <div className="flex items-center text-blue-600">
                                                            <EyeIcon className="h-4 w-4 mr-2" />
                                                            <span className="font-medium text-sm">Click to view details</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Enhanced Compliance Summary */}
                                                    <div className="mt-4 lg:mt-5 flex flex-wrap items-center gap-3">
                                                        {group.compliantCount > 0 && (
                                                            <div className="flex items-center px-3 lg:px-4 py-2 rounded-xl bg-green-50 border border-green-200 shadow-sm">
                                                                <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
                                                                <span className="text-sm lg:text-base font-semibold text-green-700">{group.compliantCount} Compliant</span>
                                                            </div>
                                                        )}
                                                        {group.notCompliantCount > 0 && (
                                                            <div className="flex items-center px-3 lg:px-4 py-2 rounded-xl bg-red-50 border border-red-200 shadow-sm">
                                                                <ExclamationCircleIcon className="h-4 w-4 mr-2 text-red-600" />
                                                                <span className="text-sm lg:text-base font-semibold text-red-700">{group.notCompliantCount} Not Compliant</span>
                                                            </div>
                                                        )}
                                                        {group.pendingCount > 0 && (
                                                            <div className="flex items-center px-3 lg:px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 shadow-sm">
                                                                <ClockIcon className="h-4 w-4 mr-2 text-amber-600" />
                                                                <span className="text-sm lg:text-base font-semibold text-amber-700">{group.pendingCount} Pending</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Enhanced Recent Establishments */}
                                                    <div className="mt-4 lg:mt-5">
                                                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Recent establishments:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {group.results.slice(0, 3).map((result) => (
                                                                <span key={result.id} className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200 shadow-sm">
                                                                    {result.establishment?.name || 'Unknown'}
                                                                </span>
                                                            ))}
                                                            {group.results.length > 3 && (
                                                                <span className="inline-flex items-center px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                                                    +{group.results.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-full bg-gray-100 group-hover:bg-gray-200 group-hover:scale-110 flex items-center justify-center transition-all duration-300">
                                                    <EyeIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 group-hover:text-gray-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 animate-fadeIn">
                            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No inspections found</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
                                You haven't completed any inspections yet. Start by checking your schedule for upcoming inspections.
                            </p>
                            <div className="flex justify-center">
                                <Link
                                    href="/staff/schedule"
                                    className="inline-flex items-center px-8 py-4 border border-transparent shadow-lg text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 hover:shadow-xl hover:scale-105"
                                >
                                    <CalendarIcon className="h-5 w-5 mr-3" />
                                    View Schedule
                                </Link>
                            </div>
                        </div>
                    )
                ) : (
                    // Show detailed inspections for selected date
                    <div className="animate-fadeIn">
                        <div className="px-6 sm:px-8 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="inline-flex items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                                    >
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        Back to Dates
                                    </button>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                                            Inspections for {selectedDate}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Detailed view of all establishments inspected on this date
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md">
                                        {displayFilteredResults.length} Establishments
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                            {displayFilteredResults.map((result, index) => (
                                <div key={result.id} className="px-6 sm:px-8 py-5 sm:py-6 hover:bg-gray-50/50 transition-all duration-200 animate-slideIn" style={{animationDelay: `${index * 0.1}s`}}>
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                                        <div className="flex items-center space-x-4 lg:space-x-6">
                                            <div className="flex-shrink-0">
                                                <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                                                    <BuildingOfficeIcon className="h-6 w-6 lg:h-7 lg:w-7 text-gray-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                                    <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                                        {result.establishment?.name || 'Unknown Establishment'}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(result.status)}`}>
                                                            {result.status || 'draft'}
                                                        </span>
                                                        {result.compliance_status && (
                                                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getComplianceColor(result.compliance_status)}`}>
                                                                {result.compliance_status.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <ClipboardDocumentListIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                        <span className="font-semibold">{result.inspection?.quarter || 'N/A'} Inspection</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                        <span>Created {formatDate(result.created_at)}</span>
                                                    </div>
                                                </div>
                                                {result.other_remarks && (
                                                    <div className="mt-4">
                                                        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200 leading-relaxed">
                                                            {result.other_remarks}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                            <button
                                                onClick={() => openInspectionModal(result)}
                                                className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                                            >
                                                <EyeIcon className="h-4 w-4 mr-2" />
                                                View
                                            </button>
                                            {result.status === 'draft' && (
                                                <Link
                                                    href={`/staff/inspections/${result.id}/edit`}
                                                    className="inline-flex items-center justify-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 hover:shadow-md"
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

            {/* Enhanced Pagination */}
            {displayData.length > 0 && (
                <div className="bg-white shadow-lg rounded-2xl border border-gray-100 px-6 py-4 mt-6 sm:mt-8 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <div className="text-center sm:text-left">
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-semibold text-gray-900">{inspectionResults.from}</span> to{' '}
                                <span className="font-semibold text-gray-900">{inspectionResults.to}</span> of{' '}
                                <span className="font-semibold text-gray-900">{inspectionResults.total}</span> inspection results
                                {searchTerm && (
                                    <span className="ml-2 text-blue-600">
                                        (filtered to <span className="font-semibold">{filteredInspectionResults.length}</span>)
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {inspectionResults.prev_page_url && (
                                <Link
                                    href={inspectionResults.prev_page_url}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                                >
                                    Previous
                                </Link>
                            )}
                            {inspectionResults.next_page_url && (
                                <Link
                                    href={inspectionResults.next_page_url}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Enhanced Inspection Detail Modal */}
            {showModal && selectedInspection && (
                <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <div 
                            className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity"
                            onClick={closeModal}
                        />

                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-100 animate-scaleIn">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 sm:px-8 py-5 sm:py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 sm:space-x-5">
                                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <BuildingOfficeIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-2xl font-bold text-white">
                                                Inspection Details
                                            </h3>
                                            <p className="text-blue-100 text-sm sm:text-base mt-1">
                                                Complete inspection information
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeModal}
                                        className="rounded-2xl text-white/80 hover:text-white hover:bg-white/20 p-2 sm:p-3 transition-all duration-200 hover:scale-110"
                                    >
                                        <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    </button>
                                </div>
                            </div>

                                {/* Modal Body */}
                                <div className="bg-white px-6 sm:px-8 py-5 sm:py-6">
                                    <div className="space-y-5 sm:space-y-7">
                                        {/* Establishment Info */}
                                        <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200">
                                            <div className="flex items-center space-x-4 sm:space-x-5">
                                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                                    <BuildingOfficeIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                                        {selectedInspection.establishment?.name || 'Unknown Establishment'}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                                                        {selectedInspection.establishment?.address || 'No address available'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Inspection Info Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Inspection Type</label>
                                                <p className="text-sm sm:text-base font-semibold text-gray-900">
                                                    {selectedInspection.inspection?.quarter || 'N/A'} Inspection
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Inspection Date</label>
                                                <p className="text-sm sm:text-base font-semibold text-gray-900">
                                                    {selectedInspection.inspection?.inspection_timestamp 
                                                        ? formatDate(selectedInspection.inspection.inspection_timestamp)
                                                        : 'No date'
                                                    }
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Status</label>
                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(selectedInspection.status)}`}>
                                                    {selectedInspection.status || 'draft'}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Compliance Status</label>
                                                {selectedInspection.compliance_status ? (
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getComplianceColor(selectedInspection.compliance_status)}`}>
                                                        {selectedInspection.compliance_status.replace('_', ' ')}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm font-medium">Not assessed</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Remarks */}
                                        {selectedInspection.other_remarks && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3">Remarks</label>
                                                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                                                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                                        {selectedInspection.other_remarks}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {selectedInspection.recommendations && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3">Recommendations</label>
                                                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                                                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                                        {selectedInspection.recommendations}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Enhanced Checklist Summary */}
                                        {selectedInspection.checklistResponses && selectedInspection.checklistResponses.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-bold text-gray-900 mb-3 sm:mb-4">Checklist Summary</label>
                                                <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-200">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                                                        <p className="text-gray-700 font-bold text-sm sm:text-base">
                                                            {selectedInspection.checklistResponses.length} questions answered
                                                        </p>
                                                        <div className="h-3 w-full sm:w-40 bg-gray-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                                                style={{ width: `${(selectedInspection.checklistResponses.length / 10) * 100}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {selectedInspection.checklistResponses.slice(0, 3).map((response) => (
                                                            <div key={response.id} className="flex items-start space-x-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                                                                <div className="h-2.5 w-2.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-bold text-gray-900">
                                                                        {response.checklistQuestion?.question || 'Unknown question'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        {response.response}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {selectedInspection.checklistResponses.length > 3 && (
                                                            <p className="text-sm text-gray-500 text-center py-3 font-medium">
                                                                ...and {selectedInspection.checklistResponses.length - 3} more responses
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Enhanced Timestamps */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-5 border-t border-gray-200">
                                            <div className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Created</label>
                                                <p className="text-sm text-gray-700 font-medium">
                                                    {formatDate(selectedInspection.created_at)} at {new Date(selectedInspection.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <div className="text-center bg-gray-50 rounded-2xl p-4 border border-gray-200">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Last Updated</label>
                                                <p className="text-sm text-gray-700 font-medium">
                                                    {formatDate(selectedInspection.updated_at)} at {new Date(selectedInspection.updated_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Enhanced Modal Footer */}
                                <div className="bg-gray-50 px-6 sm:px-8 py-4 sm:py-5 sm:flex sm:flex-row-reverse border-t border-gray-200">
                                    {selectedInspection.status === 'draft' && (
                                        <Link
                                            href={`/staff/inspections/${selectedInspection.id}/edit`}
                                            className="w-full sm:w-auto inline-flex justify-center rounded-2xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-base font-bold text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 sm:ml-4 hover:shadow-xl hover:scale-105"
                                        >
                                            Edit Inspection
                                        </Link>
                                    )}
                                    <button
                                        onClick={closeModal}
                                        className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-2xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-bold text-gray-700 hover:bg-gray-50 transition-all duration-300 sm:ml-4 hover:shadow-md"
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
