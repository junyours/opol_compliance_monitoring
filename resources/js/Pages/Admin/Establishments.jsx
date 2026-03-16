import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import EstablishmentModal from '@/Components/EstablishmentModal';
import { useNotification } from '@/Components/ValidationSystem';
import Pagination from '@/Components/Pagination';
import { 
  TrashIcon, 
  PencilSquareIcon, 
  EyeIcon,
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, businessTypes = [] }) {
  const { establishments, flash } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEstablishment, setEditingEstablishment] = useState(null);
  const [inspectionHistoryModal, setInspectionHistoryModal] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [inspectionHistory, setInspectionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [penaltiesModal, setPenaltiesModal] = useState(false);
  const [penalties, setPenalties] = useState([]);
  const [loadingPenalties, setLoadingPenalties] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    showSuccess,
    showError,
    showLoading,
    hideLoading
  } = useNotification();

  // Enhanced error handling for establishment operations
  const handleEstablishmentError = (errors, operation = 'operation') => {
    console.error(`${operation} errors:`, errors);
    
    // If there are validation errors, show a user-friendly message
    if (errors && typeof errors === 'object') {
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        // Check for common error types
        if (errors.name) {
          showError('Validation Error', 'Business name is required and must be unique.');
        } else if (errors.email) {
          showError('Validation Error', 'Please provide a valid email address.');
        } else if (errors.type_of_business_id) {
          showError('Validation Error', 'Please select a business type.');
        } else if (errors.proponent) {
          showError('Validation Error', 'Proponent name is required.');
        } else if (errors.address) {
          showError('Validation Error', 'Address is required.');
        } else {
          // Show a general validation error message
          const firstError = errors[errorFields[0]];
          showError('Validation Error', firstError || 'Please check all required fields.');
        }
      }
    } else if (typeof errors === 'string') {
      showError('Error', errors);
    } else {
      showError('Error', `Failed to complete ${operation}. Please try again.`);
    }
  };

  const handleEdit = (establishment) => {
    setEditingEstablishment(establishment);
    setModalOpen(true);
  };

  const handleDeactivate = (id) => {
    showLoading('Deactivating establishment...');
    Inertia.patch(`/admin/establishments/${id}/deactivate`, {}, {
      onSuccess: () => {
        hideLoading();
        showSuccess('Success!', 'Establishment deactivated successfully.');
      },
      onError: (errors) => {
        hideLoading();
        handleEstablishmentError(errors, 'deactivate establishment');
      }
    });
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to permanently delete this establishment? This action cannot be undone.')) {
      showLoading('Deleting establishment...');
      Inertia.delete(`/admin/establishments/${id}`, {}, {
        onSuccess: () => {
          hideLoading();
          showSuccess('Success!', 'Establishment deleted successfully.');
        },
        onError: (errors) => {
          hideLoading();
          handleEstablishmentError(errors, 'delete establishment');
        }
      });
    }
  };

  const handleViewInspectionHistory = async (establishment) => {
    setSelectedEstablishment(establishment);
    setInspectionHistoryModal(true);
    setLoadingHistory(true);
    
    try {
      const response = await fetch(`/admin/establishments/${establishment.id}/inspection-history`);
      const data = await response.json();
      
      if (response.ok) {
        setInspectionHistory(data.inspection_results);
      } else {
        showError('Error', 'Failed to load inspection history.');
      }
    } catch (error) {
      showError('Error', 'Failed to load inspection history.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleUpdatePenaltyStatus = async (penaltyId, newStatus) => {
    if (!confirm(`Are you sure you want to mark this penalty as ${newStatus}?`)) {
      return;
    }

    showLoading('Updating penalty status...');
    
    try {
      const response = await fetch(`/admin/penalties/${penaltyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local state
        setPenalties(prevPenalties => 
          prevPenalties.map(penalty => 
            penalty.id === penaltyId 
              ? { ...penalty, status: newStatus }
              : penalty
          )
        );
        showSuccess('Success!', `Penalty marked as ${newStatus}.`);
      } else {
        showError('Error', 'Failed to update penalty status.');
      }
    } catch (error) {
      showError('Error', 'Failed to update penalty status.');
    } finally {
      hideLoading();
    }
  };

  const handleViewPenalties = async (establishment) => {
    setSelectedEstablishment(establishment);
    setPenaltiesModal(true);
    setLoadingPenalties(true);
    
    try {
      const response = await fetch(`/admin/establishments/${establishment.id}/penalties`);
      const data = await response.json();
      
      if (response.ok) {
        // Process penalties to determine offense levels based on penalty_type
        const processedPenalties = (data.penalties || []).map((penalty, index) => {
          let offenseNumber = 1; // default
          let offenseLevel = '1st';
          
          // Determine offense level based on penalty_type enum from database
          if (penalty.penalty_type === 'first_penalty') {
            offenseNumber = 1;
            offenseLevel = '1st';
          } else if (penalty.penalty_type === 'second_penalty') {
            offenseNumber = 2;
            offenseLevel = '2nd';
          } else if (penalty.penalty_type === 'third_penalty') {
            offenseNumber = 3;
            offenseLevel = '3rd';
          } else {
            // Fallback to index if penalty_type is not set
            offenseNumber = index + 1;
            const getOrdinal = (num) => {
              const s = ["th", "st", "nd", "rd"];
              const v = num % 100;
              return num + (s[(v - 20) % 10] || s[v] || s[0]);
            };
            offenseLevel = getOrdinal(offenseNumber);
          }
          
          // Get severity with fallback
          const severity = getSeverity(offenseNumber);
          
          return {
            ...penalty,
            offenseLevel: offenseLevel,
            offenseNumber: offenseNumber,
            severity: severity || { color: 'gray', label: 'Unknown', level: 'Unknown' }
          };
        });
        
        setPenalties(processedPenalties);
      } else {
        showError('Error', 'Failed to load penalties.');
      }
    } catch (error) {
      showError('Error', 'Failed to load penalties.');
    } finally {
      setLoadingPenalties(false);
    }
  };

  const getSeverity = (offenseLevel) => {
    if (!offenseLevel) return { color: 'gray', label: 'Unknown', level: 'Unknown' };
    if (offenseLevel === 1) return { color: 'yellow', label: 'Warning', level: 'Low' };
    if (offenseLevel === 2) return { color: 'orange', label: 'Moderate', level: 'Medium' };
    if (offenseLevel === 3) return { color: 'red', label: 'Severe', level: 'High' };
    return { color: 'purple', label: 'Critical', level: 'Very High' };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        icon: '✓',
        label: 'Active'
      },
      'inactive': { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        icon: '○',
        label: 'Inactive'
      },
      'suspended': { 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        icon: '✕',
        label: 'Suspended'
      }
    };
    
    const config = statusConfig[status] || statusConfig['inactive'];
    
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-semibold ${config.color} shadow-sm`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getComplianceBadge = (status) => {
    const statusConfig = {
      'compliant': { 
        color: 'bg-green-100 text-green-800 border border-green-200', 
        icon: CheckCircleIcon,
        label: 'Compliant'
      },
      'not_compliant': { 
        color: 'bg-red-100 text-red-800 border border-red-200', 
        icon: XCircleIcon,
        label: 'Not Compliant'
      },
      'pending': { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', 
        icon: QuestionMarkCircleIcon,
        label: 'Pending'
      }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredEstablishments = establishments.filter(est => 
    est.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.proponent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.business_type?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.Barangay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredEstablishments.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEstablishments = filteredEstablishments.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
              <h2 className="text-2xl font-bold text-gray-900">Establishments</h2>
              <p className="text-sm text-gray-500">Manage business establishments and facilities</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{establishments.length}</p>
              <p className="text-xs text-gray-500">Total Establishments</p>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Establishments" />

      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Flash Messages */}
        {flash?.success && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl shadow-lg animate-fade-in">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-full mr-3 animate-pulse">
                <CheckCircleIcon className="w-5 h-5 text-white" />
              </div>
              <p className="text-green-800 dark:text-green-200 font-medium">{flash.success}</p>
            </div>
          </div>
        )}
        {flash?.error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg animate-fade-in">
            <div className="flex items-center">
              <div className="p-2 bg-red-500 rounded-full mr-3 animate-pulse">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              </div>
              <p className="text-red-800 dark:text-red-200 font-medium">{flash.error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{establishments.length}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-600">Active</p>
                  <p className="text-xl font-bold text-gray-900">{establishments.filter(e => e.status === 'active').length}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">○</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-600">Inactive</p>
                  <p className="text-xl font-bold text-gray-900">{establishments.filter(e => e.status === 'inactive').length}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">✕</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-600">Suspended</p>
                  <p className="text-xl font-bold text-gray-900">{establishments.filter(e => e.status === 'suspended').length}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
          </div>
        </div>

        {/* Search and Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, proponent, type, barangay, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New
            </button>
          </div>
        </div>

        {/* Modal */}
        <EstablishmentModal 
          isOpen={modalOpen} 
          onClose={() => {
            setModalOpen(false);
            setEditingEstablishment(null);
          }} 
          businessTypes={businessTypes} 
          editingEstablishment={editingEstablishment}
        />

        {/* Inspection History Modal */}
        {inspectionHistoryModal && selectedEstablishment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
                onClick={() => setInspectionHistoryModal(false)}
              ></div>

              {/* Modal panel */}
              <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <BuildingOfficeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Inspection History</h3>
                        <p className="text-sm text-blue-100">{selectedEstablishment.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setInspectionHistoryModal(false)}
                      className="p-2 text-white hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Establishment Details */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Proponent:</span>
                      <p className="text-gray-600">{selectedEstablishment.proponent || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span>
                      <p className="text-gray-600 truncate">{selectedEstablishment.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Capacity:</span>
                      <p className="text-gray-600">{selectedEstablishment.total_capacity || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Rooms:</span>
                      <p className="text-gray-600">{selectedEstablishment.number_of_rooms || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Employees:</span>
                      <p className="text-gray-600">{selectedEstablishment.number_of_employees || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Barangay:</span>
                      <p className="text-gray-600">{selectedEstablishment.Barangay || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <p className="text-gray-600">{selectedEstablishment.business_type?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <div className="mt-1">
                        {getStatusBadge(selectedEstablishment.status)}
                      </div>
                    </div>
                  </div>

                  {/* Conditional Field Responses */}
                  {inspectionHistory.length > 0 && inspectionHistory[0].conditional_field_responses && Object.keys(inspectionHistory[0].conditional_field_responses).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="text-sm font-medium text-gray-700 mb-3">Updated Conditional Question Responses:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Object.entries(inspectionHistory[0].conditional_field_responses).map(([questionId, questionData]) => (
                          <div 
                            key={questionId} 
                            className={`rounded-lg p-3 border ${
                              questionData.is_expired 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-blue-50 border-blue-200'
                            }`}
                          >
                            <div className={`text-xs font-medium mb-2 ${
                              questionData.is_expired ? 'text-red-800' : 'text-blue-800'
                            }`}>
                              {questionData.question_text}
                            </div>
                            
                            {/* Display Question Name if available */}
                            {questionData.question_name && (
                              <div className={`text-xs font-medium mb-2 ${
                                questionData.is_expired ? 'text-red-700' : 'text-blue-700'
                              }`}>
                                {questionData.question_name}
                              </div>
                            )}
                            
                            {/* Display Response Value */}
                            {questionData.response && (
                              <div className={`text-xs font-medium mb-2 ${
                                questionData.is_expired ? 'text-red-700' : 'text-gray-700'
                              }`}>
                                Response: <span className={
                                  questionData.is_expired ? 'text-red-900' : 'text-gray-900'
                                }>{
                                  questionData.response === 'N/A' || questionData.response === 'not applicable' || questionData.response === 'Not Applicable' 
                                    ? 'N/A' 
                                    : questionData.response
                                }</span>
                              </div>
                            )}
                            
                            {questionData.is_expired && questionData.expired_notes && (
                              <div className="text-xs font-medium text-red-600 mb-2">
                                ⚠️ {questionData.expired_notes}
                              </div>
                            )}
                            <div className="space-y-1">
                              {Object.entries(questionData.fields).map(([fieldName, fieldValue]) => (
                                <div key={fieldName} className="text-xs">
                                  <span className={`font-medium capitalize ${
                                    questionData.is_expired ? 'text-red-700' : 'text-gray-700'
                                  }`}>
                                    {fieldName.replace(/_/g, ' ')}:
                                  </span>
                                  <span className={`ml-1 ${
                                    questionData.is_expired ? 'text-red-900' : 'text-gray-900'
                                  }`}>
                                    {fieldValue || 'N/A'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600">Loading inspection history...</span>
                    </div>
                  ) : inspectionHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-3 bg-gray-100 rounded-full inline-flex mb-4">
                        <EyeIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No Inspection History</h4>
                      <p className="text-gray-500">This establishment hasn't been inspected yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {inspectionHistory.map((inspection) => (
                        <div key={inspection.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-gray-900">{inspection.inspection.title}</h4>
                                {getComplianceBadge(inspection.compliance_status)}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <CalendarIcon className="w-4 h-4 mr-1" />
                                  {formatDate(inspection.created_at)}
                                </div>
                                {inspection.staff && (
                                  <div className="flex items-center">
                                    <UserIcon className="w-4 h-4 mr-1" />
                                    {inspection.staff.name}
                                  </div>
                                )}
                                <div className="flex items-center">
                                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                                    {inspection.inspection.quarter}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Response Summary */}
                          {inspection.responses_summary && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center space-x-4">
                                  <span className="text-gray-600">Responses:</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="flex items-center text-green-600">
                                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                                      {inspection.responses_summary.compliant}
                                    </span>
                                    <span className="flex items-center text-red-600">
                                      <XCircleIcon className="w-4 h-4 mr-1" />
                                      {inspection.responses_summary.non_compliant}
                                    </span>
                                    <span className="flex items-center text-gray-500">
                                      <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />
                                      {inspection.responses_summary.na}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-gray-500">
                                  {inspection.responses_summary.total} questions
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setInspectionHistoryModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Penalties Modal */}
        {penaltiesModal && selectedEstablishment && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
                onClick={() => setPenaltiesModal(false)}
              ></div>

              {/* Modal panel */}
              <div className="inline-block w-full max-w-5xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-2xl rounded-2xl">
                {/* Header */}
                <div className="px-6 py-6 bg-gradient-to-r from-orange-600 via-orange-600 to-red-600 border-b border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Penalties & Violations</h3>
                        <p className="text-sm text-orange-100 font-medium">{selectedEstablishment.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPenaltiesModal(false)}
                      className="p-2 text-white hover:text-white/80 hover:bg-white/10 rounded-lg transition-all duration-200"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Statistics Cards */}
                {!loadingPenalties && penalties.length > 0 && (
                  <div className="px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Penalties</p>
                            <p className="text-xl font-bold text-gray-900">{penalties.length}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="p-2 bg-red-100 rounded-lg">
                            <span className="text-red-600 font-bold text-sm">₱</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Amount</p>
                            <p className="text-xl font-bold text-gray-900">
                              ₱{penalties.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <span className="text-yellow-600 font-bold text-sm">⏱</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Unpaid</p>
                            <p className="text-xl font-bold text-gray-900">
                              {penalties.filter(p => (p.status || 'pending') === 'pending' || (p.status || 'pending') === 'unpaid').length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <span className="text-green-600 font-bold text-sm">✓</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Paid</p>
                            <p className="text-xl font-bold text-gray-900">
                              {penalties.filter(p => p.status === 'paid').length}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <span className="text-blue-600 font-bold text-sm">1st</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">1st Offense</p>
                            <p className="text-xl font-bold text-gray-900">
                              {penalties.filter(p => p.offenseNumber === 1).length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Establishment Details */}
                <div className="px-6 py-4 bg-white border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-600" />
                    Establishment Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700 text-xs uppercase tracking-wide block mb-1">Proponent</span>
                      <p className="text-gray-900 font-medium">{selectedEstablishment.proponent || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700 text-xs uppercase tracking-wide block mb-1">Email</span>
                      <p className="text-gray-900 font-medium truncate">{selectedEstablishment.email || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700 text-xs uppercase tracking-wide block mb-1">Barangay</span>
                      <p className="text-gray-900 font-medium">{selectedEstablishment.Barangay || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700 text-xs uppercase tracking-wide block mb-1">Business Type</span>
                      <p className="text-gray-900 font-medium">{selectedEstablishment.business_type?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  {loadingPenalties ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
                      <span className="text-gray-600 font-medium">Loading penalties...</span>
                    </div>
                  ) : penalties.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-full inline-flex mb-4">
                        <ExclamationTriangleIcon className="w-8 h-8 text-green-500" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">No Penalties Found</h4>
                      <p className="text-gray-600 max-w-md mx-auto">This establishment has a clean record with no penalties or violations recorded.</p>
                      <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Compliant Status
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {penalties.map((penalty, index) => {
                        // Ensure severity has default values
                        const severity = penalty.severity || { color: 'gray', label: 'Unknown', level: 'Unknown' };
                        const offenseNumber = penalty.offenseNumber || (index + 1);
                        const offenseLevel = penalty.offenseLevel || `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'}`;
                        const currentStatus = penalty.status || 'unpaid'; // Default to unpaid
                        
                        return (
                        <div key={penalty.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-orange-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="flex items-center space-x-2">
                                  <span className={`flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm text-white ${
                                    offenseNumber === 1 ? 'bg-yellow-500' :
                                    offenseNumber === 2 ? 'bg-orange-500' :
                                    'bg-red-500'
                                  }`}>
                                    {offenseLevel}
                                  </span>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-lg">{penalty.type || 'Violation'}</h4>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        severity.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                        severity.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                        severity.color === 'red' ? 'bg-red-100 text-red-800' :
                                        severity.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {severity.label} - {severity.level} Severity
                                      </span>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                        severity.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                        severity.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                                        severity.color === 'red' ? 'bg-red-100 text-red-800' :
                                        severity.color === 'purple' ? 'bg-purple-100 text-purple-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {offenseLevel} Offense
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                                    currentStatus === 'paid' 
                                      ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300' 
                                      : currentStatus === 'pending' || currentStatus === 'unpaid'
                                      ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
                                      : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                                  }`}>
                                    <span className={`w-2 h-2 rounded-full mr-2 ${
                                      currentStatus === 'paid' ? 'bg-green-500' : currentStatus === 'pending' || currentStatus === 'unpaid' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></span>
                                    {currentStatus === 'paid' ? 'Paid' : currentStatus === 'pending' || currentStatus === 'unpaid' ? 'Unpaid' : 'Unknown'}
                                  </span>
                                  
                                  {/* Action Button */}
                                  {currentStatus !== 'paid' && (
                                    <button
                                      onClick={() => handleUpdatePenaltyStatus(penalty.id, 'paid')}
                                      className="inline-flex items-center px-3 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                                      title="Mark as Paid"
                                    >
                                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                                      Mark Paid
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="p-2 bg-gray-100 rounded-lg">
                                    <CalendarIcon className="w-4 h-4 text-gray-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date Issued</p>
                                    <p className="text-sm font-semibold text-gray-900">{formatDate(penalty.created_at)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <div className="p-2 bg-red-100 rounded-lg">
                                    <span className="text-red-600 font-bold">₱</span>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
                                    <p className="text-sm font-bold text-gray-900">₱{parseFloat(penalty.amount || 0).toLocaleString()}</p>
                                  </div>
                                </div>

                                {penalty.due_date && (
                                  <div className="flex items-center space-x-2">
                                    <div className="p-2 bg-orange-100 rounded-lg">
                                      <span className="text-orange-600 font-bold text-sm">⏰</span>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
                                      <p className="text-sm font-semibold text-gray-900">{formatDate(penalty.due_date)}</p>
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center space-x-2">
                                  <div className={`p-2 rounded-lg ${
                                    currentStatus === 'paid' ? 'bg-green-100' : 'bg-yellow-100'
                                  }`}>
                                    {currentStatus === 'paid' ? (
                                      <CheckCircleIcon className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <XCircleIcon className="w-4 h-4 text-yellow-600" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                                    <p className={`text-sm font-semibold ${
                                      currentStatus === 'paid' ? 'text-green-700' : 'text-yellow-700'
                                    }`}>
                                      {currentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Severity Progress Bar */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-gray-700">Severity Level</span>
                                  <span className="text-xs font-medium text-gray-900">{severity.level}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      severity.color === 'yellow' ? 'bg-yellow-500' :
                                      severity.color === 'orange' ? 'bg-orange-500' :
                                      severity.color === 'red' ? 'bg-red-500' :
                                      severity.color === 'purple' ? 'bg-purple-500' :
                                      'bg-gray-500'
                                    }`}
                                    style={{
                                      width: severity.level === 'Low' ? '25%' :
                                             severity.level === 'Medium' ? '50%' :
                                             severity.level === 'High' ? '75%' : 
                                             severity.level === 'Very High' ? '100%' : '10%'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {penalty.description && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h5 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Violation Details</h5>
                              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3">{penalty.description}</p>
                            </div>
                          )}

                          {penalty.violation_type && (
                            <div className="mt-3 flex items-center space-x-2">
                              <span className="text-xs font-medium text-gray-500">Category:</span>
                              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                                {penalty.violation_type}
                              </span>
                            </div>
                          )}

                          {/* Offense Level Indicator */}
                          <div className="mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-xs font-medium text-gray-600">Offense Progress:</span>
                              <div className="flex space-x-1">
                                {[1, 2, 3].map((level) => (
                                  <div
                                    key={level}
                                    className={`w-8 h-2 rounded-full ${
                                      level <= offenseNumber
                                        ? level === 1 ? 'bg-yellow-500' :
                                          level === 2 ? 'bg-orange-500' : 'bg-red-500'
                                        : 'bg-gray-300'
                                    }`}
                                  ></div>
                                ))}
                              </div>
                            </div>
                            <span className={`text-xs font-medium ${
                              offenseNumber === 1 ? 'text-yellow-700' :
                              offenseNumber === 2 ? 'text-orange-700' :
                              'text-red-700'
                            }`}>
                              {offenseLevel} Offense
                            </span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {penalties.length > 0 && (
                        <span className="font-medium">Last updated: {formatDate(penalties[0].updated_at || penalties[0].created_at)}</span>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setPenaltiesModal(false)}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Establishment List</h3>
              <div className="text-xs text-gray-600">
                {paginatedEstablishments.length} of {totalItems} establishments
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'Proponent', 'Type', 'Barangay', 'Email', 'Status', 'Actions'].map((col) => (
                    <th
                      key={col}
                      className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedEstablishments.length > 0 ? (
                  paginatedEstablishments.map((est) => (
                    <tr
                      key={est.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-5 w-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center">
                            <BuildingOfficeIcon className="h-2.5 w-2.5 text-white" />
                          </div>
                          <div className="ml-1.5">
                            <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">{est.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600 truncate max-w-[100px]">{est.proponent || 'N/A'}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          <div className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={est.business_type?.name || 'N/A'}>
                            {est.business_type?.name || 'N/A'}
                          </div>
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600 truncate max-w-[80px]">{est.Barangay || 'N/A'}</td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                          </div>
                          <div className="ml-1">
                            <div className="text-xs text-gray-900 truncate max-w-[100px]">{est.email || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        {getStatusBadge(est.status)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          {/* View */}
                          <button
                            onClick={() => handleViewInspectionHistory(est)}
                            className="inline-flex items-center px-1.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all duration-200 border border-transparent hover:border-blue-200"
                            title="View Inspection History"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </button>

                          {/* Penalties */}
                          <button
                            onClick={() => handleViewPenalties(est)}
                            className="inline-flex items-center px-1.5 py-1 text-xs font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-all duration-200 border border-transparent hover:border-orange-200"
                            title="View Penalties"
                          >
                            <ExclamationTriangleIcon className="h-3 w-3" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(est)}
                            className="inline-flex items-center px-1.5 py-1 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-all duration-200 border border-transparent hover:border-green-200"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-3 w-3" />
                          </button>

                          {/* Deactivate/Delete */}
                          {est.status === 'inactive' ? (
                            <button
                              onClick={() => handleDelete(est.id)}
                              className="inline-flex items-center px-1.5 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200 border border-transparent hover:border-red-200"
                              title="Permanently delete"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivate(est.id)}
                              className="inline-flex items-center px-1.5 py-1 text-xs font-medium text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded transition-all duration-200 border border-transparent hover:border-orange-200"
                              title="Deactivate"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-gray-100 rounded-full mb-2">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {searchTerm ? 'No establishments found' : 'No establishments available'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {searchTerm ? 'Try adjusting your search terms' : 'Add your first establishment to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
