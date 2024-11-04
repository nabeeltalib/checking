import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Award,
  Shield,
  ChevronRight,
  Star,
  Share2,
  ExternalLink,
  Trophy,
  Monitor,
  Film,
  Music,
  Utensils
} from 'lucide-react';
import { toast } from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { useTrackEngagement } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';

// Types
interface TopArgument {
  id: string;
  content: string;
  votes: number;
  author: {
    id: string;
    name: string;
    isVerified?: boolean;
  };
  timestamp: string;
  quality: number;
  impact: number;
}

interface TrendingDebate {
  id: string;
  title: string;
  description?: string;
  category: string;
  isHot: boolean;
  comments: number;
  participants: number;
  lastActive: string;
  trend: number;
  topArguments: TopArgument[];
  engagementScore: number;
  imageUrl?: string;
  qualityScore: number;
  rankingPosition?: number;
  controversyScore?: number;
}

interface TrendingDebatesSectionProps {
  debates: ITrendingDebate[];
  lists: { [key: string]: IList };  // Add this to reference lists
  isLoading?: boolean;
  onDebateClick?: (debateId: string, listId: string) => void;  // Update this
  className?: string;
}

interface DebateCardProps {
  debate: ITrendingDebate;
  list: IList;  // Add this
  isExpanded: boolean;
  onExpand: () => void;
  onShare: (e: React.MouseEvent) => void;
  onClick: () => void;
}

// Helper Functions
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'technology':
      return <Monitor className="w-6 h-6 text-blue-500" />;
    case 'movies':
      return <Film className="w-6 h-6 text-purple-500" />;
    case 'music':
      return <Music className="w-6 h-6 text-green-500" />;
    case 'sports':
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    case 'food':
      return <Utensils className="w-6 h-6 text-red-500" />;
    default:
      return <MessageSquare className="w-6 h-6 text-gray-500" />;
  }
};

const calculateAverageEngagement = (debates: TrendingDebate[]): number => {
  if (debates.length === 0) return 0;
  return debates.reduce((sum, debate) => sum + debate.engagementScore, 0) / debates.length;
};

// Memoized Components
const TrendIndicator = memo(({ trend }: { trend: number }) => {
  const isPositive = trend > 0;
  
  return (
    <div className={`flex items-center space-x-1 ${
      isPositive ? 'text-green-500' : 'text-red-500'
    }`}>
      {isPositive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isPositive ? '+' : ''}{trend}%
      </span>
    </div>
  );
});

TrendIndicator.displayName = 'TrendIndicator';

// Loading Skeleton Component
const TrendingDebatesSkeleton = memo(() => (
  <div className="w-full bg-dark-2 rounded-xl p-6 mb-8 shadow-lg">
    <div className="flex items-center space-x-3 mb-6">
      <div className="w-6 h-6 bg-dark-4 rounded animate-pulse" />
      <div className="h-6 w-32 bg-dark-4 rounded animate-pulse" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-dark-3 rounded-lg p-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-dark-4 rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-dark-4 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-dark-4 rounded w-1/4 animate-pulse" />
              <div className="flex space-x-4 mt-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-4 w-16 bg-dark-4 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
));

TrendingDebatesSkeleton.displayName = 'TrendingDebatesSkeleton';

// Debate Card Component
const DebateCard = memo(({
  debate,
  list,     // Add this
  isExpanded,
  onExpand,
  onShare,
  onClick
}: DebateCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`group bg-dark-3 rounded-lg p-4 cursor-pointer hover:bg-dark-4 transition-all 
        relative overflow-hidden ${debate.isHot ? 'ring-2 ring-orange-500/20' : ''}`}
    >
       {/* Add List Reference */}
       <div className="mb-2 text-sm text-gray-400">
        Debating: <span className="text-primary-400">{list.Title}</span>
      </div>

      {/* Add Debate Type Badge */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-1 rounded-full text-xs ${
          debate.debateType === 'ranking' ? 'bg-blue-500/10 text-blue-400' :
          debate.debateType === 'inclusion' ? 'bg-green-500/10 text-green-400' :
          debate.debateType === 'order' ? 'bg-purple-500/10 text-purple-400' :
          'bg-gray-500/10 text-gray-400'
        }`}>
          {debate.debateType.charAt(0).toUpperCase() + debate.debateType.slice(1)}
        </span>
      </div>
      {debate.isHot && (
        <motion.div
          className="absolute top-0 right-0 w-20 h-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="absolute top-5 right-[-20px] transform rotate-45 bg-orange-500 text-white text-xs py-1 px-6">
            HOT 🔥
          </div>
        </motion.div>
      )}

      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
          debate.isHot ? 'bg-orange-500/10 group-hover:bg-orange-500/20' : 'bg-dark-5 group-hover:bg-dark-6'
        }`}>
          {getCategoryIcon(debate.category)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white truncate pr-4 group-hover:text-primary-400 transition-colors">
                {debate.title}
              </h3>
              <span className="text-xs text-gray-400 mt-1 inline-block">
                {debate.category}
              </span>
            </div>
            <TrendIndicator trend={debate.trend} />
          </div>

          {debate.qualityScore > 80 && (
            <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-500/10 rounded-full mt-2">
              <Award className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-500">High Quality</span>
            </div>
          )}

          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-400">
            {[
              { icon: <MessageSquare className="w-4 h-4 mr-1" />, value: debate.comments },
              { icon: <Users className="w-4 h-4 mr-1" />, value: debate.participants },
              { icon: <Clock className="w-4 h-4 mr-1" />, value: debate.lastActive }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                {stat.icon}
                <span>{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 space-y-2"
          >
            {debate.topArguments.map((argument, index) => (
              <motion.div 
                key={argument.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between bg-dark-2 rounded-lg p-3 hover:bg-dark-3 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-500/10' : 'bg-gray-500/10'
                  }`}>
                    {index === 0 ? (
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Star className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-white">
                      {argument.content}
                    </span>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-400">
                        by {argument.author.name}
                      </span>
                      {argument.author.isVerified && (
                        <Shield className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">
                    {argument.votes} votes
                  </span>
                  {argument.quality > 80 && (
                    <Award className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-dark-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
          className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </motion.button>
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onShare}
            className="p-2 hover:bg-dark-5 rounded-full transition-colors"
          >
            <Share2 className="w-4 h-4 text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/debate/${debate.id}`, '_blank');
            }}
            className="p-2 hover:bg-dark-5 rounded-full transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </motion.button>
        </div>
      </div>
      {isExpanded && debate.metadata.listItems && (
        <div className="mt-4 border-t border-dark-4 pt-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Items being debated:
          </h4>
          <div className="space-y-1">
            {debate.metadata.listItems.map((item, index) => (
              <div key={index} className="text-sm text-gray-400">
                {index + 1}. {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
});

DebateCard.displayName = 'DebateCard';

// Main Component
const TrendingDebatesSection: React.FC<TrendingDebatesSectionProps> = ({
  debates = [],
  lists = {},      // Add this
  isLoading = false,
  onDebateClick,
  className = ''
}) => {
  const navigate = useNavigate();
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);
  const { mutate: trackEngagement } = useTrackEngagement();
  const { user } = useUserContext();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (debates.length > 0 && user?.$id) {
      timeoutId = setTimeout(() => {
        trackEngagement({
          userId: user.$id,
          action: 'view_trending_debates',
          route: '/home',
          source: 'trending_section',
          timestamp: new Date().toISOString()
        });
      }, 1000);
    }

    return () => clearTimeout(timeoutId);
  }, [debates, trackEngagement, user?.$id]);

  const handleShare = useCallback(async (debate: TrendingDebate, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user?.$id) return;

    try {
      const shareData = {
        title: debate.title,
        text: `Join the debate: ${debate.title}`,
        url: `${window.location.origin}/debate/${debate.id}`
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
        
        trackEngagement({
          userId: user.$id,
          action: 'share_debate',
          route: '/home',
          source: 'native_share',
          timestamp: new Date().toISOString()
        });

        toast({
          title: 'Shared successfully',
          description: 'The debate has been shared!',
          variant: 'success'
        });
      } else {
        await navigator.clipboard.writeText(shareData.url);
        
        trackEngagement({
          userId: user.$id,
          action: 'copy_debate_link',
          route: '/home',
          source: 'clipboard',
          timestamp: new Date().toISOString()
        });

        toast({
          title: 'Link copied',
          description: 'The debate link has been copied to your clipboard',
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: 'Error sharing',
        description: 'Unable to share the debate. Please try again.',
        variant: 'destructive'
      });
    }
  }, [trackEngagement, user?.$id]);

  const handleDebateClick = useCallback((debateId: string, debate: TrendingDebate) => {
    if (!user?.$id) return;

    trackEngagement({
      userId: user.$id,
      action: 'click_debate',
      route: '/home',
      source: 'trending_section',
      timestamp: new Date().toISOString()
    });

    onDebateClick?.(debateId);
  }, [onDebateClick, trackEngagement, user?.$id]);

  if (isLoading) {
    return <TrendingDebatesSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full bg-dark-2 rounded-xl p-6 mb-8 shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Flame className="w-6 h-6 text-orange-500" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          <h2 className="text-xl font-bold text-white">Trending Debates</h2>
          <motion.span 
            className="px-2 py-1 bg-orange-500/10 rounded-full text-xs text-orange-500"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Live
          </motion.span>
        </div>
        <motion.button 
          onClick={() => {
            if (user?.$id) {
              trackEngagement({
                userId: user.$id,
                action: 'view_all_debates',
                route: '/home',
                source: 'trending_section',
                timestamp: new Date().toISOString()
              });
            }
            navigate('/debates');
          }}
          className="text-sm text-primary-500 hover:text-primary-400 transition-colors flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </motion.button>
      </div>

      {/* Debates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence mode="popLayout">
        {debates.map((debate) => (
          <DebateCard
            key={debate.id}
            debate={debate}
            list={lists[debate.listId]}  // Add this
            isExpanded={expandedDebate === debate.id}
            onExpand={() => setExpandedDebate(debate.id === expandedDebate ? null : debate.id)}
            onShare={(e) => handleShare(debate, e)}
            onClick={() => handleDebateClick(debate.id, debate.listId)}
          />
        ))}
      </AnimatePresence>
    </div>

      {/* Empty State */}
      {debates.length === 0 && !isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-10 text-gray-400"
        >
          <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No Trending Debates</p>
          <p className="text-sm mt-2">Be the first to start a trending debate!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (user?.$id) {
                trackEngagement({
                  userId: user.$id,
                  action: 'start_new_debate',
                  route: '/home',
                  source: 'empty_state',
                  timestamp: new Date().toISOString()
                });
              }
              navigate('/debates/new');
            }}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Start a Debate
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default memo(TrendingDebatesSection);