import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Dashboard() {
  const navigate = useNavigate();
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    fetchTotalIncomes();
    fetchTotalExpenses();
  }, []);

  const fetchTotalExpenses = async () => {
    const cacheKey = `dashboard_expenses_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        setTotalExpenses(data);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('monthly_expenses')
        .select('amount')
        .eq('anual', false)
        .gte('data', new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString())
        .lt('data', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString());

      if (error) throw error;

      const total = data.reduce((sum, expense) => sum + expense.amount, 0);
      setTotalExpenses(total);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        data: total,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching total expenses:', error);
    }
  };

  const fetchTotalIncomes = async () => {
    const cacheKey = `dashboard_incomes_${currentDate.getFullYear()}_${currentDate.getMonth()}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const cacheAge = Date.now() - timestamp;
      // Use cache if it's less than 5 minutes old
      if (cacheAge < 5 * 60 * 1000) {
        setTotalIncomes(data);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from('incomes')
        .select('amount')
        .gte('data', new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString())
        .lt('data', new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toISOString());

      if (error) throw error;

      const total = data.reduce((sum, income) => sum + income.amount, 0);
      setTotalIncomes(total);
      
      // Cache the result
      localStorage.setItem(cacheKey, JSON.stringify({
        data: total,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching total incomes:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-primary-300">Buget Personal</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition duration-150 ease-in-out transform hover:-translate-y-0.5"
              >
                Deconectare
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mb-20">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Balanță
              </h3>
              <p className={`text-2xl font-bold ${
                totalIncomes - totalExpenses >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {(totalIncomes - totalExpenses).toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Venituri
                </h3>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {totalIncomes.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-lg">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cheltuieli
                </h3>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {totalExpenses.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
