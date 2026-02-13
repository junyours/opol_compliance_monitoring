import React from 'react';
import {
    XMarkIcon,
    PlusIcon,
    TrashIcon,
    QuestionMarkCircleIcon,
    TagIcon,
    Cog6ToothIcon,
    CheckCircleIcon,
    XCircleIcon,
    MinusCircleIcon
} from '@heroicons/react/24/outline';

const AddQuestionModal = ({ 
  show, 
  onClose, 
  onSubmit, 
  newQuestion, 
  setNewQuestion, 
  questionType, 
  setQuestionType, 
  options, 
  setOptions, 
  categories, 
  selectedCategory, 
  setSelectedCategory,
  isConditional,
  setIsConditional,
  onConfigureConditional
}) => {
  if (!show) return null;

  const addOption = () => {
    setOptions([...options, { text: '', type: 'neutral' }]);
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 border-b border-indigo-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <QuestionMarkCircleIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Add New Question</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <TagIcon className="w-4 h-4" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              >
                <option value="">Select a category</option>
                {categories && categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Text */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <QuestionMarkCircleIcon className="w-4 h-4" />
                Question Text
              </label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                required
              />
            </div>

            {/* Question Type */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                <Cog6ToothIcon className="w-4 h-4" />
                Question Type
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value="text">Text Input</option>
                <option value="textarea">Text Area</option>
                <option value="radio">Radio Button</option>
                <option value="checkbox">Checkbox</option>
                <option value="select">Select Dropdown</option>
              </select>
            </div>

            {/* Options Section */}
            {(questionType === 'radio' || questionType === 'checkbox' || questionType === 'select') && (
              <div>
                <label className="flex items-center justify-between text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center space-x-2">
                    <PlusIcon className="w-4 h-4" />
                    Options
                  </div>
                  <span className="text-xs text-gray-500">{options.length} option(s)</span>
                </label>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {options.map((option, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors duration-200">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={option.text || ''}
                            onChange={(e) => updateOption(index, 'text', e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                          {options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="inline-flex items-center px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 text-sm font-medium"
                            >
                              <TrashIcon className="w-3 h-3 mr-1" />
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-semibold text-gray-600">Response Type:</span>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`option-type-${index}`}
                              value="positive"
                              checked={option.type === 'positive'}
                              onChange={(e) => updateOption(index, 'type', e.target.value)}
                              className="mr-2 text-green-600 focus:ring-green-500 w-4 h-4"
                            />
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Positive
                            </span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`option-type-${index}`}
                              value="negative"
                              checked={option.type === 'negative'}
                              onChange={(e) => updateOption(index, 'type', e.target.value)}
                              className="mr-2 text-red-600 focus:ring-red-500 w-4 h-4"
                            />
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              <XCircleIcon className="w-3 h-3 mr-1" />
                              Negative
                            </span>
                          </label>
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={`option-type-${index}`}
                              value="neutral"
                              checked={option.type === 'neutral'}
                              onChange={(e) => updateOption(index, 'type', e.target.value)}
                              className="mr-2 text-gray-600 focus:ring-gray-500 w-4 h-4"
                            />
                            <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              <MinusCircleIcon className="w-3 h-3 mr-1" />
                              Neutral
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-3 inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium shadow-md"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Option
                </button>
              </div>
            )}

            {/* Conditional Logic */}
            <div>
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={isConditional}
                    onChange={(e) => setIsConditional(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    Make this question conditional
                  </span>
                </div>
                {isConditional && (
                  <button
                    type="button"
                    onClick={onConfigureConditional}
                    className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                  >
                    <Cog6ToothIcon className="w-3 h-3 mr-1" />
                    Configure Logic
                  </button>
                )}
              </label>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal;
