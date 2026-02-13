import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import EstablishmentModal from '@/Components/EstablishmentModal';
import { useNotification } from '@/Components/ValidationSystem';
import { 
  TrashIcon, 
  PencilSquareIcon, 
  EyeIcon,
  BuildingOfficeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EnvelopeIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, businessTypes = [] }) {
  const { establishments } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEstablishment, setEditingEstablishment] = useState(null);
  const [inspectionHistoryModal, setInspectionHistoryModal] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);
  const [inspectionHistory, setInspectionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    showSuccess,
    showError,
    showWarning,
    showLoading,
    hideLoading
  } = useNotification();

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
        showError('Error', errors.message || 'Failed to deactivate establishment.');
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
          showError('Error', errors.message || 'Failed to delete establishment.');
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
    est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.proponent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.business_type?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.Barangay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    est.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Establishment List</h3>
              <div className="text-xs text-gray-600">
                {filteredEstablishments.length} of {establishments.length} establishments
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
                {filteredEstablishments.length > 0 ? (
                  filteredEstablishments.map((est) => (
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
                          {est.business_type?.name || 'N/A'}
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
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
