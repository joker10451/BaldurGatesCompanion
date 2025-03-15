import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import SearchBar from './SearchBar';

const Header = () => {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="bg-background border-b border-primary shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="mr-4">
                {/* Logo */}
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="font-accent text-xl text-foreground font-bold">BG3</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-gold">БГ3 Гид</h1>
                <p className="text-sm text-foreground/80">Подробные руководства по Baldur's Gate 3</p>
              </div>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button 
              className="text-foreground p-2" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
          
          {/* Search bar - hidden on mobile, shown on medium screens and up */}
          <div className="hidden md:block w-64">
            <SearchBar />
          </div>
        </div>
        
        {/* Mobile menu - only visible on mobile screens */}
        <div className={`mt-4 md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="mb-4">
            <SearchBar />
          </div>
          <nav className="flex flex-col space-y-2">
            <Link href="/categories/classes" className="px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200">
              Классы
            </Link>
            <Link href="/categories/companions" className="px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200">
              Компаньоны
            </Link>
            <Link href="/categories/quests" className="px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200">
              Квесты
            </Link>
            <Link href="/categories/items-equipment" className="px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200">
              Предметы и снаряжение
            </Link>
            <Link href="/categories/mechanics" className="px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200">
              Механики
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
