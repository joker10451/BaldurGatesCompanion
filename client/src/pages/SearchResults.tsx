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
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Fetch search results
  const { data: searchResults = [], isLoading, error } = useQuery({
    queryKey: ['/api/guides/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await fetch(`/api/guides/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    },
    enabled: searchQuery.length >= 2,
  });

  // Show error toast if search fails
  useEffect(() => {
    if (error) {
      toast({
        title: 'Search Error',
        description: 'Failed to perform search. Please try again.',
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
              Search Results
            </h1>
            {searchQuery ? (
              <p className="text-foreground/80">
                Showing results for: <span className="text-gold font-medium">"{searchQuery}"</span>
              </p>
            ) : (
              <p className="text-foreground/80">
                Enter a search query to find guides.
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
                <p className="text-foreground/70">Searching...</p>
              </div>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="text-center py-12 fantasy-card">
              <h3 className="font-heading text-xl text-gold mb-2">Enter at least 2 characters</h3>
              <p className="text-foreground/70">
                Please enter a longer search term to find guides.
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
              <h3 className="font-heading text-xl text-gold mb-2">No Results Found</h3>
              <p className="text-foreground/70">
                No guides found for "{searchQuery}". Try different keywords or browse categories.
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
