import { Category } from "@shared/schema";

// Generate a random session ID for tracking recently viewed guides
export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Get or create a session ID
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('bg3guide_session_id');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('bg3guide_session_id', sessionId);
  }
  
  return sessionId;
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} weeks ago`;
  } else {
    return d.toLocaleDateString();
  }
};

// Get category name by ID from categories list
export const getCategoryNameById = (categories: Category[], id: number): string => {
  const category = categories.find(c => c.id === id);
  return category ? category.name : 'Unknown';
};

// Get all parent categories (those without a parentId)
export const getParentCategories = (categories: Category[]): Category[] => {
  return categories.filter(category => !category.parentId);
};

// Get subcategories for a parent category
export const getSubcategories = (categories: Category[], parentId: number): Category[] => {
  return categories.filter(category => category.parentId === parentId);
};

// Get category icon
export const getCategoryIcon = (iconName?: string): string => {
  switch (iconName) {
    case 'sword':
      return '/src/assets/icons/sword.svg';
    case 'shield':
      return '/src/assets/icons/shield.svg';
    case 'spell':
      return '/src/assets/icons/spell.svg';
    case 'quest':
      return '/src/assets/icons/quest.svg';
    case 'character':
      return '/src/assets/icons/character.svg';
    default:
      return '/src/assets/icons/sword.svg';
  }
};

// Build breadcrumb items for a category
export const buildCategoryBreadcrumbs = (
  categories: Category[],
  categoryId: number
): { items: { name: string; path: string; isActive?: boolean }[], category: Category | undefined } => {
  const category = categories.find(c => c.id === categoryId);
  
  if (!category) {
    return { items: [{ name: 'Home', path: '/' }], category: undefined };
  }
  
  const items = [{ name: 'Home', path: '/' }];
  
  if (category.parentId) {
    const parentCategory = categories.find(c => c.id === category.parentId);
    if (parentCategory) {
      items.push({ 
        name: parentCategory.name, 
        path: `/categories/${parentCategory.slug}` 
      });
    }
  }
  
  items.push({ 
    name: category.name, 
    path: `/categories/${category.slug}`,
    isActive: true
  });
  
  return { items, category };
};

// Build breadcrumb items for a guide
export const buildGuideBreadcrumbs = (
  categories: Category[],
  categoryId: number,
  guideTitle: string,
  guideSlug: string
) => {
  const { items } = buildCategoryBreadcrumbs(categories, categoryId);
  
  // Remove isActive from the last item
  const lastItem = items[items.length - 1];
  if (lastItem && lastItem.isActive) {
    lastItem.isActive = false;
  }
  
  items.push({ 
    name: guideTitle, 
    path: `/guides/${guideSlug}`,
    isActive: true
  });
  
  return items;
};
