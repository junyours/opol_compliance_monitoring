import React, { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import {
    BuildingOfficeIcon,
    ClipboardDocumentCheckIcon,
    XMarkIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// Add shake animation styles
const shakeStyles = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    .animate-shake {
        animation: shake 0.6s;
    }
`;

export default function InspectionForm({ auth }) {
    const { inspection, establishments, checklistQuestions, groupedQuestions, utilities, categories } = usePage().props;
    const [selectedEstablishment, setSelectedEstablishment] = useState('');
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

    // Simplified category functions
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

    const getNegativeResponsesInCategory = (questions) => {
        return questions.filter(question => {
            const response = checklistResponses[question.id];
            
            // Check for negative responses and N/A responses
            return response?.response === 'no' || 
                   response?.response === 'non-compliant' || 
                   response?.response === 'lacking' ||
                   response?.response === 'N/A';
        });
    };

    const getCategoryRecommendations = (category, negativeResponses) => {
        const simplifiedCategory = getSimplifiedCategoryName(category);
        
        if (negativeResponses.length === 0) {
            return null;
        }
        
        // Check if there are N/A responses
        const hasNaResponses = negativeResponses.some(question => {
            const response = checklistResponses[question.id];
            return response?.response === 'N/A';
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

    
    const handleEstablishmentSelect = (establishmentId) => {
        setSelectedEstablishment(establishmentId);
        setShowEstablishmentModal(false);
    };

    const handleCancelModal = () => {
        setShowEstablishmentModal(false);
        router.get('/staff/schedule');
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filterEstablishments = (establishments) => {
        if (!searchTerm || searchTerm.trim() === '') {
            return establishments;
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
        
        // Normalize options to handle both old string options and new object options
        let normalizedOptions = Array.isArray(question.options) ? question.options : [];
        normalizedOptions = normalizedOptions.map(option => {
            if (typeof option === 'string') {
                // Try to infer type from common negative responses
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
        
        // Find the selected option in the normalized options
        const selectedOption = normalizedOptions.find(option => option.text === response);
        const responseType = selectedOption?.type || 'neutral';
        
        // NEW LOGIC: Generate recommendations for negative responses only
        // Negative responses indicate missing documents/items that need recommendations
        if (responseType === 'negative') {
            // Generate recommendations for negative responses (missing items)
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
        
        // Check for expired permits in conditional fields
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
        
        // Check for expired checkboxes
        const hasExpiredChecks = Object.values(expiredChecks).some(isExpired => isExpired);
        
        // Combine both expired checkboxes and expired permits from conditional fields
        const hasExpiredPermitsFromFields = hasExpiredPermits; // This was calculated above
        const hasAnyExpiredPermits = hasExpiredChecks || hasExpiredPermitsFromFields;
        
        // NEW COMPLIANCE LOGIC: Use database-defined option types
        // - Non-complaint: ANY positive response with expired permits OR ANY negative response
        // - Complaint: All negative responses without any expired permits
        
        // Check for negative responses
        const hasNegativeResponses = responses.some(response => {
            // Find the question to get its options
            const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === response.question_id);
            if (!question || !question.options) return false;
            
            // Normalize options to handle both old string options and new object options
            let normalizedOptions = Array.isArray(question.options) ? question.options : [];
            normalizedOptions = normalizedOptions.map(option => {
                if (typeof option === 'string') {
                    // Try to infer type from common negative responses
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
            
            // Find the selected option in the normalized options (case-insensitive and trimmed)
            const selectedOption = normalizedOptions.find(option => 
                option.text && option.text.trim().toLowerCase() === response.response.trim().toLowerCase()
            );
            return selectedOption?.type === 'negative';
        });
        
        // Check if all responses are positive
        const allPositiveResponses = responses.length > 0 && responses.every(response => {
            // Find the question to get its options
            const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === response.question_id);
            if (!question || !question.options) return false;
            
            // Normalize options to handle both old string options and new object options
            let normalizedOptions = Array.isArray(question.options) ? question.options : [];
            normalizedOptions = normalizedOptions.map(option => {
                if (typeof option === 'string') {
                    // Try to infer type from common negative responses
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
            
            // Find the selected option in the normalized options (case-insensitive and trimmed)
            const selectedOption = normalizedOptions.find(option => 
                option.text && option.text.trim().toLowerCase() === response.response.trim().toLowerCase()
            );
            return selectedOption?.type === 'positive';
        });
        
        // NEW COMPLIANCE LOGIC:
        // - Non-complaint: ANY positive response with expired permits OR ANY negative response
        // - Complaint: All negative responses without any expired permits
        
        let newComplianceStatus = true; // Default to complaint (compliant)
        
        if (responses.length > 0) {
            // Check for conditions that make it non-complaint
            const hasPositiveWithExpired = allPositiveResponses && hasAnyExpiredPermits;
            
            // Non-complaint if: has positive responses with expired permits OR has any negative responses
            if (hasPositiveWithExpired || hasNegativeResponses) {
                // Case: Positive with expired OR any negative responses → NON-COMPLAINT
                newComplianceStatus = false;
            } else {
                // Only case left: all negative responses without expired permits → COMPLAINT
                newComplianceStatus = true;
            }
        }
        
        // Debug logging - detailed analysis
        console.log('Compliance Status Debug:', {
            totalResponses: responses.length,
            hasNegativeResponses,
            allPositiveResponses,
            hasExpiredPermitsFromFields,
            hasExpiredChecks,
            hasAnyExpiredPermits,
            newComplianceStatus,
            automatedRecommendationsCount: automatedRecommendations.length,
            detailedResponses: responses.map(response => {
                const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === response.question_id);
                let normalizedOptions = Array.isArray(question?.options) ? question.options : [];
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
                
                return {
                    questionId: response.question_id,
                    questionText: question?.question,
                    response: response.response,
                    originalOptions: question?.options,
                    normalizedOptions: normalizedOptions,
                    selectedOption: selectedOption,
                    detectedType: selectedOption?.type || 'none'
                };
            })
        });
        
        setIsCompliant(newComplianceStatus);
        
        // Update recommendation checks based on automated recommendations
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

    // Inject shake animation styles
    React.useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.textContent = shakeStyles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);

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

        // Track answered questions for highlighting
        setAnsweredQuestions(prev => {
            const newSet = new Set(prev);
            if (response && response !== '') {
                newSet.add(questionId);
            } else {
                newSet.delete(questionId);
            }
            return newSet;
        });

        // Generate automated recommendations
        const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === questionId);
        if (question) {
            const newRecommendations = generateAutomatedRecommendation(question, response);
            
            // Update automated recommendations
            setAutomatedRecommendations(prev => {
                // Remove existing recommendations for this question
                const filtered = prev.filter(rec => rec.questionId !== questionId);
                // Add new recommendations
                return [...filtered, ...newRecommendations.map(rec => ({ ...rec, questionId }))];
            });
        }

        // Handle conditional fields
        if (question?.is_conditional && question?.conditional_logic) {
            const shouldShowFields = response === question.conditional_logic.trigger_response;
            
            if (!shouldShowFields) {
                // Clear conditional fields when trigger response doesn't match
                setConditionalFields(prev => {
                    const newFields = { ...prev };
                    delete newFields[questionId];
                    return newFields;
                });
                
                // Also clear expired checkbox when conditional response is changed
                setExpiredChecks(prev => {
                    const newChecks = { ...prev };
                    delete newChecks[questionId];
                    return newChecks;
                });
                
                // Remove expired note from notes field
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
                // Initialize conditional fields if they don't exist
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

        // Check for permit expiration if this is an expiry field
        if (fieldName.toLowerCase().includes('expiry') || fieldName.toLowerCase().includes('expiration')) {
            const expiryCheck = checkPermitExpiration(value);
            if (expiryCheck.isExpired) {
                // Add automated recommendation for expired permit
                const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === questionId);
                if (question) {
                    const expiredPermitRecommendation = {
                        questionId,
                        type: 'permit',
                        message: `Permit has expired on ${new Date(value).toLocaleDateString()}. Renewal required immediately.`,
                        action: 'comply_lacking_permits'
                    };
                    
                    setAutomatedRecommendations(prev => {
                        // Remove existing expired permit recommendations for this question
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

        // Update notes field when expired checkbox is changed
        const question = groupedQuestions && Object.values(groupedQuestions).flat().find(q => q.id === questionId);
        if (question) {
            const expiredNote = isExpired ? 'Document/Permit has expired.' : '';
            
            setChecklistResponses(prev => {
                const currentNotes = prev[questionId]?.notes || '';
                const existingExpiredNote = currentNotes.includes('Document/Permit has expired.');
                
                let newNotes;
                if (isExpired && !existingExpiredNote) {
                    // Add expired note
                    newNotes = currentNotes ? `${currentNotes}\n${expiredNote}` : expiredNote;
                } else if (!isExpired && existingExpiredNote) {
                    // Remove expired note
                    newNotes = currentNotes.replace(/\n?Document\/Permit has expired\./, '').trim();
                } else {
                    // No change needed
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowConfirmationModal(true);
    };

    const confirmSubmit = () => {
        // Check for validation warnings
        const hasWarnings = progress < 100;
        
        if (hasWarnings) {
            // Trigger shake animation
            setModalShake(true);
            setTimeout(() => setModalShake(false), 600);
            return; // Don't submit if there are warnings
        }
        
        // Combine automated recommendations with manual recommendations
        const allRecommendations = [
            ...automatedRecommendations.map(rec => rec.message),
            recommendations
        ].filter(Boolean).join('\n');
        
        const formData = {
            inspection_id: inspection.id,
            establishment_id: selectedEstablishment,
            checklist_responses: Object.values(checklistResponses),
            utility_data: utilityData,
            conditional_fields: conditionalFields,
            other_remarks: overallScore, // Using overallScore for other remarks
            recommendations: allRecommendations,
            recommendation_checks: recommendationChecks,
            compliance_status: isCompliant ? 'compliant' : 'not_compliant',
            automated_recommendations: automatedRecommendations,
        };

        console.log('Form Data Being Submitted:', {
            compliance_status: formData.compliance_status,
            automated_recommendations: formData.automated_recommendations,
            isCompliant,
            automatedRecommendationsCount: automatedRecommendations.length,
            checklistResponsesCount: Object.keys(checklistResponses).length
        });

        router.post('/staff/inspection/store', formData);
        setShowConfirmationModal(false);
    };

    const renderUtilityInput = (utilityId, row, column) => {
        const key = `${row.name}_${column.name}`;
        const value = utilityData[utilityId]?.[key] || '';
        
        const inputClass = "w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 text-sm px-2 py-1.5";
        
        switch (row.type) {
            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleUtilityDataChange(utilityId, key, e.target.value)}
                        className={inputClass}
                        placeholder="0"
                        step="any"
                    />
                );
            case 'date':
                return (
                    <input
                        type="date"
                        value={value}
                        onChange={(e) => handleUtilityDataChange(utilityId, key, e.target.value)}
                        className={inputClass}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleUtilityDataChange(utilityId, key, e.target.value)}
                        className={`${inputClass} resize-none`}
                        rows={2}
                        placeholder="Enter value"
                    />
                );
            default:
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleUtilityDataChange(utilityId, key, e.target.value)}
                        className={inputClass}
                        placeholder="Enter value"
                    />
                );
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
                                            className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                                value && checkPermitExpiration(value).isExpired 
                                                    ? 'border-red-300 bg-red-50' 
                                                    : 'border-gray-300'
                                            }`}
                                            required={field.required}
                                        />
                                        {value && checkPermitExpiration(value).isExpired && (
                                            <p className="mt-1 text-xs text-red-600 flex items-center">
                                                <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                                                Permit has expired!
                                            </p>
                                        )}
                                        {value && !checkPermitExpiration(value).isExpired && checkPermitExpiration(value).isExpiringSoon && (
                                            <p className="mt-1 text-xs text-yellow-600 flex items-center">
                                                <ExclamationCircleIcon className="w-3 h-3 mr-1" />
                                                Permit expires in {checkPermitExpiration(value).daysUntilExpiry} days
                                            </p>
                                        )}
                                    </div>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        value={value}
                                        onChange={(e) => handleConditionalFieldChange(question.id, field.name, e.target.value)}
                                        rows={2}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder={`Enter ${field.label ? field.label.toLowerCase() : 'value'}`}
                                        required={field.required}
                                    />
                                ) : (
                                    <input
                                        type={field.type || 'text'}
                                        value={value}
                                        onChange={(e) => handleConditionalFieldChange(question.id, field.name, e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder={`Enter ${field.label ? field.label.toLowerCase() : 'value'}`}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderQuestionInput = (question) => {
        const response = checklistResponses[question.id]?.response || '';
        
        // Ensure options is an array and normalize to objects with text property
        let options = Array.isArray(question.options) ? question.options : [];
        // Handle old string-based options and new object-based options
        options = options.map(option => {
            if (typeof option === 'string') {
                return { text: option, type: 'neutral' };
            }
            return option;
        });
        
        switch (question.type) {
            case 'radio':
                return (
                    <div className="flex flex-wrap gap-3">
                        {options.map((option, index) => {
                            const optionText = typeof option === 'string' ? option : (option.text || '');
                            const optionValue = typeof option === 'string' ? option : (option.text || '');
                            return (
                                <label key={index} className="flex items-center">
                                    <input
                                        type="radio"
                                        name={`question_${question.id}`}
                                        value={optionValue}
                                        checked={response === optionValue}
                                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{optionText}</span>
                                </label>
                            );
                        })}
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}`}
                                value="N/A"
                                checked={response === 'N/A'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">N/A</span>
                        </label>
                    </div>
                );
            case 'yes_no':
                return (
                    <div className="flex flex-wrap gap-3">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}`}
                                value="yes"
                                checked={response === 'yes'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Yes</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}`}
                                value="no"
                                checked={response === 'no'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">No</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}`}
                                value="N/A"
                                checked={response === 'N/A'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">N/A</span>
                        </label>
                    </div>
                );
            case 'multiple_choice':
                return (
                    <div className="flex flex-wrap gap-3">
                        {options.map((option, index) => {
                            const optionText = typeof option === 'string' ? option : (option.text || '');
                            const optionValue = typeof option === 'string' ? option : (option.text || '');
                            return (
                                <label key={index} className="flex items-center">
                                    <input
                                        type="radio"
                                        name={`question_${question.id}`}
                                        value={optionValue}
                                        checked={response === optionValue}
                                        onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                        className="mr-2 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700">{optionText}</span>
                                </label>
                            );
                        })}
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}_na`}
                                value="N/A"
                                checked={response === 'N/A'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">N/A</span>
                        </label>
                    </div>
                );
            
            case 'text':
                return (
                    <div className="space-y-2">
                        <input
                            type="text"
                            value={response === 'N/A' ? '' : response}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your response"
                            disabled={response === 'N/A'}
                        />
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}_na`}
                                value="N/A"
                                checked={response === 'N/A'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">N/A (Not Applicable)</span>
                        </label>
                    </div>
                );
            
            case 'number':
                return (
                    <div className="space-y-2">
                        <input
                            type="number"
                            value={response === 'N/A' ? '' : response}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter a number"
                            disabled={response === 'N/A'}
                        />
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}_na`}
                                value="N/A"
                                checked={response === 'N/A'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">N/A (Not Applicable)</span>
                        </label>
                    </div>
                );
            
            case 'textarea':
                return (
                    <div className="space-y-2">
                        <textarea
                            value={response === 'N/A' ? '' : response}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            rows={3}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your response"
                            disabled={response === 'N/A'}
                        />
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}_na`}
                                value="N/A"
                                checked={response === 'N/A'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">N/A (Not Applicable)</span>
                        </label>
                    </div>
                );
            
            default:
                return (
                    <div className="space-y-2">
                        <textarea
                            value={response === 'N/A' ? '' : response}
                            onChange={(e) => handleResponseChange(question.id, e.target.value)}
                            rows={3}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter your response"
                            disabled={response === 'N/A'}
                        />
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name={`question_${question.id}_na`}
                                value="N/A"
                                checked={response === 'N/A'}
                                onChange={(e) => handleResponseChange(question.id, e.target.value)}
                                className="mr-2 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 font-medium">N/A (Not Applicable)</span>
                        </label>
                    </div>
                );
        }
    };

    return (
        <StaffLayout auth={auth}>
            <Head title="Inspection Form" />

            {/* Establishment Selection Modal */}
            {showEstablishmentModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Select Establishment to Inspect
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Choose the establishment you want to inspect for {inspection.quarter} Inspection.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancelModal}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Search Bar */}
                            <div className="px-4 pb-3 sm:px-6">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search establishments by name, address, business type, or barangay..."
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-white px-4 py-3 sm:px-6 sm:py-4 max-h-96 overflow-y-auto">
                                {(() => {
                                    const filteredEstablishments = filterEstablishments(establishments);
                                    return filteredEstablishments.length > 0 ? (
                                        <div className="space-y-2">
                                            {filteredEstablishments.map((establishment) => (
                                                <div
                                                    key={establishment.id}
                                                    onClick={() => handleEstablishmentSelect(establishment.id)}
                                                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-900">{establishment.name}</h4>
                                                            <p className="text-sm text-gray-500">{establishment.address}</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {establishment.type_of_business} • {establishment.Barangay}
                                                            </p>
                                                        </div>
                                                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : searchTerm && searchTerm.trim() !== '' ? (
                                        <div className="text-center py-8">
                                            <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Establishments Found</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                No establishments match your search for "{searchTerm}".
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No Available Establishments</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                All establishments have already been inspected for this schedule.
                                            </p>
                                        </div>
                                    );
                                })()}
                            </div>
                            
                            {/* Modal Footer with Cancel Button */}
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={handleCancelModal}
                                    className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Form */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {inspection.quarter} Inspection Form
                                </h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                    Complete the inspection checklist for the selected establishment.
                                </p>
                            </div>
                            {selectedEstablishment && (
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {establishments.find(e => e.id === selectedEstablishment)?.name}
                                    </p>
                                    <p className="text-xs text-gray-500">Selected Establishment</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Progress Section */}
                        <div className="bg-white px-4 py-5 sm:px-6 shadow-sm border-b sticky top-0 z-40">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Inspection Progress</h3>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    isCompliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    Status: {isCompliant ? 'Compliant' : 'Non-Compliant'}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Questions Answered</span>
                                        <span className="font-medium">{Object.keys(checklistResponses).length} / {totalQuestions}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500 mt-1">{progress}% Complete</div>
                                </div>
                                
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                                        <div className="text-xs text-blue-600">Total Questions</div>
                                    </div>
                                    <div className="bg-green-50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-green-600">{Object.keys(checklistResponses).length}</div>
                                        <div className="text-xs text-green-600">Answered</div>
                                    </div>
                                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-yellow-600">{automatedRecommendations.length}</div>
                                        <div className="text-xs text-yellow-600">Recommendations</div>
                                    </div>
                                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                                        <div className="text-2xl font-bold text-purple-600">{Object.keys(expiredChecks).filter(key => expiredChecks[key]).length || 0}</div>
                                        <div className="text-xs text-purple-600">Expired Items</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Checklist Questions */}
                        <div className="px-4 py-5 sm:px-6">
                            <h4 className="text-md font-medium text-gray-900 mb-4">Inspection Checklist</h4>
                            
                            {Object.entries(groupedQuestions).map(([categoryName, questions]) => (
                                <div key={categoryName} className="mb-8">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
                                        {categoryName || 'Uncategorized'}
                                    </h5>
                                    <div className="space-y-4">
                                        {questions.map((question) => (
                                            <div key={question.id} className={`p-4 rounded-lg transition-colors duration-300 ${
                                                answeredQuestions.has(question.id) 
                                                    ? 'bg-green-50 border border-green-200' 
                                                    : 'bg-gray-50'
                                            }`}>
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0">
                                                        <InformationCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{question.question}</p>
                                                        <div className="mt-2">
                                                            {renderQuestionInput(question)}
                                                        </div>
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
                                                            
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Notes
                                                                </label>
                                                                <textarea
                                                                    value={checklistResponses[question.id]?.notes || ''}
                                                                    onChange={(e) => handleNotesChange(question.id, e.target.value)}
                                                                    rows={2}
                                                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                    placeholder="Add additional notes (optional)"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                    Remarks
                                                                </label>
                                                                <textarea
                                                                    value={checklistResponses[question.id]?.remarks || ''}
                                                                    onChange={(e) => handleRemarksChange(question.id, e.target.value)}
                                                                    rows={2}
                                                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                                    placeholder="Add remarks or observations (optional)"
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
                        </div>

                        {/* Utility Forms Section */}
                        {utilities && utilities.length > 0 && (
                            <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                                <h4 className="text-md font-medium text-gray-900 mb-4">Utility Forms</h4>
                                
                                {utilities.map((utility) => (
                                    <div key={utility.id} className="mb-8 bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Utility Header */}
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                            <h5 className="text-sm font-semibold text-gray-900">{utility.form_name}</h5>
                                            {utility.description && (
                                                <p className="text-xs text-gray-500 mt-1">{utility.description}</p>
                                            )}
                                        </div>

                                        {/* Utility Table */}
                                        <div className="p-4">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border-collapse border border-gray-300">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900 bg-gray-50 w-64">
                                                                Data Fields
                                                            </th>
                                                            {utility.columns?.map((column) => (
                                                                <th key={column.name} className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold text-gray-900 bg-gray-50 min-w-32">
                                                                    <div className="flex flex-col items-center">
                                                                        <span>{column.name}</span>
                                                                        {column.required && (
                                                                            <span className="text-xs text-red-500 font-normal">*Required</span>
                                                                        )}
                                                                    </div>
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {utility.rows?.map((row, rowIndex) => (
                                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-900 align-middle">
                                                                    <div className="flex items-center">
                                                                        <span>{row.name}</span>
                                                                        {row.required && (
                                                                            <span className="ml-2 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">Required</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                {utility.columns?.map((column) => (
                                                                    <td key={column.name} className="border border-gray-300 px-2 py-2 align-middle">
                                                                        <div className="min-h-10 flex items-center justify-center">
                                                                            {renderUtilityInput(utility.id, row, column)}
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {/* Legend */}
                                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                                <div className="flex items-center space-x-4">
                                                    <span className="flex items-center">
                                                        <span className="w-3 h-3 bg-gray-100 border border-gray-300 mr-1"></span>
                                                        Even Rows
                                                    </span>
                                                    <span className="flex items-center">
                                                        <span className="w-3 h-3 bg-gray-50 border border-gray-300 mr-1"></span>
                                                        Odd Rows
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-red-500">*</span> Required fields
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Compliance Status and Automated Recommendations */}
                        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-md font-medium text-gray-900">Compliance Status</h4>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        isCompliant 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {isCompliant ? 'Compliant' : 'Not Compliant'}
                                    </div>
                                </div>
                                
                                {automatedRecommendations.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <h5 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center">
                                            <ExclamationCircleIcon className="w-4 h-4 mr-2" />
                                            Automated Recommendations ({automatedRecommendations.length})
                                        </h5>
                                        <div className="space-y-2">
                                            {automatedRecommendations.map((rec, index) => (
                                                <div key={`${rec.questionId}-${index}`} className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <ExclamationCircleIcon className="w-4 h-4 text-yellow-600 mt-0.5" />
                                                    </div>
                                                    <div className="ml-2">
                                                        <p className="text-sm text-yellow-800">{rec.message}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Other Remarks and Recommendations */}
                        <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
                            <h4 className="text-md font-medium text-gray-900 mb-4">Other Remarks and Recommendations</h4>
                            
                            {/* Other Remarks */}
                            <div className="mb-6">
                                <label htmlFor="other_remarks" className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Remarks
                                </label>
                                <textarea
                                    id="other_remarks"
                                    value={overallScore}
                                    onChange={(e) => setOverallScore(e.target.value)}
                                    rows={4}
                                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Enter any additional remarks or observations..."
                                />
                            </div>

                            {/* Recommendations with Checkboxes */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Recommendations
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={recommendationChecks.comply_lacking_permits}
                                            onChange={(e) => handleRecommendationCheckChange('comply_lacking_permits', e.target.checked)}
                                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Comply lacking permits</span>
                                    </label>
                                    
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={recommendationChecks.provide_lacking_facilities}
                                            onChange={(e) => handleRecommendationCheckChange('provide_lacking_facilities', e.target.checked)}
                                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Provide lacking facilities</span>
                                    </label>
                                    
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={recommendationChecks.others}
                                            onChange={(e) => handleRecommendationCheckChange('others', e.target.checked)}
                                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Others</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                            <button
                                type="button"
                                onClick={() => router.get('/staff/schedule')}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Submit Inspection
                            </button>
                        </div>
                    </form>
                
                {/* Confirmation Modal */}
                {showConfirmationModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className={`bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
                            modalShake ? 'animate-shake' : ''
                        }`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Inspection Submission</h3>
                                <button
                                    onClick={() => setShowConfirmationModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                                >
                                    ×
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <div className="text-sm text-blue-600 font-medium">Progress</div>
                                        <div className="text-2xl font-bold text-blue-800">{progress}%</div>
                                        <div className="text-xs text-blue-600">{Object.keys(checklistResponses).length} of {totalQuestions} questions answered</div>
                                    </div>
                                    <div className={`rounded-lg p-4 ${
                                        isCompliant ? 'bg-green-50' : 'bg-red-50'
                                    }`}>
                                        <div className={`text-sm font-medium ${
                                            isCompliant ? 'text-green-600' : 'text-red-600'
                                        }`}>Compliance Status</div>
                                        <div className={`text-2xl font-bold ${
                                            isCompliant ? 'text-green-800' : 'text-red-800'
                                        }`}>{isCompliant ? 'COMPLIANT' : 'NON-COMPLIANT'}</div>
                                    </div>
                                </div>
                                
                                {/* Establishment Info */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm text-gray-600 font-medium">Establishment</div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        {establishments.find(e => e.id === selectedEstablishment)?.name || 'Not selected'}
                                    </div>
                                </div>
                                
                                {/* Automated Recommendations */}
                                {automatedRecommendations.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="text-sm text-yellow-800 font-medium mb-2">
                                            Automated Recommendations ({automatedRecommendations.length})
                                        </div>
                                        <ul className="space-y-1">
                                            {automatedRecommendations.map((rec, index) => (
                                                <li key={index} className="text-sm text-yellow-700">• {rec.message}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {/* Warning for incomplete */}
                                {progress < 100 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <ExclamationCircleIcon className="h-5 w-5 text-orange-600 mr-2" />
                                            <div>
                                                <div className="text-sm text-orange-800 font-medium">Incomplete Inspection</div>
                                                <div className="text-xs text-orange-700">You have answered {Object.keys(checklistResponses).length} out of {totalQuestions} questions. Are you sure you want to submit?</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Confirmation Message */}
                                <div className="text-sm text-gray-600">
                                    Please review all the information above. Once submitted, this inspection cannot be edited.
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        onClick={() => setShowConfirmationModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Back to Edit
                                    </button>
                                    <button
                                        onClick={confirmSubmit}
                                        className="px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Confirm & Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </StaffLayout>
    );
}
