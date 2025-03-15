import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@shared/schema';
import { getParentCategories, getSubcategories, getSessionId, getCategoryIcon } from '@/lib/categories';
import { RecentlyViewedItem } from '@/lib/types';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [location] = useLocation();
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});
  const sessionId = getSessionId();

  // Fetch all categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Fetch recently viewed guides
  const { data: recentlyViewed = [], isLoading: isRecentlyViewedLoading } = useQuery({
    queryKey: ['/api/recently-viewed', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/recently-viewed?sessionId=${sessionId}&limit=5`);
      if (!response.ok) throw new Error('Failed to fetch recently viewed');
      return response.json();
    }
  });

  // Get parent categories
  const parentCategories = getParentCategories(categories);

  // Initialize expanded categories based on current location
  useEffect(() => {
    if (categories.length > 0) {
      const newExpandedCategories: Record<number, boolean> = {};
      
      // Extract the category slug from the location
      const match = location.match(/\/categories\/([^\/]+)/);
      if (match) {
        const currentSlug = match[1];
        const currentCategory = categories.find(cat => cat.slug === currentSlug);
        
        if (currentCategory) {
          // If it's a subcategory, expand its parent
          if (currentCategory.parentId) {
            newExpandedCategories[currentCategory.parentId] = true;
          } 
          // If it's a parent category, expand it
          else {
            newExpandedCategories[currentCategory.id] = true;
          }
        }
      }
      
      setExpandedCategories(newExpandedCategories);
    }
  }, [categories, location]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <aside className={`w-full md:w-64 flex-shrink-0 mb-6 md:mb-0 md:mr-6 ${className}`}>
      {/* Categories */}
      <div className="fantasy-card">
        <div className="bg-primary px-4 py-3">
          <h2 className="font-heading font-bold text-xl">Guide Categories</h2>
        </div>
        
        <nav className="p-2">
          {isCategoriesLoading ? (
            <div className="p-4 text-center text-foreground/70">
              <svg className="animate-spin h-5 w-5 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading categories...
            </div>
          ) : (
            <ul>
              {parentCategories.map((category) => {
                const isExpanded = !!expandedCategories[category.id];
                const subcategories = getSubcategories(categories, category.id);
                const hasSubcategories = subcategories.length > 0;
                const isActive = location === `/categories/${category.slug}`;
                
                return (
                  <li key={category.id} className="mb-2">
                    <div 
                      className={`p-2 rounded-md hover:bg-muted cursor-pointer transition-colors duration-200 font-medium border-l-4 ${
                        isActive || isExpanded ? 'border-gold' : 'border-secondary'
                      }`}
                      onClick={() => hasSubcategories ? toggleCategory(category.id) : null}
                    >
                      <Link href={`/categories/${category.slug}`}>
                        <a className="flex items-center justify-between">
                          <span className="flex items-center">
                            {category.icon && (
                              <img 
                                src={getCategoryIcon(category.icon)} 
                                alt={category.name} 
                                className="w-5 h-5 mr-2"
                              />
                            )}
                            {category.name}
                          </span>
                          {hasSubcategories && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className={`h-4 w-4 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          )}
                        </a>
                      </Link>
                    </div>
                    
                    {hasSubcategories && isExpanded && (
                      <ul className="ml-4 mt-1">
                        {subcategories.map((subcategory) => {
                          const isSubActive = location === `/categories/${subcategory.slug}`;
                          
                          return (
                            <li key={subcategory.id}>
                              <Link href={`/categories/${subcategory.slug}`}>
                                <a className={`py-1 px-2 block rounded transition-colors duration-200 ${
                                  isSubActive 
                                    ? 'bg-muted/50 text-foreground' 
                                    : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground'
                                }`}>
                                  {subcategory.name}
                                </a>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </div>
      
      {/* Recently Viewed */}
      <div className="mt-6 fantasy-card">
        <div className="bg-secondary px-4 py-3">
          <h2 className="font-heading font-bold text-lg">Recently Viewed</h2>
        </div>
        <div className="p-3">
          {isRecentlyViewedLoading ? (
            <div className="p-2 text-center text-foreground/70">
              <svg className="animate-spin h-5 w-5 mx-auto mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          ) : recentlyViewed.length > 0 ? (
            <ul className="space-y-2">
              {recentlyViewed.map((item: RecentlyViewedItem) => (
                <li key={item.id} className="hover:bg-muted p-2 rounded transition-colors duration-200">
                  <Link href={`/guides/${item.guide?.slug}`}>
                    <a className="block text-sm">
                      <div className="font-medium">{item.guide?.title}</div>
                      <div className="text-xs text-foreground/60">
                        {item.categoryName && `${item.categoryName}`}
                      </div>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-foreground/70 text-sm">
              No recently viewed guides
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
