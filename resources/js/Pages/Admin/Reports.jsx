import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import {
    ChartBarIcon,
    DocumentTextIcon,
    BuildingOfficeIcon,
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
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    ChartPieIcon,
    DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { LineChartComponent, BarChartComponent, PieChartComponent, chartColors } from '@/Components/Charts';

export default function Reports({ auth, reports = [] }) {
    const { flash } = usePage().props;
    const [reportsData, setReportsData] = useState(reports);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        quarter: '',
        year: new Date().getFullYear(),
        report_type: 'all'
    });
    const [expandedReport, setExpandedReport] = useState(null);
    const [quarterlyTrendView, setQuarterlyTrendView] = useState('total'); // 'total', 'compliant', 'non_compliant', 'pending'
    const [dailyInspectionView, setDailyInspectionView] = useState('total'); // 'total', 'compliant', 'non_compliant', 'pending'

    const fetchReports = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/admin/reports/data?${params.toString()}`);
            const data = await response.json();
            setReportsData(data.reports || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [filters]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleViewDetails = (report) => {
        setExpandedReport(expandedReport?.id === report.id ? null : report);
    };

    const handleExportReport = (reportType) => {
        const params = new URLSearchParams(filters);
        window.open(`/admin/reports/export/${reportType}?${params.toString()}`, '_blank');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getReportIcon = (type) => {
        switch (type) {
            case 'inspection':
                return <ClipboardDocumentCheckIcon className="w-6 h-6" />;
            case 'monitoring':
                return <ChartBarIcon className="w-6 h-6" />;
            case 'establishment':
                return <BuildingOfficeIcon className="w-6 h-6" />;
            default:
                return <DocumentTextIcon className="w-6 h-6" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'compliant':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'not_compliant':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getComplianceRate = (compliant, total) => {
        if (total === 0) return 0;
        return ((compliant / total) * 100).toFixed(2);
    };

    const getQuarterlyData = (view) => {
        const inspectionReport = reportsData.find(r => r.type === 'inspection');
        const quarterlyTrend = inspectionReport?.quarterly_trend || {};
        
        return [
            { label: 'Q1', value: quarterlyTrend.Q1?.[view] || 0 },
            { label: 'Q2', value: quarterlyTrend.Q2?.[view] || 0 },
            { label: 'Q3', value: quarterlyTrend.Q3?.[view] || 0 },
            { label: 'Q4', value: quarterlyTrend.Q4?.[view] || 0 }
        ];
    };

    const getDailyInspectionData = (view) => {
        const inspectionReport = reportsData.find(r => r.type === 'inspection');
        const dailyInspections = inspectionReport?.daily_inspections || {};
        
        const labels = Object.keys(dailyInspections).sort();
        const data = labels.map(date => dailyInspections[date][view] || 0);
        
        return {
            labels: labels.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: view.charAt(0).toUpperCase() + view.slice(1).replace('_', ' '),
                data: data,
                borderColor: view === 'compliant' ? '#10b981' : view === 'non_compliant' ? '#ef4444' : view === 'pending' ? '#f59e0b' : '#3b82f6',
                backgroundColor: view === 'compliant' ? 'rgba(16, 185, 129, 0.1)' : view === 'non_compliant' ? 'rgba(239, 68, 68, 0.1)' : view === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    };

    const getQuarterlyDataForChart = (view) => {
        const inspectionReport = reportsData.find(r => r.type === 'inspection');
        const quarterlyTrend = inspectionReport?.quarterly_trend || {};
        
        return {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
                label: view.charAt(0).toUpperCase() + view.slice(1).replace('_', ' '),
                data: [
                    quarterlyTrend.Q1?.[view] || 0,
                    quarterlyTrend.Q2?.[view] || 0,
                    quarterlyTrend.Q3?.[view] || 0,
                    quarterlyTrend.Q4?.[view] || 0
                ],
                borderColor: view === 'compliant' ? '#10b981' : view === 'non_compliant' ? '#ef4444' : view === 'pending' ? '#f59e0b' : '#3b82f6',
                backgroundColor: view === 'compliant' ? 'rgba(16, 185, 129, 0.1)' : view === 'non_compliant' ? 'rgba(239, 68, 68, 0.1)' : view === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        };
    };

    const getPieDataForChart = () => {
        const inspectionReport = reportsData.find(r => r.type === 'inspection');
        
        return {
            labels: ['Compliant', 'Non-Compliant', 'Pending'],
            datasets: [{
                data: [
                    inspectionReport?.compliant_count || 0,
                    inspectionReport?.non_compliant_count || 0,
                    inspectionReport?.pending_count || 0
                ],
                backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                borderColor: ['#ffffff'],
                borderWidth: 2
            }]
        };
    };

    const getBarDataForChart = () => {
        return {
            labels: ['Inspection', 'Monitoring', 'Establishment'],
            datasets: [{
                label: 'Reports',
                data: [
                    reportsData.filter(r => r.type === 'inspection').reduce((sum, r) => sum + r.total_inspections, 0),
                    reportsData.filter(r => r.type === 'monitoring').reduce((sum, r) => sum + r.total_inspections, 0),
                    reportsData.filter(r => r.type === 'establishment').reduce((sum, r) => sum + r.total_inspections, 0)
                ],
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                borderWidth: 1
            }]
        };
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl border border-white/20 backdrop-blur-sm">
                            <DocumentTextIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Reports Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Comprehensive analytics and reporting insights</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => handleExportReport('comprehensive')}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <DocumentArrowDownIcon className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Export</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Reports" />

            <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
                <div className="w-full space-y-8">
                    {/* Flash Messages */}
                    {flash && flash.success && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                <p className="text-green-800 font-medium">{flash.success}</p>
                            </div>
                        </div>
                    )}

                    {/* Filters Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <AdjustmentsHorizontalIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Advanced Filters</h3>
                                </div>
                                <button
                                    onClick={() => setFilters({
                                        date_from: '',
                                        date_to: '',
                                        quarter: '',
                                        year: new Date().getFullYear(),
                                        report_type: 'all'
                                    })}
                                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <FunnelIcon className="w-4 h-4" />
                                    <span>Clear</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date From</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={filters.date_from}
                                            onChange={(e) => handleFilterChange('date_from', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all"
                                        />
                                        <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date To</label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={filters.date_to}
                                            onChange={(e) => handleFilterChange('date_to', e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all"
                                        />
                                        <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quarter</label>
                                    <select
                                        value={filters.quarter}
                                        onChange={(e) => handleFilterChange('quarter', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all"
                                    >
                                        <option value="">All Quarters</option>
                                        <option value="Q1">Q1 (Jan-Mar)</option>
                                        <option value="Q2">Q2 (Apr-Jun)</option>
                                        <option value="Q3">Q3 (Jul-Sep)</option>
                                        <option value="Q4">Q4 (Oct-Dec)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                                    <select
                                        value={filters.year}
                                        onChange={(e) => handleFilterChange('year', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all"
                                    >
                                        {[2023, 2024, 2025, 2026].map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                                    <select
                                        value={filters.report_type}
                                        onChange={(e) => handleFilterChange('report_type', e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50/50 transition-all"
                                    >
                                        <option value="all">All Reports</option>
                                        <option value="inspection">Inspection Reports</option>
                                        <option value="inspection_negative">Negative Response Analysis</option>
                                        <option value="monitoring">Monitoring Reports</option>
                                        <option value="establishment">Establishment Reports</option>
                                        <option value="government">Government Reports</option>
                                        <option value="professional">Professional Reports</option>
                                    </select>
                                </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Squares2X2Icon className="w-5 h-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Visual Analytics</h3>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Compliance Pie Chart */}
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <PieChartComponent 
                                        data={getPieDataForChart()}
                                        title="Compliance Distribution"
                                        height={220}
                                    />
                                </div>

                                {/* Inspection Types Bar Chart */}
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <BarChartComponent 
                                        data={getBarDataForChart()}
                                        title="Report Categories"
                                        height={220}
                                    />
                                </div>

                                {/* Quarterly Trend Line Chart */}
                                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                        <h4 className="text-sm font-bold text-gray-900">Quarterly Performance</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {['total', 'compliant', 'non_compliant', 'pending'].map((view) => (
                                                <button
                                                    key={view}
                                                    onClick={() => setQuarterlyTrendView(view)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                                        quarterlyTrendView === view 
                                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' 
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {view.charAt(0).toUpperCase() + view.slice(1).replace('_', '-')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <LineChartComponent 
                                        data={getQuarterlyDataForChart(quarterlyTrendView)}
                                        height={220}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-white/90">Total Inspections</p>
                                    <p className="text-3xl font-bold text-white">
                                        {reportsData.find(r => r.type === 'inspection')?.total_inspections || 0}
                                    </p>
                                    <div className="flex items-center space-x-1 text-xs text-white/80">
                                        <ArrowTrendingUpIcon className="w-3 h-3" />
                                        <span>+12% from last month</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <ClipboardDocumentCheckIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-white/90">Compliance Rate</p>
                                    <p className="text-3xl font-bold text-white">
                                        {(() => {
                                            const inspectionReport = reportsData.find(r => r.type === 'inspection');
                                            return inspectionReport ? 
                                                getComplianceRate(inspectionReport.compliant_count, inspectionReport.total_inspections) : 0;
                                        })()}%
                                    </p>
                                    <div className="flex items-center space-x-1 text-xs text-white/80">
                                        <ArrowTrendingUpIcon className="w-3 h-3" />
                                        <span>+5% improvement</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <ChartPieIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-white/90">Pending Items</p>
                                    <p className="text-3xl font-bold text-white">
                                        {reportsData.reduce((sum, r) => sum + r.pending_count, 0)}
                                    </p>
                                    <div className="flex items-center space-x-1 text-xs text-white/80">
                                        <ClockIcon className="w-3 h-3" />
                                        <span>Requires attention</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <ClockIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-400 via-violet-500 to-purple-600 rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-white/90">Active Reports</p>
                                    <p className="text-3xl font-bold text-white">
                                        {reportsData.length}
                                    </p>
                                    <div className="flex items-center space-x-1 text-xs text-white/80">
                                        <DocumentTextIcon className="w-3 h-3" />
                                        <span>This period</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <DocumentTextIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Daily Inspections Chart */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <CalendarIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Daily Inspection Trends</h3>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {['total', 'compliant', 'non_compliant', 'pending'].map((view) => (
                                        <button
                                            key={view}
                                            onClick={() => setDailyInspectionView(view)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                                dailyInspectionView === view 
                                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            {view.charAt(0).toUpperCase() + view.slice(1).replace('_', '-')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
                                <LineChartComponent 
                                    data={getDailyInspectionData(dailyInspectionView)}
                                    height={320}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
