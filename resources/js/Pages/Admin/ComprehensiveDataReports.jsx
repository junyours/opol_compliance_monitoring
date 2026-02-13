import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    DocumentTextIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    BuildingOfficeIcon,
    TagIcon,
    QuestionMarkCircleIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    FunnelIcon,
    ChartBarIcon,
    CalendarIcon,
    UserGroupIcon,
    ArrowPathIcon,
    MagnifyingGlassIcon,
    DocumentArrowDownIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const ComprehensiveDataReports = () => {
    const { auth } = usePage().props;
    const [responseData, setResponseData] = useState({
        expired_checklist_responses: [],
        conditional_field_responses: [],
        analytics: {
            establishment_analysis: [],
            question_analysis: [],
            field_value_analysis: [],
            total_expired_items: 0,
            total_conditional_fields: 0,
            total_expired_conditional_fields: 0
        },
        summary: {
            total_expired_checklist_responses: 0,
            total_conditional_field_responses: 0,
            unique_establishments: 0,
            unique_questions: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [expandedField, setExpandedField] = useState(null);
    const [expandedEstablishment, setExpandedEstablishment] = useState(null);
    const [viewMode, setViewMode] = useState('establishments'); // 'establishments', 'questions', 'fields'
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        quarter: '',
        year: new Date().getFullYear(),
        establishment_id: '',
        category_id: '',
        question_id: ''
    });
    const [establishments, setEstablishments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedEstablishment, setSelectedEstablishment] = useState(null);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [selectedField, setSelectedField] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            console.log('Fetching comprehensive data...');
            console.log('Filters:', filters);
            
            const params = new URLSearchParams(filters);
            console.log('Filter parameters being sent:', params.toString());
            
            const response = await fetch(`/admin/reports/comprehensive-data?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data);
            console.log('Expired checklist responses:', data.expired_checklist_responses?.length || 0);
            console.log('Conditional field responses:', data.conditional_field_responses?.length || 0);
            console.log('Analytics:', data.analytics);
            
            // Debug: Log inspection dates from received data
            if (data.expired_checklist_responses && data.expired_checklist_responses.length > 0) {
                console.log('Inspection dates in received data:');
                data.expired_checklist_responses.forEach((response, index) => {
                    const inspectionDate = response.inspectionResult?.inspection?.inspection_timestamp;
                    console.log(`Response ${index + 1}: Date=${inspectionDate}, Establishment=${response.inspectionResult?.establishment?.name}`);
                });
            }
            
            setResponseData(data);
            
            // Extract unique establishments, categories, and questions for filters
            if (data.expired_checklist_responses && data.expired_checklist_responses.length > 0) {
                const uniqueEstablishments = [...new Set(data.expired_checklist_responses.map(r => 
                    r.inspectionResult?.establishment?.id
                ).filter(Boolean))];
                
                const establishmentOptions = uniqueEstablishments.map(id => {
                    const establishment = data.expired_checklist_responses.find(r => 
                        r.inspectionResult?.establishment?.id === id
                    )?.inspectionResult?.establishment;
                    return establishment ? {
                        id: establishment.id,
                        name: establishment.name
                    } : null;
                }).filter(Boolean);
                
                setEstablishments(establishmentOptions);
                
                const uniqueCategories = [...new Set(data.expired_checklist_responses.map(r => 
                    r.checklistQuestion?.inspectionCategory?.id
                ).filter(Boolean))];
                
                const categoryOptions = uniqueCategories.map(id => {
                    const category = data.expired_checklist_responses.find(r => 
                        r.checklistQuestion?.inspectionCategory?.id === id
                    )?.checklistQuestion?.inspectionCategory;
                    return category ? {
                        id: category.id,
                        name: category.name
                    } : null;
                }).filter(Boolean);
                
                setCategories(categoryOptions);
                
                const uniqueQuestions = [...new Set(data.expired_checklist_responses.map(r => 
                    r.checklist_question_id
                ).filter(Boolean))];
                
                const questionOptions = uniqueQuestions.map(id => {
                    const question = data.expired_checklist_responses.find(r => 
                        r.checklist_question_id === id
                    )?.checklistQuestion;
                    return question ? {
                        id: question.id,
                        text: question.question,
                        category: question.inspectionCategory?.name || 'Uncategorized'
                    } : null;
                }).filter(Boolean);
                
                setQuestions(questionOptions);
            }
            
        } catch (error) {
            console.error('Error fetching comprehensive data:', error);
            // Set empty data on error to prevent crashes
            setResponseData({
                expired_checklist_responses: [],
                conditional_field_responses: [],
                analytics: {
                    establishment_analysis: [],
                    question_analysis: [],
                    field_value_analysis: [],
                    total_expired_items: 0,
                    total_conditional_fields: 0,
                    total_expired_conditional_fields: 0
                },
                summary: {
                    total_expired_checklist_responses: 0,
                    total_conditional_field_responses: 0,
                    unique_establishments: 0,
                    unique_questions: 0
                }
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleViewDetails = (questionId) => {
        setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
    };

    const handleViewFieldDetails = (fieldName) => {
        setExpandedField(expandedField === fieldName ? null : fieldName);
    };

    const handleViewEstablishmentDetails = (establishmentName) => {
        setExpandedEstablishment(expandedEstablishment === establishmentName ? null : establishmentName);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const applyFilters = () => {
        fetchData();
    };

    const resetFilters = () => {
        setFilters({
            date_from: '',
            date_to: '',
            quarter: '',
            year: new Date().getFullYear(),
            establishment_id: '',
            category_id: '',
            question_id: ''
        });
        // Clear filter options as well
        setEstablishments([]);
        setCategories([]);
        setQuestions([]);
    };

    // Group conditional fields by field name for field analysis
    const fieldAnalysis = {};
    
    // Process data from establishment analysis
    responseData.analytics.establishment_analysis?.forEach(establishment => {
        establishment.conditional_fields?.forEach(field => {
            if (!fieldAnalysis[field.field_name]) {
                fieldAnalysis[field.field_name] = {
                    field_name: field.field_name,
                    total_responses: 0,
                    unique_values: new Set(),
                    value_frequency: {},
                    expired_count: 0,
                    non_expired_count: 0,
                    establishments: new Set(),
                    expired_establishments: new Set(),
                    all_responses: []
                };
            }
            
            fieldAnalysis[field.field_name].total_responses++;
            fieldAnalysis[field.field_name].unique_values.add(field.field_value);
            fieldAnalysis[field.field_name].establishments.add(field.establishment_name);
            
            if (!fieldAnalysis[field.field_name].value_frequency[field.field_value]) {
                fieldAnalysis[field.field_name].value_frequency[field.field_value] = 0;
            }
            fieldAnalysis[field.field_name].value_frequency[field.field_value]++;
            
            if (field.is_expired) {
                fieldAnalysis[field.field_name].expired_count++;
                fieldAnalysis[field.field_name].expired_establishments.add(field.establishment_name);
            } else {
                fieldAnalysis[field.field_name].non_expired_count++;
            }
            
            fieldAnalysis[field.field_name].all_responses.push(field);
        });
    });
    
    // Also process data from question analysis to ensure we have complete information
    responseData.analytics.question_analysis?.forEach(question => {
        question.conditional_fields?.forEach(field => {
            if (!fieldAnalysis[field.field_name]) {
                fieldAnalysis[field.field_name] = {
                    field_name: field.field_name,
                    total_responses: 0,
                    unique_values: new Set(),
                    value_frequency: {},
                    expired_count: 0,
                    non_expired_count: 0,
                    establishments: new Set(),
                    expired_establishments: new Set(),
                    all_responses: []
                };
            }
            
            fieldAnalysis[field.field_name].total_responses++;
            fieldAnalysis[field.field_name].unique_values.add(field.field_value);
            fieldAnalysis[field.field_name].establishments.add(field.establishment_name);
            
            if (!fieldAnalysis[field.field_name].value_frequency[field.field_value]) {
                fieldAnalysis[field.field_name].value_frequency[field.field_value] = 0;
            }
            fieldAnalysis[field.field_name].value_frequency[field.field_value]++;
            
            if (field.is_expired) {
                fieldAnalysis[field.field_name].expired_count++;
                fieldAnalysis[field.field_name].expired_establishments.add(field.establishment_name);
            } else {
                fieldAnalysis[field.field_name].non_expired_count++;
            }
            
            fieldAnalysis[field.field_name].all_responses.push(field);
        });
    });

    const fieldAnalysisArray = Object.values(fieldAnalysis);
    
    // Filter out responses with N/A establishment names and remove duplicates
    fieldAnalysisArray.forEach(field => {
        // Create a unique set based on result_id to avoid duplicates
        const uniqueResponses = new Map();
        
        field.all_responses.forEach(response => {
            // Skip if establishment is N/A
            if (!response.establishment_name || response.establishment_name === 'N/A') {
                return;
            }
            
            // Use result_id as key to avoid duplicates
            const key = response.inspection_result_id || `${response.field_value}_${response.establishment_name}`;
            if (!uniqueResponses.has(key)) {
                uniqueResponses.set(key, response);
            }
        });
        
        // Replace all_responses with unique, filtered responses
        field.all_responses = Array.from(uniqueResponses.values());
        
        // Update counts after filtering
        field.total_responses = field.all_responses.length;
        field.expired_count = field.all_responses.filter(r => r.is_expired).length;
        field.non_expired_count = field.all_responses.filter(r => !r.is_expired).length;
        
        // Recalculate unique values and frequency based on filtered responses
        field.unique_values = new Set();
        field.value_frequency = {};
        field.establishments = new Set();
        field.expired_establishments = new Set();
        
        field.all_responses.forEach(response => {
            field.unique_values.add(response.field_value);
            field.establishments.add(response.establishment_name);
            
            if (!field.value_frequency[response.field_value]) {
                field.value_frequency[response.field_value] = 0;
            }
            field.value_frequency[response.field_value]++;
            
            if (response.is_expired) {
                field.expired_establishments.add(response.establishment_name);
            }
        });
    });
    
    // Debug: Log field analysis data to check structure
    console.log('Field Analysis Data:', fieldAnalysisArray);
    fieldAnalysisArray.forEach(field => {
        console.log(`Field: ${field.field_name}, Responses:`, field.all_responses);
    });

    // Helper function to format inspection details
    const formatInspectionDetails = (inspection) => {
        if (!inspection) return 'N/A';
        
        const inspectionDate = inspection.inspection_timestamp ? new Date(inspection.inspection_timestamp).toLocaleDateString() : 'N/A';
        const inspectionTime = inspection.inspection_timestamp ? new Date(inspection.inspection_timestamp).toLocaleTimeString() : 'N/A';
        const inspectorName = inspection.inspectionResult?.staff 
            ? `${inspection.inspectionResult.staff.first_name} ${inspection.inspectionResult.staff.last_name}`
            : 'N/A';
        
        return {
            inspectionId: inspection.inspectionResult?.inspection?.id || inspection.inspection_id || 'N/A',
            inspectionResultId: inspection.inspectionResult?.id || inspection.inspection_result_id || 'N/A',
            date: inspectionDate,
            time: inspectionTime,
            dateTime: inspection.inspection_timestamp,
            quarter: inspection.quarter || 'N/A',
            year: inspection.inspection_timestamp ? new Date(inspection.inspection_timestamp).getFullYear() : 'N/A',
            inspector: inspectorName,
            establishmentName: inspection.inspectionResult?.establishment?.name || 'N/A',
            businessType: inspection.inspectionResult?.establishment?.businessType?.name || 'N/A'
        };
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Comprehensive Data Reports" />
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes scale-in {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                @keyframes expand {
                    from {
                        opacity: 0;
                        max-height: 0;
                    }
                    to {
                        opacity: 1;
                        max-height: 2000px;
                    }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out;
                }
                
                .animate-slide-in {
                    animation: slide-in 0.5s ease-out both;
                }
                
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out both;
                }
                
                .animate-expand {
                    animation: expand 0.3s ease-out;
                }
            `}</style>
            
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8 animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                            <ChartBarIcon className="w-8 h-8" />
                                            Comprehensive Data Reports
                                        </h1>
                                        <p className="mt-2 text-blue-100 text-lg">
                                            Advanced analytics of expired checklist responses and conditional field data
                                        </p>
                                    </div>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                                        <DocumentTextIcon className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-8 animate-slide-up">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FunnelIcon className="w-5 h-5 text-gray-600" />
                                        Advanced Filters
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={resetFilters}
                                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 flex items-center gap-2 text-sm font-medium"
                                        >
                                            <ArrowPathIcon className="w-4 h-4" />
                                            Reset
                                        </button>
                                        <button
                                            onClick={applyFilters}
                                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 text-sm font-medium shadow-lg hover:shadow-xl"
                                        >
                                            <MagnifyingGlassIcon className="w-4 h-4" />
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                                            Date From
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_from}
                                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                                            Date To
                                        </label>
                                        <input
                                            type="date"
                                            value={filters.date_to}
                                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Quarter</label>
                                        <select
                                            value={filters.quarter}
                                            onChange={(e) => handleFilterChange('quarter', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        >
                                            <option value="">All Quarters</option>
                                            <option value="1">Q1</option>
                                            <option value="2">Q2</option>
                                            <option value="3">Q3</option>
                                            <option value="4">Q4</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Year</label>
                                        <select
                                            value={filters.year}
                                            onChange={(e) => handleFilterChange('year', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        >
                                            <option value="">All Years</option>
                                            {[2023, 2024, 2025, 2026].map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                                            Establishment
                                        </label>
                                        <select
                                            value={filters.establishment_id}
                                            onChange={(e) => handleFilterChange('establishment_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        >
                                            <option value="">All Establishments</option>
                                            {establishments.map(establishment => (
                                                <option key={establishment.id} value={establishment.id}>
                                                    {establishment.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700">Category</label>
                                        <select
                                            value={filters.category_id}
                                            onChange={(e) => handleFilterChange('category_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />
                                            Question
                                        </label>
                                        <select
                                            value={filters.question_id}
                                            onChange={(e) => handleFilterChange('question_id', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                                        >
                                            <option value="">All Questions</option>
                                            {questions.map(question => (
                                                <option key={question.id} value={question.id}>
                                                    {question.text?.length > 50 ? question.text.substring(0, 50) + '...' : question.text}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="bg-gradient-to-br from-red-500 to-red-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-red-100 text-sm font-medium">Critical</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 font-medium mb-2">Expired Items</p>
                                <p className="text-3xl font-bold text-red-600">{responseData.summary.total_expired_checklist_responses}</p>
                                <div className="mt-3 flex items-center text-xs text-red-600">
                                    <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                                    Requires immediate attention
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                        <TagIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-blue-100 text-sm font-medium">Data Points</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 font-medium mb-2">Conditional Fields</p>
                                <p className="text-3xl font-bold text-gray-900">{responseData.summary.total_conditional_field_responses}</p>
                                <div className="mt-3 flex items-center text-xs text-blue-600">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                                    Total field responses
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                        <BuildingOfficeIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-orange-100 text-sm font-medium">Locations</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 font-medium mb-2">Establishments</p>
                                <p className="text-3xl font-bold text-gray-900">{responseData.summary.unique_establishments}</p>
                                <div className="mt-3 flex items-center text-xs text-orange-600">
                                    <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                                    Unique locations
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:scale-105 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                                        <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-purple-100 text-sm font-medium">Queries</span>
                                </div>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 font-medium mb-2">Questions</p>
                                <p className="text-3xl font-bold text-gray-900">{responseData.summary.unique_questions}</p>
                                <div className="mt-3 flex items-center text-xs text-purple-600">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                                    Total questions analyzed
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* View Mode Tabs */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 animate-slide-up">
                        <div className="border-b border-gray-200">
                            <nav className="flex">
                                {[
                                    { mode: 'establishments', icon: BuildingOfficeIcon, label: 'Establishments' },
                                    { mode: 'questions', icon: QuestionMarkCircleIcon, label: 'Questions' },
                                    { mode: 'fields', icon: TagIcon, label: 'Fields' }
                                ].map(({ mode, icon: Icon, label }) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`flex-1 py-4 px-6 border-b-2 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                            viewMode === mode
                                                ? 'border-blue-500 text-blue-600 bg-blue-50'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-semibold">{label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-16 animate-fade-in">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-gray-600 font-medium text-lg">Loading comprehensive data...</p>
                            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'establishments' && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
                                            Establishment Analysis
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {responseData.analytics.establishment_analysis?.map((establishment, index) => (
                                                <div 
                                                    key={index} 
                                                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-in"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div 
                                                        className="p-5 cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-all duration-200"
                                                        onClick={() => setSelectedEstablishment(establishment)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                                    <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
                                                                    {establishment.establishment_name}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-4">
                                                                    <span className="flex items-center gap-1">
                                                                        <TagIcon className="w-4 h-4 text-gray-500" />
                                                                        {establishment.business_type}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                                                        {establishment.expired_responses_count} expired responses
                                                                    </span>
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                                                                    establishment.expired_responses_count > 0 
                                                                        ? 'bg-red-100 text-red-800 border border-red-200' 
                                                                        : 'bg-green-100 text-green-800 border border-green-200'
                                                                }`}>
                                                                    {establishment.expired_responses_count > 0 ? '⚠️ Has Expired' : '✅ All Active'}
                                                                </span>
                                                                <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'questions' && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <QuestionMarkCircleIcon className="w-5 h-5 text-gray-600" />
                                            Questions Analysis
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {responseData.analytics.question_analysis?.map((question, index) => (
                                                <div 
                                                    key={index} 
                                                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-in"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div 
                                                        className="p-5 cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-all duration-200"
                                                        onClick={() => setSelectedQuestion(question)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                                    <QuestionMarkCircleIcon className="w-5 h-5 text-purple-600" />
                                                                    {question.question_text}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-4">
                                                                    <span className="flex items-center gap-1">
                                                                        <TagIcon className="w-4 h-4 text-gray-500" />
                                                                        {question.category}
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                                                                        {question.expired_responses_count} responses
                                                                    </span>
                                                                </p>
                                                                <div className="flex items-center space-x-6 mt-3">
                                                                    <span className="text-sm text-red-600 flex items-center gap-2 font-medium">
                                                                        <ExclamationTriangleIcon className="w-5 h-5" />
                                                                        Expired: {question.expired_conditional_fields_count}
                                                                    </span>
                                                                    <span className="text-sm text-green-600 flex items-center gap-2 font-medium">
                                                                        <CheckCircleIcon className="w-5 h-5" />
                                                                        Active: {question.conditional_fields_count - question.expired_conditional_fields_count}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'fields' && (
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <TagIcon className="w-5 h-5 text-gray-600" />
                                            Field Values Analysis
                                        </h3>
                                    </div>
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {fieldAnalysisArray?.map((field, index) => (
                                                <div 
                                                    key={index} 
                                                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-in"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <div 
                                                        className="p-5 cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-white transition-all duration-200"
                                                        onClick={() => setSelectedField(field)}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                                    <TagIcon className="w-5 h-5 text-green-600" />
                                                                    {field.field_name}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-4">
                                                                    <span className="flex items-center gap-1">
                                                                        <DocumentTextIcon className="w-4 h-4 text-gray-500" />
                                                                        {field.total_responses} responses
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <ChartBarIcon className="w-4 h-4 text-blue-500" />
                                                                        {field.unique_values.size} unique values
                                                                    </span>
                                                                </p>
                                                                <div className="flex items-center space-x-6 mt-3">
                                                                    <span className="text-sm text-red-600 flex items-center gap-2 font-medium">
                                                                        <ExclamationTriangleIcon className="w-5 h-5" />
                                                                        Expired: {field.expired_count}
                                                                    </span>
                                                                    <span className="text-sm text-green-600 flex items-center gap-2 font-medium">
                                                                        <CheckCircleIcon className="w-5 h-5" />
                                                                        Non-Expired: {field.non_expired_count}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Establishment Details Modal */}
                    {selectedEstablishment && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <BuildingOfficeIcon className="w-6 h-6" />
                                            {selectedEstablishment.establishment_name} - Detailed Analysis
                                        </h3>
                                        <button
                                            onClick={() => setSelectedEstablishment(null)}
                                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto max-h-[calc(90vh-160px)]">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                                Expired Responses
                                            </p>
                                            <p className="text-2xl font-bold text-red-600">{selectedEstablishment.expired_responses_count}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <TagIcon className="w-4 h-4 text-blue-500" />
                                                Conditional Fields
                                            </p>
                                            <p className="text-2xl font-bold text-blue-600">{selectedEstablishment.conditional_fields_count}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <BuildingOfficeIcon className="w-4 h-4 text-orange-500" />
                                                Business Type
                                            </p>
                                            <p className="text-lg font-bold text-orange-600">{selectedEstablishment.business_type}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <p className="font-bold text-gray-800 mb-3 flex items-center gap-1 text-sm">
                                            <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                                            Inspection Details:
                                        </p>
                                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                                            {selectedEstablishment.questions_with_notes?.map((question, idx) => {
                                                const inspection = {
                                                    inspection_timestamp: question.inspection_date,
                                                    quarter: question.quarter,
                                                    inspectionResult: {
                                                        id: question.inspection_result_id,
                                                        inspection: { id: question.inspection_id },
                                                        establishment: { name: selectedEstablishment.establishment_name },
                                                        staff: question.inspector ? {
                                                            first_name: question.inspector.split(' ')[0],
                                                            last_name: question.inspector.split(' ').slice(1).join(' ')
                                                        } : null
                                                    }
                                                };
                                                
                                                const details = formatInspectionDetails(inspection);
                                                
                                                return (
                                                    <div 
                                                        key={idx} 
                                                        className="mb-4 p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-200"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex-1">
                                                                <h6 className="font-bold text-gray-900 text-base flex items-center gap-1 mb-2">
                                                                    <QuestionMarkCircleIcon className="w-4 h-4 text-blue-600" />
                                                                    {question.question_text?.length > 80 ? question.question_text.substring(0, 80) + '...' : question.question_text}
                                                                </h6>
                                                                <div className="flex flex-wrap gap-1 mb-2">
                                                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium border border-blue-200">
                                                                        🆔 Inspection: {question.inspection_id || 'N/A'}
                                                                    </span>
                                                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium border border-green-200">
                                                                        📋 Result: {question.inspection_result_id || 'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
                                                                    <div className="bg-white rounded p-2 border border-gray-200">
                                                                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                            <CalendarIcon className="w-3 h-3 text-gray-500" />
                                                                            Date:
                                                                        </span>
                                                                        <div className="text-gray-900">{details.date}</div>
                                                                    </div>
                                                                    <div className="bg-white rounded p-2 border border-gray-200">
                                                                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                            <ChartBarIcon className="w-3 h-3 text-gray-500" />
                                                                            Quarter:
                                                                        </span>
                                                                        <div className="text-gray-900">{details.quarter}</div>
                                                                    </div>
                                                                    <div className="bg-white rounded p-2 border border-gray-200">
                                                                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                            <UserGroupIcon className="w-3 h-3 text-gray-500" />
                                                                            Inspector:
                                                                        </span>
                                                                        <div className="text-gray-900">{details.inspector}</div>
                                                                    </div>
                                                                    <div className="bg-white rounded p-2 border border-gray-200">
                                                                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                            <BuildingOfficeIcon className="w-3 h-3 text-gray-500" />
                                                                            Business Type:
                                                                        </span>
                                                                        <div className="text-gray-900">{details.businessType}</div>
                                                                    </div>
                                                                    <div className="bg-white rounded p-2 border border-gray-200">
                                                                        <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                            <DocumentTextIcon className="w-3 h-3 text-gray-500" />
                                                                            Response:
                                                                        </span>
                                                                        <div className="text-gray-900">{question.response || 'N/A'}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                                                    <p className="font-bold text-yellow-800 flex items-center gap-1">
                                                                        <DocumentTextIcon className="w-3 h-3" />
                                                                        Notes: {question.notes || 'No notes provided'}
                                                                    </p>
                                                                </div>
                                                                {question.remarks && (
                                                                    <div className="mt-1 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                                                        <p className="font-bold text-blue-800 flex items-center gap-1">
                                                                            <DocumentTextIcon className="w-3 h-3" />
                                                                            Remarks: {question.remarks}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Question Details Modal */}
                    {selectedQuestion && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
                                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <QuestionMarkCircleIcon className="w-6 h-6" />
                                            Question Analysis - {selectedQuestion.question_text?.substring(0, 50) + '...'}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedQuestion(null)}
                                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto max-h-[calc(90vh-160px)]">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                                Expired Fields
                                            </p>
                                            <p className="text-2xl font-bold text-red-600">{selectedQuestion.expired_conditional_fields_count}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <TagIcon className="w-4 h-4 text-blue-500" />
                                                Total Fields
                                            </p>
                                            <p className="text-2xl font-bold text-blue-600">{selectedQuestion.conditional_fields_count}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <BuildingOfficeIcon className="w-4 h-4 text-orange-500" />
                                                Category
                                            </p>
                                            <p className="text-lg font-bold text-orange-600">{selectedQuestion.category}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="font-bold text-gray-800 mb-2 flex items-center gap-1 text-sm">
                                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                            Establishments with Expired:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedQuestion.establishments_with_expired_conditional?.map((est, idx) => (
                                                <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium border border-red-200 flex items-center gap-1">
                                                    ⚠️ {est}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="font-bold text-gray-800 mb-3 flex items-center gap-1 text-sm">
                                            <TagIcon className="w-4 h-4 text-gray-600" />
                                            Conditional Fields by Establishment:
                                        </p>
                                        <div className="space-y-2">
                                            {Object.entries(
                                                selectedQuestion.conditional_fields?.reduce((groups, field) => {
                                                    const est = field.establishment_name;
                                                    if (!groups[est]) {
                                                        groups[est] = [];
                                                    }
                                                    groups[est].push(field);
                                                    return groups;
                                                }, {})
                                            ).map(([establishmentName, fields]) => (
                                                <div 
                                                    key={establishmentName} 
                                                    className={`border rounded-lg p-3 ${
                                                        fields.some(f => f.is_expired) 
                                                            ? 'border-red-200 bg-red-50' 
                                                            : 'border-green-200 bg-green-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-bold text-gray-900 text-sm flex items-center gap-1">
                                                            <BuildingOfficeIcon className="w-4 h-4 text-blue-600" />
                                                            {establishmentName}
                                                        </h5>
                                                        <span className={`px-2 py-1 text-xs rounded font-bold border ${
                                                            fields.some(f => f.is_expired)
                                                                ? 'bg-red-100 text-red-800 border-red-200'
                                                                : 'bg-green-100 text-green-800 border-green-200'
                                                        }`}>
                                                            {fields.some(f => f.is_expired) ? '⚠️ EXPIRED' : '✅ ACTIVE'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {fields.map((field, idx) => (
                                                            <div key={idx} className="bg-white border border-gray-200 rounded p-2">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <span className="text-gray-700 font-semibold text-sm flex items-center gap-1">
                                                                        <TagIcon className="w-3 h-3 text-blue-500" />
                                                                        {field.field_name}: <span className="text-gray-900">{field.field_value}</span>
                                                                    </span>
                                                                    <div className="flex items-center gap-1">
                                                                        {field.is_expired && (
                                                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium border border-red-200">
                                                                                ⚠️ Expired
                                                                            </span>
                                                                        )}
                                                                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                                                            🆔 {field.inspection_result_id || 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="text-xs text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-1">
                                                                    <div className="bg-gray-50 rounded p-1">
                                                                        <span className="font-semibold text-gray-700">Question:</span> 
                                                                        <div className="text-gray-900">{field.question_text?.length > 30 ? field.question_text.substring(0, 30) + '...' : field.question_text}</div>
                                                                    </div>
                                                                    <div className="bg-gray-50 rounded p-1">
                                                                        <span className="font-semibold text-gray-700">Category:</span> 
                                                                        <div className="text-gray-900">{field.category}</div>
                                                                    </div>
                                                                    <div className="bg-gray-50 rounded p-1">
                                                                        <span className="font-semibold text-gray-700">Date:</span> 
                                                                        <div className="text-gray-900">{field.inspection_date && field.inspection_date !== 'Unknown' ? new Date(field.inspection_date).toLocaleDateString() : 'N/A'}</div>
                                                                    </div>
                                                                    <div className="bg-gray-50 rounded p-1">
                                                                        <span className="font-semibold text-gray-700">Status:</span> 
                                                                        <div className={`font-bold ${field.is_expired ? 'text-red-600' : 'text-green-600'}`}>
                                                                            {field.is_expired ? '⚠️ Expired' : '✅ Active'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Field Details Modal */}
                    {selectedField && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-scale-in">
                                <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <TagIcon className="w-6 h-6" />
                                            Field Analysis - {selectedField.field_name}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedField(null)}
                                            className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                                        >
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 overflow-y-auto max-h-[calc(90vh-160px)]">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                                                Total Responses
                                            </p>
                                            <p className="text-2xl font-bold text-blue-600">{selectedField.total_responses}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <ChartBarIcon className="w-4 h-4 text-green-500" />
                                                Unique Values
                                            </p>
                                            <p className="text-2xl font-bold text-green-600">{selectedField.unique_values.size}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                                                Expired
                                            </p>
                                            <p className="text-2xl font-bold text-red-600">{selectedField.expired_count}</p>
                                        </div>
                                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                                            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1 text-sm">
                                                <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                                Active
                                            </p>
                                            <p className="text-2xl font-bold text-green-600">{selectedField.non_expired_count}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <p className="font-bold text-gray-800 mb-3 flex items-center gap-1 text-sm">
                                            <ChartBarIcon className="w-4 h-4 text-gray-600" />
                                            Value Frequency:
                                        </p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                            {Object.entries(selectedField.value_frequency).map(([value, count]) => (
                                                <div 
                                                    key={value} 
                                                    className="bg-gradient-to-r from-white to-gray-50 rounded-lg p-2 border border-gray-200 hover:shadow-md transition-all duration-200"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-700 font-medium text-sm">{value}</span>
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-xs border border-blue-200">
                                                            {count}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <p className="font-bold text-gray-800 mb-3 flex items-center gap-1 text-sm">
                                            <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                                            Responses ({selectedField.total_responses}):
                                        </p>
                                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                                            {selectedField.all_responses?.map((response, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-gray-700 font-bold text-sm flex items-center gap-1">
                                                            <TagIcon className="w-3 h-3 text-green-500" />
                                                            {response.field_value}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {response.is_expired && (
                                                                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium border border-red-200">
                                                                    ⚠️ Expired
                                                                </span>
                                                            )}
                                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                                                🆔 {response.inspection_result_id || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-600 grid grid-cols-2 md:grid-cols-4 gap-1">
                                                        <div className="bg-gray-50 rounded p-1">
                                                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                <BuildingOfficeIcon className="w-3 h-3" />
                                                                Establishment:
                                                            </span> 
                                                            <div className="text-gray-900">{response.establishment_name || 'N/A'}</div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded p-1">
                                                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                <QuestionMarkCircleIcon className="w-3 h-3" />
                                                                Question:
                                                            </span> 
                                                            <div className="text-gray-900">{response.question_text?.length > 40 ? response.question_text.substring(0, 40) + '...' : response.question_text}</div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded p-1">
                                                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                                                                <CalendarIcon className="w-3 h-3" />
                                                                Date:
                                                            </span> 
                                                            <div className="text-gray-900">{response.inspection_date && response.inspection_date !== 'Unknown' ? new Date(response.inspection_date).toLocaleDateString() : 'N/A'}</div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded p-1">
                                                            <span className="font-semibold text-gray-700">Status:</span> 
                                                            <div className={`font-bold flex items-center gap-1 ${response.is_expired ? 'text-red-600' : 'text-green-600'}`}>
                                                                {response.is_expired ? '⚠️ Expired' : '✅ Active'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default ComprehensiveDataReports;
