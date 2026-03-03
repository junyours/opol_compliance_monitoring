import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Link } from '@inertiajs/react';
import { useNotification } from '@/Components/ValidationSystem';
import Pagination from '@/Components/Pagination';
import {
    TagIcon,
    PlusIcon,
    TrashIcon,
    DocumentTextIcon,
    ListBulletIcon,
    PencilSquareIcon,
    XMarkIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

export default function Inspection({ auth }) {
  const { categories } = usePage().props;
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    showSuccess,
    showError,
    showWarning,
    showLoading,
    hideLoading,
    validateDuplicate,
    showDuplicateModal
  } = useNotification();

  const handleAddCategory = (e) => {
    e.preventDefault();
    
    // Validate input
    if (!newCategory || newCategory.trim() === '') {
      showError('Validation Error', 'Category name is required.');
      return;
    }

    if (newCategory.length < 2) {
      showError('Validation Error', 'Category name must be at least 2 characters long.');
      return;
    }

    // Check for duplicates
    const duplicates = validateDuplicate({ name: newCategory }, categories || [], ['name']);

    if (duplicates.length > 0) {
      showDuplicateModal(
        duplicates,
        () => {
          proceedWithAddCategory();
        },
        () => {
          showWarning('Cancelled', 'Category creation was cancelled due to duplicates.');
        }
      );
    } else {
      proceedWithAddCategory();
    }
  };

  const proceedWithAddCategory = () => {
    showLoading('Creating new category...');
    
    Inertia.post('/admin/inspection', { name: newCategory }, {
      onSuccess: () => {
        hideLoading();
        showSuccess('Success!', 'Category created successfully.');
        setNewCategory('');
      },
      onError: (errors) => {
        hideLoading();
        showError('Error', errors.message || 'Failed to create category.');
      }
    });
  };

  const handleDeleteCategory = (id) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      showLoading('Deleting category...');
      Inertia.delete(`/admin/inspection/${id}`, {}, {
        onSuccess: () => {
          hideLoading();
          showSuccess('Success!', 'Category deleted successfully.');
        },
        onError: (errors) => {
          hideLoading();
          showError('Error', errors.message || 'Failed to delete category.');
        }
      });
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditCategoryName(category.name);
  };

  const handleUpdateCategory = (id) => {
    // Validate input
    if (!editCategoryName || editCategoryName.trim() === '') {
      showError('Validation Error', 'Category name is required.');
      return;
    }

    if (editCategoryName.length < 2) {
      showError('Validation Error', 'Category name must be at least 2 characters long.');
      return;
    }

    // Check for duplicates (excluding current category)
    const otherCategories = categories?.filter(cat => cat.id !== id) || [];
    const duplicates = validateDuplicate({ name: editCategoryName }, otherCategories, ['name']);

    if (duplicates.length > 0) {
      showDuplicateModal(
        duplicates,
        () => {
          proceedWithUpdateCategory(id);
        },
        () => {
          showWarning('Cancelled', 'Category update was cancelled due to duplicates.');
        }
      );
    } else {
      proceedWithUpdateCategory(id);
    }
  };

  const proceedWithUpdateCategory = (id) => {
    showLoading('Updating category...');
    
    Inertia.put(`/admin/inspection/${id}`, { name: editCategoryName }, {
      onSuccess: () => {
        hideLoading();
        showSuccess('Success!', 'Category updated successfully.');
        setEditingCategory(null);
        setEditCategoryName('');
      },
      onError: (errors) => {
        hideLoading();
        showError('Error', errors.message || 'Failed to update category.');
      }
    });
  };

  const toRoman = (num) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][num] || (num + 1);

  const filteredCategories = (categories || []).filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
              <TagIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Inspection Categories</h2>
              <p className="text-sm text-gray-500">Organize inspection types and requirements</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{categories.length}</p>
              <p className="text-xs text-gray-500">Total Categories</p>
            </div>
          </div>
        </div>
      }
    >
      <Head title="Inspection Categories" />

      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="w-full space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                  <ListBulletIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Categories</h3>
                  <p className="text-sm text-gray-500">Manage inspection categories and their order</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{totalItems}</p>
                  <p className="text-xs text-gray-500">Total Categories</p>
                </div>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mt-4">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Add new category */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category name..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              />
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-gray-900">Category List</h4>
                <div className="text-xs text-gray-600">
                  {paginatedCategories.length} of {totalItems} categories
                </div>
              </div>
            </div>
            <div className="p-6">
              {paginatedCategories.length > 0 ? (
                <ol className="space-y-3">
                  {paginatedCategories.map((cat, index) => (
                    <li
                      key={cat.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {toRoman(index)}
                        </div>
                        <div>
                          {editingCategory === cat.id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                placeholder="Edit category name..."
                              />
                              <button
                                onClick={() => handleUpdateCategory(cat.id)}
                                className="inline-flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                              >
                                <PlusIcon className="w-4 h-4 mr-1" />
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCategory(null);
                                  setEditCategoryName('');
                                }}
                                className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                              >
                                <XMarkIcon className="w-4 h-4 mr-1" />
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <div>
                                <h5 className="text-lg font-bold text-gray-900">{cat.name}</h5>
                                <p className="text-sm text-gray-500">Category #{index + 1}</p>
                              </div>
                              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                  onClick={() => handleEditCategory(cat)}
                                  className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                                >
                                  <PencilSquareIcon className="w-4 h-4 mr-1" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                                >
                                  <TrashIcon className="w-4 h-4 mr-1" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-center py-12">
                  <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <TagIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {searchTerm ? 'No Categories Found' : 'No Categories Available'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'Try adjusting your search terms' : 'Create your first category to start organizing inspections.'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
