import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import {
    BellIcon,
    Cog6ToothIcon,
    Bars3Icon,
    ArrowRightOnRectangleIcon,
    SunIcon,
    MoonIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useDarkMode } from '../Context/DarkModeContext';

export default function StaffTopbar({ onMenuClick }) {
    const { auth } = usePage().props;
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const { darkMode, toggleDarkMode } = useDarkMode();

    const handleLogout = () => {
        Inertia.post(route('logout'));
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.user-menu-container')) {
                setShowUserMenu(false);
            }
            if (showSettingsMenu && !event.target.closest('.settings-menu-container')) {
                setShowSettingsMenu(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showUserMenu, showSettingsMenu]);

    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Menu button and title */}
                    <div className="flex items-center">
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2 rounded-md text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
                        >
                            <Bars3Icon className="h-6 w-6" />
                        </button>
                        <h1 className="ml-4 lg:ml-0 text-xl font-semibold text-gray-900 dark:text-white">
                            Staff Portal
                        </h1>
                    </div>

                    {/* Right side - Notifications, dark mode, and user menu */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative">
                            <button className="p-2 rounded-full text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                                <BellIcon className="h-6 w-6" />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
                            </button>
                        </div>


                        {/* Settings */}
                        <div className="relative settings-menu-container">
                            <button
                                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                className="p-2 rounded-full text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            >
                                <Cog6ToothIcon className="h-6 w-6" />
                            </button>

                            {/* Settings Dropdown */}
                            {showSettingsMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">Settings</p>
                                    </div>
                                    
                                    <div className="py-1">
                                        <button
                                            onClick={toggleDarkMode}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                                        >
                                            {darkMode ? (
                                                <>
                                                    <SunIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                                    Light Mode
                                                </>
                                            ) : (
                                                <>
                                                    <MoonIcon className="mr-3 h-5 w-5 text-gray-400" />
                                                    Dark Mode
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User dropdown */}
                        <div className="relative user-menu-container">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700 p-1 transition-colors duration-200"
                            >
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 dark:text-gray-200 font-medium text-sm">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{auth.user.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">Staff Member</div>
                                </div>
                                <ChevronDownIcon className="hidden md:block w-4 h-4 text-gray-400 dark:text-gray-500" />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{auth.user.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{auth.user.email}</p>
                                    </div>
                                    
                                    <div className="py-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                        >
                                            <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
