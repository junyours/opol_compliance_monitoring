import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useNotification } from '@/Components/ValidationSystem';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    PhoneIcon,
    BriefcaseIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    MapPinIcon,
    PlusIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

export default function CreateStaff({ auth }) {
    const { staffs, departments, filters, flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    
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
        // User account fields
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        
        // Staff profile fields
        first_name: '',
        last_name: '',
        phone: '',
        position: '',
        department: '',
        hire_date: '',
        status: 'active',
        address: ''
    });

    const resetForm = () => {
        setFormData({
            // User account fields
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            
            // Staff profile fields
            first_name: '',
            last_name: '',
            phone: '',
            position: '',
            department: '',
            hire_date: '',
            status: 'active',
            address: ''
        });
        setEditingStaff(null);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.name || !formData.email || !formData.first_name || !formData.last_name) {
            showError('Validation Error', 'Please fill in all required fields.');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showError('Invalid Email', 'Please enter a valid email address.');
            return;
        }

        // Validate password match for new staff
        if (!editingStaff && (!formData.password || formData.password !== formData.password_confirmation)) {
            showError('Password Mismatch', 'Password and confirmation must match.');
            return;
        }

        // Check for duplicates
        const existingStaff = staffs?.data || [];
        const duplicateFields = ['email', 'phone'];
        const duplicates = validateDuplicate(formData, existingStaff, duplicateFields);

        if (duplicates.length > 0) {
            showDuplicateModal(
                duplicates,
                () => {
                    // Proceed with submission despite duplicates
                    proceedWithSubmission();
                },
                () => {
                    // Cancel submission
                    showWarning('Cancelled', 'Staff creation was cancelled due to duplicates.');
                }
            );
        } else {
            proceedWithSubmission();
        }
    };

    const proceedWithSubmission = () => {
        showLoading(editingStaff ? 'Updating staff member...' : 'Creating new staff member...');
        
        const data = {
            ...formData
        };

        const successCallback = () => {
            hideLoading();
            showSuccess(
                'Success!',
                editingStaff ? 'Staff member updated successfully.' : 'New staff member created successfully.'
            );
            resetForm();
        };

        const errorCallback = (errors) => {
            hideLoading();
            showError('Error', errors.message || 'Something went wrong. Please try again.');
        };

        if (editingStaff) {
            Inertia.put(route('admin.staffs.update', editingStaff.id), data, {
                onSuccess: successCallback,
                onError: errorCallback
            });
        } else {
            Inertia.post(route('admin.staffs.store'), data, {
                onSuccess: successCallback,
                onError: errorCallback
            });
        }
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setFormData({
            // User account fields
            name: staff.user?.name || '',
            email: staff.user?.email || '',
            password: '',
            password_confirmation: '',
            
            // Staff profile fields
            first_name: staff.first_name || '',
            last_name: staff.last_name || '',
            phone: staff.phone || '',
            position: staff.position || '',
            department: staff.department || '',
            hire_date: staff.hire_date || '',
            status: staff.status || 'active',
            address: staff.address || ''
        });
        setShowForm(true);
    };

    const handleDeactivate = (id) => {
        if (confirm('Are you sure you want to deactivate this staff member? They will be marked as deactive but can be reactivated later.')) {
            Inertia.patch(route('admin.staffs.deactivate', id));
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to permanently delete this staff member? This action cannot be undone.')) {
            Inertia.delete(route('admin.staffs.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <UserIcon className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage staff accounts and profiles
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <UserIcon className="w-4 h-4" />
                        <span>{staffs?.data?.length || 0} Staff Members</span>
                    </div>
                </div>
            }
        >
            <Head title="Staff Management" />
            
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                                <p className="text-green-800">{flash.success}</p>
                            </div>
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3" />
                                <p className="text-red-800">{flash.error}</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Header with Add Button */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Staff Members</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage staff accounts and their information
                                </p>
                            </div>
                            <button
                                onClick={() => setShowForm(!showForm)}
                                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    showForm 
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                                }`}
                            >
                                {showForm ? (
                                    <>
                                        <XMarkIcon className="w-4 h-4 mr-2" />
                                        Cancel
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Staff Member
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Staff</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or position..."
                                        defaultValue={filters.search}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                Inertia.get(route('staffs.index'), {
                                                    ...filters,
                                                    search: e.target.value
                                                });
                                            }
                                        }}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="lg:w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                <select
                                    defaultValue={filters.department}
                                    onChange={(e) => {
                                        Inertia.get(route('staffs.index'), {
                                            ...filters,
                                            department: e.target.value
                                        });
                                    }}
                                    className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map((dept) => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="lg:w-48">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    defaultValue={filters.status}
                                    onChange={(e) => {
                                        Inertia.get(route('staffs.index'), {
                                            ...filters,
                                            status: e.target.value
                                        });
                                    }}
                                    className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                            </h4>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Personal Information */}
                                    <div className="lg:col-span-3">
                                        <h5 className="text-md font-semibold text-gray-700 mb-3">Personal Information</h5>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password {!editingStaff && '*'}
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder={editingStaff ? "Leave blank to keep current password" : "Enter password"}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required={!editingStaff}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm Password {!editingStaff && '*'}
                                        </label>
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            value={formData.password_confirmation}
                                            onChange={handleInputChange}
                                            placeholder="Confirm password"
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required={!editingStaff}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                   
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Employment Details */}
                                    <div className="lg:col-span-3">
                                        <h5 className="text-md font-semibold text-gray-700 mb-3 mt-4">Employment Details</h5>
                                    </div>
                                   
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Position
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hire Date
                                        </label>
                                        <input
                                            type="date"
                                            name="hire_date"
                                            value={formData.hire_date}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status *
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="terminated">Terminated</option>
                                        </select>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="lg:col-span-3">
                                        <h5 className="text-md font-semibold text-gray-700 mb-3 mt-4">Additional Information</h5>
                                    </div>
                                    <div className="lg:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Address
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            rows="2"
                                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm hover:shadow-md"
                                    >
                                        {editingStaff ? 'Update Staff Member' : 'Add Staff Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Staff List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Staff Directory</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {staffs?.data?.length || 0} staff members
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Position
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
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
                                    {staffs.data.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {staff.first_name} {staff.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {staff.phone}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{staff.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{staff.position}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{staff.department || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    staff.status === 'active' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : staff.status === 'inactive'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : staff.status === 'terminated'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {staff.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleEdit(staff)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Edit
                                                </button>
                                                {staff.status === 'inactive' ? (
                                                    <button
                                                        onClick={() => handleDelete(staff.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Permanently delete this staff member"
                                                    >
                                                        Delete
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDeactivate(staff.id)}
                                                        className="text-orange-600 hover:text-orange-900 mr-3"
                                                        title="Deactivate this staff member"
                                                    >
                                                        Deactivate
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {staffs.links && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {/* Mobile pagination */}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{staffs.from}</span> to{' '}
                                            <span className="font-medium">{staffs.to}</span> of{' '}
                                            <span className="font-medium">{staffs.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        {/* Pagination links */}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}