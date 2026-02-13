import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { XMarkIcon } from "@heroicons/react/24/solid";

export default function BusinessTypeModal({ isOpen, onClose, onSuccess }) {
  const initialForm = {
    name: '',
    description: '',
    is_active: true
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    Inertia.post('/admin/business-types', form, {
      onSuccess: () => {
        // Reset form and close modal
        setForm(initialForm);
        setErrors({});
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      },
      onError: (err) => {
        setErrors(err);
      },
    });
  };

  // Clear form & errors if modal is closed manually
  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-4 transform transition-transform duration-300 scale-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Add New Business Type</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm font-medium mb-1">Business Type Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Restaurant, Hotel, Retail Store"
              required
            />
            {errors.name && (
              <span className="text-red-500 text-xs mt-1">{errors.name}</span>
            )}
          </div>

          <div className="flex flex-col">
            <label className="text-gray-600 text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Optional description of this business type"
            />
            {errors.description && (
              <span className="text-red-500 text-xs mt-1">{errors.description}</span>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Active (available for selection)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition text-sm"
            >
              Add Business Type
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
