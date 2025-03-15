import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GuideCard from '@/components/GuideCard';
import Footer from '@/components/Footer';
import { getCategoryNameById } from '@/lib/categories';
import { useToast } from '@/hooks/use-toast';
import { Guide } from '@shared/schema';

const SearchResults = () => {
  const [location] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // Parse search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const query = params.get('q') || '';
    setSearchQuery(query);
  }, [location]);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Не удалось загрузить категории');
      return response.json();
    }
  });

  // Fetch search results
  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: ['/api/guides/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await fetch(`/api/guides/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Ошибка поиска');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Show error toast if search fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Ошибка поиска',
        description: 'Не удалось выполнить поиск. Пожалуйста, попробуйте снова.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Get category name for a guide
  const getCategoryName = (categoryId: number) => {
    return getCategoryNameById(categories, categoryId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row flex-grow">
        <Sidebar />
        
        <div className="flex-grow">
          <div className="mb-6">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-gold mb-2">
              Результаты поиска
            </h1>
            {searchQuery ? (
              <p className="text-foreground/80">
                Показаны результаты для: <span className="text-gold font-medium">"{searchQuery}"</span>
              </p>
            ) : (
              <p className="text-foreground/80">
                Введите поисковый запрос для поиска руководств.
              </p>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-foreground/70">Поиск...</p>
              </div>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-12 fantasy-card">
              <h3 className="font-heading text-xl text-gold mb-2">Введите не менее 2 символов</h3>
              <p className="text-foreground/70">
                Пожалуйста, введите более длинный поисковый запрос для поиска руководств.
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((guide: Guide) => (
                <GuideCard 
                  key={guide.id} 
                  guide={guide} 
                  categoryName={getCategoryName(guide.categoryId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 fantasy-card">
              <h3 className="font-heading text-xl text-gold mb-2">Результатов не найдено</h3>
              <p className="text-foreground/70">
                Не найдено руководств для "{searchQuery}". Попробуйте другие ключевые слова или просмотрите категории.
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
