import { Link } from 'wouter';
import { GuideCardProps } from '@/lib/types';
import { formatDate } from '@/lib/categories';

const GuideCard: React.FC<GuideCardProps> = ({ guide, categoryName }) => {
  return (
    <div className="fantasy-card hover:border-gold/50 transition-colors duration-200">
      <div className="h-40 bg-secondary relative">
        {guide.featuredImage ? (
          <img 
            src={guide.featuredImage} 
            alt={guide.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-foreground/30 text-lg font-medium">Нет изображения</span>
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background/90 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-3">
          <span className="bg-primary text-foreground text-xs px-2 py-1 rounded font-medium">
            {categoryName || 'Руководство'}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading font-bold text-lg mb-2">{guide.title}</h3>
        {guide.excerpt && (
          <p className="text-sm text-foreground/80 mb-3">{guide.excerpt}</p>
        )}
        <div className="flex justify-between items-center text-xs">
          {guide.patch && (
            <span className="text-foreground/60">Обновлено для {guide.patch}</span>
          )}
          <Link href={`/guides/${guide.slug}`} className="text-gold">
            Читать руководство →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuideCard;
