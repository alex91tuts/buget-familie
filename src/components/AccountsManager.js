import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function AccountsManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    purpose: '',
    owner: '',
    account_number: '',
    type: '',
    balance: '',
    currency: 'EUR',
    description: '',
    color: '#6366f1'  // Default color matching your primary theme
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAccounts(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching accounts:', error.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        const { error } = await supabase
          .from('accounts')
          .update(formData)
          .eq('id', editingAccount.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert([formData]);
        if (error) throw error;
      }
      
      setShowForm(false);
      setEditingAccount(null);
      setFormData({
        name: '',
        bank: '',
        purpose: '',
        owner: '',
        account_number: '',
        type: '',
        balance: '',
        currency: 'EUR',
        description: ''
      });
      fetchAccounts();
    } catch (error) {
      console.error('Error saving account:', error.message);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData(account);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const { error } = await supabase
          .from('accounts')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account:', error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-end">
          <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          Add Account
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank</label>
              <input
                type="text"
                name="bank"
                value={formData.bank}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purpose</label>
              <input
                type="text"
                name="purpose"
                value={formData.purpose}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner</label>
              <input
                type="text"
                name="owner"
                value={formData.owner}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
              <input
                type="text"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                required
              >
                <option value="">Select type</option>
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="credit">Credit</option>
                <option value="investment">Investment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Balance</label>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                maxLength="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Card Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="mt-1 block w-full h-8 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingAccount(null);
                setFormData({
                  name: '',
                  bank: '',
                  purpose: '',
                  owner: '',
                  account_number: '',
                  type: '',
                  balance: '',
                  currency: 'EUR',
                  description: '',
                  color: '#6366f1'
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              {editingAccount ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="space-y-4">
          {accounts.map(account => (
            <div 
              key={account.id} 
              className="p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-600"
              style={{
                background: `linear-gradient(135deg, ${account.color}20 0%, ${account.color}40 100%)`,
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{account.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{account.bank}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{account.purpose}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Balance: {account.balance} {account.currency}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(account)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountsManager;
