import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Powrót do bloga</span>
        </button>

        {/* Article */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Featured Image */}
          {entry.featured_image && (
            <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
              <img
                src={entry.featured_image}
                alt={entry.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              {/* Category Badge on Image */}
              {entry.category_name && (
                <div className="absolute top-6 left-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-primary-600 text-white shadow-lg backdrop-blur-sm">
                    {entry.category_name}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 sm:px-10 md:px-16 py-10 md:py-14">
            {/* Category Badge (if no image) */}
            {!entry.featured_image && entry.category_name && (
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-primary-600 text-white shadow-md">
                  {entry.category_name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
              {entry.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-10 pb-8 border-b-2 border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="font-medium">{entry.author_name || `Autor #${entry.author}`}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-lg">
                <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="font-medium">{formatDate(entry.created_at)}</span>
              </div>
            </div>

            {/* Excerpt */}
            {entry.excerpt && (
              <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border-l-4 border-primary-600 rounded-r-xl px-8 py-6 mb-10">
                <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                  {entry.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-img:rounded-lg prose-img:shadow-md">
              <MDEditor.Markdown source={entry.content} />
            </div>
          </div>
        </article>

        {/* Back to Top Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-1"
          >
            <span className="font-medium">Powrót na górę</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
