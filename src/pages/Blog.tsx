import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react';
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

  const calculateReadTime = (content: string) => {
    const plainText = stripHtmlTags(content);
    const wordsPerMinute = 200;
    const words = plainText.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  if (loading && entries.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Blog
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Najnowsze wiadomości, analizy i relacje ze świata piłki nożnej
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-6 py-2.5 rounded-full transition-all duration-200 font-medium ${
              selectedCategory === null
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50 scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
            }`}
          >
            Wszystkie
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-6 py-2.5 rounded-full transition-all duration-200 font-medium ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50 scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
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
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Link to={`/blog/${entry.id}`} className="block">
                <div className="lg:flex">
                  {/* Featured Image with Overlay */}
                  {entry.featured_image && (
                    <div className="relative lg:w-2/5 flex-shrink-0 overflow-hidden">
                      <img
                        src={entry.featured_image}
                        alt={entry.title}
                        className="h-64 lg:h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent lg:bg-gradient-to-r"></div>
                      {/* Category Badge on Image */}
                      {entry.category_name && (
                        <div className="absolute top-4 left-4">
                          <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm shadow-lg">
                            {entry.category_name}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Title */}
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {entry.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed flex-grow">
                      {getExcerpt(entry)}
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <User className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{entry.author_name || `Autor #${entry.author}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span>{formatDate(entry.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span>{calculateReadTime(entry.content)} min czytania</span>
                      </div>
                    </div>

                    {/* Read More Link */}
                    <div className="mt-4">
                      <span className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold group-hover:gap-2 transition-all">
                        Czytaj więcej 
                        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && entries.length > 0 && totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 transition-all duration-200 font-medium"
          >
            <ChevronLeft className="h-5 w-5" />
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
                  className={`min-w-[3rem] px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/50 scale-110'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 hover:border-primary-500 hover:scale-105'
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
            className="flex items-center space-x-2 px-5 py-3 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-800 disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600 transition-all duration-200 font-medium"
          >
            <span>Następna</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Blog;
