import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Chart configuration options
const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 12
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleFont: {
                size: 14
            },
            bodyFont: {
                size: 12
            },
            padding: 10,
            cornerRadius: 4
        }
    }
};

// Line Chart Component
export const LineChartComponent = ({ data, title, height = 300 }) => {
    const options = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: 'rgba(229, 231, 235, 0.5)'
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(229, 231, 235, 0.5)'
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        },
        elements: {
            point: {
                radius: 5,
                hoverRadius: 7,
                backgroundColor: '#3b82f6',
                borderColor: '#ffffff',
                borderWidth: 2
            },
            line: {
                tension: 0.4,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: '#3b82f6',
                borderWidth: 3,
                fill: true
            }
        }
    };

    return (
        <div style={{ height: `${height}px` }}>
            <Line data={data} options={options} />
        </div>
    );
};

// Bar Chart Component
export const BarChartComponent = ({ data, title, height = 300 }) => {
    const options = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: 'rgba(229, 231, 235, 0.5)'
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            }
        },
        elements: {
            bar: {
                borderRadius: 4,
                backgroundColor: '#8b5cf6',
                borderColor: '#7c3aed',
                borderWidth: 1
            }
        }
    };

    return (
        <div style={{ height: `${height}px` }}>
            <Bar data={data} options={options} />
        </div>
    );
};

// Pie Chart Component
export const PieChartComponent = ({ data, title, height = 300 }) => {
    const options = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            title: {
                display: !!title,
                text: title,
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
        elements: {
            arc: {
                borderWidth: 2,
                borderColor: '#ffffff'
            }
        }
    };

    return (
        <div style={{ height: `${height}px` }}>
            <Pie data={data} options={options} />
        </div>
    );
};

// Color schemes for charts
export const chartColors = {
    primary: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
    compliance: ['#10b981', '#ef4444', '#f59e0b', '#6b7280'],
    success: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    danger: ['#ef4444', '#f87171', '#fca5a5', '#fecaca']
};

export default { LineChartComponent, BarChartComponent, PieChartComponent, chartColors };
