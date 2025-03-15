import { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import GuideCard from '@/components/GuideCard';
import Footer from '@/components/Footer';
import { buildCategoryBreadcrumbs } from '@/lib/categories';
import { BreadcrumbItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const CategoryPage: React.FC<CategoryPageProps> = ({ params }) => {
  const [location, setLocation] = useLocation();
  const { slug } = params;
  const { toast } = useToast();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Не удалось загрузить категории');
      return response.json();
    }
  });

  // Fetch category by slug
  const { data: category, isLoading: isCategoryLoading, error: categoryError } = useQuery({
    queryKey: [`/api/categories/${slug}`],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${slug}`);
      if (response.status === 404) {
        throw new Error('Категория не найдена');
      }
      if (!response.ok) throw new Error('Не удалось загрузить категорию');
      return response.json();
    }
  });

  // Fetch guides for this category
  const { data: guides = [], isLoading: isGuidesLoading } = useQuery({
    queryKey: [`/api/guides/category/${category?.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/guides/category/${category.id}`);
      if (!response.ok) throw new Error('Не удалось загрузить руководства');
      return response.json();
    },
    enabled: !!category?.id,
  });

  // Fetch subcategories if this is a parent category
  const { data: subcategories = [] } = useQuery({
    queryKey: [`/api/categories/${category?.id}/subcategories`],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${category.id}/subcategories`);
      if (!response.ok) throw new Error('Не удалось загрузить подкатегории');
      return response.json();
    },
    enabled: !!category?.id && !category?.parentId,
  });

  // Handle error
  useEffect(() => {
    if (categoryError) {
      toast({
        title: 'Ошибка',
        description: 'Запрошенная категория не найдена.',
        variant: 'destructive',
      });
      setLocation('/');
    }
  }, [categoryError, setLocation, toast]);

  // Build breadcrumbs
  const { items: breadcrumbs } = category && categories.length > 0
    ? buildCategoryBreadcrumbs(categories, category.id)
    : { items: [{ name: 'Главная', path: '/' }] };

  const isLoading = isCategoryLoading || isGuidesLoading;

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
                    <Link href={item.path} className="text-gold hover:underline">
                      {item.name}
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
                <p className="text-foreground/70">Загрузка категории...</p>
              </div>
            </div>
          ) : category ? (
            <>
              {/* Category header */}
              <div className="mb-6">
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-gold mb-2">
                  Руководства: {category.name}
                </h1>
                {category.description && (
                  <p className="text-foreground/80">
                    {category.description}
                  </p>
                )}
              </div>
              
              {/* Subcategories */}
              {!category.parentId && subcategories.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-heading text-2xl text-gold mb-4">Подкатегории</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {subcategories.map((subcategory) => (
                      <Link 
                        key={subcategory.id} 
                        href={`/categories/${subcategory.slug}`}
                        className="fantasy-card p-4 hover:border-gold/50 transition-colors duration-200"
                      >
                        <h3 className="font-heading text-xl font-medium mb-2">{subcategory.name}</h3>
                        {subcategory.description && (
                          <p className="text-sm text-foreground/70">{subcategory.description}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Guides for this category */}
              <div className="mb-8">
                <h2 className="font-heading text-2xl text-gold mb-4">
                  {category.parentId ? `Руководства: ${category.name}` : 'Руководства'}
                </h2>
                {guides.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {guides.map((guide) => (
                      <GuideCard 
                        key={guide.id} 
                        guide={guide} 
                        categoryName={category.name}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 fantasy-card">
                    <h3 className="font-heading text-xl text-gold mb-2">Руководства не найдены</h3>
                    <p className="text-foreground/70">
                      Загляните позже, чтобы найти руководства в этой категории.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
