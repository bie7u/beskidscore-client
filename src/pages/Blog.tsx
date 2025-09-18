import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BlogPost, BlogCategory } from '../utils/types';
import BlogCard from '../components/blog/BlogCard';
import CategoryFilter from '../components/blog/CategoryFilter';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Mock data - in real app this would come from API
const mockCategories: BlogCategory[] = [
  { id: 1, name: 'Wyniki', slug: 'wyniki', color: '#10B981' },
  { id: 2, name: 'Transfery', slug: 'transfery', color: '#F59E0B' },
  { id: 3, name: 'Analiza', slug: 'analiza', color: '#6366F1' },
  { id: 4, name: 'Wywiady', slug: 'wywiady', color: '#EF4444' },
  { id: 5, name: 'Historia', slug: 'historia', color: '#8B5CF6' },
];

const mockPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Manchester United wygrywa derby z City 2-1',
    slug: 'manchester-united-wygrywa-derby-z-city',
    excerpt: 'Fantastyczny mecz w Manchesterze zakończył się zwycięstwem United nad City 2-1. Bohaterem spotkania został Marcus Rashford, który zdobył oba gole dla czerwonych diabłów.',
    content: 'Pełna relacja z meczu...',
    category: mockCategories[0],
    author: 'Jan Kowalski',
    publishedAt: '2025-01-08T15:30:00Z',
    readTime: 5,
    imageUrl: '/api/placeholder/800/400',
    tags: ['Premier League', 'Manchester United', 'Manchester City', 'Derby']
  },
  {
    id: 2,
    title: 'Kylian Mbappe oficjalnie w Realu Madryt',
    slug: 'kylian-mbappe-oficjalnie-w-realu-madryt',
    excerpt: 'Po długich spekulacjach, Kylian Mbappe oficjalnie dołączył do Realu Madryt. Transfer wart 200 milionów euro został potwierdzony przez oba kluby.',
    content: 'Szczegóły transferu...',
    category: mockCategories[1],
    author: 'Anna Nowak',
    publishedAt: '2025-01-07T12:00:00Z',
    readTime: 7,
    imageUrl: '/api/placeholder/800/400',
    tags: ['Real Madrid', 'PSG', 'Transfer', 'Mbappe']
  },
  {
    id: 3,
    title: 'Analiza: Czy Pep Guardiola zmieni taktykę?',
    slug: 'analiza-czy-pep-guardiola-zmieni-taktyke',
    excerpt: 'Manchester City przechodzi trudny okres. Czy Pep Guardiola zdecyduje się na radykalne zmiany w ustawieniu zespołu? Analizujemy możliwe scenariusze.',
    content: 'Szczegółowa analiza...',
    category: mockCategories[2],
    author: 'Piotr Wiśniewski',
    publishedAt: '2025-01-06T09:15:00Z',
    readTime: 10,
    imageUrl: '/api/placeholder/800/400',
    tags: ['Manchester City', 'Taktyka', 'Pep Guardiola', 'Analiza']
  },
  {
    id: 4,
    title: 'Wywiad z kapitanem reprezentacji Polski',
    slug: 'wywiad-z-kapitanem-reprezentacji-polski',
    excerpt: 'Rozmawiamy z kapitanem reprezentacji Polski o nadchodzących meczach eliminacyjnych i przygotowaniach do Euro 2024.',
    content: 'Pełny wywiad...',
    category: mockCategories[3],
    author: 'Maria Kowalczyk',
    publishedAt: '2025-01-05T14:20:00Z',
    readTime: 8,
    imageUrl: '/api/placeholder/800/400',
    tags: ['Reprezentacja Polski', 'Euro 2024', 'Wywiad', 'Kapitan']
  },
  {
    id: 5,
    title: 'Historia polskiej piłki: Lata świetności',
    slug: 'historia-polskiej-pilki-lata-swietnosci',
    excerpt: 'Przypominamy najlepsze lata polskiej piłki nożnej - od mistrzostw olimpijskich w 1972 roku po trzecie miejsce na mundialu 1982.',
    content: 'Historia polskiego futbolu...',
    category: mockCategories[4],
    author: 'Tomasz Nowicki',
    publishedAt: '2025-01-04T11:00:00Z',
    readTime: 12,
    imageUrl: '/api/placeholder/800/400',
    tags: ['Historia', 'Polska', 'Mundial 1982', 'Boniek']
  },
  {
    id: 6,
    title: 'Real Madrid wygrywa El Clasico',
    slug: 'real-madrid-wygrywa-el-clasico',
    excerpt: 'Królewscy pokonali FC Barcelona 3-1 w emocjonujących El Clasico. Hat-tricka strzelił Karim Benzema, a Real umocnił się na pozycji lidera LaLigi.',
    content: 'Relacja z El Clasico...',
    category: mockCategories[0],
    author: 'Carlos Rodriguez',
    publishedAt: '2025-01-03T20:45:00Z',
    readTime: 6,
    imageUrl: '/api/placeholder/800/400',
    tags: ['El Clasico', 'Real Madrid', 'Barcelona', 'LaLiga']
  }
];

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setPosts(mockPosts);
      setCategories(mockCategories);
      setLoading(false);
    };

    loadData();
  }, []);

  const filteredPosts = selectedCategory 
    ? posts.filter(post => post.category.id === selectedCategory)
    : posts;

  const handlePostClick = (post: BlogPost) => {
    navigate(`/blog/${post.slug}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Blog
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Najnowsze wiadomości ze świata futbolu
        </p>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={(categoryId) => setSelectedCategory(categoryId || undefined)}
      />

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              onClick={handlePostClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Brak artykułów w wybranej kategorii.
          </p>
        </div>
      )}
    </div>
  );
};

export default Blog;