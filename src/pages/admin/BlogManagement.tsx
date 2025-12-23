import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, FolderOpen } from 'lucide-react';
import { apiService } from '../../utils/apiService';
import type { BlogEntry, PaginatedResponse } from '../../utils/types';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const BlogManagement: React.FC = () => {
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await apiService.getBlogEntries();
      
      // Check if the response is a paginated object or a plain array
      if (data && typeof data === 'object' && 'results' in data) {
        // Paginated response from Django REST Framework
        const paginatedData = data as PaginatedResponse<BlogEntry>;
        setEntries(paginatedData.results);
      } else {
        // Plain array response (legacy or mock API)
        setEntries(data as BlogEntry[]);
      }
      
      setError('');
    } catch (err) {
      setError('Nie udało się załadować wpisów');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Czy na pewno chcesz usunąć ten wpis?')) {
      return;
    }

    try {
      await apiService.deleteBlogEntry(id);
      setEntries(entries.filter(entry => entry.id !== id));
    } catch (err) {
      alert('Nie udało się usunąć wpisu');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin"
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Powrót do panelu</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Zarządzanie Blogiem
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Twórz i edytuj wpisy blogowe
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/admin/blog/categories"
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <FolderOpen className="h-5 w-5" />
              <span>Zarządzaj kategoriami</span>
            </Link>
            <Link
              to="/admin/blog/new"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Nowy wpis</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Brak wpisów. Utwórz pierwszy wpis!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tytuł
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Kategoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {entry.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.category_name ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                          {entry.category_name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {entry.author_name || `ID: ${entry.author}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(entry.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          entry.published
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {entry.published ? (
                          <>
                            <Eye className="h-3 w-3" />
                            <span>Opublikowane</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            <span>Szkic</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/admin/blog/edit/${entry.id}`}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
