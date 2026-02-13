import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { useNotification } from '@/Components/ValidationSystem';
import { 
  TrashIcon, 
  PencilSquareIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth }) {
  const { businessTypes, flash } = usePage().props;
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Ensure flash is defined to prevent errors
  const flashMessages = flash || {};
  const [editingType, setEditingType] = useState(null);

  const {
    showSuccess,
    showError,
    showWarning,
    showLoading,
    hideLoading,
    validateDuplicate,
    showDuplicateModal
  } = useNotification();

  const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
    name: '',
    description: '',
    is_active: true
  });

  const filteredBusinessTypes = (businessTypes || []).filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingType(null);
    reset();
    setModalOpen(true);
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setData({
      name: type.name,
      description: type.description || '',
      is_active: type.is_active
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      showError('Validation Error', 'Business type name is required.');
      return;
    }

    if (data.name.length < 2) {
      showError('Validation Error', 'Business type name must be at least 2 characters long.');
      return;
    }

    // Check for duplicates
    const duplicates = validateDuplicate(data, businessTypes || [], ['name']);

    if (duplicates.length > 0) {
      showDuplicateModal(
        duplicates,
        () => {
          // Proceed with submission despite duplicates
          proceedWithSubmission();
        },
        () => {
          // Cancel submission
          showWarning('Cancelled', 'Business type creation was cancelled due to duplicates.');
        }
      );
    } else {
      proceedWithSubmission();
    }
  };

  const proceedWithSubmission = () => {
    showLoading(editingType ? 'Updating business type...' : 'Creating new business type...');
    
    const successCallback = () => {
      hideLoading();
      showSuccess(
        'Success!',
        editingType ? 'Business type updated successfully.' : 'New business type created successfully.'
      );
      setModalOpen(false);
      setEditingType(null);
      reset();
    };

    const errorCallback = (errors) => {
      hideLoading();
      showError('Error', errors.message || 'Something went wrong. Please try again.');
    };
    
    if (editingType) {
      put(route('admin.business-types.update', editingType.id), {
        onSuccess: successCallback,
        onError: errorCallback
      });
    } else {
      post(route('admin.business-types.store'), {
        onSuccess: successCallback,
        onError: errorCallback
      });
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this business type?')) {
      destroy(route('admin.business-types.destroy', id));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData(name, type === 'checkbox' ? checked : value);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Business Types</h2>
              <p className="text-sm text-gray-500">Manage business type categories</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{businessTypes.length}</p>
              <p className="text-xs text-gray-500">Total Types</p>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Business Types" />

      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-4">

        {/* Success/Error Messages */}
        {flashMessages.success && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {flashMessages.success}
          </div>
        )}
        
        {flashMessages.error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {flashMessages.error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{(businessTypes || []).length}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">✓</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-600">Active</p>
                  <p className="text-xl font-bold text-gray-900">{(businessTypes || []).filter(t => t.is_active).length}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden group">
            <div className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <span className="text-white font-bold text-sm">○</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-medium text-gray-600">Inactive</p>
                  <p className="text-xl font-bold text-gray-900">{(businessTypes || []).filter(t => !t.is_active).length}</p>
                </div>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-gray-500 to-gray-600"></div>
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
                  placeholder="Search business types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Type
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Business Type List</h3>
              <div className="text-xs text-gray-600">
                {filteredBusinessTypes.length} of {(businessTypes || []).length} types
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredBusinessTypes.length > 0 ? (
                  filteredBusinessTypes.map((type) => (
                    <tr
                      key={type.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded flex items-center justify-center">
                            <BuildingOfficeIcon className="h-3 w-3 text-white" />
                          </div>
                          <div className="ml-2">
                            <div className="text-sm font-medium text-gray-900">{type.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="max-w-xs truncate">
                          {type.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          type.is_active 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                        }`}>
                          {type.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(type)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-all duration-200 border border-transparent hover:border-green-200"
                            title="Edit"
                          >
                            <PencilSquareIcon className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-all duration-200 border border-transparent hover:border-red-200"
                            title="Delete"
                          >
                            <TrashIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-gray-100 rounded-full mb-2">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {searchTerm ? 'No business types found' : 'No business types available'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {searchTerm ? 'Try adjusting your search terms' : 'Add your first business type to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-4 transform transition-transform duration-300 scale-100">
              <div className="flex justify-between items-center border-b pb-2 mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingType ? 'Edit Business Type' : 'Add New Business Type'}
                </h2>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={handleChange}
                    className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs mt-1">{errors.name}</span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-gray-600 text-sm font-medium mb-1">Description</label>
                  <textarea
                    name="description"
                    value={data.description}
                    onChange={handleChange}
                    rows={3}
                    className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <span className="text-red-500 text-xs mt-1">{errors.description}</span>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={data.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Saving...' : (editingType ? 'Update' : 'Save')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
