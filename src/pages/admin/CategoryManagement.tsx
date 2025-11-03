import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { apiService } from '../../utils/apiService';
import type { BlogCategory } from '../../utils/types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBlogCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      setError('Nie udało się załadować kategorii');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      setError('Nazwa kategorii nie może być pusta');
      return;
    }

    try {
      const newCategory = await apiService.createCategory(newCategoryName.trim());
      setCategories([...categories, newCategory]);
      setNewCategoryName('');
      setShowAddForm(false);
      setError('');
    } catch (err) {
      setError('Nie udało się utworzyć kategorii');
      console.error(err);
    }
  };

  const handleStartEdit = (category: BlogCategory) => {
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) {
      setError('Nazwa kategorii nie może być pusta');
      return;
    }

    try {
      const updatedCategory = await apiService.updateCategory(id, editingName.trim());
      setCategories(categories.map(cat => cat.id === id ? updatedCategory : cat));
      setEditingId(null);
      setEditingName('');
      setError('');
    } catch (err) {
      setError('Nie udało się zaktualizować kategorii');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tę kategorię?')) {
      return;
    }

    try {
      await apiService.deleteCategory(id);
      setCategories(categories.filter(cat => cat.id !== id));
    } catch (err) {
      alert('Nie udało się usunąć kategorii');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/blog"
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do zarządzania blogiem</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Zarządzanie Kategoriami
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Twórz i edytuj kategorie blogowe
            </p>
          </div>

          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Dodaj kategorię</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Dodaj nową kategorię
          </h2>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nazwa kategorii"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
              autoFocus
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Utwórz
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewCategoryName('');
                setError('');
              }}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Brak kategorii. Utwórz pierwszą kategorię!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {editingId === category.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdate(category.id);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdate(category.id)}
                      className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      title="Zapisz"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      title="Anuluj"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Slug: {category.slug}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleStartEdit(category)}
                        className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        title="Edytuj"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
