import { Category, Guide, Tip } from "@shared/schema";

export interface BreadcrumbItem {
  name: string;
  path: string;
  isActive?: boolean;
}

export interface GuideCardProps {
  guide: Guide;
  categoryName?: string;
}

export interface SearchResultItem {
  id: number;
  title: string;
  excerpt?: string;
  slug: string;
  categoryId: number;
  categoryName?: string;
}

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface GuideWithCategory extends Guide {
  categoryName?: string;
}

export interface RecentlyViewedItem {
  id: number;
  guideId: number;
  viewedAt: Date;
  sessionId: string;
  guide?: Guide;
  categoryName?: string;
}
