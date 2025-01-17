import React from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';
import AccountsManager from './AccountsManager';

function Settings() {
  const { darkMode, setDarkMode } = useTheme();
  
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Account</h2>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>

        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Appearance</h2>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                darkMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Categories</h2>
          <Link
            to="/categories"
            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            Manage Categories
          </Link>
        </div>

        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Accounts</h2>
          <Link
            to="/accounts"
            className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            Manage Accounts
          </Link>
        </div>

        <div className="border-b pb-6">
          <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">About</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;
