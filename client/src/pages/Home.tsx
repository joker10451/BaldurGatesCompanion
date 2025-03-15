import { useQuery } from '@tanstack/react-query';
import { Category, Guide } from '@shared/schema';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GuideCard from '@/components/GuideCard';
import FeaturedGuide from '@/components/FeaturedGuide';
import Footer from '@/components/Footer';
import { getCategoryNameById } from '@/lib/categories';

const Home = () => {
  // Fetch categories
  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Fetch guides
  const { data: guides = [], isLoading: isGuidesLoading } = useQuery({
    queryKey: ['/api/guides'],
    queryFn: async () => {
      const response = await fetch('/api/guides');
      if (!response.ok) throw new Error('Failed to fetch guides');
      return response.json();
    }
  });

  // Get a featured guide (first one for simplicity)
  const featuredGuide = guides.length > 0 ? guides[0] : null;
  
  // Get remaining guides for grid display
  const remainingGuides = featuredGuide ? guides.filter(guide => guide.id !== featuredGuide.id) : guides;

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
              Baldur's Gate 3 Guides
            </h1>
            <p className="text-foreground/80">
              Comprehensive guides to help you master Baldur's Gate 3. Explore classes, companions, quests, and more.
            </p>
          </div>
          
          {isGuidesLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-foreground/70">Loading guides...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Featured Guide */}
              {featuredGuide && (
                <FeaturedGuide 
                  guide={featuredGuide} 
                  categoryName={getCategoryName(featuredGuide.categoryId)} 
                />
              )}
              
              {/* Guides Grid */}
              <div className="mb-8">
                <h2 className="font-heading text-2xl text-gold mb-4">Latest Guides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {remainingGuides.map((guide: Guide) => (
                    <GuideCard 
                      key={guide.id} 
                      guide={guide} 
                      categoryName={getCategoryName(guide.categoryId)}
                    />
                  ))}
                </div>
              </div>
              
              {/* No guides message */}
              {guides.length === 0 && (
                <div className="text-center py-12 fantasy-card">
                  <h3 className="font-heading text-xl text-gold mb-2">No Guides Available</h3>
                  <p className="text-foreground/70">
                    Check back soon for comprehensive guides on Baldur's Gate 3.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
