import React, { useState, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage } from "@inertiajs/react";
import { XMarkIcon, PlusIcon, MagnifyingGlassIcon, ChevronUpDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import BusinessTypeModal from "./BusinessTypeModal";

export default function EstablishmentModal({ isOpen, onClose, businessTypes = [], editingEstablishment = null }) {
  const { auth, establishments } = usePage().props;
  
  // Barangays in Opol, Misamis Oriental
  const barangays = [
    'Awang',
    'Bagocboc',
    'Barra',
    'Bonbon',
    'Cauyonan',
    'Igpit',
    'Limonda',
    'Luyong Bonbon',
    'Malanang',
    'Nangcaon',
    'Patag',
    'Poblacion',
    'Taboc',
    'Tingalan'
  ];

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
  const [businessTypeSearch, setBusinessTypeSearch] = useState('');
  const [showBusinessTypeDropdown, setShowBusinessTypeDropdown] = useState(false);
  const [barangaySearch, setBarangaySearch] = useState('');
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);
  const [fieldValidation, setFieldValidation] = useState({
    contact_number: '',
    duplicate_check: ''
  });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateSubmission, setDuplicateSubmission] = useState(null);

  // Determine route prefix based on user role
  const routePrefix = auth.user.role === 'admin' ? '/admin' : '/staff';

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
        
        // Set business type search if editing
        if (editingEstablishment.type_of_business_id && businessTypes.length > 0) {
          const currentType = businessTypes.find(type => type.id === editingEstablishment.type_of_business_id);
          if (currentType) {
            setBusinessTypeSearch(currentType.name);
          }
        }
        
        // Set barangay search if editing
        if (editingEstablishment.Barangay) {
          setBarangaySearch(editingEstablishment.Barangay);
        }
      } else {
        setForm(initialForm);
        setBusinessTypeSearch('');
        setBarangaySearch('');
      }
      setErrors({});
      setFieldValidation({ contact_number: '', duplicate_check: '' });
      setShowBusinessTypeDropdown(false);
      setShowBarangayDropdown(false);
    }
  }, [isOpen, editingEstablishment, businessTypes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Real-time validation for contact number
    if (name === 'contact_number') {
      if (value === '') {
        setFieldValidation(prev => ({ ...prev, contact_number: '' }));
      } else if (/^[0-9]{11}$/.test(value)) {
        setFieldValidation(prev => ({ ...prev, contact_number: 'valid' }));
      } else {
        setFieldValidation(prev => ({ ...prev, contact_number: 'invalid' }));
      }
    }

    // Real-time validation for duplicate name + business type
    if (name === 'name' || name === 'type_of_business_id') {
      checkDuplicateValidation(name, value);
    }
  };

  const handleBusinessTypeSelect = (businessType) => {
    setForm({ ...form, type_of_business_id: businessType.id });
    setBusinessTypeSearch(businessType.name);
    setShowBusinessTypeDropdown(false);
    // Check duplicate validation when business type is selected
    checkDuplicateValidation('type_of_business_id', businessType.id);
  };

  const handleBarangaySearchChange = (e) => {
    const value = e.target.value;
    setBarangaySearch(value);
    setShowBarangayDropdown(true);
    setForm({ ...form, Barangay: value });
  };

  const handleBarangaySelect = (barangay) => {
    setForm({ ...form, Barangay: barangay });
    setBarangaySearch(barangay);
    setShowBarangayDropdown(false);
  };

  const handleBarangayInputFocus = () => {
    setShowBarangayDropdown(true);
  };

  const handleBarangayInputBlur = () => {
    setTimeout(() => setShowBarangayDropdown(false), 200);
  };

  const handleBusinessTypeSearchChange = (e) => {
    const value = e.target.value;
    setBusinessTypeSearch(value);
    setShowBusinessTypeDropdown(true);
    
    // If the search matches exactly one business type, select it
    const exactMatch = businessTypes.find(type => 
      type.name.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      setForm({ ...form, type_of_business_id: exactMatch.id });
    } else {
      setForm({ ...form, type_of_business_id: '' });
    }
  };

  const handleBusinessTypeInputFocus = () => {
    setShowBusinessTypeDropdown(true);
    // Set the search term to current business type name if exists
    if (form.type_of_business_id) {
      const currentType = businessTypes.find(type => type.id === form.type_of_business_id);
      if (currentType) {
        setBusinessTypeSearch(currentType.name);
      }
    }
  };

  const handleBusinessTypeInputBlur = () => {
    // Delay hiding dropdown to allow clicking on options
    setTimeout(() => setShowBusinessTypeDropdown(false), 200);
  };

  // Filter business types based on search
  const filteredBusinessTypes = businessTypes.filter(type =>
    type.name.toLowerCase().includes(businessTypeSearch.toLowerCase())
  );

  // Filter barangays based on search
  const filteredBarangays = barangays.filter(barangay =>
    barangay.toLowerCase().includes(barangaySearch.toLowerCase())
  );

  // Check for duplicate name + business type combination
  const checkDuplicateValidation = async (fieldName, fieldValue) => {
    const currentName = fieldName === 'name' ? fieldValue : form.name;
    const currentBusinessTypeId = fieldName === 'type_of_business_id' ? fieldValue : form.type_of_business_id;

    if (currentName && currentBusinessTypeId) {
      const existing = establishments.find(est => 
        est.name.toLowerCase().trim() === currentName.toLowerCase().trim() &&
        est.type_of_business_id == currentBusinessTypeId &&
        est.id !== editingEstablishment?.id
      );

      if (existing) {
        setFieldValidation(prev => ({ ...prev, duplicate_check: 'invalid' }));
        setErrors(prev => ({ ...prev, name: 'An establishment with this name and business type already exists.' }));
      } else {
        setFieldValidation(prev => ({ ...prev, duplicate_check: 'valid' }));
        // Clear the duplicate error if it exists
        if (errors.name === 'An establishment with this name and business type already exists.') {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.name;
            return newErrors;
          });
        }
      }
    } else {
      setFieldValidation(prev => ({ ...prev, duplicate_check: '' }));
      // Clear the duplicate error if it exists
      if (errors.name === 'An establishment with this name and business type already exists.') {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.name;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Debug logging
    console.log('Form data being submitted:', form);
    console.log('Editing establishment ID:', editingEstablishment?.id);
    console.log('Route prefix:', routePrefix);

    // Check for duplicate before submission
    console.log('Checking for duplicates...');
    console.log('Form name:', form.name);
    console.log('Form business type ID:', form.type_of_business_id);
    console.log('Editing establishment ID:', editingEstablishment?.id);
    console.log('Available establishments:', establishments);
    
    if (form.name && form.type_of_business_id) {
      const existing = establishments.find(est => 
        est.name.toLowerCase().trim() === form.name.toLowerCase().trim() &&
        est.type_of_business_id == form.type_of_business_id &&
        est.id !== editingEstablishment?.id
      );
      
      console.log('Found duplicate:', existing);
      
      if (existing) {
        // Show duplicate modal instead of submitting
        setDuplicateSubmission(existing);
        setShowDuplicateModal(true);
        return;
      } else {
        console.log('No duplicate found, proceeding with submission...');
      }
    } else {
      console.log('Missing name or business type, skipping duplicate check...');
    }

    // Validate required fields (removed to allow empty fields)
    // const requiredFields = ['name', 'proponent', 'address', 'type_of_business_id'];
    // const missingFields = requiredFields.filter(field => !form[field] || (typeof form[field] === 'string' && form[field].trim() === ''));
    
    // if (missingFields.length > 0) {
    //   const fieldErrors = {};
    //   missingFields.forEach(field => {
    //     fieldErrors[field] = 'This field is required';
    //   });
    //   setErrors(fieldErrors);
    //   return;
    // }

    // Validate email format if provided
    if (form.email && typeof form.email === 'string' && form.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setErrors({ ...errors, email: 'Please enter a valid email address' });
        return;
      }
    }

    if (editingEstablishment) {
      // Update existing establishment
      Inertia.put(`${routePrefix}/establishments/${editingEstablishment.id}`, form, {
        onSuccess: (page) => {
          console.log('Update successful:', page);
          setForm(initialForm);
          setErrors({});
          onClose();
        },
        onError: (err) => {
          console.log('Update errors:', err);
          setErrors(err);
          
          // Show a user-friendly error message if there are general errors
          if (err.general || err.message) {
            // You could optionally show a toast notification here
            console.error('Establishment update failed:', err.general || err.message);
          }
        },
        preserveState: false,
      });
    } else {
      // Create new establishment
      Inertia.post(`${routePrefix}/establishments`, form, {
        onSuccess: (page) => {
          console.log('Create successful:', page);
          setForm(initialForm);
          setErrors({});
          onClose();
        },
        onError: (err) => {
          console.log('Create errors:', err);
          setErrors(err);
          
          // Show a user-friendly error message if there are general errors
          if (err.general || err.message) {
            // You could optionally show a toast notification here
            console.error('Establishment creation failed:', err.general || err.message);
          }
          
          // If there are validation errors, scroll to the first error field
          if (err && Object.keys(err).length > 0) {
            const firstErrorField = Object.keys(err)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
              errorElement.focus();
              errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        },
        preserveState: false,
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
      setFieldValidation({ contact_number: '', duplicate_check: '' });
      setBusinessTypeSearch('');
      setBarangaySearch('');
      setShowBusinessTypeDropdown(false);
      setShowBarangayDropdown(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b pb-2 mb-3 px-4 pt-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingEstablishment ? 'Edit Establishment' : 'Add New Establishment'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form - Scrollable */}
        <form onSubmit={handleSubmit} className="space-y-3 flex-1 overflow-y-auto px-4 pb-4">
          {/* General Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm font-medium">{errors.general}</span>
              </div>
            </div>
          )}
          
          {/* Validation Errors Summary */}
          {Object.keys(errors).length > 0 && !errors.general && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
                <span className="text-amber-700 text-sm font-medium">
                  Please fix the {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? 's' : ''} below
                </span>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'name', label: 'Business Name', type: 'text' },
              { name: 'proponent', label: 'Proponent', type: 'text' },
              { name: 'address', label: 'Address', type: 'text' },
              { name: 'contact_number', label: 'Contact Number', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'type_of_business_id', label: 'Type of Business', type: 'select' },
              { name: 'Barangay', label: 'Barangay', type: 'select' },
              { name: 'total_capacity', label: 'Total Capacity', type: 'number' },
              { name: 'number_of_rooms', label: 'Number of Rooms', type: 'number' },
              { name: 'number_of_employees', label: 'Number of Employees', type: 'number' },
            ].map((field) => (
              <div key={field.name} className="flex flex-col">
                <label className="text-gray-600 text-sm font-medium mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <div className="flex flex-col">
                    {field.name === 'Barangay' ? (
                      <div className="flex flex-col">
                        <div className="relative">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search or type barangay..."
                              value={barangaySearch}
                              onChange={handleBarangaySearchChange}
                              onFocus={handleBarangayInputFocus}
                              onBlur={handleBarangayInputBlur}
                              className={`w-full pl-10 pr-10 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors[field.name] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <ChevronUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          
                          {/* Barangay Dropdown */}
                          {showBarangayDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredBarangays.length > 0 ? (
                                filteredBarangays.map((barangay, index) => (
                                  <div
                                    key={index}
                                    onClick={() => handleBarangaySelect(barangay)}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-gray-900">{barangay}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                  No barangays found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {errors[field.name] && (
                          <span className="text-red-500 text-xs mt-1">{errors[field.name]}</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search business type..."
                              value={businessTypeSearch}
                              onChange={handleBusinessTypeSearchChange}
                              onFocus={handleBusinessTypeInputFocus}
                              onBlur={handleBusinessTypeInputBlur}
                              className={`w-full pl-10 pr-10 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                errors[field.name] ? 'border-red-500' : 'border-gray-300'
                              }`}
                            />
                            <ChevronUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                          
                          {/* Dropdown */}
                          {showBusinessTypeDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                              {filteredBusinessTypes.length > 0 ? (
                                filteredBusinessTypes.map((type) => (
                                  <div
                                    key={type.id}
                                    onClick={() => handleBusinessTypeSelect(type)}
                                    className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-gray-900">{type.name}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                  No business types found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
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
                    )}
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
                      errors[field.name] ? 'border-red-500' : 
                      field.name === 'contact_number' && fieldValidation.contact_number === 'valid' ? 'border-green-500 bg-green-50' :
                      field.name === 'contact_number' && fieldValidation.contact_number === 'invalid' ? 'border-red-500 bg-red-50' :
                      field.name === 'name' && fieldValidation.duplicate_check === 'valid' ? 'border-green-500 bg-green-50' :
                      field.name === 'name' && fieldValidation.duplicate_check === 'invalid' ? 'border-red-500 bg-red-50' :
                      'border-gray-300'
                    }`}
                  />
                )}
                {errors[field.name] && (
                  <div className="flex items-start space-x-1 mt-1">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-500 text-xs font-medium">{errors[field.name]}</span>
                  </div>
                )}
                {/* Real-time validation feedback */}
                {!errors[field.name] && field.name === 'contact_number' && fieldValidation.contact_number === 'valid' && (
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-green-500 text-xs font-medium">✓ Valid 11-digit number</span>
                  </div>
                )}
                {!errors[field.name] && field.name === 'contact_number' && fieldValidation.contact_number === 'invalid' && (
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-red-500 text-xs font-medium">Must be exactly 11 digits</span>
                  </div>
                )}
                {!errors[field.name] && field.name === 'name' && fieldValidation.duplicate_check === 'valid' && (
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-green-500 text-xs font-medium">✓ Available</span>
                  </div>
                )}
                {/* Duplicate message - shows even when there's an error */}
                {field.name === 'name' && fieldValidation.duplicate_check === 'invalid' && (
                  <div className="flex items-center space-x-1 mt-1">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-red-500 text-xs font-medium">Duplicate establishment with same name and business type</span>
                  </div>
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
          <div className="flex justify-end space-x-2 mt-4 flex-shrink-0">
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
      
      {/* Duplicate Warning Modal */}
      {showDuplicateModal && duplicateSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Duplicate Entry Detected</h3>
              </div>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              <div className="mb-4">
                <p className="text-gray-600 text-sm mb-3">
                  An establishment with this name and business type already exists:
                </p>
                
                {/* Existing Establishment Details */}
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Establishment Name:</span>
                      <p className="text-sm font-medium text-gray-900">{duplicateSubmission.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Business Type:</span>
                      <p className="text-sm font-medium text-gray-900">{duplicateSubmission.business_type?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Proponent:</span>
                      <p className="text-sm text-gray-700">{duplicateSubmission.proponent || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Address:</span>
                      <p className="text-sm text-gray-700">{duplicateSubmission.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Solution:</strong> Please either change the establishment name or select a different business type to avoid duplication.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
