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
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState('text');
  const [editOptions, setEditOptions] = useState([{ text: '', type: 'neutral' }]);
  const [editIsConditional, setEditIsConditional] = useState(false);
  const [editConditionalLogic, setEditConditionalLogic] = useState(null);
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
    console.log('Editing question:', question);
    console.log('Setting editingQuestion to:', question.id);
    console.log('Setting editText to:', question.question);
    console.log('Question conditional_logic:', question.conditional_logic);
    console.log('Question is_conditional:', question.is_conditional);
    
    setEditingQuestion(question.id);
    setEditText(question.question);
    setEditType(question.type || 'text');
    setEditOptions(question.options && question.options.length > 0 ? question.options : [{ text: '', type: 'neutral' }]);
    setEditIsConditional(question.is_conditional || false);
    setEditConditionalLogic(question.conditional_logic || null);
  };

  const handleUpdateQuestion = (id) => {
    const updateData = {
      question: editText,
      type: editType,
      options: editType !== 'text' ? editOptions.filter(opt => opt.text && opt.text.trim() !== '') : [],
      is_conditional: editIsConditional,
      conditional_logic: editIsConditional ? editConditionalLogic : null
    };

    console.log('Updating question with data:', updateData);

    Inertia.put(route('admin.inspection.checklist.update', id), updateData, {
      onSuccess: () => {
        setEditingQuestion(null);
        setEditText('');
        setEditType('text');
        setEditOptions([{ text: '', type: 'neutral' }]);
        setEditIsConditional(false);
        setEditConditionalLogic(null);
      }
    });
  };

  const addEditOption = () => {
    setEditOptions([...editOptions, { text: '', type: 'neutral' }]);
  };

  const updateEditOption = (index, value) => {
    const newOptions = [...editOptions];
    newOptions[index] = value;
    setEditOptions(newOptions);
  };

  const removeEditOption = (index) => {
    setEditOptions(editOptions.filter((_, i) => i !== index));
  };

  const handleEditConditionalLogic = () => {
    setShowConditionalModal(true);
  };

  const handleSaveEditConditionalLogic = (logic) => {
    setEditConditionalLogic(logic);
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
      
        <div className="w-full px-3 sm:px-4 lg:px-8 py-4 sm:py-8 space-y-6">
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

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories && categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{formatCategoryName(cat.name)}</h3>
                      <p className="text-indigo-100 text-sm mt-1">
                        {cat.questions ? cat.questions.length : 0} questions
                      </p>
                    </div>
                    <div className="bg-white bg-opacity-20 rounded-lg p-2 ml-3">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="p-6">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {cat.questions && cat.questions.length > 0 ? (
                      cat.questions.map((q, index) => (
                        <div key={q.id} className="group bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0 pr-3">
                              <p className="text-sm font-medium text-gray-900">
                                <span className="text-indigo-600 font-bold mr-2">{index + 1}.</span>
                                {q.question}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                  {q.type || 'text'}
                                </span>
                                {q.is_conditional && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    <LightBulbIcon className="w-3 h-3 mr-1" />
                                    Conditional
                                  </span>
                                )}
                                {q.options && q.options.length > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                    {q.options.length} options
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => handleEditQuestion(q)}
                                className="inline-flex items-center px-2 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <PencilSquareIcon className="w-3 h-3 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="inline-flex items-center px-2 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <TrashIcon className="w-3 h-3 mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                          {console.log('Render check - editingQuestion:', editingQuestion, 'q.id:', q.id, 'Should show edit:', editingQuestion === q.id)}
                          {editingQuestion === q.id && (
                            <div className="mt-3 p-4 bg-white rounded-lg border border-indigo-200 shadow-sm">
                              <div className="space-y-4">
                                {/* Question Text */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                                  <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Edit question..."
                                  />
                                </div>

                                {/* Question Type */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                                  <select
                                    value={editType}
                                    onChange={(e) => setEditType(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="text">Text</option>
                                    <option value="textarea">Textarea</option>
                                    <option value="radio">Radio</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="select">Select</option>
                                  </select>
                                </div>

                                {/* Options for Radio/Checkbox/Select */}
                                {(editType === 'radio' || editType === 'checkbox' || editType === 'select') && (
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                    <div className="space-y-2">
                                      {editOptions.map((option, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                          <input
                                            type="text"
                                            value={option.text}
                                            onChange={(e) => updateEditOption(index, { ...option, text: e.target.value })}
                                            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Option text..."
                                          />
                                          <select
                                            value={option.type}
                                            onChange={(e) => updateEditOption(index, { ...option, type: e.target.value })}
                                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                          >
                                            <option value="positive">Positive</option>
                                            <option value="negative">Negative</option>
                                            <option value="neutral">Neutral</option>
                                          </select>
                                          {editOptions.length > 1 && (
                                            <button
                                              onClick={() => removeEditOption(index)}
                                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                              <XMarkIcon className="w-4 h-4" />
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                      <button
                                        onClick={addEditOption}
                                        className="flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      >
                                        <PlusIcon className="w-4 h-4 mr-1" />
                                        Add Option
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Conditional Question */}
                                <div>
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={editIsConditional}
                                      onChange={(e) => setEditIsConditional(e.target.checked)}
                                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Conditional Question</span>
                                  </label>
                                  {editIsConditional && (
                                    <button
                                      onClick={handleEditConditionalLogic}
                                      className="ml-4 inline-flex items-center px-3 py-2 border border-indigo-300 text-sm leading-4 font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                      <Cog6ToothIcon className="w-4 h-4 mr-1" />
                                      Configure Logic
                                    </button>
                                  )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-2 pt-2 border-t">
                                  <button
                                    onClick={() => {
                                      setEditingQuestion(null);
                                      setEditText('');
                                      setEditType('text');
                                      setEditOptions([{ text: '', type: 'neutral' }]);
                                      setEditIsConditional(false);
                                      setEditConditionalLogic(null);
                                    }}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                  >
                                    <XMarkIcon className="w-4 h-4 mr-1" />
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdateQuestion(q.id)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                  >
                                    <PlusIcon className="w-4 h-4 mr-1" />
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 font-medium">No questions in this category</p>
                        <p className="text-xs text-gray-400 mt-1">Click "Add Question" to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
      
      <ConditionalQuestionModal
        show={showConditionalModal}
        onClose={() => setShowConditionalModal(false)}
        onSave={handleSaveEditConditionalLogic}
        conditionalLogic={editConditionalLogic}
        setConditionalLogic={setEditConditionalLogic}
        questionOptions={editingQuestion 
          ? (editType !== 'text' ? editOptions.filter(opt => opt.text && opt.text.trim() !== '') : [])
          : (questionType !== 'text' ? options.filter(opt => opt.text && opt.text.trim() !== '') : [])
        }
      />
    </AuthenticatedLayout>
  );
}
