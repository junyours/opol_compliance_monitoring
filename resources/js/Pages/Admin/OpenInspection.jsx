import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useNotification } from '@/Components/ValidationSystem';
import {
    PencilIcon,
    TrashIcon,
    EyeIcon,
    XMarkIcon,
    ExclamationTriangleIcon,
    CalendarIcon,
    ClockIcon,
    DocumentTextIcon,
    PlusIcon,
    CheckCircleIcon,
    BuildingOfficeIcon,
    UserIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

export default function OpenInspection({ auth }) {
    const { inspections, flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editingInspection, setEditingInspection] = useState(null);
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);
    const [completedInspections, setCompletedInspections] = useState([]);

    const {
        showSuccess,
        showError,
        showWarning,
        showLoading,
        hideLoading
    } = useNotification();

    const [formData, setFormData] = useState({
        quarter: '',
        inspection_date: '',
        inspection_time: '',
        notes: ''
    });

    const resetForm = () => {
        setFormData({
            quarter: '',
            inspection_date: '',
            inspection_time: '',
            notes: ''
        });
        setEditingInspection(null);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.quarter || !formData.inspection_date || !formData.inspection_time) {
            showError('Validation Error', 'Please fill in all required fields (quarter, date, and time).');
            return;
        }

        // Validate quarter format
        const validQuarters = ['Q1', 'Q2', 'Q3', 'Q4'];
        if (!validQuarters.includes(formData.quarter)) {
            showError('Validation Error', 'Please select a valid quarter (Q1, Q2, Q3, or Q4).');
            return;
        }

        // Validate date is not in the past (only for new inspections)
        const inspectionDate = new Date(formData.inspection_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (inspectionDate < today) {
            if (editingInspection) {
                // Allow editing past inspections but show warning
                showWarning('Past Date Warning', 'You are editing an inspection with a past date. This is allowed for existing inspections only.');
            } else {
                // Block creating new inspections with past dates
                showError('Invalid Date', 'Inspection date cannot be in the past. Please select today or a future date.');
                return;
            }
        }

        showLoading(editingInspection ? 'Updating inspection...' : 'Creating new inspection...');

        // Convert 12-hour time to 24-hour format if needed
        let formattedTime = formData.inspection_time;
        if (formData.inspection_time && formData.inspection_time.includes(':')) {
            const timeParts = formData.inspection_time.split(':');
            let hours = parseInt(timeParts[0]);
            const minutes = timeParts[1] || '00';
            
            // If hours are in 12-hour format (1-12), convert to 24-hour
            if (hours <= 12 && hours >= 1) {
                // Check if it's PM format (assuming PM if hours < 12 and time contains PM indicator)
                const timeString = formData.inspection_time.toLowerCase();
                if (timeString.includes('pm') && hours < 12) {
                    hours += 12;
                } else if (timeString.includes('am') && hours === 12) {
                    hours = 0;
                }
            }
            
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.substring(0, 2)}`;
        }

        // Create timestamp in Manila time (local browser time should be Manila time)
        const inspectionTimestamp = formData.inspection_date && formattedTime 
            ? `${formData.inspection_date} ${formattedTime}:00`
            : '';

        const data = {
            quarter: formData.quarter,
            inspection_timestamp: inspectionTimestamp,
            notes: formData.notes || ''
        };

        console.log('Original form data:', formData);
        console.log('Formatted time (Manila):', formattedTime);
        console.log('Formatted timestamp (Manila):', inspectionTimestamp);
        console.log('Current browser timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
        console.log('Submitting data:', data);

        const successCallback = () => {
            hideLoading();
            showSuccess(
                'Success!',
                editingInspection ? 'Inspection updated successfully.' : 'New inspection created successfully.'
            );
            resetForm();
        };

        const errorCallback = (errors) => {
            hideLoading();
            showError('Error', errors.message || 'Something went wrong. Please try again.');
        };

        if (editingInspection) {
            Inertia.put(route('admin.inspections.update', editingInspection.id), data, {
                onSuccess: successCallback,
                onError: errorCallback
            });
        } else {
            Inertia.post(route('admin.inspections.store'), data, {
                onSuccess: successCallback,
                onError: errorCallback
            });
        }
    };

    const handleEdit = (inspection) => {
        console.log('Editing inspection:', inspection);
        setEditingInspection(inspection);
        
        // Handle date/time parsing for ISO timestamps
        let inspectionDate = '';
        let inspectionTime = '';
        
        if (inspection.inspection_timestamp) {
            console.log('Original timestamp (Manila):', inspection.inspection_timestamp);
            
            // Check if it's an ISO timestamp with timezone
            if (inspection.inspection_timestamp.includes('T') && inspection.inspection_timestamp.includes('Z')) {
                // Parse ISO timestamp - backend is already in Manila timezone
                const isoDate = new Date(inspection.inspection_timestamp);
                console.log('Parsed ISO date (from backend):', isoDate);
                console.log('Hours from backend:', isoDate.getHours());
                
                // Backend is already in Manila time, so no need to add 8 hours
                // Just use the date as-is since Laravel timezone is set to Asia/Manila
                inspectionDate = isoDate.toISOString().split('T')[0]; // YYYY-MM-DD
                
                // Get time in 24-hour format for HTML time input
                const hours = isoDate.getHours();
                const minutes = isoDate.getMinutes();
                
                // HTML time input needs 24-hour format (HH:MM)
                inspectionTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                
                // Also store display time for debugging
                let displayHour = hours;
                let period = 'AM';
                
                if (hours >= 12) {
                    period = 'PM';
                    if (hours > 12) {
                        displayHour = hours - 12;
                    }
                } else if (hours === 0) {
                    displayHour = 12;
                }
                
                const displayTime = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
                console.log('Time for input (24h):', inspectionTime);
                console.log('Display time (12h):', displayTime);
            } else {
                // Fallback for simple string format
                const parts = inspection.inspection_timestamp.split(' ');
                if (parts.length >= 2) {
                    inspectionDate = parts[0]; // YYYY-MM-DD format
                    const timePart = parts[1]; // HH:MM:SS format
                    let timeOnly = timePart.substring(0, 5); // Extract HH:MM
                    
                    // Convert 24-hour time to 12-hour format for display
                    const [hours, minutes] = timeOnly.split(':');
                    const hourNum = parseInt(hours);
                    let displayHour = hourNum;
                    let period = 'AM';
                    
                    if (hourNum >= 12) {
                        period = 'PM';
                        if (hourNum > 12) {
                            displayHour = hourNum - 12;
                        }
                    } else if (hourNum === 0) {
                        displayHour = 12;
                    }
                    
                    inspectionTime = `${displayHour}:${minutes} ${period}`;
                }
            }
        }

        const formData = {
            quarter: inspection.quarter || '',
            inspection_date: inspectionDate,
            inspection_time: inspectionTime,
            notes: inspection.notes || ''
        };

        console.log('Parsed form data:', formData);
        setFormData(formData);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this inspection?')) {
            Inertia.delete(route('admin.inspections.destroy', id));
        }
    };

    const handleViewCompleted = (inspection) => {
        setSelectedInspection(inspection);
        // Fetch completed inspections for this inspection schedule using fetch API
        fetch(`/admin/inspections/${inspection.id}/completed`)
            .then(response => response.json())
            .then(data => {
                setCompletedInspections(data.completedInspections || []);
                setShowCompletedModal(true);
            })
            .catch(error => {
                console.error('Error fetching completed inspections:', error);
                alert('Failed to fetch completed inspections');
            });
    };

    const handleCloseModal = () => {
        setShowCompletedModal(false);
        setSelectedInspection(null);
        setCompletedInspections([]);
    };

    const formatDateTime = (timestamp) => {
        const date = new Date(timestamp);

        const month = date.toLocaleString('en-US', { month: 'long' });
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();

        const time = date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        return `${month}-${day}, ${year} • ${time}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <CalendarIcon className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Open Inspections</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage inspection schedules and view completed inspections
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{inspections?.length || 0} Scheduled</span>
                    </div>
                </div>
            }
        >
            <Head title="Open Inspections" />

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
                                <h3 className="text-lg font-semibold text-gray-900">Inspection Schedule</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage upcoming inspection schedules
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
                                        Schedule Inspection
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Inspection Form Modal */}
                    {showForm && (
                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                                </div>

                                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                                <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                    <form onSubmit={handleSubmit}>
                                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                            <div className="sm:flex sm:items-start">
                                                <div className="w-full">
                                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                                        {editingInspection ? 'Edit Inspection' : 'Schedule New Inspection'}
                                                    </h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Quarter *
                                                            </label>
                                                            <select
                                                                name="quarter"
                                                                value={formData.quarter}
                                                                onChange={handleInputChange}
                                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            >
                                                                <option value="">Select Quarter</option>
                                                                <option value="Q1">1st Quarter</option>
                                                                <option value="Q2">2nd Quarter</option>
                                                                <option value="Q3">3rd Quarter</option>
                                                                <option value="Q4">4th Quarter</option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Inspection Date *
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name="inspection_date"
                                                                value={formData.inspection_date}
                                                                onChange={handleInputChange}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {editingInspection 
                                                                    ? 'Editing existing inspection (past dates allowed for updates only)'
                                                                    : 'New inspections can only be scheduled for today or future dates'
                                                                }
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Inspection Time *
                                                            </label>
                                                            <input
                                                                type="time"
                                                                name="inspection_time"
                                                                value={formData.inspection_time}
                                                                onChange={handleInputChange}
                                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                required
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Notes
                                                            </label>
                                                            <textarea
                                                                name="notes"
                                                                value={formData.notes}
                                                                onChange={handleInputChange}
                                                                rows={3}
                                                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                placeholder="Additional notes..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                            <button
                                                type="submit"
                                                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                                {editingInspection ? 'Update Inspection' : 'Schedule Inspection'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={resetForm}
                                                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Inspection List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Scheduled Inspections</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {inspections?.length || 0} inspection schedules
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quarter
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Notes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inspections?.length ? inspections.map(inspection => (
                                        <tr key={inspection.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                    <CalendarIcon className="w-4 h-4 mr-1" />
                                                    {inspection.quarter}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center text-sm text-gray-900">
                                                    <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                    {inspection.inspection_timestamp
                                                        ? formatDateTime(inspection.inspection_timestamp)
                                                        : 'N/A'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {inspection.notes || (
                                                        <span className="text-gray-400 italic">No notes</span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => handleViewCompleted(inspection)}
                                                        className="inline-flex items-center px-3 py-2 rounded-lg text-green-600 hover:text-green-900 hover:bg-green-50 transition"
                                                        title="View Completed Inspections"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(inspection)}
                                                        className="inline-flex items-center px-3 py-2 rounded-lg text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 transition"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(inspection.id)}
                                                        className="inline-flex items-center px-3 py-2 rounded-lg text-red-600 hover:text-red-900 hover:bg-red-50 transition"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <CalendarIcon className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections scheduled</h3>
                                                    <p className="text-gray-500">Get started by scheduling your first inspection.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                {/* Completed Inspections Modal */}
                {showCompletedModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                                <div className="bg-white px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Completed Inspections
                                            </h3>
                                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                                {selectedInspection?.quarter} Inspection - {selectedInspection?.inspection_timestamp ? formatDateTime(selectedInspection.inspection_timestamp) : 'N/A'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleCloseModal}
                                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {completedInspections.length > 0 ? (
                                        <div className="mt-6">
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {completedInspections.length} establishments inspected
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>Compliant: {completedInspections.filter(r => r.compliance_status === 'compliant').length}</span>
                                                        <span>Not Compliant: {completedInspections.filter(r => r.compliance_status === 'not_compliant').length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Establishment
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Inspector
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Completed Date
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Compliance Status
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {completedInspections.map((result) => (
                                                            <tr key={result.id} className="hover:bg-gray-50">
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                                            <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                {result.establishment?.name || 'N/A'}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {result.establishment?.address || 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center">
                                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                                                            <UserIcon className="w-4 h-4 text-gray-600" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-sm text-gray-900">
                                                                                {result.staff?.first_name} {result.staff?.last_name}
                                                                            </div>
                                                                            <div className="text-sm text-gray-500">
                                                                                {result.staff?.department || 'N/A'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center text-sm text-gray-900">
                                                                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                                                        {new Date(result.created_at).toLocaleDateString()}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {result.status === 'non-compliant' ? (
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                            Non-Compliant
                                                                        </span>
                                                                    ) : result.status === 'compliant' ? (
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                            Compliant
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                            {result.status || 'Unknown'}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {result.compliance_status === 'not_compliant' ? (
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                            Not Compliant
                                                                        </span>
                                                                    ) : result.compliance_status === 'compliant' ? (
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                            Compliant
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                            {result.compliance_status ? result.compliance_status.replace('_', ' ').charAt(0).toUpperCase() + result.compliance_status.replace('_', ' ').slice(1) : 'Unknown'}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                    <button
                                                                        onClick={() => router.get(`/admin/inspection-results/${result.id}`)}
                                                                        className="inline-flex items-center px-3 py-2 rounded-lg text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 transition"
                                                                    >
                                                                        <EyeIcon className="h-4 w-4 mr-1" />
                                                                        View Details
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <EyeIcon className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No completed inspections</h3>
                                            <p className="text-gray-500">No establishments have been inspected for this schedule yet.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="bg-gray-50 px-6 py-4 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition"
                                    >
                                        Close
                                    </button>
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
