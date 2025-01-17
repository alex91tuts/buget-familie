import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { personas } from '../constants/personas';
import { commonIcons } from '../utils/icons';

function AddExpenseForm({ onClose, onExpenseAdded, editingExpense }) {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isValidCategory, setIsValidCategory] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState(
    editingExpense || {
      amount: '',
      description: '',
      category: '',
      persona: '',
      data: new Date().toISOString().split('T')[0],
      annual: false
    }
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchCategories();
    
    // Set isValidCategory to true when editing
    if (editingExpense) {
      setIsValidCategory(true);
    }
  }, [editingExpense]);

  const fetchCategories = async () => {
    const cacheKey = 'expense_categories';
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        setCategories(data);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'expense')
        .order('name');
      
      if (error) throw error;
      
      setCategories(data || []);
      localStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('monthly_expenses')
          .update({
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category,
            persona: formData.persona,
            data: formData.data,
            anual: formData.annual,
            user_id: user?.id
          })
          .eq('id', editingExpense.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('monthly_expenses')
          .insert({
            amount: parseFloat(formData.amount),
            description: formData.description,
            category: formData.category,
            persona: formData.persona,
            data: formData.data,
            anual: formData.annual,
            user_id: user?.id
          });

        if (error) throw error;
      }

      // Clear dashboard cache when expense is added/updated
      const currentDate = new Date(formData.data);
      const cacheKey = `dashboard_expenses_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
      localStorage.removeItem(cacheKey);

      onExpenseAdded();
      onClose();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-dark-800">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  value={formData.category}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, category: value });
                    setIsValidCategory(categories.some(cat => cat.name === value));
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Type to search categories..."
                />
                {formData.category && showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {categories
                      .filter(cat => cat.name.toLowerCase().includes(formData.category.toLowerCase()))
                      .map((category) => (
                        <div
                          key={category.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                          onClick={() => {
                            setFormData({ ...formData, category: category.name });
                            setIsValidCategory(true);
                            setShowDropdown(false);
                          }}
                        >
                          {category.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Who made it
              </label>
              <select
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                value={formData.persona}
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
              >
                <option value="">Select who made it</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.name}>
                    {persona.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="annual"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                checked={formData.annual}
                onChange={(e) => setFormData({ ...formData, annual: e.target.checked })}
              />
              <label htmlFor="annual" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Annual Expense
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-lg ${
                  isValidCategory 
                    ? 'bg-primary-600 text-white hover:bg-primary-700' 
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
                disabled={!isValidCategory}
              >
                {editingExpense ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddExpenseForm;
