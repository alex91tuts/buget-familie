import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { RiAddLine } from 'react-icons/ri';
import { commonIcons } from '../utils/icons';
import CategoryForm from './CategoryForm';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      setEditingCategory(null);
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Categories</h1>
      
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowForm(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md flex items-center"
        >
          <RiAddLine className="mr-2" /> Add Category
        </button>
      </div>

      {showForm && (
        <CategoryForm
          onSubmit={handleSave}
          onClose={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
          initialData={editingCategory}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {loading ? (
            <p className="p-4 text-gray-500 dark:text-gray-400">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="p-4 text-gray-500 dark:text-gray-400">No categories found.</p>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color || '#000000' }}
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.description}
                      </p>
                    )}
                    {category.icon && commonIcons[category.icon] && React.createElement(commonIcons[category.icon], {
                      className: "w-5 h-5 text-gray-500 dark:text-gray-400"
                    })}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Categories;
