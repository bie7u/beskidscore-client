import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock, Share2 } from 'lucide-react';
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

  const stripHtmlTags = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const calculateReadTime = (content: string) => {
    const plainText = stripHtmlTags(content);
    const wordsPerMinute = 200;
    const words = plainText.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleShare = async () => {
    if (navigator.share && entry) {
      try {
        await navigator.share({
          title: entry.title,
          text: entry.excerpt || entry.title,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link skopiowany do schowka!');
    }
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
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Powrót do bloga</span>
        </button>

        {/* Article */}
        <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Featured Image with Gradient Overlay */}
          {entry.featured_image && (
            <div className="relative w-full h-96 md:h-[32rem] overflow-hidden">
              <img
                src={entry.featured_image}
                alt={entry.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Title Overlay on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                {entry.category_name && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white backdrop-blur-sm shadow-lg">
                      {entry.category_name}
                    </span>
                  </div>
                )}
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                  {entry.title}
                </h1>
              </div>
            </div>
          )}

          {/* Content Container */}
          <div className="p-8 md:p-12">
            {/* If no featured image, show title here */}
            {!entry.featured_image && (
              <>
                {entry.category_name && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-200">
                      {entry.category_name}
                    </span>
                  </div>
                )}
                <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  {entry.title}
                </h1>
              </>
            )}

            {/* Meta Information Bar */}
            <div className="flex flex-wrap items-center gap-6 py-6 mb-8 border-y border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                  <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Autor</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {entry.author_name || `Autor #${entry.author}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                  <Calendar className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Data publikacji</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(entry.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-full">
                  <Clock className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Czas czytania</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {calculateReadTime(entry.content)} min
                  </p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span className="font-medium">Udostępnij</span>
              </button>
            </div>

            {/* Excerpt */}
            {entry.excerpt && (
              <div className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-10 pb-10 border-b border-gray-200 dark:border-gray-700 italic leading-relaxed font-light">
                {entry.excerpt}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg md:prose-xl dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-ul:my-6 prose-ol:my-6
              prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-primary-500 prose-blockquote:pl-6 prose-blockquote:italic
              prose-code:text-primary-600 dark:prose-code:text-primary-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8">
              <MDEditor.Markdown source={entry.content} />
            </div>
          </div>
        </article>

        {/* Back to Blog Button at Bottom */}
        <div className="mt-12 text-center">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Wróć do wszystkich artykułów</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
