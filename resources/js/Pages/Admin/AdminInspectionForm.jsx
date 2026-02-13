import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    BuildingOfficeIcon,
    ClipboardDocumentCheckIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

export default function AdminInspectionForm({ auth }) {
    const { establishments = [], staff = [], checklistQuestions = [], groupedQuestions = {}, utilities = [], categories = [], businessTypes = [], existingInspections = [] } = usePage().props;
    
    // Debug: Log existing inspections data
    console.log('=== Component Loaded ===');
    console.log('Existing inspections from props:', existingInspections);
    console.log('Number of existing inspections:', existingInspections.length);
    const [selectedEstablishment, setSelectedEstablishment] = useState('');
    const [selectedEstablishmentData, setSelectedEstablishmentData] = useState(null);
    const [showEstablishmentModal, setShowEstablishmentModal] = useState(true);
    const [checklistResponses, setChecklistResponses] = useState({});
    const [utilityData, setUtilityData] = useState({});
    const [overallScore, setOverallScore] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [recommendationChecks, setRecommendationChecks] = useState({
        comply_lacking_permits: false,
        provide_lacking_facilities: false,
        others: false
    });
    const [conditionalFields, setConditionalFields] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [automatedRecommendations, setAutomatedRecommendations] = useState([]);
    const [isCompliant, setIsCompliant] = useState(true);
    const [expiredChecks, setExpiredChecks] = useState({});
    const [progress, setProgress] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [modalShake, setModalShake] = useState(false);
    const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
    const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
    const [inspectionTime, setInspectionTime] = useState(new Date().toTimeString().slice(0, 5));
    const [quarter, setQuarter] = useState('Q1');
    const [inspectorId, setInspectorId] = useState('');
    const [dateSelectionMode, setDateSelectionMode] = useState('new'); // 'new' or 'existing'
    const [selectedExistingInspection, setSelectedExistingInspection] = useState('');
    const [existingInspectionsData, setExistingInspectionsData] = useState([]);

    // Initialize utility data when utilities change
    React.useEffect(() => {
        if (utilities && utilities.length > 0) {
            const initialUtilityData = {};
            utilities.forEach(utility => {
                initialUtilityData[utility.id] = {};
                utility.rows?.forEach(row => {
                    utility.columns?.forEach(column => {
                        const key = `${row.name}_${column.name}`;
                        initialUtilityData[utility.id][key] = '';
                    });
                });
            });
            setUtilityData(initialUtilityData);
        }
    }, [utilities]);

    // Initialize existing inspections data from props
    React.useEffect(() => {
        console.log('=== Initializing Existing Inspections ===');
        console.log('Props existingInspections:', existingInspections);
        setExistingInspectionsData(existingInspections);
    }, [existingInspections]);

    const handleEstablishmentSelect = (establishmentId) => {
        setSelectedEstablishment(establishmentId);
        const establishment = establishments.find(est => est.id === establishmentId);
        setSelectedEstablishmentData(establishment);
        console.log('Selected establishment:', establishment); // Debug log
        setShowEstablishmentModal(false);
    };

    const handleCancelModal = () => {
        setShowEstablishmentModal(false);
        window.history.back();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterEstablishments = (establishments) => {
        if (!establishments || !searchTerm || searchTerm.trim() === '') {
            return establishments || [];
        }
        
        const term = searchTerm.toLowerCase();
        return establishments.filter(establishment => 
            establishment.name.toLowerCase().includes(term) ||
            establishment.address?.toLowerCase().includes(term) ||
            establishment.type_of_business?.toLowerCase().includes(term) ||
            establishment.Barangay?.toLowerCase().includes(term)
        );
    };

    const checkPermitExpiration = (expiryDate) => {
        if (!expiryDate) return { isExpired: false, daysUntilExpiry: null };
        
        const expiry = new Date(expiryDate);
        const today = new Date();
        const diffTime = expiry - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return {
            isExpired: diffDays < 0,
            daysUntilExpiry: diffDays,
            isExpiringSoon: diffDays >= 0 && diffDays <= 30
        };
    };

    const generateAutomatedRecommendation = (question, response) => {
        const recommendations = [];
        
        let normalizedOptions = Array.isArray(question.options) ? question.options : [];
        normalizedOptions = normalizedOptions.map(option => {
            if (typeof option === 'string') {
                const lowerOption = option.toLowerCase().trim();
                if (['non-present', 'no', 'not available', 'non-compliant', 'non-functional', 'inoperational', 'n/a'].some(neg => lowerOption.includes(neg))) {
                    return { text: option, type: 'negative' };
                } else if (['present', 'yes', 'available', 'compliant', 'functional', 'operational'].some(pos => lowerOption.includes(pos))) {
                    return { text: option, type: 'positive' };
                }
                return { text: option, type: 'neutral' };
            }
            return option;
        });
        
        const selectedOption = normalizedOptions.find(option => option.text === response);
        const responseType = selectedOption?.type || 'neutral';
        
        if (responseType === 'negative') {
            if (question.question.toLowerCase().includes('permit') || question.question.toLowerCase().includes('license')) {
                recommendations.push({
                    type: 'permit',
                    message: `Acquire necessary ${question.question.toLowerCase().includes('permit') ? 'permit' : 'license'} to comply with regulations.`,
                    action: 'comply_lacking_permits'
                });
            } else if (question.question.toLowerCase().includes('facility') || question.question.toLowerCase().includes('equipment')) {
                recommendations.push({
                    type: 'facility',
                    message: `Provide required ${question.question.toLowerCase().includes('facility') ? 'facility' : 'equipment'} to meet compliance standards.`,
                    action: 'provide_lacking_facilities'
                });
            } else {
                recommendations.push({
                    type: 'others',
                    message: `Address compliance issue for: ${question.question}`,
                    action: 'others'
                });
            }
        }
        
        return recommendations;
    };

    const updateComplianceStatus = () => {
        const responses = Object.values(checklistResponses);
        
        let hasExpiredPermits = false;
        Object.entries(conditionalFields).forEach(([questionId, fields]) => {
            Object.entries(fields).forEach(([fieldName, value]) => {
                if (fieldName.toLowerCase().includes('expiry') || fieldName.toLowerCase().includes('expiration')) {
                    const expiryCheck = checkPermitExpiration(value);
                    if (expiryCheck.isExpired) {
                        hasExpiredPermits = true;
                    }
                }
            });
        });
        
        const hasExpiredChecks = Object.values(expiredChecks).some(isExpired => isExpired);
        const hasAnyExpiredPermits = hasExpiredChecks || hasExpiredPermits;
        
        const hasNegativeResponses = responses.some(response => {
            const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === response.question_id);
            if (!question || !question.options) return false;
            
            let normalizedOptions = Array.isArray(question.options) ? question.options : [];
            normalizedOptions = normalizedOptions.map(option => {
                if (typeof option === 'string') {
                    const lowerOption = option.toLowerCase().trim();
                    if (['non-present', 'no', 'not available', 'non-compliant', 'non-functional', 'inoperational', 'n/a'].some(neg => lowerOption.includes(neg))) {
                        return { text: option, type: 'negative' };
                    } else if (['present', 'yes', 'available', 'compliant', 'functional', 'operational'].some(pos => lowerOption.includes(pos))) {
                        return { text: option, type: 'positive' };
                    }
                    return { text: option, type: 'neutral' };
                }
                return option;
            });
            
            const selectedOption = normalizedOptions.find(option => 
                option.text && option.text.trim().toLowerCase() === response.response.trim().toLowerCase()
            );
            return selectedOption?.type === 'negative';
        });
        
        const allPositiveResponses = responses.length > 0 && responses.every(response => {
            const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === response.question_id);
            if (!question || !question.options) return false;
            
            let normalizedOptions = Array.isArray(question.options) ? question.options : [];
            normalizedOptions = normalizedOptions.map(option => {
                if (typeof option === 'string') {
                    const lowerOption = option.toLowerCase().trim();
                    if (['non-present', 'no', 'not available', 'non-compliant', 'non-functional', 'inoperational', 'n/a'].some(neg => lowerOption.includes(neg))) {
                        return { text: option, type: 'negative' };
                    } else if (['present', 'yes', 'available', 'compliant', 'functional', 'operational'].some(pos => lowerOption.includes(pos))) {
                        return { text: option, type: 'positive' };
                    }
                    return { text: option, type: 'neutral' };
                }
                return option;
            });
            
            const selectedOption = normalizedOptions.find(option => 
                option.text && option.text.trim().toLowerCase() === response.response.trim().toLowerCase()
            );
            return selectedOption?.type === 'positive';
        });
        
        let newComplianceStatus = true;
        
        if (responses.length > 0) {
            const hasPositiveWithExpired = allPositiveResponses && hasAnyExpiredPermits;
            
            if (hasPositiveWithExpired || hasNegativeResponses) {
                newComplianceStatus = false;
            } else {
                newComplianceStatus = true;
            }
        }
        
        setIsCompliant(newComplianceStatus);
        
        const newRecommendationChecks = {
            comply_lacking_permits: false,
            provide_lacking_facilities: false,
            others: false
        };
        
        automatedRecommendations.forEach(rec => {
            if (rec.action && newRecommendationChecks.hasOwnProperty(rec.action)) {
                newRecommendationChecks[rec.action] = true;
            }
        });
        
        setRecommendationChecks(prev => ({ ...prev, ...newRecommendationChecks }));
    };

    // Calculate progress and total questions
    React.useEffect(() => {
        if (groupedQuestions) {
            const total = Object.values(groupedQuestions).flat().length;
            setTotalQuestions(total);
            
            const answered = Object.keys(checklistResponses).length;
            const progressPercentage = total > 0 ? Math.round((answered / total) * 100) : 0;
            setProgress(progressPercentage);
        }
    }, [checklistResponses, groupedQuestions]);

    // Update compliance status when responses or conditional fields change
    React.useEffect(() => {
        updateComplianceStatus();
    }, [checklistResponses, conditionalFields, automatedRecommendations, expiredChecks]);

    const handleResponseChange = (questionId, response) => {
        setChecklistResponses(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                question_id: questionId,
                response: response,
                notes: prev[questionId]?.notes || '',
                remarks: prev[questionId]?.remarks || ''
            }
        }));

        setAnsweredQuestions(prev => {
            const newSet = new Set(prev);
            if (response && response !== '') {
                newSet.add(questionId);
            } else {
                newSet.delete(questionId);
            }
            return newSet;
        });

        const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === questionId);
        if (question) {
            const newRecommendations = generateAutomatedRecommendation(question, response);
            
            setAutomatedRecommendations(prev => {
                const filtered = prev.filter(rec => rec.questionId !== questionId);
                return [...filtered, ...newRecommendations.map(rec => ({ ...rec, questionId }))];
            });
        }

        if (question?.is_conditional && question?.conditional_logic) {
            const shouldShowFields = response === question.conditional_logic.trigger_response;
            
            if (!shouldShowFields) {
                setConditionalFields(prev => {
                    const newFields = { ...prev };
                    delete newFields[questionId];
                    return newFields;
                });
                
                setExpiredChecks(prev => {
                    const newChecks = { ...prev };
                    delete newChecks[questionId];
                    return newChecks;
                });
                
                setChecklistResponses(prev => {
                    const currentNotes = prev[questionId]?.notes || '';
                    const newNotes = currentNotes.replace(/\n?Document\/Permit has expired\./, '').trim();
                    
                    return {
                        ...prev,
                        [questionId]: {
                            ...prev[questionId],
                            notes: newNotes
                        }
                    };
                });
            } else {
                setConditionalFields(prev => ({
                    ...prev,
                    [questionId]: question.conditional_logic.fields.reduce((acc, field) => {
                        acc[field.name] = '';
                        return acc;
                    }, {})
                }));
            }
        }
    };

    const handleConditionalFieldChange = (questionId, fieldName, value) => {
        setConditionalFields(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                [fieldName]: value
            }
        }));

        if (fieldName.toLowerCase().includes('expiry') || fieldName.toLowerCase().includes('expiration')) {
            const expiryCheck = checkPermitExpiration(value);
            if (expiryCheck.isExpired) {
                const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === questionId);
                if (question) {
                    const expiredPermitRecommendation = {
                        questionId,
                        type: 'permit',
                        message: `Permit has expired on ${new Date(value).toLocaleDateString()}. Renewal required immediately.`,
                        action: 'comply_lacking_permits'
                    };
                    
                    setAutomatedRecommendations(prev => {
                        const filtered = prev.filter(rec => !(rec.questionId === questionId && rec.type === 'permit'));
                        return [...filtered, expiredPermitRecommendation];
                    });
                }
            }
        }
    };

    const handleNotesChange = (questionId, notes) => {
        setChecklistResponses(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                question_id: questionId,
                response: prev[questionId]?.response || '',
                notes: notes,
                remarks: prev[questionId]?.remarks || ''
            }
        }));
    };

    const handleRemarksChange = (questionId, remarks) => {
        setChecklistResponses(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                question_id: questionId,
                response: prev[questionId]?.response || '',
                notes: prev[questionId]?.notes || '',
                remarks: remarks
            }
        }));
    };

    const handleExpiredCheck = (questionId, isExpired) => {
        setExpiredChecks(prev => ({
            ...prev,
            [questionId]: isExpired
        }));

        const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === questionId);
        if (question) {
            const expiredNote = isExpired ? 'Document/Permit has expired.' : '';
            
            setChecklistResponses(prev => {
                const currentNotes = prev[questionId]?.notes || '';
                const existingExpiredNote = currentNotes.includes('Document/Permit has expired.');
                
                let newNotes;
                if (isExpired && !existingExpiredNote) {
                    newNotes = currentNotes ? `${currentNotes}\n${expiredNote}` : expiredNote;
                } else if (!isExpired && existingExpiredNote) {
                    newNotes = currentNotes.replace(/\n?Document\/Permit has expired\./, '').trim();
                } else {
                    newNotes = currentNotes;
                }
                
                return {
                    ...prev,
                    [questionId]: {
                        ...prev[questionId],
                        question_id: questionId,
                        response: prev[questionId]?.response || '',
                        notes: newNotes,
                        remarks: prev[questionId]?.remarks || ''
                    }
                };
            });
        }
    };

    const handleUtilityDataChange = (utilityId, key, value) => {
        setUtilityData(prev => ({
            ...prev,
            [utilityId]: {
                ...prev[utilityId],
                [key]: value
            }
        }));
    };

    const handleRecommendationCheckChange = (checkName, value) => {
        setRecommendationChecks(prev => ({
            ...prev,
            [checkName]: value
        }));
    };

    const handleExistingInspectionSelect = (inspectionId) => {
        console.log('=== Existing Inspection Selection ===');
        console.log('Selected inspection ID:', inspectionId);
        console.log('Current existingInspectionsData array:', existingInspectionsData);
        console.log('Array length:', existingInspectionsData.length);
        
        // Convert to number to fix type mismatch
        const numericId = parseInt(inspectionId, 10);
        console.log('Converted numeric ID:', numericId);
        
        // Log each inspection in the array
        existingInspectionsData.forEach((inspection, index) => {
            console.log(`Inspection ${index}:`, inspection);
        });
        
        setSelectedExistingInspection(inspectionId);
        const inspection = existingInspectionsData.find(insp => insp.id === numericId);
        
        if (inspection) {
            console.log('Found inspection data:', inspection);
            console.log('Setting date to:', inspection.date);
            console.log('Setting time to:', inspection.time);
            console.log('Setting quarter to:', inspection.quarter);
            
            setInspectionDate(inspection.date);
            setInspectionTime(inspection.time);
            setQuarter(inspection.quarter);
        } else {
            console.error('Inspection not found for ID:', numericId);
            console.error('Available IDs:', existingInspectionsData.map(insp => insp.id));
        }
    };

    const handleDateSelectionModeChange = (mode) => {
        console.log('=== Date Selection Mode Changed ===');
        console.log('New mode:', mode);
        console.log('Previous mode:', dateSelectionMode);
        
        setDateSelectionMode(mode);
        if (mode === 'new') {
            setSelectedExistingInspection('');
            // Reset to current date/time when switching to new mode
            const newDate = new Date().toISOString().split('T')[0];
            const newTime = new Date().toTimeString().slice(0, 5);
            console.log('Resetting to new mode - Date:', newDate, 'Time:', newTime, 'Quarter: Q1');
            
            setInspectionDate(newDate);
            setInspectionTime(newTime);
            setQuarter('Q1'); // Reset to default quarter
        } else {
            // Clear date/time when switching to existing mode
            console.log('Switching to existing mode - clearing fields');
            setInspectionDate('');
            setInspectionTime('');
            setQuarter(''); // Clear quarter
        }
    };

    const renderConditionalFields = (question) => {
        if (!question.is_conditional || !question.conditional_logic) return null;
        
        const response = checklistResponses[question.id]?.response;
        const shouldShowFields = response === question.conditional_logic.trigger_response;
        
        if (!shouldShowFields) return null;
        
        return (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h6 className="text-sm font-semibold text-blue-800 mb-3">
                    {question.conditional_logic.type === 'permit' ? 'Permit Information' : 'Clearance Information'}
                </h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.conditional_logic.fields.map((field) => {
                        const value = conditionalFields[question.id]?.[field.name] || '';
                        
                        return (
                            <div key={field.name}>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'date' ? (
                                    <div>
                                        <input
                                            type="date"
                                            value={value}
                                            onChange={(e) => handleConditionalFieldChange(question.id, field.name, e.target.value)}
                                            className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleConditionalFieldChange(question.id, field.name, e.target.value)}
                                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                        className="w-full border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmationModal(true);
    };

    const confirmSubmit = () => {
        console.log('=== Form Submission Started ===');
        console.log('Date selection mode:', dateSelectionMode);
        console.log('Selected existing inspection:', selectedExistingInspection);
        console.log('Current inspection date:', inspectionDate);
        console.log('Current inspection time:', inspectionTime);
        console.log('Current quarter:', quarter);
        console.log('Selected establishment:', selectedEstablishment);
        console.log('Selected inspector:', inspectorId);
        
        const hasWarnings = progress < 100;
        
        if (hasWarnings) {
            console.log('Submission blocked: Progress not complete');
            setModalShake(true);
            setTimeout(() => setModalShake(false), 600);
            return;
        }

        // Validate date selection
        if (dateSelectionMode === 'existing' && !selectedExistingInspection) {
            console.log('Submission blocked: No existing inspection selected');
            alert('Please select an existing inspection date and time.');
            return;
        }

        if (dateSelectionMode === 'new' && (!inspectionDate || !inspectionTime)) {
            console.log('Submission blocked: Missing date or time in new mode');
            alert('Please enter both inspection date and time.');
            return;
        }

        // Validate inspector selection
        if (!inspectorId) {
            console.log('Submission blocked: No inspector selected');
            alert('Please select an inspector.');
            return;
        }

        console.log('Validation passed, preparing form data...');
        
        const allRecommendations = [
            ...automatedRecommendations.map(rec => rec.message),
            recommendations
        ].filter(Boolean).join('\n');
        
        const formData = {
            establishment_id: selectedEstablishment,
            inspection_date: inspectionDate,
            inspection_time: inspectionTime,
            quarter: quarter,
            inspector_id: inspectorId,
            existing_inspection_id: dateSelectionMode === 'existing' ? selectedExistingInspection : null,
            checklist_responses: Object.values(checklistResponses),
            utility_data: utilityData,
            conditional_fields: conditionalFields,
            other_remarks: overallScore,
            recommendations: allRecommendations,
            recommendation_checks: recommendationChecks,
            compliance_status: isCompliant ? 'compliant' : 'not_compliant',
            automated_recommendations: automatedRecommendations,
        };

        console.log('Form data being submitted:', formData);
        console.log('Sending to: /admin/inspection-store');
        
        router.post('/admin/inspection-store', formData, {
            onSuccess: (page) => {
                console.log('Success response:', page);
                setShowConfirmationModal(false);
            },
            onError: (errors) => {
                console.log('Error response:', errors);
                alert('Error submitting form: ' + JSON.stringify(errors));
                setShowConfirmationModal(false);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <ClipboardDocumentCheckIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Manual Inspection Entry</h2>
                            <p className="text-sm text-gray-500">Input previous inspection data when system is temporarily down</p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Manual Inspection Entry" />

            {/* Establishment Selection Modal */}
            {showEstablishmentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <BuildingOfficeIcon className="w-6 h-6 text-blue-600" />
                                    <h3 className="text-xl font-bold text-gray-900">Select Establishment</h3>
                                </div>
                                <button
                                    onClick={handleCancelModal}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        placeholder="Search establishments..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="max-h-96 overflow-y-auto">
                                {establishments && filterEstablishments(establishments).length > 0 ? (
                                    <div className="grid gap-3">
                                        {filterEstablishments(establishments).map(establishment => (
                                            <button
                                                key={establishment.id}
                                                onClick={() => handleEstablishmentSelect(establishment.id)}
                                                className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                                            >
                                                <div>
                                                    <div className="font-semibold text-gray-900">{establishment.name}</div>
                                                    <div className="text-sm text-gray-500">{establishment.address}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {establishment.business_type?.name || 'Not specified'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{establishment.Barangay}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No establishments found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!showEstablishmentModal && (
                <div className="p-6 bg-gray-50 min-h-screen">
                    <div className="w-full space-y-6">
                        {/* Selected Establishment Card */}
                        {selectedEstablishmentData && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                                            <BuildingOfficeIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Selected Establishment</h3>
                                            <p className="text-sm text-gray-500">Inspection target details</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowEstablishmentModal(true);
                                            setSelectedEstablishment('');
                                            setSelectedEstablishmentData(null);
                                        }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                    >
                                        Change Establishment
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Business Name</label>
                                        <p className="text-sm font-semibold text-gray-900">{selectedEstablishmentData.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Business Type</label>
                                        <p className="text-sm text-gray-700">
                                            {selectedEstablishmentData?.business_type?.name || 'Not specified'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Barangay</label>
                                        <p className="text-sm text-gray-700">{selectedEstablishmentData.Barangay}</p>
                                    </div>
                                    <div className="md:col-span-2 lg:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Address</label>
                                        <p className="text-sm text-gray-700">{selectedEstablishmentData.address}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Owner/Manager</label>
                                        <p className="text-sm text-gray-700">{selectedEstablishmentData.proponent}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Contact Number</label>
                                        <p className="text-sm text-gray-700">{selectedEstablishmentData.contact_number}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                        <p className="text-sm text-gray-700">{selectedEstablishmentData.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Inspection Details Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Inspection Details</h3>
                                
                                {/* Date Selection Mode */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date Selection Mode
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="new"
                                                checked={dateSelectionMode === 'new'}
                                                onChange={(e) => handleDateSelectionModeChange(e.target.value)}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Enter New Date & Time</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="existing"
                                                checked={dateSelectionMode === 'existing'}
                                                onChange={(e) => handleDateSelectionModeChange(e.target.value)}
                                                className="mr-2 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">Select Existing Inspection</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Date/Time Input or Selection */}
                                {dateSelectionMode === 'new' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <CalendarIcon className="w-4 h-4 inline mr-2" />
                                                Inspection Date
                                            </label>
                                            <input
                                                type="date"
                                                value={inspectionDate}
                                                onChange={(e) => setInspectionDate(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                                            <input
                                                type="time"
                                                value={inspectionTime}
                                                onChange={(e) => setInspectionTime(e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <CalendarIcon className="w-4 h-4 inline mr-2" />
                                            Select Existing Inspection Date & Time
                                        </label>
                                        <select
                                            value={selectedExistingInspection}
                                            onChange={(e) => handleExistingInspectionSelect(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Choose an existing inspection...</option>
                                            {existingInspectionsData.map(inspection => (
                                                <option key={inspection.id} value={inspection.id}>
                                                    {inspection.display}
                                                </option>
                                            ))}
                                        </select>
                                        {selectedExistingInspection && (
                                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm text-blue-800">
                                                    Selected: {inspectionDate} at {inspectionTime}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Other Inspection Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                                    <select
                                        value={quarter}
                                        onChange={(e) => setQuarter(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Q1">Q1</option>
                                        <option value="Q2">Q2</option>
                                        <option value="Q3">Q3</option>
                                        <option value="Q4">Q4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Inspector</label>
                                    <select
                                        value={inspectorId}
                                        onChange={(e) => setInspectorId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Inspector...</option>
                                        {staff && staff.map(staffMember => (
                                            <option key={staffMember.id} value={staffMember.id}>
                                                {staffMember.first_name} {staffMember.last_name} - {staffMember.position}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-500">{progress}% ({Object.keys(checklistResponses).length}/{totalQuestions} questions)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Checklist Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {Object.entries(groupedQuestions).map(([category, questions]) => (
                                <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                                        <p className="text-sm text-gray-500">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        {questions.map(question => (
                                            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-start space-x-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                        answeredQuestions.has(question.id) 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {answeredQuestions.has(question.id) ? '✓' : '?'}
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-900 mb-2">
                                                            {question.question}
                                                        </label>
                                                        
                                                        <select
                                                            value={checklistResponses[question.id]?.response || ''}
                                                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                                                        >
                                                            <option value="">Select response...</option>
                                                            {question.options?.map((option, index) => (
                                                                <option key={index} value={typeof option === 'string' ? option : option.text}>
                                                                    {typeof option === 'string' ? option : option.text}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {renderConditionalFields(question)}
                                                        <div className="mt-3 grid grid-cols-1 gap-3">
                                                            {/* Expired Checkbox for Conditional Questions */}
                                                            {question.is_conditional && question.conditional_logic && checklistResponses[question.id]?.response === question.conditional_logic.trigger_response && (
                                                                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                                    <input
                                                                        type="checkbox"
                                                                        id={`expired_${question.id}`}
                                                                        checked={expiredChecks[question.id] || false}
                                                                        onChange={(e) => handleExpiredCheck(question.id, e.target.checked)}
                                                                        className="mr-3 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
                                                                    />
                                                                    <label htmlFor={`expired_${question.id}`} className="text-sm font-medium text-yellow-800 cursor-pointer">
                                                                        <ExclamationCircleIcon className="w-4 h-4 inline mr-1" />
                                                                        Document/Permit is Expired
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                                                                <textarea
                                                                    value={checklistResponses[question.id]?.notes || ''}
                                                                    onChange={(e) => handleNotesChange(question.id, e.target.value)}
                                                                    rows={2}
                                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Add notes..."
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                                                                <textarea
                                                                    value={checklistResponses[question.id]?.remarks || ''}
                                                                    onChange={(e) => handleRemarksChange(question.id, e.target.value)}
                                                                    rows={2}
                                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    placeholder="Add remarks..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Utility Forms */}
                            {utilities && utilities.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Utility Forms</h3>
                                    {utilities.map(utility => (
                                        <div key={utility.id} className="mb-6">
                                            <h4 className="text-md font-semibold text-gray-800 mb-3">{utility.form_name}</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full border border-gray-200">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                                                            {utility.columns?.map(column => (
                                                                <th key={column.name} className="border border-gray-200 px-3 py-2 text-left text-sm font-medium text-gray-700">
                                                                    {column.name}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {utility.rows?.map(row => (
                                                            <tr key={row.name}>
                                                                <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900">
                                                                    {row.name}
                                                                </td>
                                                                {utility.columns?.map(column => {
                                                                    const key = `${row.name}_${column.name}`;
                                                                    const value = utilityData[utility.id]?.[key] || '';
                                                                    return (
                                                                        <td key={column.name} className="border border-gray-200 px-3 py-2">
                                                                            <input
                                                                                type={row.type === 'number' ? 'number' : 'text'}
                                                                                value={value}
                                                                                onChange={(e) => handleUtilityDataChange(utility.id, key, e.target.value)}
                                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                            />
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recommendations Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Recommendations</h3>
                                
                                <div className="space-y-3 mb-4">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={recommendationChecks.comply_lacking_permits}
                                            onChange={(e) => handleRecommendationCheckChange('comply_lacking_permits', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Comply lacking permits</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={recommendationChecks.provide_lacking_facilities}
                                            onChange={(e) => handleRecommendationCheckChange('provide_lacking_facilities', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Provide lacking facilities</span>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="checkbox"
                                            checked={recommendationChecks.others}
                                            onChange={(e) => handleRecommendationCheckChange('others', e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">Others</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Recommendations</label>
                                    <textarea
                                        value={recommendations}
                                        onChange={(e) => setRecommendations(e.target.value)}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter detailed recommendations..."
                                    />
                                </div>

                                {automatedRecommendations.length > 0 && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm font-medium text-yellow-800 mb-2">Automated Recommendations:</p>
                                        <ul className="list-disc list-inside text-sm text-yellow-700">
                                            {automatedRecommendations.map((rec, index) => (
                                                <li key={index}>{rec.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Other Remarks */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Other Remarks</h3>
                                <textarea
                                    value={overallScore}
                                    onChange={(e) => setOverallScore(e.target.value)}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter other remarks..."
                                />
                            </div>

                            {/* Compliance Status */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Compliance Status</h3>
                                        <p className="text-sm text-gray-500">Based on the inspection responses</p>
                                    </div>
                                    <div className={`px-4 py-2 rounded-lg font-semibold ${
                                        isCompliant 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {isCompliant ? 'COMPLIANT' : 'NOT COMPLIANT'}
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                                >
                                    Submit Inspection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 ${modalShake ? 'animate-shake' : ''}`}>
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className={`p-2 rounded-full ${
                                    progress === 100 ? 'bg-green-100' : 'bg-yellow-100'
                                }`}>
                                    {progress === 100 ? (
                                        <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                    ) : (
                                        <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        {progress === 100 ? 'Ready to Submit' : 'Incomplete Inspection'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {progress === 100 
                                            ? 'All questions have been answered. Are you ready to submit this inspection?'
                                            : `You have answered ${Object.keys(checklistResponses).length} out of ${totalQuestions} questions. Please complete all questions before submitting.`
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowConfirmationModal(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                {progress === 100 && (
                                    <button
                                        onClick={confirmSubmit}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
