import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-mobile';
import { SearchResultItem } from '@/lib/types';

const SearchBar = () => {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch search results
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['/api/guides/search', debouncedSearchTerm],
    enabled: debouncedSearchTerm.length >= 2,
    queryFn: async () => {
      if (debouncedSearchTerm.length < 2) return [];
      const response = await fetch(`/api/guides/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
      if (!response.ok) throw new Error('Поиск не удался');
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length >= 2);
  };

  const handleSelectResult = (result: SearchResultItem) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate(`/guides/${result.slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.length >= 2) {
      setIsOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <input 
            type="text" 
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => setIsOpen(searchTerm.length >= 2)}
            placeholder="Поиск руководств..." 
            className="w-full bg-muted border border-secondary rounded-md py-2 px-4 text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 text-foreground/50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Search results dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full bg-muted border border-secondary rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-3 text-center text-foreground/70">
              <svg className="animate-spin h-5 w-5 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Поиск...
            </div>
          ) : searchResults && searchResults.length > 0 ? (
            <ul>
              {searchResults.map((result: SearchResultItem) => (
                <li key={result.id} className="border-b border-secondary last:border-0">
                  <button
                    onClick={() => handleSelectResult(result)}
                    className="w-full text-left px-4 py-3 hover:bg-background/50 transition-colors duration-200"
                  >
                    <div className="font-medium text-foreground">{result.title}</div>
                    {result.excerpt && (
                      <div className="text-sm text-foreground/70 truncate">{result.excerpt}</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-3 text-center text-foreground/70">
              Ничего не найдено по запросу "{searchTerm}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
