import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const addNotification = useCallback((type, title, message, duration = 5000) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            type,
            title,
            message,
            duration
        };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showSuccess = useCallback((title, message) => {
        return addNotification('success', title, message);
    }, [addNotification]);

    const showError = useCallback((title, message) => {
        return addNotification('error', title, message);
    }, [addNotification]);

    const showWarning = useCallback((title, message) => {
        return addNotification('warning', title, message);
    }, [addNotification]);

    const showInfo = useCallback((title, message) => {
        return addNotification('info', title, message);
    }, [addNotification]);

    const showLoading = useCallback((message = 'Loading...') => {
        setLoading(true);
        setLoadingMessage(message);
    }, []);

    const hideLoading = useCallback(() => {
        setLoading(false);
        setLoadingMessage('');
    }, []);

    const validateDuplicate = useCallback((data, existingData, fields) => {
        const duplicates = [];
        
        for (const item of existingData) {
            for (const field of fields) {
                if (data[field] && item[field] && 
                    data[field].toLowerCase().trim() === item[field].toLowerCase().trim()) {
                    duplicates.push({
                        field,
                        value: data[field],
                        existingItem: item
                    });
                    break; // Stop checking other fields for this item once a duplicate is found
                }
            }
        }
        
        return duplicates;
    }, []);

    const showDuplicateModal = useCallback((duplicates, onConfirm, onCancel) => {
        const id = addNotification('duplicate', 'Duplicate Entry Detected', '', 0); // No auto-dismiss
        
        // Store modal callbacks
        setNotifications(prev => prev.map(n => 
            n.id === id 
                ? { ...n, duplicates, onConfirm, onCancel, isModal: true }
                : n
        ));
        
        return id;
    }, [addNotification]);

    return (
        <NotificationContext.Provider value={{
            notifications,
            loading,
            loadingMessage,
            showSuccess,
            showError,
            showWarning,
            showInfo,
            showLoading,
            hideLoading,
            validateDuplicate,
            showDuplicateModal,
            removeNotification
        }}>
            {children}
            
            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-gray-900">Processing</p>
                                <p className="text-sm text-gray-600 mt-1">{loadingMessage}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Notifications Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

const NotificationItem = ({ notification, onClose }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircleIcon className="w-6 h-6 text-green-600" />;
            case 'error':
                return <XCircleIcon className="w-6 h-6 text-red-600" />;
            case 'warning':
                return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />;
            case 'info':
                return <InformationCircleIcon className="w-6 h-6 text-blue-600" />;
            case 'duplicate':
                return <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />;
            default:
                return <InformationCircleIcon className="w-6 h-6 text-gray-600" />;
        }
    };

    const getStyles = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'duplicate':
                return 'bg-orange-50 border-orange-200 text-orange-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    if (notification.isModal && notification.type === 'duplicate') {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Duplicate Entry Detected</h3>
                                    <p className="text-sm text-gray-600">Potential duplicate data found</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-sm text-gray-700 mb-4">The following duplicates were found:</p>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {notification.duplicates.map((dup, index) => (
                                    <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <p className="text-sm font-medium text-orange-800">
                                            {dup.field}: "{dup.value}"
                                        </p>
                                        <p className="text-xs text-orange-600 mt-1">
                                            Already exists in record #{dup.existingItem.id || 'N/A'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    notification.onCancel?.();
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    notification.onConfirm?.();
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Proceed Anyway
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`transform transition-all duration-300 ease-in-out ${getStyles()} border rounded-xl p-4 shadow-lg backdrop-blur-sm`}>
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    {notification.message && (
                        <p className="text-sm mt-1 opacity-90">{notification.message}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
