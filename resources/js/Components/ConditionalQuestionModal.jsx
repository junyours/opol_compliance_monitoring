import React, { useState, useEffect } from 'react';

export default function ConditionalQuestionModal({ 
    show, 
    onClose, 
    onSave, 
    conditionalLogic, 
    setConditionalLogic,
    questionOptions = []
}) {
    const [localLogic, setLocalLogic] = useState(conditionalLogic || {
        type: 'permit', // 'permit' or 'clearance'
        trigger_response: '', // Will be set from available options
        fields: []
    });

    // Update localLogic when conditionalLogic prop changes
    useEffect(() => {
        if (conditionalLogic) {
            setLocalLogic(conditionalLogic);
        } else {
            setLocalLogic({
                type: 'permit',
                trigger_response: '',
                fields: []
            });
        }
    }, [conditionalLogic]);

    const handleTypeChange = (type) => {
        const newLogic = {
            ...localLogic,
            type,
            fields: type === 'permit' ? [
                { name: 'permit_number', label: 'Permit Number', type: 'text', required: true },
                { name: 'expiry_date', label: 'Expiry Date', type: 'date', required: true }
            ] : [
                { name: 'clearance_number', label: 'Clearance Number', type: 'text', required: true },
                { name: 'issuing_authority', label: 'Issuing Authority', type: 'text', required: true }
            ]
        };
        setLocalLogic(newLogic);
    };

    const handleFieldChange = (index, field, value) => {
        const newFields = [...localLogic.fields];
        newFields[index][field] = value;
        setLocalLogic({
            ...localLogic,
            fields: newFields
        });
    };

    const addField = () => {
        setLocalLogic({
            ...localLogic,
            fields: [...localLogic.fields, { 
                name: '', 
                label: '', 
                type: 'text', 
                required: false 
            }]
        });
    };

    const removeField = (index) => {
        const newFields = localLogic.fields.filter((_, i) => i !== index);
        setLocalLogic({
            ...localLogic,
            fields: newFields
        });
    };

    const handleSave = () => {
        setConditionalLogic(localLogic);
        onSave(localLogic);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Configure Conditional Logic
                                </h3>
                                
                                {/* Conditional Type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Conditional Type
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="permit"
                                                checked={localLogic.type === 'permit'}
                                                onChange={(e) => handleTypeChange(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Permit</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="clearance"
                                                checked={localLogic.type === 'clearance'}
                                                onChange={(e) => handleTypeChange(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Clearance</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Trigger Response */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Show fields when response is:
                                    </label>
                                    <select
                                        value={localLogic.trigger_response}
                                        onChange={(e) => setLocalLogic({
                                            ...localLogic,
                                            trigger_response: e.target.value
                                        })}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="">Select trigger response</option>
                                        {questionOptions.map((option, index) => (
                                            <option key={index} value={option.text}>{option.text}</option>
                                        ))}
                                    </select>
                                    {questionOptions.length === 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Please add options to the question first
                                        </p>
                                    )}
                                </div>

                                {/* Conditional Fields */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Fields to Show
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addField}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                        >
                                            Add Field
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {localLogic.fields.map((field, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                                                <div className="grid grid-cols-2 gap-3 mb-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Field Name
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={field.name}
                                                            onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            placeholder="permit_number"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Field Label
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={field.label}
                                                            onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
                                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                            placeholder="Permit Number"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Field Type
                                                        </label>
                                                        <select
                                                            value={field.type}
                                                            onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                        >
                                                            <option value="text">Text</option>
                                                            <option value="date">Date</option>
                                                            <option value="number">Number</option>
                                                            <option value="textarea">Textarea</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex items-end">
                                                        <label className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-sm">Required</span>
                                                        </label>
                                                        
                                                        {localLogic.fields.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeField(index)}
                                                                className="ml-auto text-red-600 hover:text-red-800 text-sm"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Save Conditional Logic
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
