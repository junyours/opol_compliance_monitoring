import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import BusinessTypeModal from "./BusinessTypeModal";

export default function EstablishmentModal({ isOpen, onClose, businessTypes = [], editingEstablishment = null }) {
  const initialForm = {
    name: '',
    proponent: '',
    address: '',
    contact_number: '',
    email: '',
    type_of_business_id: '',
    Barangay: '',
    total_capacity: '',
    number_of_rooms: '',
    number_of_employees: '',
    status: 'active',
  };

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [businessTypeModalOpen, setBusinessTypeModalOpen] = useState(false);

  // Reset form when modal opens or editing establishment changes
  useEffect(() => {
    if (isOpen) {
      if (editingEstablishment) {
        setForm({
          name: editingEstablishment.name || '',
          proponent: editingEstablishment.proponent || '',
          address: editingEstablishment.address || '',
          contact_number: editingEstablishment.contact_number || '',
          email: editingEstablishment.email || '',
          type_of_business_id: editingEstablishment.type_of_business_id || '',
          Barangay: editingEstablishment.Barangay || '',
          total_capacity: editingEstablishment.total_capacity || '',
          number_of_rooms: editingEstablishment.number_of_rooms || '',
          number_of_employees: editingEstablishment.number_of_employees || '',
          status: editingEstablishment.status || 'active',
        });
      } else {
        setForm(initialForm);
      }
      setErrors({});
    }
  }, [isOpen, editingEstablishment]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Debug logging
    console.log('Form data being submitted:', form);
    console.log('Editing establishment ID:', editingEstablishment?.id);

    if (editingEstablishment) {
      // Update existing establishment
      Inertia.put(`/admin/establishments/${editingEstablishment.id}`, form, {
        onSuccess: () => {
          setForm(initialForm);
          setErrors({});
          onClose();
        },
        onError: (err) => {
          console.log('Update errors:', err);
          setErrors(err);
        },
      });
    } else {
      // Create new establishment
      Inertia.post('/admin/establishments', form, {
        onSuccess: () => {
          setForm(initialForm);
          setErrors({});
          onClose();
        },
        onError: (err) => {
          console.log('Create errors:', err);
          setErrors(err);
        },
      });
    }
  };

  const handleBusinessTypeSuccess = () => {
    // Reload the page to get updated business types
    window.location.reload();
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-4 transform transition-transform duration-300 scale-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingEstablishment ? 'Edit Establishment' : 'Add New Establishment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'name', label: 'Business Name', type: 'text' },
              { name: 'proponent', label: 'Proponent', type: 'text' },
              { name: 'address', label: 'Address', type: 'text' },
              { name: 'contact_number', label: 'Contact Number', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'type_of_business_id', label: 'Type of Business', type: 'select' },
              { name: 'Barangay', label: 'Barangay', type: 'text' },
              { name: 'total_capacity', label: 'Total Capacity', type: 'number' },
              { name: 'number_of_rooms', label: 'Number of Rooms', type: 'number' },
              { name: 'number_of_employees', label: 'Number of Employees', type: 'number' },
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="text-gray-600 text-sm font-medium mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <select
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors[field.name] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      >
                        <option value="">Select a business type</option>
                        {businessTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setBusinessTypeModalOpen(true)}
                        className="inline-flex items-center px-2 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors duration-200"
                        title="Add New Business Type"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add
                      </button>
                    </div>
                    {errors[field.name] && (
                      <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
                    )}
                  </div>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                )}
                {errors[field.name] && (
                  <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
                )}
              </div>
            ))}
          </div>

          {/* Status Field */}
          <div className="flex flex-col">
            <label className="text-gray-600 text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="terminated">Terminated</option>
            </select>
            {errors.status && (
              <span className="text-red-500 text-xs mt-1">{errors.status}</span>
            )}
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
              className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition text-sm"
            >
              {editingEstablishment ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Business Type Modal */}
      <BusinessTypeModal 
        isOpen={businessTypeModalOpen} 
        onClose={() => setBusinessTypeModalOpen(false)}
        onSuccess={handleBusinessTypeSuccess}
      />
    </div>
  );
}
