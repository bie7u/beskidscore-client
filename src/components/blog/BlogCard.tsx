import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import type { BlogPost } from '../../utils/types';

interface BlogCardProps {
  post: BlogPost;
  onClick?: (post: BlogPost) => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(post);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={handleClick}
    >
      {post.imageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img 
            src={post.imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="px-3 py-1 text-xs font-medium rounded-full text-white"
            style={{ backgroundColor: post.category.color || '#3B82F6' }}
          >
            {post.category.name}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 overflow-hidden" 
            style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 2, 
              WebkitBoxOrient: 'vertical' 
            }}>
          {post.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-4 overflow-hidden" 
           style={{ 
             display: '-webkit-box', 
             WebkitLineClamp: 3, 
             WebkitBoxOrient: 'vertical' 
           }}>
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{post.readTime} min</span>
            </div>
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {post.author}
          </span>
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;