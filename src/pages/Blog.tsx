import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { apiService } from '../utils/apiService';
import type { BlogEntry, BlogCategory, PaginatedResponse } from '../utils/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Blog: React.FC = () => {
  const [entries, setEntries] = useState<BlogEntry[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, currentPage]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getBlogCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadEntries = async () => {
    try {
      setLoading(true);
      const filters: {
        published: boolean;
        category?: number;
        page?: number;
        page_size?: number;
      } = {
        published: true,
        page: currentPage,
        page_size: pageSize,
      };

      if (selectedCategory !== null) {
        filters.category = selectedCategory;
      }

      const data = await apiService.getBlogEntries(filters);
      
      // Check if the response is a paginated object or a plain array
      if (data && typeof data === 'object' && 'results' in data) {
        // Paginated response from Django REST Framework
        const paginatedData = data as PaginatedResponse<BlogEntry>;
        setEntries(paginatedData.results);
        
        // Calculate total pages from the count
        const totalPageCount = Math.ceil(paginatedData.count / pageSize);
        setTotalPages(totalPageCount);
      } else {
        // Plain array response (legacy or mock API)
        const arrayData = data as BlogEntry[];
        setEntries(arrayData);
        
        // Calculate total pages based on returned data
        // Note: This is a simple approach. Ideally, the API should return total count
        // For now, we'll assume if we get less than pageSize, it's the last page
        if (arrayData.length < pageSize) {
          setTotalPages(currentPage);
        } else {
          // We don't know the exact total, so we just enable next page
          setTotalPages(currentPage + 1);
        }
      }
      
      setError('');
    } catch (err) {
      setError('Nie udało się załadować wpisów');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getExcerpt = (entry: BlogEntry) => {
    if (entry.excerpt) {
      return entry.excerpt;
    }
    // If no excerpt, create one from content
    const plainText = stripHtmlTags(entry.content);
    return plainText.length > 200 ? plainText.substring(0, 200) + '...' : plainText;
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Blog
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Najnowsze wiadomości, analizy i relacje ze świata piłki nożnej
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === null
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Wszystkie
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Blog Entries */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : entries.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {selectedCategory !== null
              ? 'Brak wpisów w tej kategorii.'
              : 'Brak wpisów.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="md:flex">
                {/* Featured Image */}
                {entry.featured_image && (
                  <div className="md:w-1/3 md:flex-shrink-0">
                    <img
                      src={entry.featured_image}
                      alt={entry.title}
                      className="h-48 w-full object-cover md:h-full"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6 flex-1">
                  {/* Category Badge */}
                  {entry.category_name && (
                    <div className="mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
                        {entry.category_name}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <Link to={`/blog/${entry.id}`}>
                      {entry.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {getExcerpt(entry)}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{entry.author_name || `Autor #${entry.author}`}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-4">
                    <Link
                      to={`/blog/${entry.id}`}
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                    >
                      Czytaj więcej →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && entries.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Poprzednia</span>
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show current page and 2 pages on each side
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span>Następna</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Blog;
