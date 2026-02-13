import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { UserCircleIcon, KeyIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Edit({ auth, mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="mt-1 text-sm text-gray-600">Manage your account information and security settings</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{auth.user.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{auth.user.role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                                {auth.user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Profile Settings" />

            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Profile Overview Card */}
                    <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                        <div className="flex items-center space-x-6">
                            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <UserCircleIcon className="h-16 w-16 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold">{auth.user.name}</h2>
                                <p className="text-blue-100">{auth.user.email}</p>
                                <div className="mt-2 flex items-center space-x-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                                        {auth.user.role.charAt(0).toUpperCase() + auth.user.role.slice(1)}
                                    </span>
                                    {auth.user.email_verified_at ? (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 backdrop-blur-sm">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 backdrop-blur-sm">
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Settings Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Profile Information */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <UserCircleIcon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                        className="max-w-none"
                                    />
                                </div>
                            </div>

                            {/* Password Update */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <KeyIcon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <UpdatePasswordForm className="max-w-none" />
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-8">
                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h4 className="text-sm font-semibold text-gray-900 mb-4">Account Summary</h4>
                                <dl className="space-y-3">
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Member Since</dt>
                                        <dd className="text-sm font-medium text-gray-900">
                                            {new Date(auth.user.created_at).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Account Status</dt>
                                        <dd className="text-sm font-medium text-green-600">Active</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-sm text-gray-600">Email Status</dt>
                                        <dd className={`text-sm font-medium ${auth.user.email_verified_at ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {auth.user.email_verified_at ? 'Verified' : 'Pending'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <TrashIcon className="h-5 w-5 text-red-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-gray-600 mb-4">
                                        Permanently delete your account and all associated data.
                                    </p>
                                    <DeleteUserForm className="max-w-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
