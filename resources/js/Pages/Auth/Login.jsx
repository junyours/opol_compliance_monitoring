import { useEffect, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login({ status, canResetPassword, accountLocked }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [customErrors, setCustomErrors] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showAccountLockedModal, setShowAccountLockedModal] = useState(false);

    useEffect(() => {
        // Load remembered email from localStorage
        const rememberedEmail = localStorage.getItem('remember_email');
        if (rememberedEmail) {
            setData('email', rememberedEmail);
            setData('remember', true);
        }
        
        return () => reset('password');
    }, []);

    useEffect(() => {
        if (accountLocked) {
            setShowAccountLockedModal(true);
        }
    }, [accountLocked]);

    const validateField = (field, value) => {
        let newErrors = { ...customErrors };

        if (field === 'email') {
            newErrors.email = value.endsWith('@gmail.com')
                ? ''
                : 'Email must end with @gmail.com';
        }

        if (field === 'password') {
            newErrors.password = value.length >= 6
                ? ''
                : 'Password must be at least 6 characters';
        }

        setCustomErrors(newErrors);
    };

    const handleChange = (field, value) => {
        setData(field, value);
        validateField(field, value);
    };

    const submit = (e) => {
        e.preventDefault();
        if (customErrors.email || customErrors.password) return;
        
        // Store remember me preference in localStorage
        if (data.remember) {
            localStorage.setItem('remember_email', data.email);
        } else {
            localStorage.removeItem('remember_email');
        }
        
        post(route('login'));
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 sm:px-6 relative overflow-hidden">
                
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center py-8">
                    <div className="relative z-10 w-full max-w-4xl bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl rounded-3xl 
                                    shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/20
                                    flex flex-col md:flex-row overflow-hidden
                                    animate-fade-in-up">

                        {/* LEFT FORM */}
                        <div className="w-full md:w-1/2 px-8 sm:px-10 py-8 
                                        flex flex-col justify-center
                                        animate-fade-in-up delay-150">
                        <div className="mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 rounded-2xl shadow-2xl mb-4 transform hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-xs text-purple-200">
                                Sign in to continue to your account
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">

                            {/* EMAIL */}
                            <div>
                                <InputLabel
                                    htmlFor="email"
                                    value="Email Address"
                                    className="text-purple-200 text-sm font-medium"
                                />
                                <div className="mt-2 relative">
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="w-full px-3 py-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg 
                                                   focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 
                                                   text-white placeholder-purple-200/70
                                                   transition-all duration-300 shadow-lg text-sm"
                                        placeholder="you@gmail.com"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <InputError message={errors.email || customErrors.email} className="mt-2" />
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                    className="text-purple-200 text-sm font-medium"
                                />
                                <div className="mt-2 relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        className="w-full px-3 py-2 pr-10 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg 
                                                   focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 
                                                   text-white placeholder-purple-200/70
                                                   transition-all duration-300 shadow-lg text-sm"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-purple-300 hover:text-white transition-colors duration-200"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between mt-2">
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm text-purple-300 hover:text-white transition-colors duration-200"
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>

                                <InputError message={errors.password || customErrors.password} className="mt-2" />
                            </div>

                            {/* REMEMBER */}
                            <div className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-purple-300/50 rounded"
                                />
                                <span className="ml-2 text-sm text-purple-200">
                                    Remember me
                                </span>
                            </div>

                            {/* BUTTON */}
                            <PrimaryButton
                                disabled={processing}
                                className="w-full justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 hover:from-purple-700 hover:via-pink-600 hover:to-indigo-700 
                                           text-white py-2 rounded-lg font-bold tracking-wide 
                                           shadow-[0_10px_25px_rgba(168,85,247,0.5)]
                                           hover:shadow-[0_14px_30px_rgba(168,85,247,0.7)]
                                           transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm text-sm"
                            >
                                {processing ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign In'
                                )}
                            </PrimaryButton>
                        </form>

                        <div className="text-center text-xs text-purple-200 mt-4">
                            Don't have an account? Please contact the administrator.
                        </div>
                    </div>

                    {/* RIGHT INFO */}
                    <div className="hidden md:flex w-1/2 
                                    bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-indigo-600/20 backdrop-blur-md
                                    flex-col items-center justify-center px-8 py-8 text-center
                                    animate-fade-in-up delay-300 relative overflow-hidden border-l border-white/20">
                        {/* Background Pattern */}
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                            <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
                            <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
                        </div>
                        
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl mb-6 border border-white/20">
                                <img
                                    src="/images/logo.png"
                                    alt="Logo"
                                    className="w-16 h-16"
                                />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-3">
                                MENRO Portal
                            </h3>
                            <p className="text-base text-purple-200 max-w-lg leading-relaxed mb-8">
                                Municipal Environment and Natural Resources Office
                            </p>
                            <div className="flex items-center justify-center space-x-8 mb-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white mb-1">100%</div>
                                    <div className="text-xs text-purple-200">Secure</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white mb-1">24/7</div>
                                    <div className="text-xs text-purple-200">Available</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-white mb-1">Fast</div>
                                    <div className="text-xs text-purple-200">Reliable</div>
                                </div>
                            </div>
                            <div className="max-w-lg">
                                <p className="text-purple-200 leading-relaxed text-base">
                                    Access your account securely and manage your environmental compliance tasks with our comprehensive inspection system.
                                </p>
                            </div>
                        </div>
                    </div>

                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 py-4 text-center border-t border-white/10">
                    <div className="text-xs text-purple-200 space-y-1">
                        <p>&copy; 2024 MENRO - Municipal Environment and Natural Resources Office. All rights reserved.</p>
                        <p className="opacity-50">Developed by: Jessther Jay C. Salon II</p>
                    </div>
                </footer>
            </div>

            {/* Account Locked Modal */}
            {showAccountLockedModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md mx-4 transform transition-all">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Account Locked</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Your account is locked. Please contact the administrator.
                            </p>
                            <button
                                onClick={() => setShowAccountLockedModal(false)}
                                className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:via-pink-600 hover:to-indigo-700 transition-all duration-300"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
