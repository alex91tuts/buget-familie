import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { personas } from '../constants/personas';
import { commonIcons } from '../utils/icons';

function AddIncomeForm({ onClose, onIncomeAdded, editingIncome, currentDate }) {
  const [formData, setFormData] = useState(
    editingIncome || {
      amount: '',
      description: '',
      category: '',
      persona: '',
      data: new Date().toISOString().split('T')[0]
    }
  );
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isValidCategory, setIsValidCategory] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    fetchCategories();
    
    // Set isValidCategory to true when editing
    if (editingIncome) {
      setIsValidCategory(true);
    }
  }, [editingIncome]);

  const fetchCategories = async () => {
    const cacheKey = 'income_categories';
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
        .eq('type', 'income')
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
    setLoading(true);

    try {
      const { data, error } = editingIncome
        ? await supabase
            .from('incomes')
            .update({
              amount: parseFloat(formData.amount),
              description: formData.description,
              category: formData.category,
              persona: formData.persona,
              data: formData.data,
              user_id: user?.id
            })
            .eq('id', editingIncome.id)
        : await supabase
            .from('incomes')
            .insert([
              {
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: formData.category,
                persona: formData.persona,
                data: formData.data,
                user_id: user?.id
              }
            ]);

      if (error) throw error;

      // Clear dashboard cache when income is added/updated
      const currentDate = new Date(formData.data);
      const cacheKey = `dashboard_incomes_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
      localStorage.removeItem(cacheKey);

      onIncomeAdded();
      onClose();
    } catch (error) {
      alert('Error adding income: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {editingIncome ? 'Edit Income' : 'Add New Income'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                Persona
              </label>
              <select
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                value={formData.persona}
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
              >
                <option value="">Al cui este?</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
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
              <textarea
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              disabled={loading || !isValidCategory}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-primary-300"
            >
              {loading ? 'Saving...' : (editingIncome ? 'Save Changes' : 'Add Income')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddIncomeForm;
