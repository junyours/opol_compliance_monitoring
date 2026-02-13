import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { 
    BuildingOfficeIcon, 
    CalendarIcon, 
    UserIcon, 
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    ClipboardDocumentCheckIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function InspectionResultView({ auth }) {
    const { inspectionResult, groupedConditionalFields } = usePage().props;
    const [activeTab, setActiveTab] = useState('checklist');
    const [isEditing, setIsEditing] = useState(false);
    const [editedResult, setEditedResult] = useState({
        compliance_status: inspectionResult.compliance_status,
        automated_recommendations: inspectionResult.automated_recommendations || [],
        checklist_responses: inspectionResult.checklist_responses || [],
        conditional_fields: groupedConditionalFields || {},
        other_remarks: inspectionResult.other_remarks || '',
        recommendations: inspectionResult.recommendations || '',
        photos: inspectionResult.photos || []
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getSimplifiedCategoryName = (category) => {
        if (!category) return 'General';
        
        // Extract the first meaningful word from the category
        const words = category.toUpperCase().split(/\s+/);
        
        // Common category mappings
        const categoryMappings = {
            'PERMIT': 'PERMIT',
            'PERMITS': 'PERMIT',
            'ENVIRONMENTAL': 'ENVIRONMENT',
            'ENVIRONMENT': 'ENVIRONMENT',
            'FACILITIES': 'FACILITY',
            'FACILITY': 'FACILITY',
            'SAFETY': 'SAFETY',
            'HEALTH': 'HEALTH',
            'SANITATION': 'SANITATION',
            'WASTE': 'WASTE',
            'WATER': 'WATER',
            'ELECTRICAL': 'ELECTRICAL',
            'FIRE': 'FIRE',
            'STRUCTURAL': 'STRUCTURAL',
            'BUILDING': 'BUILDING',
            'DOCUMENTARY': 'DOCUMENT',
            'DOCUMENT': 'DOCUMENT',
            'RECORDS': 'RECORD',
            'RECORD': 'RECORD'
        };
        
        // Find the first word that matches our mappings
        for (const word of words) {
            if (categoryMappings[word]) {
                return categoryMappings[word];
            }
        }
        
        // If no mapping found, return the first word or a default
        return words[0] || 'General';
    };

    const getNegativeResponsesInCategory = (responses) => {
        return responses.filter(response => {
            const editedResponse = editedResult.checklist_responses.find(r => r.id === response.id);
            const currentResponse = editedResponse || response;
            
            // Check for negative responses and N/A responses
            return currentResponse.response === 'no' || 
                   currentResponse.response === 'non-compliant' || 
                   currentResponse.response === 'lacking' ||
                   currentResponse.response === 'N/A';
        });
    };

    const getCategoryRecommendations = (category, negativeResponses) => {
        const simplifiedCategory = getSimplifiedCategoryName(category);
        
        if (negativeResponses.length === 0) {
            return null;
        }
        
        // Check if there are N/A responses
        const hasNaResponses = negativeResponses.some(response => {
            const editedResponse = editedResult.checklist_responses.find(r => r.id === response.id);
            const currentResponse = editedResponse || response;
            return currentResponse.response === 'N/A';
        });
        
        // Generate recommendations based on category and negative responses
        const recommendations = [];
        
        switch (simplifiedCategory) {
            case 'PERMIT':
                recommendations.push('Comply lacking permit requirements');
                recommendations.push('Secure necessary permits before operation');
                if (hasNaResponses) {
                    recommendations.push('Review permit requirements for applicability');
                    recommendations.push('Document why certain permits are not applicable');
                }
                break;
            case 'ENVIRONMENT':
                recommendations.push('Address environmental compliance issues');
                recommendations.push('Implement proper environmental controls');
                if (hasNaResponses) {
                    recommendations.push('Assess environmental impact for non-applicable items');
                    recommendations.push('Document environmental exemptions properly');
                }
                break;
            case 'FACILITY':
                recommendations.push('Upgrade facility to meet standards');
                recommendations.push('Ensure facility compliance with regulations');
                if (hasNaResponses) {
                    recommendations.push('Evaluate facility requirements for applicability');
                    recommendations.push('Document facility exemptions with proper justification');
                }
                break;
            case 'SAFETY':
                recommendations.push('Implement safety measures immediately');
                recommendations.push('Conduct safety training for staff');
                if (hasNaResponses) {
                    recommendations.push('Review safety requirements for relevance');
                    recommendations.push('Document safety exemptions with risk assessment');
                }
                break;
            case 'SANITATION':
                recommendations.push('Improve sanitation facilities');
                recommendations.push('Follow proper waste disposal procedures');
                if (hasNaResponses) {
                    recommendations.push('Assess sanitation requirements for applicability');
                    recommendations.push('Document sanitation exemptions with health assessment');
                }
                break;
            case 'ELECTRICAL':
                recommendations.push('Update electrical systems to code');
                recommendations.push('Conduct regular electrical inspections');
                if (hasNaResponses) {
                    recommendations.push('Review electrical requirements for relevance');
                    recommendations.push('Document electrical exemptions with safety evaluation');
                }
                break;
            case 'FIRE':
                recommendations.push('Install proper fire safety equipment');
                recommendations.push('Conduct fire safety drills');
                if (hasNaResponses) {
                    recommendations.push('Assess fire safety requirements for applicability');
                    recommendations.push('Document fire exemptions with fire risk assessment');
                }
                break;
            default:
                recommendations.push(`Address ${simplifiedCategory.toLowerCase()} compliance issues`);
                recommendations.push(`Implement required ${simplifiedCategory.toLowerCase()} improvements`);
                if (hasNaResponses) {
                    recommendations.push(`Review ${simplifiedCategory.toLowerCase()} requirements for applicability`);
                    recommendations.push(`Document ${simplifiedCategory.toLowerCase()} exemptions with proper justification`);
                }
        }
        
        return recommendations;
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownloadPDF = () => {
        // Open PDF download in new window
        window.open(`/admin/inspection-results/${inspectionResult.id}/pdf`, '_blank');
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset to original values
            setEditedResult({
                compliance_status: inspectionResult.compliance_status,
                automated_recommendations: inspectionResult.automated_recommendations || [],
                checklist_responses: inspectionResult.checklist_responses || [],
                conditional_fields: groupedConditionalFields || {},
                other_remarks: inspectionResult.other_remarks || '',
                recommendations: inspectionResult.recommendations || ''
            });
        }
        setIsEditing(!isEditing);
    };

    const handleComplianceStatusChange = (newStatus) => {
        setEditedResult(prev => ({
            ...prev,
            compliance_status: newStatus,
            // Clear recommendations if status changes
            automated_recommendations: newStatus !== inspectionResult.compliance_status ? [] : prev.automated_recommendations
        }));
    };

    const handleResponseChange = (responseId, field, value) => {
        setEditedResult(prev => ({
            ...prev,
            checklist_responses: prev.checklist_responses.map(response =>
                response.id === responseId
                    ? { ...response, [field]: value }
                    : response
            )
        }));
    };

    const handleConditionalFieldChange = (questionId, fieldName, value) => {
        setEditedResult(prev => ({
            ...prev,
            conditional_fields: {
                ...prev.conditional_fields,
                [questionId]: {
                    ...prev.conditional_fields[questionId],
                    [fieldName]: value
                }
            }
        }));
    };

    const handleSaveChanges = () => {
        // Save changes via API
        router.put(`/admin/inspection-results/${inspectionResult.id}`, editedResult, {
            onSuccess: () => {
                setIsEditing(false);
                // Optionally show success message
            },
            onError: (errors) => {
                console.error('Error saving changes:', errors);
            }
        });
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingPhoto = (index) => {
        setEditedResult(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handlePhotoUpload = async () => {
        if (selectedFiles.length === 0) return;

        const formData = new FormData();
        selectedFiles.forEach((file, index) => {
            formData.append(`photos[${index}]`, file);
        });
        formData.append('inspection_result_id', inspectionResult.id);

        try {
            // Get CSRF token from the page or use a fallback
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
                        || document.querySelector('input[name="_token"]')?.value
                        || '';

            const response = await fetch(`/admin/inspection-results/${inspectionResult.id}/upload-photos`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest'
                }
                // Don't set Content-Type for FormData, let browser set it with boundary
            });

            // Check if response is HTML (error page) instead of JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Server returned HTML instead of JSON:', text.substring(0, 200));
                throw new Error('Server returned an error page. Please check CSRF token and permissions.');
            }

            const result = await response.json();
            
            if (response.ok) {
                setEditedResult(prev => ({
                    ...prev,
                    photos: [...prev.photos, ...result.photos]
                }));
                setSelectedFiles([]);
                // Show success message
                alert('Photos uploaded successfully!');
            } else {
                console.error('Upload failed:', result);
                alert('Upload failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload error: ' + error.message);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'draft': { color: 'bg-gray-100 text-gray-800', icon: InformationCircleIcon },
            'submitted': { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
            'reviewed': { color: 'bg-yellow-100 text-yellow-800', icon: ExclamationCircleIcon },
            'approved': { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon }
        };
        
        const config = statusConfig[status] || statusConfig['draft'];
        const Icon = config.icon;
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                <Icon className="w-4 h-4 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getComplianceBadge = (complianceStatus) => {
        const isCompliant = complianceStatus === 'compliant';
        
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isCompliant 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
            }`}>
                {isCompliant ? (
                    <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Compliant
                    </>
                ) : (
                    <>
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        Not Compliant
                    </>
                )}
            </span>
        );
    };

    const groupResponsesByCategory = (responses) => {
        const grouped = {};
        responses?.forEach(response => {
            const category = response.checklist_question?.category?.name || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(response);
        });
        return grouped;
    };

    const groupedResponses = groupResponsesByCategory(inspectionResult.checklist_responses);

    const renderConditionalFields = (response, currentResponse = null) => {
        const conditionalFields = currentResponse 
            ? editedResult.conditional_fields?.[response.checklist_question_id] || {}
            : groupedConditionalFields?.[response.checklist_question_id];
            
        if (!conditionalFields || Object.keys(conditionalFields).length === 0) return null;

        return (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h6 className="text-sm font-semibold text-blue-800 mb-2">Conditional Information</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(conditionalFields).map(([fieldName, fieldValue]) => {
                        // Convert field name to readable label
                        const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return (
                            <div key={fieldName} className="text-xs">
                                <span className="font-medium text-gray-600">{label}:</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={fieldValue || ''}
                                        onChange={(e) => handleConditionalFieldChange(response.checklist_question_id, fieldName, e.target.value)}
                                        className="ml-1 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter value..."
                                    />
                                ) : (
                                    <span className="ml-1 text-gray-800">{fieldValue || 'N/A'}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Inspection Result Details
                    </h2>
                    <div className="flex space-x-2">
                        {isEditing ? (
                            <>
                                <button 
                                    onClick={handleSaveChanges}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    Save Changes
                                </button>
                                <button 
                                    onClick={handleEditToggle}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={handleEditToggle}
                                    className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                                >
                                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                                    Edit
                                </button>
                                <button 
                                    onClick={handleDownloadPDF}
                                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                                    Download PDF
                                </button>
                                <button 
                                    onClick={() => window.print()}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    <PrinterIcon className="w-4 h-4 mr-2" />
                                    Print
                                </button>
                            </>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Inspection Result Details" />

            <div className="max-w-7xl mx-auto print:mx-0">
                {/* Header Information */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Establishment Info */}
                        <div className="flex items-start space-x-3">
                            <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Establishment</h3>
                                <p className="text-lg font-semibold text-gray-900">
                                    {inspectionResult.establishment?.name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {inspectionResult.establishment?.address || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        {inspectionResult.establishment?.business_type?.name || 'N/A'}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Inspection Info */}
                        <div className="flex items-start space-x-3">
                            <CalendarIcon className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Inspection</h3>
                                <p className="text-lg font-semibold text-gray-900">
                                    {inspectionResult.inspection?.quarter || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Scheduled: {formatDateTime(inspectionResult.inspection?.inspection_timestamp)}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Completed: {formatDateTime(inspectionResult.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Inspector Info */}
                        <div className="flex items-start space-x-3">
                            <UserIcon className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Inspector</h3>
                                <p className="text-lg font-semibold text-gray-900">
                                    {inspectionResult.staff ? 
                                        `${inspectionResult.staff.first_name} ${inspectionResult.staff.last_name}` : 
                                        'N/A'
                                    }
                                </p>
                                <p className="text-sm text-gray-600">
                                    {inspectionResult.staff?.department || 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Staff ID: {inspectionResult.staff_id || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-start space-x-3">
                            <CheckCircleIcon className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <div className="mt-1 space-x-2">
                                    {getStatusBadge(inspectionResult.status)}
                                    {inspectionResult.compliance_status && getComplianceBadge(inspectionResult.compliance_status)}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Result ID: #{inspectionResult.id}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Compliance Status Summary */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Compliance Status</h3>
                        {inspectionResult.compliance_status && getComplianceBadge(inspectionResult.compliance_status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Compliance Status Card */}
                        <div className={`rounded-lg p-4 ${
                            editedResult.compliance_status === 'compliant' 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    {editedResult.compliance_status === 'compliant' ? (
                                        <CheckCircleIcon className="w-8 h-8 text-green-600 mr-3" />
                                    ) : (
                                        <ExclamationCircleIcon className="w-8 h-8 text-red-600 mr-3" />
                                    )}
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">
                                            {editedResult.compliance_status === 'compliant' ? 'Compliant' : 'Not Compliant'}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {editedResult.compliance_status === 'compliant' 
                                                ? 'Establishment meets all requirements' 
                                                : 'Establishment requires attention'}
                                        </p>
                                    </div>
                                </div>
                                {isEditing && (
                                    <select
                                        value={editedResult.compliance_status || ''}
                                        onChange={(e) => handleComplianceStatusChange(e.target.value)}
                                        className="ml-3 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="compliant">Compliant</option>
                                        <option value="not_compliant">Not Compliant</option>
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Recommendations Count */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-600 mr-3" />
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        {inspectionResult.automated_recommendations?.length || 0} Recommendations
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Automated action items generated
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Inspection Progress */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <InformationCircleIcon className="w-8 h-8 text-purple-600 mr-3" />
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        {inspectionResult.checklist_responses?.length || 0} Questions Answered
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Complete inspection checklist
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-lg mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('checklist')}
                                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === 'checklist'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <ClipboardDocumentCheckIcon className="w-4 h-4 inline mr-2" />
                                Checklist Results
                            </button>
                            <button
                                onClick={() => setActiveTab('utilities')}
                                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === 'utilities'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <InformationCircleIcon className="w-4 h-4 inline mr-2" />
                                Utility Data
                            </button>
                            <button
                                onClick={() => setActiveTab('remarks')}
                                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === 'remarks'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <InformationCircleIcon className="w-4 h-4 inline mr-2" />
                                Remarks & Recommendations
                            </button>
                            <button
                                onClick={() => setActiveTab('photos')}
                                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === 'photos'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <InformationCircleIcon className="w-4 h-4 inline mr-2" />
                                Photos
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Checklist Tab */}
                        {activeTab === 'checklist' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Checklist Results</h3>
                                {Object.entries(groupedResponses).map(([category, responses]) => {
                                    const simplifiedCategory = getSimplifiedCategoryName(category);
                                    const negativeResponses = getNegativeResponsesInCategory(responses);
                                    const recommendations = getCategoryRecommendations(category, negativeResponses);
                                    
                                    return (
                                        <div key={category} className="mb-8">
                                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                                {/* Category Header */}
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                    <h4 className="text-md font-medium text-gray-700 flex items-center">
                                                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
                                                        {simplifiedCategory}
                                                        {negativeResponses.length > 0 && (
                                                            <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                                                {negativeResponses.length} Issues
                                                            </span>
                                                        )}
                                                    </h4>
                                                </div>
                                                
                                                {/* Recommendations Section */}
                                                {recommendations && (
                                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                                        <div className="flex">
                                                            <div className="flex-shrink-0">
                                                                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400" />
                                                            </div>
                                                            <div className="ml-3">
                                                                <h5 className="text-sm font-medium text-yellow-800">
                                                                    Recommendations for {simplifiedCategory}:
                                                                </h5>
                                                                <div className="mt-2 text-sm text-yellow-700">
                                                                    <ul className="list-disc list-inside space-y-1">
                                                                        {recommendations.map((rec, index) => (
                                                                            <li key={index}>{rec}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Checklist Items */}
                                                <div className="p-4 space-y-3">
                                                    {responses.map((response) => {
                                                        const editedResponse = editedResult.checklist_responses.find(r => r.id === response.id);
                                                        const currentResponse = editedResponse || response;
                                                        const isNegative = currentResponse.response === 'no' || 
                                                                         currentResponse.response === 'non-compliant' || 
                                                                         currentResponse.response === 'lacking' ||
                                                                         currentResponse.response === 'N/A';
                                                        
                                                        return (
                                                            <div key={response.id} className={`p-4 rounded-lg border ${
                                                                isNegative 
                                                                    ? 'bg-red-50 border-red-200' 
                                                                    : 'bg-gray-50 border-gray-200'
                                                            }`}>
                                                                <div className="flex items-start justify-between">
                                                                    <div className="flex-1">
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            {response.checklist_question?.question || 'N/A'}
                                                                        </p>
                                                                        <div className="mt-2">
                                                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                                currentResponse.response === 'N/A' 
                                                                                    ? 'bg-gray-100 text-gray-600'
                                                                                    : currentResponse.response === 'yes' || currentResponse.response === 'compliant'
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : currentResponse.response === 'no' || currentResponse.response === 'non-compliant'
                                                                                    ? 'bg-red-100 text-red-800'
                                                                                    : 'bg-blue-100 text-blue-800'
                                                                            }`}>
                                                                                {currentResponse.response === 'N/A' ? 'Not Applicable' : currentResponse.response}
                                                                            </span>
                                                                        </div>
                                                                        
                                                                        {/* Notes Field */}
                                                                        <div className="mt-3">
                                                                            <label className="text-xs font-medium text-gray-600">Notes:</label>
                                                                            {isEditing ? (
                                                                                <textarea
                                                                                    value={currentResponse.notes || ''}
                                                                                    onChange={(e) => handleResponseChange(response.id, 'notes', e.target.value)}
                                                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                                    rows={2}
                                                                                    placeholder="Add notes..."
                                                                                />
                                                                            ) : (
                                                                                <p className="text-sm text-gray-700 mt-1">
                                                                                    {currentResponse.notes || 'No notes provided.'}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {/* Remarks Field */}
                                                                        <div className="mt-3">
                                                                            <label className="text-xs font-medium text-gray-600">Remarks:</label>
                                                                            {isEditing ? (
                                                                                <textarea
                                                                                    value={currentResponse.remarks || ''}
                                                                                    onChange={(e) => handleResponseChange(response.id, 'remarks', e.target.value)}
                                                                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                                    rows={2}
                                                                                    placeholder="Add remarks..."
                                                                                />
                                                                            ) : (
                                                                                <p className="text-sm text-gray-700 mt-1">
                                                                                    {currentResponse.remarks || 'No remarks provided.'}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {renderConditionalFields(response, currentResponse)}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Utilities Tab */}
                        {activeTab === 'utilities' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Utility Data</h3>
                                {inspectionResult.utility_data && inspectionResult.utility_data.length > 0 ? (
                                    <div className="space-y-6">
                                        {inspectionResult.utility_data.map((utilityData) => (
                                            <div key={utilityData.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                                    <h4 className="text-md font-semibold text-gray-900">
                                                        {utilityData.utility?.form_name || 'Utility Form'}
                                                    </h4>
                                                    {utilityData.utility?.description && (
                                                        <p className="text-sm text-gray-500 mt-1">{utilityData.utility.description}</p>
                                                    )}
                                                </div>
                                                <div className="p-4">
                                                    <div className="overflow-x-auto">
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900 bg-gray-50">
                                                                        Data Fields
                                                                    </th>
                                                                    {utilityData.utility?.columns?.map((column) => (
                                                                        <th key={column.name} className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-900 bg-gray-50">
                                                                            {column.name}
                                                                        </th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {utilityData.utility?.rows?.map((row, rowIndex) => (
                                                                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className="border border-gray-300 px-4 py-2 text-sm font-medium text-gray-900">
                                                                            {row.name}
                                                                        </td>
                                                                        {utilityData.utility?.columns?.map((column) => {
                                                                            const key = `${row.name}_${column.name}`;
                                                                            const value = utilityData.data?.[key] || '';
                                                                            return (
                                                                                <td key={column.name} className="border border-gray-300 px-2 py-2 text-sm text-center">
                                                                                    {value || '-'}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <InformationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No utility data available for this inspection.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Remarks Tab */}
                        {activeTab === 'remarks' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Remarks & Recommendations</h3>
                                
                                {/* Automated Recommendations */}
                                {inspectionResult.automated_recommendations && inspectionResult.automated_recommendations.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                            <ExclamationCircleIcon className="w-5 h-5 mr-2 text-yellow-600" />
                                            Automated Recommendations ({inspectionResult.automated_recommendations.length})
                                        </h4>
                                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600 font-medium">
                                                    The following automated recommendations were generated based on the inspection results:
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                {inspectionResult.automated_recommendations.map((rec, index) => (
                                                    <div key={index} className="flex items-start bg-white rounded-lg p-3 border border-yellow-200">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">
                                                                {index + 1}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-800 font-medium">{rec.message}</p>
                                                            {rec.type && (
                                                                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                                                                    rec.type === 'permit' 
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : rec.type === 'facility'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Other Remarks */}
                                <div className="mb-6">
                                    <h4 className="text-md font-medium text-gray-700 mb-2">Other Remarks</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {isEditing ? (
                                            <textarea
                                                value={editedResult.other_remarks || ''}
                                                onChange={(e) => setEditedResult(prev => ({ ...prev, other_remarks: e.target.value }))}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                rows={4}
                                                placeholder="Enter other remarks..."
                                            />
                                        ) : (
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {editedResult.other_remarks || 'No other remarks provided.'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Recommendation Checks */}
                                <div className="mb-6">
                                    <h4 className="text-md font-medium text-gray-700 mb-2">Recommendations</h4>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={inspectionResult.comply_lacking_permits || false}
                                                readOnly
                                                className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Comply lacking permits</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={inspectionResult.provide_lacking_facilities || false}
                                                readOnly
                                                className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Provide lacking facilities</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={inspectionResult.others_recommendation || false}
                                                readOnly
                                                className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Others</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Detailed Recommendations */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-700 mb-2">Detailed Recommendations</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        {isEditing ? (
                                            <textarea
                                                value={editedResult.recommendations || ''}
                                                onChange={(e) => setEditedResult(prev => ({ ...prev, recommendations: e.target.value }))}
                                                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                rows={4}
                                                placeholder="Enter detailed recommendations..."
                                            />
                                        ) : (
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {editedResult.recommendations || 'No detailed recommendations provided.'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Photos Tab */}
                        {activeTab === 'photos' && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspection Photos</h3>
                                
                                {/* Upload Section */}
                                {isEditing && (
                                    <div className="mb-6">
                                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6">
                                            <div className="text-center">
                                                <div className="text-6xl text-gray-400 mb-4">📷</div>
                                                <div className="mt-4">
                                                    <label htmlFor="photo-upload" className="cursor-pointer">
                                                        <span className="mt-2 block text-sm font-medium text-gray-900">
                                                            Click to upload photos
                                                        </span>
                                                        <input id="photo-upload" name="photo-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleFileSelect} />
                                                    </label>
                                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
                                                </div>
                                            </div>
                                            
                                            {/* Selected Files */}
                                            {selectedFiles.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Files:</h4>
                                                    <div className="space-y-2">
                                                        {selectedFiles.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                                <button
                                                                    onClick={() => handleRemoveFile(index)}
                                                                    className="text-red-600 hover:text-red-800"
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={handlePhotoUpload}
                                                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                                    >
                                                        Upload Photos
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Existing Photos */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-700 mb-4">
                                        Uploaded Photos ({editedResult.photos?.length || 0})
                                    </h4>
                                    {editedResult.photos && editedResult.photos.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {editedResult.photos.map((photo, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-48 cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setSelectedPhoto(photo)}>
                                                        <img
                                                            src={photo.url || `/storage/${photo.path}`}
                                                            alt={`Inspection photo ${index + 1}`}
                                                            className="w-full h-full object-contain"
                                                            onLoad={() => console.log('Image loaded successfully:', photo.path)}
                                                            onError={(e) => {
                                                                console.error('Image failed to load:', {
                                                                    path: photo.path,
                                                                    url: photo.url,
                                                                    attemptedSrc: e.target.src
                                                                });
                                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2U1ZTdlNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                                            <div className="text-white opacity-0 hover:opacity-100 transition-opacity">
                                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0h3m-3 0h3" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-sm text-gray-600 truncate">{photo.name || `Photo ${index + 1}`}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {photo.uploaded_at ? new Date(photo.uploaded_at).toLocaleDateString() : 'Recently uploaded'}
                                                        </p>
                                                    </div>
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => handleRemoveExistingPhoto(index)}
                                                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                                                        >
                                                            ×
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="text-6xl text-gray-400 mb-4">📷</div>
                                            <p className="mt-2 text-sm text-gray-500">No photos uploaded yet</p>
                                            {isEditing && (
                                                <p className="text-xs text-gray-400 mt-1">Click the upload area above to add photos</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        {/* Photo Modal */}
        {selectedPhoto && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
                <div className="relative max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition z-10"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    
                    <div className="bg-white rounded-lg overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedPhoto.name || `Photo ${editedResult.photos.indexOf(selectedPhoto) + 1}`}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Uploaded: {selectedPhoto.uploaded_at ? new Date(selectedPhoto.uploaded_at).toLocaleString() : 'Recently'}
                                {selectedPhoto.size && ` • Size: ${(selectedPhoto.size / 1024).toFixed(1)} KB`}
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-100">
                            <img
                                src={selectedPhoto.url || `/storage/${selectedPhoto.path}`}
                                alt={selectedPhoto.name || `Photo ${editedResult.photos.indexOf(selectedPhoto) + 1}`}
                                className="max-w-full max-h-[70vh] object-contain mx-auto"
                                onError={(e) => {
                                    console.error('Modal image failed to load:', selectedPhoto.path);
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2U1ZTdlNSIvPjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+PC9zdmc+';
                                }}
                            />
                        </div>
                        
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = selectedPhoto.url || `/storage/${selectedPhoto.path}`;
                                    link.download = selectedPhoto.name || `photo-${editedResult.photos.indexOf(selectedPhoto) + 1}`;
                                    link.click();
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </AuthenticatedLayout>
    );
}
