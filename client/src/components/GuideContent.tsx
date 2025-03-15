import { useState } from 'react';
import { Link } from 'wouter';
import { Guide } from '@shared/schema';

interface GuideContentProps {
  guide: Guide;
  relatedGuides?: Guide[];
}

const GuideContent: React.FC<GuideContentProps> = ({ guide, relatedGuides }) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Convert markdown content to HTML
  const renderMarkdown = (content: string) => {
    // This is a very basic markdown conversion - in a real app, use a markdown library
    const contentHtml = content
      // Headers
      .replace(/^# (.*$)/gm, '<h2 class="font-heading text-gold text-2xl mb-4">$1</h2>')
      .replace(/^## (.*$)/gm, '<h3 class="font-heading text-xl text-gold mb-3">$1</h3>')
      .replace(/^### (.*$)/gm, '<h4 class="font-medium text-lg">$1</h4>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
      // Bold
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      // Paragraphs
      .replace(/^(?!<[h|l])/gm, '<p>$&</p>');

    return { __html: contentHtml };
  };
  
  const tabs = [
    { id: 'overview', label: 'Обзор' },
    { id: 'subclasses', label: 'Подклассы' },
    { id: 'skills', label: 'Навыки и способности' },
    { id: 'equipment', label: 'Снаряжение' },
    { id: 'builds', label: 'Билды' },
    { id: 'faq', label: 'ЧЗВ' },
  ];

  return (
    <div className="fantasy-card mb-8">
      <div className="border-b border-secondary">
        <nav className="flex overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-gold border-b-2 border-gold'
                  : 'text-foreground/70 hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-6">
        <article className="prose prose-invert prose-lg max-w-none">
          {activeTab === 'overview' && (
            <div dangerouslySetInnerHTML={renderMarkdown(guide.content)} />
          )}
          
          {activeTab === 'subclasses' && (
            <div>
              <h2 className="font-heading text-gold text-2xl mb-4">Подклассы</h2>
              <p>Информация о подклассах будет добавлена в ближайшее время.</p>
            </div>
          )}
          
          {activeTab === 'skills' && (
            <div>
              <h2 className="font-heading text-gold text-2xl mb-4">Навыки и способности</h2>
              <p>Информация о навыках и способностях будет добавлена в ближайшее время.</p>
            </div>
          )}
          
          {activeTab === 'equipment' && (
            <div>
              <h2 className="font-heading text-gold text-2xl mb-4">Снаряжение</h2>
              <p>Информация о снаряжении будет добавлена в ближайшее время.</p>
            </div>
          )}
          
          {activeTab === 'builds' && (
            <div>
              <h2 className="font-heading text-gold text-2xl mb-4">Билды</h2>
              <p>Руководства по билдам будут добавлены в ближайшее время.</p>
            </div>
          )}
          
          {activeTab === 'faq' && (
            <div>
              <h2 className="font-heading text-gold text-2xl mb-4">Часто задаваемые вопросы</h2>
              <p>Информация для ЧЗВ будет добавлена в ближайшее время.</p>
            </div>
          )}
          
          {/* Continue reading section */}
          {relatedGuides && relatedGuides.length > 0 && (
            <div className="border-t border-secondary pt-4 mt-8">
              <h3 className="font-heading text-xl text-gold mb-4">Читайте также</h3>
              <div className="flex flex-col md:flex-row gap-4">
                {relatedGuides.slice(0, 2).map((relatedGuide) => (
                  <Link key={relatedGuide.id} href={`/guides/${relatedGuide.slug}`}>
                    <div className="group flex-1 bg-background border border-secondary rounded-md p-4 transition-colors duration-200 hover:bg-secondary/30">
                      <div className="font-medium group-hover:text-gold transition-colors duration-200">
                        {relatedGuide.title}
                      </div>
                      <p className="text-sm text-foreground/70">
                        {relatedGuide.excerpt || 'Посмотрите похожее руководство'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default GuideContent;
