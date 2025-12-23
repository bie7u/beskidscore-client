import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import type { BlogEntry } from '../utils/types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { apiService } from '../utils/apiService';

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<BlogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Nie podano identyfikatora wpisu');
      setLoading(false);
      return;
    }

    const loadBlogEntry = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiService.getBlogEntry(parseInt(id));
        setEntry(data);
      } catch (error) {
        console.error('Error loading blog entry:', error);
        setError('Nie udało się załadować wpisu. Spróbuj ponownie.');
      } finally {
        setLoading(false);
      }
    };

    loadBlogEntry();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
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

  if (error || !entry) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Powrót</span>
        </button>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <p className="text-red-800 dark:text-red-200">
            {error || 'Nie znaleziono wpisu'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Powrót do bloga</span>
      </button>

      {/* Article */}
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {/* Featured Image */}
        {entry.featured_image && (
          <div className="w-full">
            <img
              src={entry.featured_image}
              alt={entry.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          {/* Category Badge */}
          {entry.category_name && (
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
                {entry.category_name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {entry.title}
          </h1>

          {/* Meta Information */}
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>{entry.author_name || `Autor #${entry.author}`}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(entry.created_at)}</span>
            </div>
          </div>

          {/* Excerpt */}
          {entry.excerpt && (
            <div className="text-xl text-gray-600 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700 italic">
              {entry.excerpt}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div dangerouslySetInnerHTML={{ __html: entry.content }} />
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
