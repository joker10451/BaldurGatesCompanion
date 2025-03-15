import { GuideWithCategory } from '@/lib/types';
import GuideCard from './GuideCard';

interface RelatedGuidesProps {
  guides: GuideWithCategory[];
  title?: string;
}

const RelatedGuides: React.FC<RelatedGuidesProps> = ({ 
  guides,
  title = 'Похожие руководства' 
}) => {
  if (!guides || guides.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="font-heading text-2xl text-gold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((guide) => (
          <GuideCard 
            key={guide.id} 
            guide={guide} 
            categoryName={guide.categoryName}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedGuides;
