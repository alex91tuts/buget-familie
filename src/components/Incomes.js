import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AddIncomeForm from './AddIncomeForm';
import MonthSelector from './MonthSelector';
import { personas } from '../constants/personas';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';


function Incomes() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [totalIncomes, setTotalIncomes] = useState(0);

  useEffect(() => {
    fetchIncomes();
  }, [currentDate]);

  const deleteIncome = async (id) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        const income = incomes.find(inc => inc.id === id);
        const { error } = await supabase
          .from('incomes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        // Clear dashboard cache when income is deleted
        const date = new Date(income.data);
        const cacheKey = `dashboard_incomes_${date.getFullYear()}_${date.getMonth()}`;
        localStorage.removeItem(cacheKey);
        
        fetchIncomes();
      } catch (error) {
        alert('Error deleting income: ' + error.message);
      }
    }
  };

  const [editingIncome, setEditingIncome] = useState(null);

  async function fetchIncomes() {
    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('*')
        .gte('data', new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString())
        .lt('data', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      const incomeData = data || [];
      setIncomes(incomeData);
      
      // Calculate total incomes
      const total = incomeData.reduce((sum, income) => sum + income.amount, 0);
      setTotalIncomes(total);
    } catch (error) {
      alert('Error loading incomes: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 mb-20">
      <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
        Incomes
      </h2>
      <div className="flex justify-between items-center mb-4 text-sm">
        <MonthSelector 
          currentDate={currentDate} 
          onDateChange={setCurrentDate}
        />
        <div className="font-semibold text-gray-900 dark:text-white">
          Total: ${totalIncomes.toFixed(2)}
        </div>
      </div>
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-soft p-6">
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        ) : incomes.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No incomes yet. Add your first income!</p>
        ) : (
          <div className="space-y-4">
            {incomes.map((income) => (
              <div 
                key={income.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <img 
                      src={personas.find(p => p.id === income.persona)?.avatar} 
                      alt={personas.find(p => p.id === income.persona)?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        ${income.amount.toFixed(2)}
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {income.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(income.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setEditingIncome(income)}
                      className="p-1 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"
                      title="Edit"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteIncome(income.id)}
                      className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {income.description && (
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                    {income.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Income Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed right-4 bottom-20 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Add Income Form Modal */}
      {(showAddForm || editingIncome) && (
        <AddIncomeForm
          onClose={() => {
            setShowAddForm(false);
            setEditingIncome(null);
          }}
          onIncomeAdded={() => {
            fetchIncomes();
            setShowAddForm(false);
            setEditingIncome(null);
          }}
          editingIncome={editingIncome}
          currentDate={currentDate}
        />
      )}
    </div>
  );
}

export default Incomes;
