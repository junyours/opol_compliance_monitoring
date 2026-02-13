import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('admin.profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <InputLabel htmlFor="name" value="Full Name" className="text-sm font-medium text-gray-700" />
                        <TextInput
                            id="name"
                            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                            placeholder="Enter your full name"
                        />
                        <InputError className="mt-2" message={errors.name} />
                    </div>

                    <div className="md:col-span-2">
                        <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700" />
                        <TextInput
                            id="email"
                            type="email"
                            className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="Enter your email address"
                        />
                        <InputError className="mt-2" message={errors.email} />
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">Email Verification Required</h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>Your email address is unverified. Please verify your email to access all features.</p>
                                    <div className="mt-3">
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
                                        >
                                            Resend Verification Email
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mt-4 rounded-md bg-green-50 p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-green-800">
                                            Verification email sent successfully!
                                        </p>
                                        <p className="mt-1 text-sm text-green-700">
                                            Please check your inbox and follow the instructions to verify your email.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date(user.updated_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-4">
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <div className="flex items-center text-sm text-green-600">
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Profile updated successfully
                            </div>
                        </Transition>
                        <PrimaryButton 
                            disabled={processing}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </section>
    );
}
