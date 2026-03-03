import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    ChartBarIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    CalendarIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    Squares2X2Icon,
    AdjustmentsHorizontalIcon,
    ChartPieIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    BuildingOfficeIcon,
    QuestionMarkCircleIcon,
    TagIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    BellIcon,
    Cog6ToothIcon,
    UserGroupIcon,
    DocumentDuplicateIcon,
    ArrowPathIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    AdjustmentsHorizontalIcon as FilterIcon,
    Squares2X2Icon as ViewfinderCircleIcon,
    ShieldCheckIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { LineChartComponent, BarChartComponent, PieChartComponent, chartColors } from '@/Components/Charts';

export default function ChecklistResponseReports({ auth }) {
    const { flash } = usePage().props;
    const [responseData, setResponseData] = useState({
        responses: [],
        analytics: {
            category_analysis: [],
            question_analysis: [],
            total_responses: 0,
            response_trends: []
        },
        summary: {
            total_responses: 0,
            positive_responses: 0,
            negative_responses: 0,
            na_responses: 0,
            applicable_responses: 0,
            overall_compliance_rate: 0,
            unique_establishments: 0,
            unique_questions: 0
        }
    });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        quarter: '',
        year: new Date().getFullYear(),
        establishment_id: '',
        category_id: '',
        question_id: ''
    });
    const [expandedQuestion, setExpandedQuestion] = useState(null);
    const [viewMode, setViewMode] = useState('overview'); // 'overview', 'questions', 'categories', 'trends'
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [questionResponses, setQuestionResponses] = useState({
        positive: [],
        negative: [],
        na: [],
        conditional_fields: []
    });
    const [loadingQuestionDetails, setLoadingQuestionDetails] = useState(false);
    const [establishmentSearch, setEstablishmentSearch] = useState('');

    const fetchResponseData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/admin/reports/checklist-responses/data?${params.toString()}`);
            const data = await response.json();
            setResponseData(data);
        } catch (error) {
            console.error('Error fetching checklist response data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResponseData();
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleViewDetails = (questionId) => {
        setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
    };

    const handleQuestionClick = async (question) => {
        setSelectedQuestion(question);
        setShowQuestionModal(true);
        setLoadingQuestionDetails(true);
        
        try {
            const response = await fetch(`/admin/reports/checklist-responses/question-details/${question.question_id}?${new URLSearchParams(filters).toString()}`);
            const data = await response.json();
            console.log('Question details data:', data);
            console.log('Conditional fields:', data.conditional_fields);
            setQuestionResponses(data);
        } catch (error) {
            console.error('Error fetching question details:', error);
        } finally {
            setLoadingQuestionDetails(false);
        }
    };

    const handleCloseQuestionModal = () => {
        setShowQuestionModal(false);
        setSelectedQuestion(null);
        setQuestionResponses({ positive: [], negative: [], na: [], conditional_fields: [] });
        setEstablishmentSearch('');
    };

    const filterResponses = (responses) => {
        if (!establishmentSearch.trim()) return responses;
        
        const searchTerm = establishmentSearch.toLowerCase();
        return responses.filter(response => 
            response.establishment_name.toLowerCase().includes(searchTerm)
        );
    };

    const handleExportReport = () => {
        const params = new URLSearchParams(filters);
        window.open(`/admin/reports/checklist-responses/export?${params.toString()}`, '_blank');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getResponseColor = (response) => {
        if (!response) return 'bg-gray-100 text-gray-800 border-gray-200';
        
        const responseStr = response.toLowerCase().trim();
        
        // Check for N/A responses (including variations)
        if (responseStr === 'n/a' || 
            responseStr === 'na' || 
            responseStr.includes('not applicable') || 
            responseStr === 'n/a') {
            return 'bg-gray-100 text-gray-800 border-gray-200';
        }
        
        // Check for positive responses
        const positiveIndicators = ['yes', 'compliant', 'pass', 'positive', 'ok', 'okay', 'approved', 'satisfactory', 'good', 'excellent', 'complete', 'done', 'true', '1', 'present', 'available', 'installed', 'functional', 'working', 'operational'];
        if (positiveIndicators.some(indicator => responseStr.includes(indicator))) {
            return 'bg-green-100 text-green-800 border-green-200';
        }
        
        // Check for negative responses
        const negativeIndicators = ['no', 'non_compliant', 'fail', 'negative', 'not', 'disapproved', 'unsatisfactory', 'poor', 'incomplete', 'pending', 'false', '0', 'violated', 'violation', 'issue', 'problem', 'deficiency', 'non-present', 'absent', 'unavailable', 'not installed', 'non-functional', 'broken', 'malfunctioning'];
        if (negativeIndicators.some(indicator => responseStr.includes(indicator))) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        
        // Default to yellow for neutral/unclear responses
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    };

    const getComplianceRateColor = (rate) => {
        if (rate >= 90) return 'text-green-600';
        if (rate >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getCategoryDataForChart = () => {
        const categories = responseData.analytics.category_analysis || [];
        return {
            labels: categories.map(cat => cat.category),
            datasets: [{
                label: 'Compliance Rate',
                data: categories.map(cat => cat.compliance_rate),
                backgroundColor: categories.map((_, index) => {
                    const rate = categories[index].compliance_rate;
                    if (rate >= 90) return '#10b981';
                    if (rate >= 70) return '#f59e0b';
                    return '#ef4444';
                }),
                borderColor: '#ffffff',
                borderWidth: 2
            }]
        };
    };

    const getResponseDistributionData = () => {
        const summary = responseData.summary;
        return {
            labels: ['Positive', 'Negative', 'N/A'],
            datasets: [{
                data: [summary.positive_responses, summary.negative_responses, summary.na_responses],
                backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
                borderColor: ['#ffffff'],
                borderWidth: 2
            }]
        };
    };

    const getTrendDataForChart = () => {
        const trends = responseData.analytics.response_trends || [];
        return {
            labels: trends.map(trend => trend.month),
            datasets: [{
                label: 'Compliance Rate',
                data: trends.map(trend => trend.compliance_rate),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    };

    const getQuestionComplianceData = () => {
        const questions = responseData.analytics.question_analysis || [];
        const topQuestions = questions.slice(0, 10); // Top 10 questions with lowest compliance
        return {
            labels: topQuestions.map(q => q.question_text.substring(0, 50) + (q.question_text.length > 50 ? '...' : '')),
            datasets: [{
                label: 'Compliance Rate',
                data: topQuestions.map(q => q.compliance_rate),
                backgroundColor: topQuestions.map(q => {
                    if (q.compliance_rate >= 90) return '#10b981';
                    if (q.compliance_rate >= 70) return '#f59e0b';
                    return '#ef4444';
                }),
                borderColor: '#7c3aed',
                borderWidth: 1
            }]
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="relative overflow-hidden">
                    {/* Background gradient decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full opacity-20 blur-2xl"></div>
                    
                    <div className="relative flex items-center justify-between p-6">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                                <div className="relative p-4 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm">
                                    <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                                    Checklist Response Reports
                                </h1>
                                <p className="text-lg text-gray-600 mt-2 flex items-center">
                                    <SparklesIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                    Advanced analytics and insights for inspection compliance
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">Live Data</span>
                            </div>
                            <button
                                onClick={handleExportReport}
                                className="group flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <DocumentArrowDownIcon className="w-5 h-5 group-hover:animate-bounce" />
                                <span className="font-semibold">Export Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Checklist Response Reports" />

            <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 min-h-screen">
                <div className="w-full space-y-8">
                    {/* Flash Messages */}
                    {flash && flash.success && (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-10"></div>
                            <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-500 rounded-xl shadow-lg">
                                        <CheckCircleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-green-800 font-bold text-lg">{flash.success}</p>
                                        <p className="text-green-600 text-sm">Operation completed successfully</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View Mode Selector */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-50"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                        <ViewfinderCircleIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Analysis View</h3>
                                        <p className="text-sm text-gray-600">Choose your preferred data visualization</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>Last updated: {new Date().toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={() => setFilters({
                                            date_from: '',
                                            date_to: '',
                                            quarter: '',
                                            year: new Date().getFullYear(),
                                            establishment_id: '',
                                            category_id: '',
                                            question_id: ''
                                        })}
                                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                                    >
                                        <ArrowPathIcon className="w-4 h-4" />
                                        <span>Reset</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { mode: 'overview', icon: Squares2X2Icon, label: 'Overview', desc: 'Dashboard view' },
                                    { mode: 'questions', icon: QuestionMarkCircleIcon, label: 'Questions', desc: 'Detailed analysis' },
                                    { mode: 'categories', icon: TagIcon, label: 'Categories', desc: 'Grouped insights' },
                                    { mode: 'trends', icon: ArrowTrendingUpIcon, label: 'Trends', desc: 'Historical data' }
                                ].map(({ mode, icon: Icon, label, desc }) => (
                                    <button
                                        key={mode}
                                        onClick={() => setViewMode(mode)}
                                        className={`relative group p-4 rounded-xl border-2 transition-all duration-300 ${
                                            viewMode === mode
                                                ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg transform scale-105'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:transform hover:scale-102'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <div className={`p-3 rounded-lg ${
                                                viewMode === mode 
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                                                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                                            }`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-center">
                                                <p className={`font-semibold ${
                                                    viewMode === mode ? 'text-indigo-700' : 'text-gray-700'
                                                }`}>{label}</p>
                                                <p className="text-xs text-gray-500">{desc}</p>
                                            </div>
                                        </div>
                                        {viewMode === mode && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <CheckCircleIcon className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-30"></div>
                        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <FilterIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
                                            <p className="text-blue-100 text-sm">Refine your data analysis</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFilters({
                                            date_from: '',
                                            date_to: '',
                                            quarter: '',
                                            year: new Date().getFullYear(),
                                            establishment_id: '',
                                            category_id: '',
                                            question_id: ''
                                        })}
                                        className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm"
                                    >
                                        <FunnelIcon className="w-4 h-4" />
                                        <span>Clear All</span>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <BuildingOfficeIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Establishment
                                        </label>
                                        <select
                                            value={filters.establishment_id}
                                            onChange={(e) => handleFilterChange('establishment_id', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                        >
                                            <option value="">All Establishments</option>
                                            {responseData.summary?.unique_establishments > 0 && Array.from({length: responseData.summary.unique_establishments}, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {responseData.summary?.establishment_names?.[i] || `Establishment ${i + 1}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Date From
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={filters.date_from}
                                                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                            />
                                            <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Date To
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={filters.date_to}
                                                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                            />
                                            <CalendarIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <ChartBarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Quarter
                                        </label>
                                        <select
                                            value={filters.quarter}
                                            onChange={(e) => handleFilterChange('quarter', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                        >
                                            <option value="">All Quarters</option>
                                            <option value="Q1">Q1 (Jan-Mar)</option>
                                            <option value="Q2">Q2 (Apr-Jun)</option>
                                            <option value="Q3">Q3 (Jul-Sep)</option>
                                            <option value="Q4">Q4 (Oct-Dec)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center text-sm font-bold text-gray-700">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                                            Year
                                        </label>
                                        <select
                                            value={filters.year}
                                            onChange={(e) => handleFilterChange('year', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all duration-200 hover:bg-gray-50"
                                        >
                                            {[2023, 2024, 2025, 2026].map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Total Responses</p>
                                        <p className="text-4xl font-bold text-white">
                                            {responseData.summary.total_responses}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <DocumentTextIcon className="w-4 h-4" />
                                            <span>All checklist items</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <DocumentTextIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-green-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Compliance Rate</p>
                                        <p className="text-4xl font-bold text-white">
                                            {responseData.summary.overall_compliance_rate}%
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <ArrowTrendingUpIcon className="w-4 h-4" />
                                            <span>Overall performance</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <ChartPieIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Issues Found</p>
                                        <p className="text-4xl font-bold text-white">
                                            {responseData.summary.negative_responses}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <ExclamationTriangleIcon className="w-4 h-4" />
                                            <span>Require attention</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <ExclamationTriangleIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 opacity-90"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                            <div className="relative bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-white/90 uppercase tracking-wide">Unique Questions</p>
                                        <p className="text-4xl font-bold text-white">
                                            {responseData.summary.unique_questions}
                                        </p>
                                        <div className="flex items-center space-x-2 text-xs text-white/80">
                                            <QuestionMarkCircleIcon className="w-4 h-4" />
                                            <span>Different checklist items</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                                        <QuestionMarkCircleIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content based on view mode */}
                    {viewMode === 'overview' && (
                        <>
                            {/* Charts Section */}
                            <div className="relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-30"></div>
                                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 border-b border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                                <Squares2X2Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Visual Analytics</h3>
                                                <p className="text-indigo-100 text-sm">Interactive data visualization</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Response Distribution Pie Chart */}
                                            <div className="group relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-90"></div>
                                                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                                    <div className="absolute top-4 right-4 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                        <ChartPieIcon className="w-4 h-4 text-indigo-600" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                                        <SparklesIcon className="w-5 h-5 mr-2 text-indigo-500" />
                                                        Response Distribution
                                                    </h4>
                                                    <PieChartComponent 
                                                        data={getResponseDistributionData()}
                                                        height={250}
                                                    />
                                                </div>
                                            </div>

                                            {/* Category Compliance Bar Chart */}
                                            <div className="group relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-90"></div>
                                                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                                    <div className="absolute top-4 right-4 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                        <ChartBarIcon className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                                        <TagIcon className="w-5 h-5 mr-2 text-purple-500" />
                                                        Category Compliance Rates
                                                    </h4>
                                                    <BarChartComponent 
                                                        data={getCategoryDataForChart()}
                                                        height={250}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compliance Trends Line Chart */}
                                        <div className="mt-8 group relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-90"></div>
                                            <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                                                <div className="absolute top-4 right-4 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
                                                </div>
                                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-green-500" />
                                                    Compliance Trends Over Time
                                                </h4>
                                                <LineChartComponent 
                                                    data={getTrendDataForChart()}
                                                    height={300}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {viewMode === 'questions' && (
                        <div className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-30"></div>
                            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-6 border-b border-gray-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                            <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Question Analysis</h3>
                                            <p className="text-purple-100 text-sm">Detailed breakdown of individual question performance</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    <div className="mb-8 group relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-90"></div>
                                        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
                                            <div className="absolute top-4 right-4 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                                <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                                            </div>
                                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                                <InformationCircleIcon className="w-5 h-5 mr-2 text-red-500" />
                                                Top 10 Questions with Lowest Compliance
                                            </h4>
                                            <BarChartComponent 
                                                data={getQuestionComplianceData()}
                                                height={300}
                                            />
                                        </div>
                                    </div>

                                    {/* Questions Grouped by Category */}
                                    <div className="space-y-8">
                                        {Object.entries(
                                            responseData.analytics.question_analysis.reduce((categories, question) => {
                                                const categoryName = question.category || 'Uncategorized';
                                                if (!categories[categoryName]) {
                                                    categories[categoryName] = [];
                                                }
                                                categories[categoryName].push(question);
                                                return categories;
                                            }, {})
                                        ).map(([categoryName, questions]) => {
                                            // Sort questions by compliance rate (lowest first) to prioritize problematic questions
                                            const sortedQuestions = [...questions].sort((a, b) => a.compliance_rate - b.compliance_rate);
                                            
                                            return (
                                            <div key={categoryName} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-3">
                                                            <TagIcon className="w-5 h-5 text-indigo-600" />
                                                            <h3 className="text-lg font-bold text-gray-900">{categoryName}</h3>
                                                            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                                                                {questions.length} questions
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                            <span>Category Compliance:</span>
                                                            <span className={`font-bold ${
                                                                questions.reduce((sum, q) => sum + q.compliance_rate, 0) / questions.length >= 90 ? 'text-green-600' :
                                                                questions.reduce((sum, q) => sum + q.compliance_rate, 0) / questions.length >= 70 ? 'text-yellow-600' :
                                                                'text-red-600'
                                                            }`}>
                                                                {Math.round(questions.reduce((sum, q) => sum + q.compliance_rate, 0) / questions.length)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-6">
                                                    <div className="space-y-4">
                                                        {sortedQuestions.map((question, index) => (
                                                            <div key={question.question_id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-bold">
                                                                            {index + 1}
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                            question.compliance_rate >= 90 ? 'bg-green-100 text-green-800 border border-green-200' :
                                                                            question.compliance_rate >= 70 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                                                            'bg-red-100 text-red-800 border border-red-200'
                                                                        }`}>
                                                                            {question.compliance_rate}% compliant
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center space-x-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => handleQuestionClick(question)}>
                                                                        <span className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                                                                            Click here
                                                                        </span>
                                                                        <ChevronRightIcon className="w-4 h-4 text-indigo-600 hover:text-indigo-800 transition-colors" />
                                                                    </div>
                                                                    <h4 
                                                                        className="font-semibold text-gray-900 text-sm cursor-pointer hover:text-indigo-600 transition-colors flex-1 text-right"
                                                                        onClick={() => handleQuestionClick(question)}
                                                                    >
                                                                        {question.question_text.substring(0, 80)}{question.question_text.length > 80 ? '...' : ''}
                                                                    </h4>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-3 text-xs">
                                                                    <div className="text-center p-2 bg-white rounded">
                                                                        <p className="text-2xl font-bold text-gray-600">{question.na_responses}</p>
                                                                        <p className="text-xs text-gray-600">N/A Responses</p>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-green-50 rounded">
                                                                        <p className="font-medium text-green-600">Positive</p>
                                                                        <p className="text-lg font-bold text-green-600">{question.positive_responses}</p>
                                                                    </div>
                                                                    <div className="text-center p-2 bg-red-50 rounded">
                                                                        <p className="font-medium text-red-600">Negative</p>
                                                                        <p className="text-lg font-bold text-red-600">{question.negative_responses}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'categories' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <TagIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Category Analysis</h3>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {responseData.analytics.category_analysis.map((category, index) => (
                                        <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-900">{category.category}</h4>
                                                <span className={`text-2xl font-bold ${getComplianceRateColor(category.compliance_rate)}`}>
                                                    {category.compliance_rate}%
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Total Responses</span>
                                                    <span className="font-medium">{category.total_responses}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-green-600">Positive</span>
                                                    <span className="font-medium text-green-600">{category.positive_responses}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-red-600">Negative</span>
                                                    <span className="font-medium text-red-600">{category.negative_responses}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">N/A</span>
                                                    <span className="font-medium">{category.na_responses}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full ${
                                                            category.compliance_rate >= 90 ? 'bg-green-500' :
                                                            category.compliance_rate >= 70 ? 'bg-yellow-500' :
                                                            'bg-red-500'
                                                        }`}
                                                        style={{ width: `${category.compliance_rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {viewMode === 'trends' && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <ArrowTrendingUpIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Compliance Trends</h3>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                                    <LineChartComponent 
                                        data={getTrendDataForChart()}
                                        height={400}
                                    />
                                </div>
                                
                                <div className="mt-6 overflow-x-auto">
                                    <table className="w-full bg-white rounded-xl border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Responses</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positive</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Negative</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compliance Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {responseData.analytics.response_trends.map((trend, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trend.month}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trend.total}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{trend.positive}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{trend.negative}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`text-sm font-medium ${getComplianceRateColor(trend.compliance_rate)}`}>
                                                            {trend.compliance_rate}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Question Details Modal */}
            {showQuestionModal && selectedQuestion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-6 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">Establishment Responses</h3>
                                    <p className="text-indigo-100 text-sm mt-1">{selectedQuestion.question_text}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseQuestionModal}
                                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
                            >
                                <XCircleIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={establishmentSearch}
                                onChange={(e) => setEstablishmentSearch(e.target.value)}
                                placeholder="Search establishments..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {loadingQuestionDetails ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                            <h4 className="font-bold text-green-800">Positive Responses</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-green-600">{filterResponses(questionResponses.positive).length}</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <XCircleIcon className="w-5 h-5 text-red-600" />
                                            <h4 className="font-bold text-red-800">Negative Responses</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-red-600">{filterResponses(questionResponses.negative).length}</p>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <ClockIcon className="w-5 h-5 text-gray-600" />
                                            <h4 className="font-bold text-gray-800">N/A Responses</h4>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-600">{filterResponses(questionResponses.na).length}</p>
                                    </div>
                                </div>

                                {/* Positive Responses Table */}
                                {filterResponses(questionResponses.positive).length > 0 && (
                                    <div className="bg-white border border-green-200 rounded-xl overflow-hidden">
                                        <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                                            <h4 className="font-bold text-green-800 flex items-center">
                                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                                Positive Responses ({filterResponses(questionResponses.positive).length})
                                            </h4>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-green-50/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Establishment</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Response</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Conditional Fields</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-green-100">
                                                    {filterResponses(questionResponses.positive).map((response, index) => {
                                                        const conditionalFields = filterResponses(questionResponses.conditional_fields)
                                                            .filter(field => field.establishment_name === response.establishment_name);
                                                        
                                                        return (
                                                            <tr key={index} className="hover:bg-green-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{response.establishment_name}</td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResponseColor(response.response)}`}>
                                                                        {response.response}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    {conditionalFields.length > 0 ? (
                                                                        <div className="space-y-1">
                                                                            {conditionalFields.map((field, fieldIndex) => (
                                                                                <div key={fieldIndex} className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-600">{field.field_name}:</span>
                                                                                    <span className="text-xs font-medium">{field.field_value}</span>
                                                                                    {field.is_expired === true && (
                                                                                        <span className="px-1 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
                                                                                            Expired
                                                                                        </span>
                                                                                    )}
                                                                                                                                                                    </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400">None</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(response.response_date)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Negative Responses Table */}
                                {filterResponses(questionResponses.negative).length > 0 && (
                                    <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
                                        <div className="bg-red-50 px-4 py-3 border-b border-red-200">
                                            <h4 className="font-bold text-red-800 flex items-center">
                                                <XCircleIcon className="w-5 h-5 mr-2" />
                                                Negative Responses ({filterResponses(questionResponses.negative).length})
                                            </h4>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-red-50/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Establishment</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Response</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-red-100">
                                                    {filterResponses(questionResponses.negative).map((response, index) => (
                                                        <tr key={index} className="hover:bg-red-50">
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{response.establishment_name}</td>
                                                            <td className="px-4 py-3 text-sm">
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResponseColor(response.response)}`}>
                                                                    {response.response}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(response.response_date)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* N/A Responses Table */}
                                {filterResponses(questionResponses.na).length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                            <h4 className="font-bold text-gray-800 flex items-center">
                                                <ClockIcon className="w-5 h-5 mr-2" />
                                                N/A Responses ({filterResponses(questionResponses.na).length})
                                            </h4>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Establishment</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Response</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Conditional Fields</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {filterResponses(questionResponses.na).map((response, index) => {
                                                        const conditionalFields = filterResponses(questionResponses.conditional_fields)
                                                            .filter(field => field.establishment_name === response.establishment_name);
                                                        
                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{response.establishment_name}</td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResponseColor(response.response)}`}>
                                                                        {response.response}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    {conditionalFields.length > 0 ? (
                                                                        <div className="space-y-1">
                                                                            {conditionalFields.map((field, fieldIndex) => (
                                                                                <div key={fieldIndex} className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-600">{field.field_name}:</span>
                                                                                    <span className="text-xs font-medium">{field.field_value}</span>
                                                                                    {field.is_expired === true && (
                                                                                        <span className="px-1 py-0.5 text-xs font-medium rounded bg-red-100 text-red-800">
                                                                                            Expired
                                                                                        </span>
                                                                                    )}
                                                                                                                                                                    </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400">None</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(response.response_date)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* No results message */}
                                {filterResponses(questionResponses.positive).length === 0 && 
                                 filterResponses(questionResponses.negative).length === 0 && 
                                 filterResponses(questionResponses.na).length === 0 && (
                                    <div className="text-center py-12">
                                        <InformationCircleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">No responses found for "{establishmentSearch}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
        </AuthenticatedLayout>
    );
}

function in_array(needle, haystack) {
    return haystack.includes(needle);
}
