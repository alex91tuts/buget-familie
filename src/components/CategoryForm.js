import React, { useState, useEffect, useMemo } from 'react';
import { iconOptions } from '../utils/icons';

function CategoryForm({ onSubmit, onClose, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'expense',
    color: '#000000',
    icon: 'RiQuestionLine'
  });
  const [iconSearch, setIconSearch] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const filteredIcons = useMemo(() => 
    iconOptions.filter(({ name }) => 
      name.toLowerCase().includes(iconSearch.toLowerCase())
    ),
    [iconSearch]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            {initialData ? 'Edit Category' : 'Add Category'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 transition-all duration-200 ease-in-out hover:border-primary-400 h-12 px-4"
                required
              />
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 h-8 px-4"
              />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 h-8 px-4"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Icon
              <input
                type="text"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder="Search icons..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 mb-2 h-8 px-4"
              />
              <div className="mt-1 grid grid-cols-8 gap-2 p-2 max-h-40 overflow-y-auto border rounded-md dark:border-gray-600 scrollbar-thin scrollbar-thumb-primary-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
                {filteredIcons.map(({ name, Icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: name })}
                    className={`p-2 rounded-md transition-all duration-200 ease-in-out transform hover:scale-110 flex items-center justify-center ${
                      formData.icon === name 
                        ? 'bg-primary-100 dark:bg-primary-900 ring-2 ring-primary-500' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Color
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-8 w-8 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md transform transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {initialData ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CategoryForm;
