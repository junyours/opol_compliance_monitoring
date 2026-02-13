import { useRef, useState } from 'react';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Warning: Irreversible Action</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium text-gray-900">Delete Account</h4>
                    <p className="text-sm text-gray-500 mt-1">Permanently remove your account and all associated data</p>
                </div>
                <DangerButton 
                    onClick={confirmUserDeletion}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                >
                    Delete Account
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <div className="p-0">
                    <div className="bg-gradient-to-r from-red-600 to-pink-600 px-6 py-4">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ExclamationTriangleIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-semibold text-white">
                                    Confirm Account Deletion
                                </h3>
                            </div>
                        </div>
                    </div>
                    
                    <form onSubmit={deleteUser} className="p-6">
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete your account? Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.
                            </p>

                            <div>
                                <InputLabel htmlFor="password" value="Password" className="sr-only" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 transition-colors"
                                    isFocused
                                    placeholder="Enter your password to confirm"
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <SecondaryButton 
                                onClick={closeModal}
                                className="px-4 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                Cancel
                            </SecondaryButton>
                            <DangerButton 
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200" 
                                disabled={processing}
                            >
                                {processing ? 'Deleting...' : 'Delete Account'}
                            </DangerButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}
