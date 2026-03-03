import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import AddQuestionModal from '@/Components/AddQuestionModal';
import ConditionalQuestionModal from '@/Components/ConditionalQuestionModal';
import {
    ClipboardDocumentListIcon,
    PlusIcon,
    QuestionMarkCircleIcon,
    DocumentTextIcon,
    Cog6ToothIcon,
    SquaresPlusIcon,
    PencilSquareIcon,
    TrashIcon,
    ChartBarIcon,
    LightBulbIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function Checklist({ auth }) {
  const { category, questions, categories } = usePage().props;
  const [newQuestion, setNewQuestion] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [options, setOptions] = useState([{ text: '', type: 'neutral' }]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestionData, setEditingQuestionData] = useState(null);
  const [responses, setResponses] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showConditionalModal, setShowConditionalModal] = useState(false);
  const [conditionalLogic, setConditionalLogic] = useState(null);
  const [isConditional, setIsConditional] = useState(false);

  const formatCategoryName = (name) => {
    return name
      .split('/')
      .map(part => part.trim())
      .join(' / ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleAddQuestion = () => {
    if (!newQuestion || !selectedCategory) return;
    
    const questionData = {
      question: newQuestion,
      type: questionType,
      options: questionType !== 'text' ? options.filter(opt => opt.text && opt.text.trim() !== '') : [],
      is_conditional: isConditional,
      conditional_logic: isConditional ? conditionalLogic : null
    };

    Inertia.post(route('admin.inspection.checklist.store', selectedCategory), questionData, {
      onSuccess: () => {
        setNewQuestion('');
        setQuestionType('text');
        setOptions([{ text: '', type: 'neutral' }]);
        setShowAddModal(false);
        setSelectedCategory('');
        setIsConditional(false);
        setConditionalLogic(null);
      }
    });
  };

  const handleDeleteQuestion = (id) => {
    if (confirm('Are you sure you want to delete this question?')) {
      Inertia.delete(route('admin.inspection.checklist.destroy', id));
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestionData({
      ...question,
      options: question.options && question.options.length > 0 ? question.options : [{ text: '', type: 'neutral' }]
    });
    setShowEditModal(true);
  };

  const handleUpdateQuestion = () => {
    const updateData = {
      question: editingQuestionData.question,
      type: editingQuestionData.type,
      options: editingQuestionData.type !== 'text' ? editingQuestionData.options.filter(opt => opt.text && opt.text.trim() !== '') : [],
      is_conditional: editingQuestionData.is_conditional,
      conditional_logic: editingQuestionData.is_conditional ? editingQuestionData.conditional_logic : null
    };

    Inertia.put(route('admin.inspection.checklist.update', editingQuestionData.id), updateData, {
      onSuccess: () => {
        setShowEditModal(false);
        setEditingQuestionData(null);
      }
    });
  };

  const addEditOption = () => {
    setEditingQuestionData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', type: 'neutral' }]
    }));
  };

  const updateEditOption = (index, value) => {
    setEditingQuestionData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return { ...prev, options: newOptions };
    });
  };

  const removeEditOption = (index) => {
    setEditingQuestionData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleEditConditionalLogic = () => {
    setShowConditionalModal(true);
  };

  const handleSaveEditConditionalLogic = (logic) => {
    setEditingQuestionData(prev => ({
      ...prev,
      conditional_logic: logic
    }));
    setShowConditionalModal(false);
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const addOption = () => {
    setOptions([...options, { text: '', type: 'neutral' }]);
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmitQuestionnaire = (e) => {
    e.preventDefault();
    Inertia.post(route('admin.inspection.checklist.category.submit', category.id), { responses });
  };

  const handleConfigureConditional = () => {
    setShowConditionalModal(true);
  };

  const handleSaveConditionalLogic = (logic) => {
    setConditionalLogic(logic);
    setIsConditional(true);
  };

  const renderQuestionInput = (question) => {
    const commonProps = {
      className: "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    };

    switch (question.type) {
      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={responses[question.id]?.includes(option) || false}
                  onChange={(e) => {
                    const current = responses[question.id] || [];
                    if (e.target.checked) {
                      handleResponseChange(question.id, [...current, option]);
                    } else {
                      handleResponseChange(question.id, current.filter(item => item !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={responses[question.id] === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
      case 'select':
        return (
          <select
            {...commonProps}
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={3}
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your response..."
          />
        );
      default:
        return (
          <input
            {...commonProps}
            type="text"
            value={responses[question.id] || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder="Enter your response..."
          />
        );
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
              <ClipboardDocumentListIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Checklist Management</h2>
              <p className="text-sm text-gray-500">Create and manage inspection questions</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Question
          </button>
        </div>

        
      } 
    >

            <Head title="Check List" />
      
        <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-8 space-y-6 pr-4 lg:pr-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600">Categories</dt>
                      <dd className="text-2xl font-bold text-gray-900">{categories ? categories.length : 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <QuestionMarkCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600">Questions</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {categories ? categories.reduce((total, cat) => total + (cat.questions ? cat.questions.length : 0), 0) : 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <LightBulbIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600">Conditional</dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {categories ? categories.reduce((total, cat) => {
                          if (!cat.questions) return total;
                          return total + cat.questions.filter(q => q.is_conditional).length;
                        }, 0) : 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600">Types</dt>
                      <dd className="text-2xl font-bold text-gray-900">4</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
              <h3 className="text-lg font-semibold text-gray-900">Categories & Questions</h3>
              <p className="text-sm text-gray-600 mt-1">Manage all inspection questions organized by category</p>
            </div>
            
            <div className="mb-6">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Question
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Properties
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories && categories.map((cat) => {
                    const questionCount = cat.questions ? cat.questions.length : 0;
                    const rowSpan = questionCount > 0 ? questionCount : 1;
                    
                    return (
                      <React.Fragment key={cat.id}>
                        {cat.questions && cat.questions.length > 0 ? (
                          cat.questions.map((q, index) => (
                            <tr key={q.id} className="hover:bg-gray-50 transition-colors duration-150">
                              {index === 0 && (
                                <td 
                                  rowSpan={rowSpan} 
                                  className="px-6 py-4 whitespace-nowrap align-top bg-gradient-to-br from-indigo-50 to-indigo-100 border-r border-indigo-200"
                                >
                                  <div className="flex items-center">
                                    <div className="p-2 bg-indigo-600 rounded-lg mr-3">
                                      <DocumentTextIcon className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-900">
                                        {formatCategoryName(cat.name)}
                                      </div>
                                      <div className="text-xs text-gray-600 mt-1">
                                        {questionCount} question{questionCount !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              )}
                              <td className="px-6 py-4">
                                <div className="flex items-start">
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mr-3 flex-shrink-0">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                      {q.question}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  {q.type || 'text'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {q.is_conditional && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                      <LightBulbIcon className="w-3 h-3 mr-1" />
                                      Conditional
                                    </span>
                                  )}
                                  {q.options && q.options.length > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      {q.options.length} option{q.options.length !== 1 ? 's' : ''}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleEditQuestion(q)}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                                  >
                                    <PencilSquareIcon className="w-3 h-3 mr-1" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-150"
                                  >
                                    <TrashIcon className="w-3 h-3 mr-1" />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr key={cat.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-8 whitespace-nowrap bg-gradient-to-br from-indigo-50 to-indigo-100 border-r border-indigo-200">
                              <div className="flex items-center">
                                <div className="p-2 bg-indigo-600 rounded-lg mr-3">
                                  <DocumentTextIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {formatCategoryName(cat.name)}
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    No questions
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td colSpan="4" className="px-6 py-8 text-center">
                              <div className="flex flex-col items-center">
                                <QuestionMarkCircleIcon className="h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-500 font-medium">No questions in this category</p>
                                <p className="text-xs text-gray-400 mt-1">Click "Add Question" to get started</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {(!categories || categories.length === 0) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <ClipboardDocumentListIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No Categories Found</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">Get started by creating your first category and adding questions to build your inspection checklist.</p>
            </div>
          )}
        </div>
      
      <AddQuestionModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddQuestion}
        newQuestion={newQuestion}
        setNewQuestion={setNewQuestion}
        questionType={questionType}
        setQuestionType={setQuestionType}
        options={options}
        setOptions={setOptions}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        isConditional={isConditional}
        setIsConditional={setIsConditional}
        onConfigureConditional={handleConfigureConditional}
      />
      
      {/* Edit Question Modal */}
      {showEditModal && editingQuestionData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowEditModal(false)}></div>
            
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PencilSquareIcon className="w-6 h-6 text-white mr-3" />
                    <h3 className="text-lg font-semibold text-white">Edit Question</h3>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Question Text */}
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                    <input
                      type="text"
                      value={editingQuestionData.question || ''}
                      onChange={(e) => setEditingQuestionData(prev => ({ ...prev, question: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Edit question..."
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                    <select
                      value={editingQuestionData.type || 'text'}
                      onChange={(e) => setEditingQuestionData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="text">Text</option>
                      <option value="textarea">Textarea</option>
                      <option value="radio">Radio</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="select">Select</option>
                    </select>
                  </div>

                  {/* Conditional Question */}
                  <div>
                    <label className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        checked={editingQuestionData.is_conditional || false}
                        onChange={(e) => setEditingQuestionData(prev => ({ ...prev, is_conditional: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Conditional Question</span>
                    </label>
                    {editingQuestionData.is_conditional && (
                      <button
                        onClick={handleEditConditionalLogic}
                        className="ml-4 mt-3 inline-flex items-center px-4 py-2 border border-indigo-300 text-sm leading-4 font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Configure Logic
                      </button>
                    )}
                  </div>
                </div>

                {/* Options for Radio/Checkbox/Select */}
                {(editingQuestionData.type === 'radio' || editingQuestionData.type === 'checkbox' || editingQuestionData.type === 'select') && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Options</label>
                    <div className="space-y-3">
                      {editingQuestionData.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={option.text || ''}
                            onChange={(e) => updateEditOption(index, { ...option, text: e.target.value })}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Option text..."
                          />
                          <select
                            value={option.type || 'neutral'}
                            onChange={(e) => updateEditOption(index, { ...option, type: e.target.value })}
                            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="positive">Positive</option>
                            <option value="negative">Negative</option>
                            <option value="neutral">Neutral</option>
                          </select>
                          {editingQuestionData.options.length > 1 && (
                            <button
                              onClick={() => removeEditOption(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addEditOption}
                        className="flex items-center px-4 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingQuestionData(null);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateQuestion}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ConditionalQuestionModal
        show={showConditionalModal}
        onClose={() => setShowConditionalModal(false)}
        onSave={handleSaveEditConditionalLogic}
        conditionalLogic={editingQuestionData?.conditional_logic}
        setConditionalLogic={(logic) => setEditingQuestionData(prev => ({ ...prev, conditional_logic: logic }))}
        questionOptions={editingQuestionData?.type !== 'text' ? editingQuestionData?.options?.filter(opt => opt.text && opt.text.trim() !== '') : []}
      />
    </AuthenticatedLayout>
  );
}
