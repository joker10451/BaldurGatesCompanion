import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GuideContent from '@/components/GuideContent';
import RelatedGuides from '@/components/RelatedGuides';
import CommunityTips from '@/components/CommunityTips';
import Footer from '@/components/Footer';
import { getSessionId, buildGuideBreadcrumbs, getCategoryNameById } from '@/lib/categories';
import { BreadcrumbItem, GuideWithCategory } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Guide } from '@shared/schema';

interface GuidePageProps {
  params: {
    slug: string;
  };
}

const GuidePage: React.FC<GuidePageProps> = ({ params }) => {
  const [location, setLocation] = useLocation();
  const { slug } = params;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Fetch guide by slug
  const { data: guide, isLoading, error } = useQuery({
    queryKey: [`/api/guides/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/guides/${slug}`);
      if (response.status === 404) {
        throw new Error('Guide not found');
      }
      if (!response.ok) throw new Error('Failed to fetch guide');
      return response.json();
    }
  });

  // Fetch related guides
  const { data: relatedGuides = [] } = useQuery({
    queryKey: [`/api/guides/${guide?.id}/related`],
    queryFn: async () => {
      const response = await fetch(`/api/guides/${guide.id}/related`);
      if (!response.ok) throw new Error('Failed to fetch related guides');
      return response.json();
    },
    enabled: !!guide?.id,
  });

  // Add to recently viewed
  const addToRecentlyViewedMutation = useMutation({
    mutationFn: async ({ guideId, sessionId }: { guideId: number, sessionId: string }) => {
      return apiRequest('POST', '/api/recently-viewed', { guideId, sessionId });
    },
    onError: (error) => {
      console.error('Error adding to recently viewed:', error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recently-viewed', sessionId] });
    }
  });

  // Add guide to recently viewed when it loads
  useEffect(() => {
    if (guide && !isLoading) {
      addToRecentlyViewedMutation.mutate({ guideId: guide.id, sessionId });
    }
  }, [guide, isLoading]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'The requested guide could not be found.',
        variant: 'destructive',
      });
      setLocation('/');
    }
  }, [error, setLocation, toast]);

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = guide && categories.length > 0
    ? buildGuideBreadcrumbs(categories, guide.categoryId, guide.title, guide.slug)
    : [{ name: 'Home', path: '/' }];

  // Enhance related guides with category names
  const relatedGuidesWithCategories: GuideWithCategory[] = 
    relatedGuides.map((relatedGuide: Guide) => ({
      ...relatedGuide,
      categoryName: getCategoryNameById(categories, relatedGuide.categoryId),
    }));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="container mx-auto px-4 py-6 flex flex-col md:flex-row flex-grow">
        <Sidebar />
        
        <div className="flex-grow">
          {/* Breadcrumb navigation */}
          <div className="mb-4 text-sm">
            <ol className="flex items-center flex-wrap">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {item.isActive ? (
                    <span className="text-foreground/80">{item.name}</span>
                  ) : (
                    <Link href={item.path}>
                      <a className="text-gold hover:underline">{item.name}</a>
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-foreground/70">Loading guide...</p>
              </div>
            </div>
          ) : guide ? (
            <>
              {/* Guide content */}
              <GuideContent guide={guide} relatedGuides={relatedGuidesWithCategories} />
              
              {/* Related guides */}
              {relatedGuidesWithCategories.length > 0 && (
                <RelatedGuides guides={relatedGuidesWithCategories} />
              )}
              
              {/* Community tips */}
              <CommunityTips guideId={guide.id} />
            </>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default GuidePage;
