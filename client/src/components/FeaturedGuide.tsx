import { Link } from 'wouter';
import { Guide } from '@shared/schema';
import { formatDate } from '@/lib/categories';

interface FeaturedGuideProps {
  guide: Guide;
  categoryName?: string;
}

const FeaturedGuide: React.FC<FeaturedGuideProps> = ({ guide, categoryName }) => {
  return (
    <div className="fantasy-card mb-8">
      <div className="md:flex">
        <div className="md:w-1/3 h-48 md:h-auto bg-secondary relative overflow-hidden">
          {guide.featuredImage ? (
            <img 
              src={guide.featuredImage} 
              alt={guide.title} 
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-foreground/30 text-lg font-medium">No Image</span>
            </div>
          )}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background/90 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-4">
            <span className="bg-primary text-foreground text-xs px-2 py-1 rounded font-medium">
              {categoryName || 'Featured Guide'}
            </span>
          </div>
        </div>
        <div className="p-6 md:w-2/3">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-heading text-2xl font-bold text-gold">
              <Link href={`/guides/${guide.slug}`}>
                <a>{guide.title}</a>
              </Link>
            </h2>
            {guide.patch && (
              <div className="fantasy-badge">
                UPDATED: {guide.patch}
              </div>
            )}
          </div>
          <p className="text-foreground/80 mb-4">
            {guide.excerpt || 'No description available.'}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {guide.tags && guide.tags.map((tag, index) => (
              <span key={index} className="fantasy-tag">{tag}</span>
            ))}
          </div>
          <div className="flex items-center space-x-2 text-sm text-foreground/60">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Last updated: {formatDate(guide.updatedAt)}</span>
            <span className="mx-1">•</span>
            <span>5 min read</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedGuide;
