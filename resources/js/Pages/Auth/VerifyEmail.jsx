import GuestLayout from '@/Layouts/GuestLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { Head, Link, useForm } from '@inertiajs/react';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon, ShieldCheckIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="w-full sm:max-w-md mx-auto">
                {/* Back to Login Link */}
                <div className="mb-6 text-center">
                    <a 
                        href={route('login')} 
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Login
                    </a>
                </div>

                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <EnvelopeIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Thanks for signing up! Before getting started, could you verify your email address by clicking on the
                        link we just emailed to you? If you didn't receive the email, we will gladly send you another.
                    </p>
                </div>

                {/* Status Message */}
                {status === 'verification-link-sent' && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium text-green-800">
                                A new verification link has been sent to the email address you provided during registration.
                            </p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border border-purple-200">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                            <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Inbox</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            We've sent a verification email to your registered email address. 
                            Please check your inbox and click the verification link to complete your registration.
                        </p>
                        
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center text-sm text-gray-700">
                                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                <span className="font-medium">Verification Link Sent!</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                        <PrimaryButton 
                            className="flex-1 justify-center bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] shadow-lg" 
                            disabled={processing}
                        >
                            {processing ? (
                                <div className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    <EnvelopeIcon className="w-4 h-4 mr-2" />
                                    Resend Verification Email
                                </div>
                            )}
                        </PrimaryButton>

                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                        >
                            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                            Log Out
                        </Link>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>
                            Didn't receive the email? Check your spam folder or 
                            <button 
                                onClick={submit}
                                className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200 underline"
                                disabled={processing}
                            >
                                click here to resend
                            </button>
                        </p>
                        <p>
                            Already verified?{' '}
                            <a 
                                href={route('login')} 
                                className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
                            >
                                Sign in to your account
                            </a>
                        </p>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="text-sm text-purple-800">
                            <p className="font-medium mb-1">Verification Required</p>
                            <p className="text-xs">
                                Email verification helps us ensure the security of your account and prevents unauthorized access. 
                                The verification link is valid for 60 minutes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
