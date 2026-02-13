import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useNotification } from '@/Components/ValidationSystem';
import { 
    DocumentTextIcon,
    PlusIcon,
    XMarkIcon,
    PencilSquareIcon,
    TrashIcon,
    Cog6ToothIcon,
    TableCellsIcon,
    Squares2X2Icon
} from '@heroicons/react/24/outline';

export default function Utilities({ auth }) {
    const { utilities } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editingUtility, setEditingUtility] = useState(null);
    
    const {
        showSuccess,
        showError,
        showWarning,
        showLoading,
        hideLoading,
        validateDuplicate,
        showDuplicateModal
    } = useNotification();
    
    const [formData, setFormData] = useState({
        form_name: '',
        form_type: 'utility_inspection',
        rows: [
            { name: 'Month', type: 'text', required: true },
            { name: 'Deepwell Pump Rated Capacity', type: 'text', required: false },
            { name: 'Deepwell Permit No.', type: 'text', required: false },
            { name: 'Date Issued', type: 'date', required: false },
            { name: 'Brand/Rated Capacity', type: 'text', required: false },
            { name: 'Permit No.', type: 'text', required: false },
            { name: 'Expiry Date', type: 'date', required: false },
            { name: 'Geotags', type: 'text', required: false }
        ],
        columns: [
            { name: 'COWD', type: 'text', required: false },
            { name: 'Deepwell', type: 'text', required: false },
            { name: 'MORESCO', type: 'text', required: false },
            { name: 'Gen Set', type: 'text', required: false }
        ],
        description: '',
        is_active: true
    });

    const resetForm = () => {
        setFormData({
            form_name: '',
            form_type: 'utility_inspection',
            rows: [
                { name: 'Month', type: 'text', required: true },
                { name: 'Deepwell Pump Rated Capacity', type: 'text', required: false },
                { name: 'Deepwell Permit No.', type: 'text', required: false },
                { name: 'Date Issued', type: 'date', required: false },
                { name: 'Brand/Rated Capacity', type: 'text', required: false },
                { name: 'Permit No.', type: 'text', required: false },
                { name: 'Expiry Date', type: 'date', required: false },
                { name: 'Geotags', type: 'text', required: false }
            ],
            columns: [
                { name: 'COWD', type: 'text', required: false },
                { name: 'Deepwell', type: 'text', required: false },
                { name: 'MORESCO', type: 'text', required: false },
                { name: 'Gen Set', type: 'text', required: false }
            ],
            description: '',
            is_active: true
        });
        setEditingUtility(null);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...formData.rows];
        newRows[index][field] = field === 'required' ? (value === 'true' || value === true) : value;
        setFormData(prev => ({ ...prev, rows: newRows }));
    };

    const handleColumnChange = (index, field, value) => {
        const newColumns = [...formData.columns];
        newColumns[index][field] = field === 'required' ? (value === 'true' || value === true) : value;
        setFormData(prev => ({ ...prev, columns: newColumns }));
    };

    const addRow = () => {
        setFormData(prev => ({
            ...prev,
            rows: [...prev.rows, { name: '', type: 'text', required: false }]
        }));
    };

    const removeRow = (index) => {
        const newRows = formData.rows.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, rows: newRows }));
    };

    const addColumn = () => {
        setFormData(prev => ({
            ...prev,
            columns: [...prev.columns, { name: '', type: 'text', required: false }]
        }));
    };

    const removeColumn = (index) => {
        const newColumns = formData.columns.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, columns: newColumns }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.form_name || formData.form_name.trim() === '') {
            showError('Validation Error', 'Form name is required.');
            return;
        }

        if (formData.form_name.length < 3) {
            showError('Validation Error', 'Form name must be at least 3 characters long.');
            return;
        }

        // Validate rows
        if (!formData.rows || formData.rows.length === 0) {
            showError('Validation Error', 'At least one row is required.');
            return;
        }

        // Validate columns
        if (!formData.columns || formData.columns.length === 0) {
            showError('Validation Error', 'At least one column is required.');
            return;
        }

        // Check for duplicates
        const duplicates = validateDuplicate(formData, utilities || [], ['form_name']);

        if (duplicates.length > 0) {
            showDuplicateModal(
                duplicates,
                () => {
                    proceedWithSubmit();
                },
                () => {
                    showWarning('Cancelled', 'Utility form creation was cancelled due to duplicates.');
                }
            );
        } else {
            proceedWithSubmit();
        }
    };

    const proceedWithSubmit = () => {
        showLoading(editingUtility ? 'Updating utility form...' : 'Creating new utility form...');
        
        if (editingUtility) {
            Inertia.patch(route('utilities.update', editingUtility.id), formData, {
                onSuccess: () => {
                    hideLoading();
                    showSuccess('Success!', 'Utility form updated successfully.');
                    resetForm();
                },
                onError: (errors) => {
                    hideLoading();
                    showError('Error', errors.message || 'Failed to update utility form.');
                }
            });
        } else {
            Inertia.post(route('utilities.store'), formData, {
                onSuccess: () => {
                    hideLoading();
                    showSuccess('Success!', 'Utility form created successfully.');
                    resetForm();
                },
                onError: (errors) => {
                    hideLoading();
                    showError('Error', errors.message || 'Failed to create utility form.');
                }
            });
        }
    };

    const handleEdit = (utility) => {
        setEditingUtility(utility);
        setFormData({
            form_name: utility.form_name,
            form_type: utility.form_type,
            rows: utility.rows || [],
            columns: utility.columns || [],
            description: utility.description || '',
            is_active: utility.is_active
        });
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this utility record? This action cannot be undone.')) {
            showLoading('Deleting utility record...');
            Inertia.delete(route('utilities.destroy', id), {}, {
                onSuccess: () => {
                    hideLoading();
                    showSuccess('Success!', 'Utility record deleted successfully.');
                },
                onError: (errors) => {
                    hideLoading();
                    showError('Error', errors.message || 'Failed to delete utility record.');
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                            <Cog6ToothIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Form Structure Builder</h2>
                            <p className="text-sm text-gray-500">Create and manage dynamic form structures</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{utilities.length}</p>
                            <p className="text-xs text-gray-500">Total Forms</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Utilities Management" />

                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header with Add Button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                    <DocumentTextIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Form Structures</h3>
                                    <p className="text-sm text-gray-500">Dynamic form templates for inspections</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                {showForm ? (
                                    <>
                                        <XMarkIcon className="w-4 h-4 mr-2" />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Create Form Structure
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                <h4 className="text-lg font-bold text-gray-900">
                                    {editingUtility ? 'Edit Form Structure' : 'Create New Form Structure'}
                                </h4>
                            </div>
                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Form Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Form Name
                                            </label>
                                            <input
                                                type="text"
                                                name="form_name"
                                                value={formData.form_name}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Utility Inspection Form"
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Form Type
                                            </label>
                                            <select
                                                name="form_type"
                                                value={formData.form_type}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                            >
                                                <option value="utility_inspection">Utility Inspection</option>
                                                <option value="water_source">Water Source</option>
                                                <option value="power_source">Power Source</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Form description..."
                                            rows="3"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        />
                                    </div>

                                    {/* Rows Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Squares2X2Icon className="w-5 h-5 text-gray-600" />
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Rows (Data Fields)
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addRow}
                                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium shadow-sm"
                                            >
                                                <PlusIcon className="w-4 h-4 mr-1" />
                                                Add Row
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.rows.map((row, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                                                    <input
                                                        type="text"
                                                        value={row.name}
                                                        onChange={(e) => handleRowChange(index, 'name', e.target.value)}
                                                        placeholder="Row name"
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <select
                                                        value={row.type}
                                                        onChange={(e) => handleRowChange(index, 'type', e.target.value)}
                                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="number">Number</option>
                                                        <option value="date">Date</option>
                                                        <option value="textarea">Textarea</option>
                                                    </select>
                                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={row.required}
                                                            onChange={(e) => handleRowChange(index, 'required', e.target.checked)}
                                                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        Required
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRow(index)}
                                                        className="inline-flex items-center px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                                    >
                                                        <TrashIcon className="w-4 h-4 mr-1" />
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Columns Section */}
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <TableCellsIcon className="w-5 h-5 text-gray-600" />
                                                <label className="text-sm font-semibold text-gray-700">
                                                    Columns (Water & Power Sources)
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addColumn}
                                                className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium shadow-sm"
                                            >
                                                <PlusIcon className="w-4 h-4 mr-1" />
                                                Add Column
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {formData.columns.map((column, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                                                    <input
                                                        type="text"
                                                        value={column.name}
                                                        onChange={(e) => handleColumnChange(index, 'name', e.target.value)}
                                                        placeholder="Column name"
                                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                    <select
                                                        value={column.type}
                                                        onChange={(e) => handleColumnChange(index, 'type', e.target.value)}
                                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="number">Number</option>
                                                        <option value="date">Date</option>
                                                        <option value="textarea">Textarea</option>
                                                    </select>
                                                    <label className="flex items-center text-sm font-medium text-gray-700">
                                                        <input
                                                            type="checkbox"
                                                            checked={column.required}
                                                            onChange={(e) => handleColumnChange(index, 'required', e.target.checked)}
                                                            className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        Required
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeColumn(index)}
                                                        className="inline-flex items-center px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                                    >
                                                        <TrashIcon className="w-4 h-4 mr-1" />
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active Status */}
                                    <div>
                                        <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={handleInputChange}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm font-semibold text-gray-700">Active Status</span>
                                            <span className="text-xs text-gray-500">({formData.is_active ? 'Enabled' : 'Disabled'})</span>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex justify-end pt-4 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                                        >
                                            {editingUtility ? (
                                                <>
                                                    <PencilSquareIcon className="w-5 h-5 mr-2" />
                                                    Update Form Structure
                                                </>
                                            ) : (
                                                <>
                                                    <PlusIcon className="w-5 h-5 mr-2" />
                                                    Create Form Structure
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Form Structures List */}
                    <div className="space-y-4">
                        {utilities.length > 0 ? (
                            utilities.map((utility) => (
                                <div key={utility.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                                        <DocumentTextIcon className="w-4 h-4 text-white" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900">
                                                        {utility.form_name}
                                                    </h4>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                                        {utility.form_type}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        utility.is_active 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {utility.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        Created: {new Date(utility.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {utility.description && (
                                                    <p className="text-sm text-gray-600 mt-2">{utility.description}</p>
                                                )}
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                <button
                                                    onClick={() => handleEdit(utility)}
                                                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                                                >
                                                    <PencilSquareIcon className="w-4 h-4 mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(utility.id)}
                                                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Display Rows */}
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-2 mb-3">
                                                <Squares2X2Icon className="w-4 h-4 text-gray-600" />
                                                <h5 className="text-sm font-bold text-gray-900">
                                                    Rows ({utility.rows?.length || 0})
                                                </h5>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {utility.rows?.map((row, index) => (
                                                    <span key={index} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium border border-blue-200">
                                                        {row.name} ({row.type}){row.required && <span className="ml-1 text-red-600">*</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Display Columns */}
                                        <div>
                                            <div className="flex items-center space-x-2 mb-3">
                                                <TableCellsIcon className="w-4 h-4 text-gray-600" />
                                                <h5 className="text-sm font-bold text-gray-900">
                                                    Columns ({utility.columns?.length || 0})
                                                </h5>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {utility.columns?.map((column, index) => (
                                                    <span key={index} className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-800 rounded-lg text-xs font-medium border border-green-200">
                                                        {column.name} ({column.type}){column.required && <span className="ml-1 text-red-600">*</span>}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                    <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Form Structures Found</h3>
                                <p className="text-sm text-gray-500">Create your first form structure to get started with dynamic inspections.</p>
                            </div>
                        )}
                    </div>
                </div>
            
        </AuthenticatedLayout>
    );
}
