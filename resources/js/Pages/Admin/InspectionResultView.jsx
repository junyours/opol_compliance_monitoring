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
    XMarkIcon,
    DocumentTextIcon,
    BanknotesIcon,
    EyeIcon,
    EyeSlashIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function InspectionResultView({ auth }) {
    const { inspectionResult, groupedConditionalFields, penalties: backendPenalties, previousUnpaidPenalties } = usePage().props;
    
    // Debug: Log previous unpaid penalties to verify data
    console.log('Previous Unpaid Penalties:', previousUnpaidPenalties);
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
    const [showPenaltiesSidebar, setShowPenaltiesSidebar] = useState(false);
    const [penalties, setPenalties] = useState({
        first_penalty: {
            description: backendPenalties?.first_penalty?.description || '',
            amount: backendPenalties?.first_penalty?.amount || '',
            document: backendPenalties?.first_penalty?.document || null,
            payment_status: backendPenalties?.first_penalty?.payment_status || 'pending',
            paid_at: backendPenalties?.first_penalty?.paid_at || null
        },
        second_penalty: {
            description: backendPenalties?.second_penalty?.description || '',
            amount: backendPenalties?.second_penalty?.amount || '',
            document: backendPenalties?.second_penalty?.document || null,
            payment_status: backendPenalties?.second_penalty?.payment_status || 'pending',
            paid_at: backendPenalties?.second_penalty?.paid_at || null
        },
        third_penalty: {
            description: backendPenalties?.third_penalty?.description || '',
            amount: backendPenalties?.third_penalty?.amount || '',
            document: backendPenalties?.third_penalty?.document || null,
            payment_status: backendPenalties?.third_penalty?.payment_status || 'pending',
            paid_at: backendPenalties?.third_penalty?.paid_at || null
        }
    });
    const [penaltyDocuments, setPenaltyDocuments] = useState({
        first_penalty: null,
        second_penalty: null,
        third_penalty: null
    });
    const [expiredChecks, setExpiredChecks] = useState({});
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailData, setEmailData] = useState({
        email: '',
        subject: '',
        message: ''
    });
    const [isSending, setIsSending] = useState(false);

    // Function to get previous unpaid penalty for a specific penalty type
    const getPreviousUnpaidPenalty = (penaltyType) => {
        console.log(`Getting previous unpaid penalty for: ${penaltyType}`);
        console.log('Available previous unpaid penalties:', previousUnpaidPenalties);
        
        if (!previousUnpaidPenalties || previousUnpaidPenalties.length === 0) {
            console.log('No previous unpaid penalties found');
            return null;
        }

        // Map current penalty types to previous penalty types that should be displayed
        const mapping = {
            'first_penalty': 'first_penalty', // Show previous first_penalty in first_penalty field
            'second_penalty': 'second_penalty', // Show previous second_penalty in second_penalty field
            'third_penalty': 'third_penalty'  // Show previous third_penalty in third_penalty field
        };

        const previousPenaltyType = mapping[penaltyType];
        console.log(`Looking for penalty type: ${previousPenaltyType}`);
        
        if (!previousPenaltyType) {
            console.log('No previous penalty type mapping found');
            return null;
        }

        // Find the most recent unpaid penalty of the matching type
        const foundPenalty = previousUnpaidPenalties.find(penalty => 
            penalty.penalty_type === previousPenaltyType && penalty.status === 'unpaid'
        ) || null;
        
        console.log(`Found penalty:`, foundPenalty);
        return foundPenalty;
    };

    // Function to get display data for penalty field (combines current and previous)
    const getPenaltyDisplayData = (penaltyType) => {
        const currentPenalty = penalties[penaltyType];
        const previousPenalty = getPreviousUnpaidPenalty(penaltyType);
        
        console.log(`=== getPenaltyDisplayData for ${penaltyType} ===`);
        console.log('Current penalty:', currentPenalty);
        console.log('Previous penalty:', previousPenalty);
        
        // If there's a previous unpaid penalty, display it with notes
        if (previousPenalty) {
            console.log('Using previous penalty data');
            const displayData = {
                description: previousPenalty.description || 'No description',
                amount: previousPenalty.amount || 0,
                status: previousPenalty.status,
                isPrevious: true,
                inspectionDate: previousPenalty.inspection ? 
                    new Date(previousPenalty.inspection.inspection_timestamp).toLocaleDateString() : 
                    'N/A',
                document: previousPenalty.document_path ? {
                    path: previousPenalty.document_path,
                    name: previousPenalty.document_name,
                    url: `/storage/${previousPenalty.document_path}`,
                } : null,
            };
            console.log('Returning displayData:', displayData);
            return displayData;
        }
        
        console.log('Using current penalty data');
        // Otherwise, display current penalty
        const displayData = {
            description: currentPenalty.description || '',
            amount: currentPenalty.amount || 0,
            status: currentPenalty.payment_status || 'pending',
            isPrevious: false,
            inspectionDate: null,
            document: currentPenalty.document || null,
        };
        console.log('Returning displayData:', displayData);
        return displayData;
    };

    // Helper functions to determine penalty input states
    const isPenaltyDisabled = (penaltyType) => {
        switch (penaltyType) {
            case 'first_penalty':
                return false; // First penalty is always enabled
            case 'second_penalty':
                return penalties.first_penalty.payment_status !== 'paid';
            case 'third_penalty':
                return penalties.second_penalty.payment_status !== 'paid';
            default:
                return false;
        }
    };

    const getPenaltyStatusText = (penaltyType) => {
        const penalty = penalties[penaltyType];
        if (penalty.payment_status === 'paid') {
            return `Paid on ${formatDate(penalty.paid_at)}`;
        }
        return 'Pending Payment';
    };

    const getPenaltyBadgeClass = (penaltyType) => {
        const penalty = penalties[penaltyType];
        return penalty.payment_status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800';
    };

    // Initialize expiredChecks based on existing notes
    React.useEffect(() => {
        const initialExpiredChecks = {};
        inspectionResult.checklist_responses?.forEach(response => {
            if (response.notes && response.notes.includes('Document/Permit has expired.')) {
                initialExpiredChecks[response.id] = true;
            }
        });
        setExpiredChecks(initialExpiredChecks);
    }, [inspectionResult.checklist_responses]);

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
        setEditedResult(prev => {
            const updatedChecklistResponses = prev.checklist_responses.map(response =>
                response.id === responseId
                    ? { ...response, [field]: value }
                    : response
            );

            // Check if this is a conditional question and handle field initialization
            const response = updatedChecklistResponses.find(r => r.id === responseId);
            const question = response?.checklist_question;
            
            if (question?.is_conditional && question?.conditional_logic && field === 'response') {
                const shouldShowFields = value === question.conditional_logic.trigger_response;
                
                if (shouldShowFields) {
                    // Initialize conditional fields if they don't exist
                    const currentConditionalFields = prev.conditional_fields || {};
                    if (!currentConditionalFields[question.id]) {
                        const newFields = question.conditional_logic.fields.reduce((acc, field) => {
                            acc[field.name] = '';
                            return acc;
                        }, {});
                        
                        return {
                            ...prev,
                            checklist_responses: updatedChecklistResponses,
                            conditional_fields: {
                                ...currentConditionalFields,
                                [question.id]: newFields
                            }
                        };
                    }
                } else {
                    // Remove conditional fields if response doesn't match trigger
                    const currentConditionalFields = prev.conditional_fields || {};
                    const newConditionalFields = { ...currentConditionalFields };
                    delete newConditionalFields[question.id];
                    
                    // Also clear expired check for this question
                    const newExpiredChecks = { ...expiredChecks };
                    delete newExpiredChecks[responseId];
                    setExpiredChecks(newExpiredChecks);
                    
                    // Clear expired notes from the response
                    const updatedResponsesWithClearedNotes = updatedChecklistResponses.map(resp =>
                        resp.id === responseId
                            ? { 
                                ...resp, 
                                notes: resp.notes?.replace(/\n?Document\/Permit has expired\./, '').trim() || null
                              }
                            : resp
                    );
                    
                    return {
                        ...prev,
                        checklist_responses: updatedResponsesWithClearedNotes,
                        conditional_fields: newConditionalFields
                    };
                }
            }

            return {
                ...prev,
                checklist_responses: updatedChecklistResponses
            };
        });
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

    const handleClearNotes = (responseId) => {
        setEditedResult(prev => {
            const updated = {
                ...prev,
                checklist_responses: prev.checklist_responses.map(response =>
                    response.id === responseId
                        ? { ...response, notes: null }  // Explicitly set to null
                        : response
                )
            };
            return updated;
        });
    };

    const handleExpiredCheck = (responseId, isExpired) => {
        alert(`Expired checkbox changed: ${responseId}, isExpired: ${isExpired}`);
        setExpiredChecks(prev => ({
            ...prev,
            [responseId]: isExpired
        }));

        // Update the notes field when expired checkbox changes
        setEditedResult(prev => {
            const currentResponse = prev.checklist_responses.find(r => r.id === responseId);
            const currentNotes = currentResponse?.notes || '';
            const existingExpiredNote = currentNotes.includes('Document/Permit has expired.');
            
            alert(`Current notes: "${currentNotes}"\nHas expired note: ${existingExpiredNote}`);
            
            let newNotes;
            if (isExpired && !existingExpiredNote) {
                newNotes = currentNotes ? `${currentNotes}\nDocument/Permit has expired.` : 'Document/Permit has expired.';
            } else if (!isExpired && existingExpiredNote) {
                newNotes = currentNotes.replace(/\n?Document\/Permit has expired\./, '').trim();
            } else {
                newNotes = currentNotes;
            }
            
            alert(`New notes will be: "${newNotes}"`);
            
            const updated = {
                ...prev,
                checklist_responses: prev.checklist_responses.map(response =>
                    response.id === responseId
                        ? { ...response, notes: newNotes }
                        : response
                )
            };
            
            const updatedResponse = updated.checklist_responses.find(r => r.id === responseId);
            alert(`Updated response notes: "${updatedResponse.notes}"`);
            return updated;
        });
    };

    const handleSaveChanges = () => {
        // Include penalties data in the save request
        const dataToSave = {
            ...editedResult,
            penalties: penalties
        };
        
        // Save changes via API
        router.put(`/admin/inspection-results/${inspectionResult.id}`, dataToSave, {
            onSuccess: (response) => {
                setIsEditing(false);
                // Reload the page to get updated data
                window.location.reload();
            },
            onError: (errors) => {
                alert('Error saving changes: ' + JSON.stringify(errors));
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

    const handleSendEmail = async () => {
        setIsSending(true);
        
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
                        || document.querySelector('input[name="_token"]')?.value
                        || '';

            const response = await fetch(`/admin/inspection-results/${inspectionResult.id}/email-pdf`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(emailData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                setShowEmailModal(false);
                setEmailData({ email: '', subject: '', message: '' });
                alert('PDF successfully sent to ' + emailData.email);
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Email error:', error);
            alert('Failed to send email: ' + error.message);
        } finally {
            setIsSending(false);
        }
    };

    const handlePenaltyChange = (penaltyType, field, value) => {
        setPenalties(prev => ({
            ...prev,
            [penaltyType]: {
                ...prev[penaltyType],
                [field]: value
            }
        }));
    };

    const handlePenaltyDocumentUpload = async (penaltyType, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('penalty_type', penaltyType);
        formData.append('establishment_id', inspectionResult.establishment_id);
        formData.append('inspection_id', inspectionResult.inspection_id);
        formData.append('inspection_result_id', inspectionResult.id);

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') 
                        || document.querySelector('input[name="_token"]')?.value
                        || '';

            const response = await fetch(`/admin/penalties/upload-document`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const result = await response.json();
            
            if (response.ok) {
                handlePenaltyChange(penaltyType, 'document', result.document);
                setPenaltyDocuments(prev => ({
                    ...prev,
                    [penaltyType]: null
                }));
                alert('Document uploaded successfully!');
            } else {
                console.error('Document upload failed:', result);
                alert('Document upload failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Document upload error:', error);
            alert('Document upload error: ' + error.message);
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
            
        const currentResponseData = currentResponse || response;
        const isConditionalQuestion = response.checklist_question?.is_conditional;
        const hasConditionalLogic = response.checklist_question?.conditional_logic;
        const triggerResponse = response.checklist_question?.conditional_logic?.trigger_response;
        const shouldShowConditionalFields = isConditionalQuestion && hasConditionalLogic && 
                                        currentResponseData.response === triggerResponse;
        const shouldShowExpiredCheckbox = shouldShowConditionalFields;
        
        // During editing, show conditional fields if they should be shown based on the response
        if (isEditing) {
            if (!shouldShowConditionalFields && (!conditionalFields || Object.keys(conditionalFields).length === 0)) {
                return null;
            }
        } else {
            // During view mode, only show if there are existing conditional fields or expired checkbox
            if ((!conditionalFields || Object.keys(conditionalFields).length === 0) && !shouldShowExpiredCheckbox) {
                return null;
            }
        }

        return (
            <div className="mt-3">
                {/* Conditional Information */}
                {isEditing ? (
                    // During editing, always show conditional fields section if it should be visible
                    shouldShowConditionalFields && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                            <h6 className="text-sm font-semibold text-blue-800 mb-2">
                                {response.checklist_question?.conditional_logic?.type === 'permit' ? 'Permit Information' : 'Clearance Information'}
                            </h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {response.checklist_question?.conditional_logic?.fields?.map((field) => {
                                    const fieldName = field.name;
                                    const fieldValue = conditionalFields?.[fieldName] || '';
                                    
                                    return (
                                        <div key={fieldName}>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {field.type === 'date' ? (
                                                <input
                                                    type="date"
                                                    value={fieldValue}
                                                    onChange={(e) => handleConditionalFieldChange(response.checklist_question_id, fieldName, e.target.value)}
                                                    className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={fieldValue}
                                                    onChange={(e) => handleConditionalFieldChange(response.checklist_question_id, fieldName, e.target.value)}
                                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                                    className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                ) : (
                    // During view mode, show existing conditional fields
                    conditionalFields && Object.keys(conditionalFields).length > 0 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                            <h6 className="text-sm font-semibold text-blue-800 mb-2">Conditional Information</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(conditionalFields).map(([fieldName, fieldValue]) => {
                                    // Convert field name to readable label
                                    const label = fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    return (
                                        <div key={fieldName} className="text-xs">
                                            <span className="font-medium text-gray-600">{label}:</span>
                                            <span className="ml-1 text-gray-800">{fieldValue || 'N/A'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                )}
                
                {/* Expired Checkbox for Conditional Questions */}
                {shouldShowExpiredCheckbox && (
                    <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <input
                            type="checkbox"
                            id={`expired_${response.id}`}
                            checked={expiredChecks[response.id] || false}
                            onChange={(e) => handleExpiredCheck(response.id, e.target.checked)}
                            className="mr-3 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
                            disabled={!isEditing}
                        />
                        <label htmlFor={`expired_${response.id}`} className="text-sm font-medium text-yellow-800 cursor-pointer">
                            <ExclamationCircleIcon className="w-4 h-4 inline mr-1" />
                            Document/Permit is Expired
                        </label>
                    </div>
                )}
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
                                    onClick={() => {
                                        setEmailData(prev => ({ 
                                            ...prev, 
                                            email: inspectionResult.establishment?.email || '' 
                                        }));
                                        setShowEmailModal(true);
                                    }}
                                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                >
                                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                                    Email PDF
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
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 sticky top-0 z-10">
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
                            <button
                                onClick={() => setActiveTab('penalties')}
                                className={`py-3 px-6 border-b-2 font-medium text-sm ${
                                    activeTab === 'penalties'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <BanknotesIcon className="w-4 h-4 inline mr-2" />
                                Penalties
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
                                                                         currentResponse.response === 'NON-PRESENT';
                                                        
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
                                                                            {isEditing ? (
                                                                                <select
                                                                                    value={currentResponse.response || ''}
                                                                                    onChange={(e) => handleResponseChange(response.id, 'response', e.target.value)}
                                                                                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                                                                                >
                                                                                    <option value="">Select Response</option>
                                                                                    {response.checklist_question?.options?.map((option, index) => (
                                                                                        <option key={index} value={option.text || option}>
                                                                                            {option.text === 'N/A' ? 'Not Applicable' : (option.text || option)}
                                                                                        </option>
                                                                                    ))}
                                                                                    {/* Always include N/A option if not already in options */}
                                                                                    {!response.checklist_question?.options?.some(opt => (opt.text || opt) === 'N/A') && (
                                                                                        <option value="N/A">Not Applicable</option>
                                                                                    )}
                                                                                </select>
                                                                            ) : (
                                                                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                                                                    currentResponse.response === 'N/A' 
                                                                                        ? 'bg-gray-100 text-gray-600'
                                                                                        : currentResponse.response === 'yes' || currentResponse.response === 'compliant'
                                                                                        ? 'bg-green-100 text-green-800'
                                                                                        : currentResponse.response === 'no' || currentResponse.response === 'non-compliant' || currentResponse.response === 'lacking' || currentResponse.response === 'NON-PRESENT'
                                                                                        ? 'bg-red-100 text-red-800'
                                                                                        : 'bg-blue-100 text-blue-800'
                                                                                }`}>
                                                                                    {currentResponse.response === 'N/A' ? 'Not Applicable' : currentResponse.response}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {/* Notes Field */}
                                                                        <div className="mt-3">
                                                                            <label className="text-xs font-medium text-gray-600">Notes:</label>
                                                                            {isEditing ? (
                                                                                <div className="flex items-center space-x-2">
                                                                                    <textarea
                                                                                        value={currentResponse.notes ?? ''}
                                                                                        onChange={(e) => handleResponseChange(response.id, 'notes', e.target.value)}
                                                                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                                        rows={2}
                                                                                        placeholder="Notes cannot be edited..."
                                                                                        readOnly
                                                                                    />
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleClearNotes(response.id)}
                                                                                        className="mt-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                                                                                    >
                                                                                        Clear
                                                                                    </button>
                                                                                </div>
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

                        {/* Penalties Tab */}
                        {activeTab === 'penalties' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Penalties Management</h3>
                                    <button
                                        onClick={() => setShowPenaltiesSidebar(!showPenaltiesSidebar)}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        {showPenaltiesSidebar ? (
                                            <>
                                                <EyeSlashIcon className="w-4 h-4 mr-2" />
                                                Hide Sidebar
                                            </>
                                        ) : (
                                            <>
                                                <EyeIcon className="w-4 h-4 mr-2" />
                                                Show Sidebar
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* First Penalty */}
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                                            <h4 className="text-md font-semibold text-red-800 flex items-center">
                                                <BanknotesIcon className="w-5 h-5 mr-2" />
                                                1st Penalty
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={penalties.first_penalty.description}
                                                        onChange={(e) => handlePenaltyChange('first_penalty', 'description', e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        rows={3}
                                                        placeholder="Enter first penalty description..."
                                                    />
                                                ) : (
                                                    <div>
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('first_penalty');
                                                            return (
                                                                <div>
                                                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                                        {displayData.description}
                                                                    </p>
                                                                    {displayData.isPrevious && (
                                                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                                                            <div className="flex items-center mb-1">
                                                                                <ExclamationCircleIcon className="w-3 h-3 text-yellow-600 mr-1" />
                                                                                <span className="font-medium text-yellow-800">
                                                                                    Previous Unpaid Penalty
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-gray-600">
                                                                                From inspection on {displayData.inspectionDate}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Amount
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={penalties.first_penalty.amount}
                                                        onChange={(e) => handlePenaltyChange('first_penalty', 'amount', e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        placeholder="Enter amount..."
                                                    />
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                            ₱{penalties.first_penalty.amount || '0.00'}
                                                        </p>
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('first_penalty');
                                                            if (displayData.isPrevious) {
                                                                return (
                                                                    <div className="mt-1 text-xs text-red-600 font-medium">
                                                                        Status: Unpaid
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Transparency Document
                                                </label>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setPenaltyDocuments(prev => ({
                                                                ...prev,
                                                                first_penalty: e.target.files[0]
                                                            }))}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                        />
                                                        {penaltyDocuments.first_penalty && (
                                                            <button
                                                                onClick={() => handlePenaltyDocumentUpload('first_penalty', penaltyDocuments.first_penalty)}
                                                                className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                                                            >
                                                                Upload Document
                                                            </button>
                                                        )}
                                                        {penalties.first_penalty.document && (
                                                            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                                                                <span className="text-sm text-green-800">Document uploaded</span>
                                                                <a
                                                                    href={penalties.first_penalty.document.url || `/storage/${penalties.first_penalty.document.path}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                                >
                                                                    View
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('first_penalty');
                                                            const document = displayData.document;
                                                            
                                                            if (document) {
                                                                return (
                                                                    <div>
                                                                        <a
                                                                            href={document.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                                        >
                                                                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                                            View Document
                                                                        </a>
                                                                        {displayData.isPrevious && (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                From previous inspection
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <span className="text-sm text-gray-500">
                                                                    {displayData.isPrevious ? 'No document from previous inspection' : 'No document uploaded'}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Second Penalty */}
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-orange-50 px-4 py-3 border-b border-orange-200">
                                            <h4 className="text-md font-semibold text-orange-800 flex items-center">
                                                <BanknotesIcon className="w-5 h-5 mr-2" />
                                                2nd Penalty
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={penalties.second_penalty.description}
                                                        onChange={(e) => handlePenaltyChange('second_penalty', 'description', e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        rows={3}
                                                        placeholder="Enter second penalty description..."
                                                    />
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                            {penalties.second_penalty.description || 'No description provided'}
                                                        </p>
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('second_penalty');
                                                            if (displayData.isPrevious) {
                                                                return (
                                                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                                                        <div className="flex items-center mb-1">
                                                                            <ExclamationCircleIcon className="w-3 h-3 text-yellow-600 mr-1" />
                                                                            <span className="font-medium text-yellow-800">
                                                                                Previous Unpaid Penalty
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-gray-600">
                                                                            From inspection on {displayData.inspectionDate}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Amount
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={penalties.second_penalty.amount}
                                                        onChange={(e) => handlePenaltyChange('second_penalty', 'amount', e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        placeholder="Enter amount..."
                                                    />
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                            ₱{penalties.second_penalty.amount || '0.00'}
                                                        </p>
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('second_penalty');
                                                            if (displayData.isPrevious) {
                                                                return (
                                                                    <div className="mt-1 text-xs text-red-600 font-medium">
                                                                        Status: Unpaid
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Transparency Document
                                                </label>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setPenaltyDocuments(prev => ({
                                                                ...prev,
                                                                second_penalty: e.target.files[0]
                                                            }))}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                        />
                                                        {penaltyDocuments.second_penalty && (
                                                            <button
                                                                onClick={() => handlePenaltyDocumentUpload('second_penalty', penaltyDocuments.second_penalty)}
                                                                className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                                                            >
                                                                Upload Document
                                                            </button>
                                                        )}
                                                        {penalties.second_penalty.document && (
                                                            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                                                                <span className="text-sm text-green-800">Document uploaded</span>
                                                                <a
                                                                    href={penalties.second_penalty.document.url || `/storage/${penalties.second_penalty.document.path}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                                >
                                                                    View
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('second_penalty');
                                                            const document = displayData.document;
                                                            
                                                            if (document) {
                                                                return (
                                                                    <div>
                                                                        <a
                                                                            href={document.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                                        >
                                                                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                                            View Document
                                                                        </a>
                                                                        {displayData.isPrevious && (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                From previous inspection
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <span className="text-sm text-gray-500">
                                                                    {displayData.isPrevious ? 'No document from previous inspection' : 'No document uploaded'}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Third Penalty */}
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="bg-purple-50 px-4 py-3 border-b border-purple-200">
                                            <h4 className="text-md font-semibold text-purple-800 flex items-center">
                                                <BanknotesIcon className="w-5 h-5 mr-2" />
                                                3rd Penalty
                                            </h4>
                                        </div>
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                {isEditing ? (
                                                    <textarea
                                                        value={penalties.third_penalty.description}
                                                        onChange={(e) => handlePenaltyChange('third_penalty', 'description', e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        rows={3}
                                                        placeholder="Enter third penalty description..."
                                                    />
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                            {penalties.third_penalty.description || 'No description provided'}
                                                        </p>
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('third_penalty');
                                                            if (displayData.isPrevious) {
                                                                return (
                                                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                                                        <div className="flex items-center mb-1">
                                                                            <ExclamationCircleIcon className="w-3 h-3 text-yellow-600 mr-1" />
                                                                            <span className="font-medium text-yellow-800">
                                                                                Previous Unpaid Penalty
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-gray-600">
                                                                            From inspection on {displayData.inspectionDate}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Amount
                                                </label>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        value={penalties.third_penalty.amount}
                                                        onChange={(e) => handlePenaltyChange('third_penalty', 'amount', e.target.value)}
                                                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        placeholder="Enter amount..."
                                                    />
                                                ) : (
                                                    <div>
                                                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                            ₱{penalties.third_penalty.amount || '0.00'}
                                                        </p>
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('third_penalty');
                                                            if (displayData.isPrevious) {
                                                                return (
                                                                    <div className="mt-1 text-xs text-red-600 font-medium">
                                                                        Status: Unpaid
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Transparency Document
                                                </label>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="file"
                                                            onChange={(e) => setPenaltyDocuments(prev => ({
                                                                ...prev,
                                                                third_penalty: e.target.files[0]
                                                            }))}
                                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                        />
                                                        {penaltyDocuments.third_penalty && (
                                                            <button
                                                                onClick={() => handlePenaltyDocumentUpload('third_penalty', penaltyDocuments.third_penalty)}
                                                                className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-sm"
                                                            >
                                                                Upload Document
                                                            </button>
                                                        )}
                                                        {penalties.third_penalty.document && (
                                                            <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                                                                <span className="text-sm text-green-800">Document uploaded</span>
                                                                <a
                                                                    href={penalties.third_penalty.document.url || `/storage/${penalties.third_penalty.document.path}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                                >
                                                                    View
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 p-2 rounded">
                                                        {(() => {
                                                            const displayData = getPenaltyDisplayData('third_penalty');
                                                            const document = displayData.document;
                                                            
                                                            if (document) {
                                                                return (
                                                                    <div>
                                                                        <a
                                                                            href={document.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                                                        >
                                                                            <DocumentTextIcon className="w-4 h-4 mr-1" />
                                                                            View Document
                                                                        </a>
                                                                        {displayData.isPrevious && (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                From previous inspection
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <span className="text-sm text-gray-500">
                                                                    {displayData.isPrevious ? 'No document from previous inspection' : 'No document uploaded'}
                                                                </span>
                                                            );
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Penalties Summary */}
                                <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Penalties Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h5 className="text-sm font-medium text-gray-600 mb-2">1st Penalty</h5>
                                            <p className="text-xl font-bold text-red-600">
                                                ₱{penalties.first_penalty.amount || '0.00'}
                                            </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h5 className="text-sm font-medium text-gray-600 mb-2">2nd Penalty</h5>
                                            <p className="text-xl font-bold text-orange-600">
                                                ₱{penalties.second_penalty.amount || '0.00'}
                                            </p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                                            <h5 className="text-sm font-medium text-gray-600 mb-2">3rd Penalty</h5>
                                            <p className="text-xl font-bold text-purple-600">
                                                ₱{penalties.third_penalty.amount || '0.00'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-300">
                                        <div className="flex justify-between items-center">
                                            <h5 className="text-lg font-semibold text-gray-900">Total Penalties</h5>
                                            <p className="text-2xl font-bold text-gray-900">
                                                ₱{(parseFloat(penalties.first_penalty.amount || 0) + 
                                                    parseFloat(penalties.second_penalty.amount || 0) + 
                                                    parseFloat(penalties.third_penalty.amount || 0)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            {/* Penalties Sidebar */}
            {showPenaltiesSidebar && (
                <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-40 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Penalties Quick View</h3>
                            <button
                                onClick={() => setShowPenaltiesSidebar(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <h4 className="font-semibold text-red-800 mb-2">1st Penalty</h4>
                                <p className="text-sm text-gray-700 mb-2">{penalties.first_penalty.description || 'No description'}</p>
                                <p className="text-lg font-bold text-red-600">₱{penalties.first_penalty.amount || '0.00'}</p>
                            </div>
                            
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <h4 className="font-semibold text-orange-800 mb-2">2nd Penalty</h4>
                                <p className="text-sm text-gray-700 mb-2">{penalties.second_penalty.description || 'No description'}</p>
                                <p className="text-lg font-bold text-orange-600">₱{penalties.second_penalty.amount || '0.00'}</p>
                            </div>
                            
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-800 mb-2">3rd Penalty</h4>
                                <p className="text-sm text-gray-700 mb-2">{penalties.third_penalty.description || 'No description'}</p>
                                <p className="text-lg font-bold text-purple-600">₱{penalties.third_penalty.amount || '0.00'}</p>
                            </div>
                            
                            <div className="bg-gray-900 p-4 rounded-lg text-white">
                                <h4 className="font-semibold mb-2">Total Amount</h4>
                                <p className="text-2xl font-bold">
                                    ₱{(parseFloat(penalties.first_penalty.amount || 0) + 
                                        parseFloat(penalties.second_penalty.amount || 0) + 
                                        parseFloat(penalties.third_penalty.amount || 0)).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
        
        {/* Email Modal */}
        {showEmailModal && (
            <div className="fixed inset-0 z-[9999] overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowEmailModal(false)}></div>
                    
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full z-[10000]">
                        <div className="bg-green-600 px-6 py-4 rounded-t-xl">
                            <h3 className="text-lg font-semibold text-white">Email Inspection Report</h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={emailData.email}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="recipient@example.com"
                                        required
                                        autoFocus
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
                                    <input
                                        type="text"
                                        value={emailData.subject}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Inspection Report"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                                    <textarea
                                        value={emailData.message}
                                        onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        rows={3}
                                        placeholder="Please find attached the inspection report."
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={!emailData.email || isSending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    {isSending ? 'Sending...' : 'Send Email'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </AuthenticatedLayout>
    );
}
