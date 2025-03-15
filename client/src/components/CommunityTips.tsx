import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tip } from '@shared/schema';
import { formatDate, getSessionId } from '@/lib/categories';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface CommunityTipsProps {
  guideId: number;
}

const CommunityTips: React.FC<CommunityTipsProps> = ({ guideId }) => {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState(() => localStorage.getItem('bg3guide_author') || '');
  const [showLoadMore, setShowLoadMore] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get tips for this guide
  const { data: tips = [], isLoading } = useQuery({
    queryKey: [`/api/guides/${guideId}/tips`],
    queryFn: async () => {
      const response = await fetch(`/api/guides/${guideId}/tips`);
      if (!response.ok) throw new Error('Failed to fetch tips');
      return response.json();
    },
  });

  // Submit a new tip
  const submitTipMutation = useMutation({
    mutationFn: async (data: { content: string; author: string; guideId: number }) => {
      return apiRequest('POST', '/api/tips', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/guides/${guideId}/tips`] });
      setContent('');
      toast({
        title: 'Success',
        description: 'Your tip has been submitted.',
      });
      // Save author name for future use
      localStorage.setItem('bg3guide_author', author);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to submit your tip. Please try again.',
        variant: 'destructive',
      });
      console.error('Error submitting tip:', error);
    },
  });

  // Mark a tip as helpful
  const markHelpfulMutation = useMutation({
    mutationFn: async (tipId: number) => {
      return apiRequest('POST', `/api/tips/${tipId}/helpful`, {});
    },
    onSuccess: (_, tipId) => {
      queryClient.invalidateQueries({ queryKey: [`/api/guides/${guideId}/tips`] });
      // Store in localStorage to prevent multiple upvotes
      const helpfulTips = JSON.parse(localStorage.getItem('bg3guide_helpful_tips') || '[]');
      localStorage.setItem('bg3guide_helpful_tips', JSON.stringify([...helpfulTips, tipId]));
    },
  });

  const handleSubmitTip = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a tip before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!author.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name before submitting.',
        variant: 'destructive',
      });
      return;
    }
    
    submitTipMutation.mutate({
      content: content.trim(),
      author: author.trim(),
      guideId,
    });
  };

  const handleMarkHelpful = (tipId: number) => {
    // Check if user has already marked this tip as helpful
    const helpfulTips = JSON.parse(localStorage.getItem('bg3guide_helpful_tips') || '[]');
    if (helpfulTips.includes(tipId)) {
      toast({
        title: 'Already marked as helpful',
        description: 'You have already marked this tip as helpful.',
      });
      return;
    }
    
    markHelpfulMutation.mutate(tipId);
  };

  const isTipHelpful = (tipId: number) => {
    const helpfulTips = JSON.parse(localStorage.getItem('bg3guide_helpful_tips') || '[]');
    return helpfulTips.includes(tipId);
  };

  return (
    <div className="fantasy-card">
      <div className="border-b border-secondary px-6 py-4">
        <h2 className="font-heading text-xl text-gold">Community Tips & Tricks</h2>
      </div>
      <div className="p-6">
        <div className="space-y-5">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <svg className="animate-spin h-6 w-6 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : tips.length > 0 ? (
            <>
              {tips.slice(0, showLoadMore ? 3 : undefined).map((tip: Tip) => (
                <div key={tip.id} className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="h-10 w-10 rounded-full bg-primary/40 flex items-center justify-center">
                      <span className="font-accent text-gold">
                        {tip.author.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-background border border-secondary rounded-md p-4 flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{tip.author}</div>
                      <div className="text-xs text-foreground/60">{formatDate(tip.createdAt)}</div>
                    </div>
                    <p className="text-sm text-foreground/80">{tip.content}</p>
                    <div className="mt-2 flex items-center text-xs text-foreground/60">
                      <button 
                        className={`flex items-center mr-4 transition-colors duration-200 ${
                          isTipHelpful(tip.id) ? 'text-gold' : 'hover:text-gold'
                        }`}
                        onClick={() => handleMarkHelpful(tip.id)}
                        disabled={isTipHelpful(tip.id) || markHelpfulMutation.isPending}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        Helpful ({tip.helpfulCount})
                      </button>
                      <button className="flex items-center hover:text-gold transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {tips.length > 3 && showLoadMore && (
                <div className="flex justify-center">
                  <button 
                    className="px-4 py-2 border border-gold/50 rounded-md text-gold hover:bg-gold/10 transition-colors duration-200"
                    onClick={() => setShowLoadMore(false)}
                  >
                    Load More Tips
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-foreground/60 py-4">
              No tips yet. Be the first to share your knowledge!
            </div>
          )}
          
          <div className="mt-8 border-t border-secondary pt-6">
            <h3 className="font-heading text-lg text-gold mb-3">Share Your Own Tip</h3>
            <form onSubmit={handleSubmitTip}>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full bg-background border border-secondary rounded-md p-3 text-foreground focus:outline-none focus:ring-1 focus:ring-gold"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
              <textarea 
                className="w-full bg-background border border-secondary rounded-md p-3 text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-gold min-h-[100px]"
                placeholder="Share your knowledge with other players..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
              <div className="mt-3 flex justify-end">
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-foreground rounded-md hover:bg-primary/80 transition-colors duration-200"
                  disabled={submitTipMutation.isPending}
                >
                  {submitTipMutation.isPending ? 'Submitting...' : 'Submit Tip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityTips;
