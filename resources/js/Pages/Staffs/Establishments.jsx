import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import EstablishmentModal from '@/Components/EstablishmentModal';
import {
    BuildingOfficeIcon,
    PlusIcon,
    PencilIcon,
    EyeIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

export default function Establishments({ auth, establishments = [], businessTypes = [] }) {
    const { flash } = usePage().props;
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEstablishment, setEditingEstablishment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEstablishments = establishments.filter(establishment =>
        establishment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        establishment.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        establishment.proponent.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddEstablishment = () => {
        setEditingEstablishment(null);
        setModalOpen(true);
    };

    const handleEditEstablishment = (establishment) => {
        setEditingEstablishment(establishment);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingEstablishment(null);
    };

    return (
        <StaffLayout
            auth={auth}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Establishment Management</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage and add new establishments for inspection.
                        </p>
                    </div>
                    <button
                        onClick={handleAddEstablishment}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Establishment
                    </button>
                </div>
            }
        >
            <Head title="Establishment Management" />

            {/* Flash Messages */}
            {flash && flash.success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {flash.success}
                </div>
            )}

            {flash && flash.error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {flash.error}
                </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search establishments by name, address, or proponent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Establishments Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {filteredEstablishments.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {filteredEstablishments.map((establishment) => (
                            <li key={establishment.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {establishment.name}
                                                    </h3>
                                                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        establishment.status === 'active' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : establishment.status === 'inactive'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {establishment.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {establishment.address}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Proponent: {establishment.proponent}
                                                </p>
                                                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>Contact: {establishment.contact_number}</span>
                                                    {establishment.email && (
                                                        <span>Email: {establishment.email}</span>
                                                    )}
                                                </div>
                                                {establishment.type_of_business && (
                                                    <div className="mt-1">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {establishment.type_of_business.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleEditEstablishment(establishment)}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <PencilIcon className="h-3 w-3 mr-1" />
                                                Edit
                                            </button>
                                            <a
                                                href={`/inspections/create?establishment_id=${establishment.id}`}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                <EyeIcon className="h-3 w-3 mr-1" />
                                                Inspect
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-12">
                        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No establishments</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm ? 'No establishments match your search.' : 'Get started by adding a new establishment.'}
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={handleAddEstablishment}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Establishment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Establishment Modal */}
            <EstablishmentModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                businessTypes={businessTypes}
                editingEstablishment={editingEstablishment}
            />
        </StaffLayout>
    );
}
