import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import StaffLayout from '@/Layouts/StaffLayout';
import { UserIcon, EnvelopeIcon, PhoneIcon, CameraIcon, ShieldCheckIcon, ClockIcon, KeyIcon, BellIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { UserCircleIcon, StarIcon } from '@heroicons/react/24/solid';
import DigitalSignature from '@/Components/DigitalSignature';

export default function Edit({ auth, mustVerifyEmail, status, signature }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const { data, setData, post, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone || '',
        bio: auth.user.bio || '',
        department: auth.user.department || '',
        location: auth.user.location || '',
        timezone: auth.user.timezone || 'Asia/Manila',
        language: auth.user.language || 'en',
        email_notifications: auth.user.email_notifications !== false,
        push_notifications: auth.user.push_notifications !== false,
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('staff.profile.update'));
    };

    return (
        <StaffLayout user={auth.user}>
            <Head title="Profile" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Profile Header Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8">
                        <div className="relative">
                            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 h-32 sm:h-40"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            
                            {/* Cover Photo Upload Button */}
                            <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-lg shadow-lg transition-all duration-200">
                                <CameraIcon className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="px-4 sm:px-6 pb-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20">
                                <div className="relative mb-4 sm:mb-0">
                                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 flex items-center justify-center overflow-hidden shadow-2xl">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircleIcon className="w-28 h-28 sm:w-36 sm:h-36 text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg cursor-pointer transition-all duration-200 hover:scale-110">
                                        <CameraIcon className="w-5 h-5" />
                                        <input
                                            id="profile-image"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                </div>
                                <div className="sm:ml-6 mt-4 sm:mt-20 flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                                {auth.user.name}
                                            </h1>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                                                <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start">
                                                    <ShieldCheckIcon className="w-4 h-4 mr-1 text-green-500" />
                                                    Staff Member
                                                </p>
                                                <div className="flex items-center justify-center sm:justify-start">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <StarIcon key={star} className="w-4 h-4 text-yellow-400" />
                                                    ))}
                                                    <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">5.0</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center justify-center sm:justify-start mt-1">
                                                <ClockIcon className="w-4 h-4 mr-1" />
                                                Joined {new Date(auth.user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3 sm:mt-0 justify-center sm:justify-start">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Information Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                        {/* Tab Navigation */}
                        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                            <nav className="flex min-w-max sm:min-w-0">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`py-4 px-4 sm:px-6 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                                        activeTab === 'profile'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <UserIcon className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Profile Information</span>
                                        <span className="sm:hidden">Profile</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`py-4 px-4 sm:px-6 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                                        activeTab === 'security'
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <KeyIcon className="w-4 h-4 mr-2" />
                                        Security
                                    </div>
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-4 sm:p-6 lg:p-8">
                            {status && (
                                <div className="mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                {status}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <form onSubmit={submit} className="space-y-6 sm:space-y-8">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Full Name
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-all duration-200"
                                                        autoComplete="name"
                                                        placeholder="Enter your full name"
                                                    />
                                                </div>
                                                {errors.name && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Email Address
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        id="email"
                                                        type="email"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-all duration-200"
                                                        autoComplete="username"
                                                        placeholder="your.email@example.com"
                                                    />
                                                </div>
                                                {errors.email && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Phone Number
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                    <input
                                                        id="phone"
                                                        type="tel"
                                                        value={data.phone}
                                                        onChange={(e) => setData('phone', e.target.value)}
                                                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-all duration-200"
                                                        placeholder="+63 XXX XXX XXXX"
                                                    />
                                                </div>
                                                {errors.phone && (
                                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label htmlFor="department" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Department
                                                </label>
                                                <select
                                                    id="department"
                                                    value={data.department}
                                                    onChange={(e) => setData('department', e.target.value)}
                                                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-all duration-200"
                                                >
                                                    <option value="">Select Department</option>
                                                    <option value="inspection">Inspection</option>
                                                    <option value="compliance">Compliance</option>
                                                    <option value="monitoring">Monitoring</option>
                                                    <option value="enforcement">Enforcement</option>
                                                </select>
                                            </div>

                                            <div className="lg:col-span-2">
                                                <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                    Bio
                                                </label>
                                                <textarea
                                                    id="bio"
                                                    value={data.bio}
                                                    onChange={(e) => setData('bio', e.target.value)}
                                                    rows={4}
                                                    className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white transition-all duration-200"
                                                    placeholder="Tell us about yourself..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                                            <div className="flex items-start">
                                                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                                        Email verification required
                                                    </p>
                                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                                        Your email address is unverified.
                                                    </p>
                                                    <Link
                                                        href={route('verification.send')}
                                                        method="post"
                                                        as="button"
                                                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:text-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-900/70"
                                                    >
                                                        Resend verification email
                                                    </Link>
                                                    {status === 'verification-link-sent' && (
                                                        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                                                            A new verification link has been sent to your email address.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200 dark:border-gray-700 gap-4">
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                            >
                                                {processing ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>

                                            {recentlySuccessful && (
                                                <div className="flex items-center text-green-600 dark:text-green-400">
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span className="font-medium">Profile updated successfully!</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
                                        <div className="space-y-4">
                                            <button
                                                onClick={() => setShowPasswordModal(true)}
                                                className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <KeyIcon className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                                                        </div>
                                                    </div>
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </button>

                                            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                    <div className="flex items-center">
                                                        <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-3" />
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                                                        </div>
                                                    </div>
                                                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200">
                                                        Enable
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Digital Signature Section */}
                                    <DigitalSignature signature={signature} auth={auth} />
                                </div>
                            )}



                            {/* Account Actions Section */}
                            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                                Danger Zone
                                            </h3>
                                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                                Once you delete your account, there is no going back. Please be certain.
                                            </p>
                                            <div className="mt-4">
                                                <Link
                                                    href={route('staff.profile.destroy')}
                                                    method="delete"
                                                    as="button"
                                                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Account
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
