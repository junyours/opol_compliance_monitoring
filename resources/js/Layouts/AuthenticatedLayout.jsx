import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';

import {
    HomeIcon,
    BuildingOffice2Icon,
    Squares2X2Icon,
    ClipboardDocumentListIcon,
    WrenchScrewdriverIcon,
    UserCircleIcon,
    ClipboardDocumentCheckIcon,
    ChartBarIcon,
    Bars3Icon,
    BellIcon,
    Cog6ToothIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import Inspection from '@/Pages/Admin/Inspection';

export default function Authenticated({ user, header, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f4f7fb] flex">

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-64
                    bg-white border-r border-gray-200
                    transform transition-transform duration-300
                    overflow-y-auto
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    sm:translate-x-0
                `}
            >
                {/* LOGO */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <span className="text-lg font-semibold text-gray-800">
                        Admin Panel
                    </span>
                </div>

                <nav className="mt-6 px-3">
                    <ul className="space-y-1">

                        {/* Dashboard */}
                        <li>
                            <NavLink
                                href={route('admin.dashboard')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <HomeIcon className="w-5 h-5" />
                                Dashboard
                            </NavLink>
                        </li>

                         {/* SECTION LABEL */}
                        <li className="mt-6 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Management
                        </li>

                        {/* Staffs */}
                        <li>
                            <NavLink
                                href={route('admin.staffs.index')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <UserCircleIcon className="w-5 h-5" />
                                Staffs
                            </NavLink>
                        </li>

                        {/* Establishments */}
                        <li>
                            <NavLink
                                href={route('admin.establishments.index')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <BuildingOffice2Icon className="w-5 h-5" />
                                Establishments
                            </NavLink>
                        </li>

                        {/* Business Types */}
                        <li>
                            <NavLink
                                href={route('admin.business-types.index-page')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <BuildingOfficeIcon className="w-5 h-5" />
                                Business Types
                            </NavLink>
                        </li>


                         {/* Open Inspections */}
                        <li>
                            <NavLink
                                href={route('admin.inspections.index')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                Open Inspections
                            </NavLink>
                        </li>

                        {/* Manual Inspection */}
                        <li>
                            <NavLink
                                href={route('admin.admin.inspection.create')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                Manual Inspection
                            </NavLink>
                        </li>

                        {/* Establishment Monitoring */}
                        <li>
                            <NavLink
                                href={route('admin.monitoring.index')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <ChartBarIcon className="w-5 h-5" />
                                Establishment Monitoring
                            </NavLink>
                        </li>

                      

                        {/* SECTION LABEL */}
                        <li className="mt-6 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Reports
                        </li>

                          {/* Reports */}
                        <li>
                            <NavLink
                                href={route('admin.reports.index')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <ClipboardDocumentListIcon className="w-5 h-5" />
                                Reports
                            </NavLink>
                        </li>

                        {/* Checklist Response Reports */}
                        <li>
                            <NavLink
                                href={route('admin.reports.checklist-responses')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                Checklist Reports
                            </NavLink>
                        </li>

                        {/* Comprehensive Data Reports */}
                        <li>
                            <NavLink
                                href={route('admin.reports.comprehensive-data.page')}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg
                                           text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                           transition font-medium"
                            >
                                <ChartBarIcon className="w-5 h-5" />
                                Comprehensive Data Reports
                            </NavLink>
                        </li>

                    </ul>
                </nav>
            </aside>

            {/* MAIN */}
            <div className="flex-1 sm:ml-64">

                {/* TOP NAV */}
                <nav className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 shadow-lg">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">

                            {/* LEFT SIDE - Mobile Toggle */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="sm:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                                >
                                    <Bars3Icon className="h-6 w-6" />
                                </button>
                                
                                {/* Logo on Bottom Left */}
                                <div className="hidden sm:flex items-center space-x-3">
                                    <img src="/images/opol-logo.png" alt="OPOL Logo" className="h-8 w-auto" />
                                    <div>
                                        <p className="text-xs text-blue-100">OPOL ESTABLISHMENTS</p>
                                        <p className="text-sm font-semibold text-white">Inspection</p>
                                    </div>
                                </div>
                            </div>

                            {/* CENTER - Logo/Brand */}
                            <div className="hidden sm:flex items-center justify-center flex-1">
                                <div className="flex items-center space-x-2">
                                    <img src="/images/logo.png" alt="MENRO Logo" className="h-8 w-auto" />
                                    <span className="text-lg font-bold text-white">
                                        MENRO CMS
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT SIDE - Actions */}
                            <div className="flex items-center space-x-3">
                                {/* Categories Dropdown */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg">
                                            <Squares2X2Icon className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">Categories</span>
                                            <svg className="ms-2 h-4 w-4 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="py-2 rounded-xl shadow-2xl border border-gray-100 bg-white backdrop-blur-lg ring-1 ring-black ring-opacity-5">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
                                            </div>
                                            <div className="py-1">
                                                <Dropdown.Link href={route('admin.inspection')} className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 ease-in-out">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-200">
                                                        <Squares2X2Icon className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Category List</p>
                                                        <p class="text-xs text-gray-500">Manage inspection categories</p>
                                                    </div>
                                                </Dropdown.Link>
                                                
                                                <Dropdown.Link href={route('admin.category.checklist')} className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 hover:text-green-700 transition-all duration-200 ease-in-out">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-200">
                                                        <ClipboardDocumentListIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Checklist</p>
                                                        <p class="text-xs text-gray-500">View category checklists</p>
                                                    </div>
                                                </Dropdown.Link>
                                                
                                                <Dropdown.Link href={route('utilities.index')} className="group flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 ease-in-out">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-200">
                                                        <WrenchScrewdriverIcon className="h-4 w-4 text-white" />
                                                    </div>
                                                    <div class="flex-1">
                                                        <p class="font-medium">Utilities</p>
                                                        <p class="text-xs text-gray-500">System utilities & tools</p>
                                                    </div>
                                                </Dropdown.Link>
                                            </div>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>

                                {/* Notifications */}
                                <button className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200 relative">
                                    <BellIcon className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-400 rounded-full"></span>
                                </button>

                                {/* USER MENU */}
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200">
                                            <UserIcon className="h-4 w-4 mr-2" />
                                            <span className="hidden sm:inline">{user.name}</span>
                                            <svg className="ms-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('admin.profile.edit')} className="flex items-center">
                                            <UserIcon className="h-4 w-4 mr-2" />
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center">
                                            <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mobile User Info Bar */}
                    <div className="sm:hidden bg-blue-800 bg-opacity-50 px-4 py-2 border-t border-blue-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <img src="/images/opol-logo.png" alt="OPOL Logo" className="h-6 w-auto" />
                                <span className="text-sm text-blue-100">{user.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-blue-200">MENRO CMS</span>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* HEADER */}
                {header && (
                    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                        {header}
                    </header>
                )}

                {/* CONTENT */}
                <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}
