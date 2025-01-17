import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import AddExpenseForm from './AddExpenseForm';
import MonthSelector from './MonthSelector';
import YearSelector from './YearSelector';

function MonthlyExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenseType, setExpenseType] = useState('lunare'); // 'lunare' or 'anuale'

  useEffect(() => {
    fetchExpenses();
  }, [currentDate, expenseType]);

  const handleMonthChange = (date) => {
    setCurrentDate(date);
  };

  const getCacheKey = (date, type) => {
    if (type === 'lunare') {
      return `expenses_${date.getFullYear()}_${date.getMonth()}_${type}`;
    }
    return `expenses_${date.getFullYear()}_${type}`;
  };

  const fetchExpenses = async () => {
    const cacheKey = getCacheKey(currentDate, expenseType);
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        setExpenses(data);
        const total = data.reduce((sum, expense) => sum + expense.amount, 0);
        setTotalExpenses(total);
        setLoading(false);
        return;
      }
    }
    try {
      setLoading(true);
      
      // Determine date range based on expense type
      let startDate, endDate;
      if (expenseType === 'lunare') {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else {
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31);
      }

      // Fetch expenses with combined filters
      const { data, error } = await supabase
        .from('monthly_expenses')
        .select('*')
        .eq('anual', expenseType === 'anuale' ? true : false)
        .gte('data', startDate.toISOString())
        .lte('data', endDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const expensesData = data || [];
      setExpenses(expensesData);
      const total = expensesData.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);
      setLoading(false);

      // Cache the fetched data
      localStorage.setItem(cacheKey, JSON.stringify({
        data: expensesData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setLoading(false);
    }
  };

  const clearCache = useCallback((date) => {
    // Clear expenses cache
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('expenses_')) {
        keys.push(key);
      }
    }
    keys.forEach(key => localStorage.removeItem(key));

    // Clear dashboard cache for the affected month
    const dashboardKey = `dashboard_expenses_${date.getFullYear()}_${date.getMonth()}`;
    localStorage.removeItem(dashboardKey);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        const { error } = await supabase
          .from('monthly_expenses')
          .delete()
          .eq('id', id);

        if (error) throw error;
        clearCache(new Date(expenses.find(e => e.id === id).data));
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  return (
    <div className="container mx-auto px-4 pb-20 relative">
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Cheltuieli
            </h1>
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  expenseType === 'lunare'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => {
                  setExpenseType('lunare');
                  fetchExpenses();
                }}
              >
                Lunare
              </button>
              <button
                className={`px-4 py-2 rounded-md transition-colors ${
                  expenseType === 'anuale'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => {
                  setExpenseType('anuale');
                  fetchExpenses();
                }}
              >
                Anuale
              </button>
            </div>
          </div>
        </div>

        {expenseType === 'lunare' ? (
          <MonthSelector currentDate={currentDate} onDateChange={handleMonthChange} />
        ) : (
          <YearSelector currentDate={currentDate} onDateChange={handleMonthChange} />
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Total {expenseType === 'lunare' ? 'Lunar' : 'Anual'}
          </h2>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {totalExpenses.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
          </p>
        </div>
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                Nu există cheltuieli {expenseType === 'lunare' ? 'pentru această lună' : 'pentru acest an'}
              </p>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {expense.description}
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>{new Date(expense.data).toLocaleDateString('ro-RO')}</p>
                        <p>Category: {expense.category}</p>
                        <p>Made by: {expense.persona}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-bold text-red-600 dark:text-red-400">
                        {expense.amount.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
                      </p>
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {showAddForm && (
        <AddExpenseForm
          onClose={() => setShowAddForm(false)}
          onExpenseAdded={() => {
            clearCache(new Date(editingExpense?.data || currentDate));
            fetchExpenses();
            setShowAddForm(false);
          }}
          editingExpense={editingExpense}
          expenseType={expenseType}
        />
      )}
      <button
        onClick={() => {
          setEditingExpense(null);
          setShowAddForm(true);
        }}
        className="fixed bottom-20 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 flex items-center justify-center"
        aria-label="Add Expense"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

export default MonthlyExpenses;
