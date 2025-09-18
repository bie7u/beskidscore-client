import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import type { BlogPost, BlogCategory } from '../utils/types';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Mock data - same as in Blog.tsx
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
    content: `<p>Fantastyczny mecz w Manchesterze zakończył się zwycięstwem United nad City 2-1. Bohaterem spotkania został Marcus Rashford, który zdobył oba gole dla czerwonych diabłów.</p>

<p>Spotkanie rozpoczęło się w szybkim tempie, a już w 15. minucie prowadzenie objęli gospodarze po bramce Rashforda. Angielski napastnik wykorzystał błąd obrony City i pewnym strzałem pokonał Edersona.</p>

<p>Manchester City odpowiedział w 34. minucie, gdy Erling Haaland doprowadził do wyrównania po dośrodkowaniu Kevina De Bruyne. Norweg pokazał swoją klasę, wykorzystując jedyną poważną sytuację bramkową gości w pierwszej połowie.</p>

<p>Drugą połowę lepiej rozpoczęli podopieczni Erik ten Haga. United prezentowali się bardzo dobrze w pressingu i nie pozwalali rywalom na rozegranie piłki. W 67. minucie ich determinacja została nagrodzona - ponownie trafił Rashford, który wykorzystał błąd Kyle'a Walkera i strzałem z okolic pola karnego dał prowadzenie gospodarzom.</p>

<p>Do końca spotkania City desperacko szukało wyrównania, jednak defensywa United, prowadzona przez kapitana Harry'ego Maguire'a, spisywała się bez zarzutu. Końcowy wynik to 2-1 dla czerwonych diabłów.</p>

<p>To zwycięstwo może być przełomem w sezonie dla United, którzy w ostatnich tygodniach pokazywali słabą formę. Derby to zawsze szczególne spotkanie, a wygrana z największym rywalem z pewnością doda zespołowi pewności siebie.</p>`,
    category: mockCategories[0],
    author: 'Jan Kowalski',
    publishedAt: '2025-01-08T15:30:00Z',
    readTime: 5,
    imageUrl: '/api/placeholder/1200/600',
    tags: ['Premier League', 'Manchester United', 'Manchester City', 'Derby']
  },
  {
    id: 2,
    title: 'Kylian Mbappe oficjalnie w Realu Madryt',
    slug: 'kylian-mbappe-oficjalnie-w-realu-madryt',
    excerpt: 'Po długich spekulacjach, Kylian Mbappe oficjalnie dołączył do Realu Madryt. Transfer wart 200 milionów euro został potwierdzony przez oba kluby.',
    content: `<p>Po długich spekulacjach i miesiącach negocjacji, Kylian Mbappe oficjalnie zostaje zawodnikiem Realu Madryt. Transfer francuskiego napastnika z Paris Saint-Germain został wyceniony na 200 milionów euro, co czyni go jednym z najdroższych w historii futbolu.</p>

<p>24-letni Francuz podpisał z Królewskimi kontrakt do 2029 roku. Mbappe będzie otrzymywać 25 milionów euro rocznie plus bonusy, które mogą wynieść dodatkowo 10 milionów euro za sezon.</p>

<p>"To spełnienie marzeń z dzieciństwa" - powiedział Mbappe podczas konferencji prasowej. "Real Madryt to klub, o którym marzyłem od małego. Teraz mogę grać u boku najlepszych zawodników świata i walczyć o największe trofea."</p>

<p>Prezydent Realu, Florentino Perez, nie krył zadowolenia: "Kylian to zawodnik wyjątkowy, który wniesie do naszego zespołu nie tylko umiejętności, ale także zwycięską mentalność. To inwestycja w przyszłość klubu."</p>

<p>Transfer ten oznacza koniec ery Mbappe w PSG, gdzie spędził ostatnie 6 lat i zdobył 5 tytułów mistrza Francji. W Paryżu strzelił 212 goli w 263 meczach, stając się jednym z najskuteczniejszych napastników w historii klubu.</p>

<p>W Realu Mbappe będzie nosił koszulkę z numerem 9, po Karimie Benzemie. Jego debiut zaplanowano na najbliższy weekend przeciwko Atletico Madryt w derbach stolicy.</p>`,
    category: mockCategories[1],
    author: 'Anna Nowak',
    publishedAt: '2025-01-07T12:00:00Z',
    readTime: 7,
    imageUrl: '/api/placeholder/1200/600',
    tags: ['Real Madrid', 'PSG', 'Transfer', 'Mbappe']
  }
];

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundPost = mockPosts.find(p => p.slug === slug);
      setPost(foundPost || null);
      setLoading(false);
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Artykuł nie został znaleziony
          </h1>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć do bloga
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/blog')}
        className="inline-flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do bloga
      </button>

      {/* Article header */}
      <header className="mb-8">
        <div className="mb-4">
          <span 
            className="inline-block px-3 py-1 text-sm font-medium rounded-full text-white"
            style={{ backgroundColor: post.category.color || '#3B82F6' }}
          >
            {post.category.name}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{post.readTime} min czytania</span>
          </div>
          <span className="font-medium text-gray-700 dark:text-gray-200">
            Autor: {post.author}
          </span>
        </div>

        {post.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-lg mb-6">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </header>

      {/* Article content */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags.length > 0 && (
        <footer className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Tagi:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
};

export default BlogPostPage;