import React, { useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Flame,
  Award,
  Star,
  Users,
  Clock,
  ChevronDown,
  ExternalLink,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrackEngagement, useLikeList, useBookmarkList } from '@/lib/react-query/queries';
import { useToast } from '@/components/ui/use-toast';
import { IList } from '@/types';

interface AnimatedListCardProps {
  list: IList;
  index: number;
  showStats?: boolean;
  isInteractive?: boolean;
  onListUpdated?: (updatedList: IList) => void;
}

const ANIMATION_DURATION = 0.3;

// Helper functions
const getEngagementColor = (score: number): string => {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-blue-500';
  if (score >= 40) return 'text-yellow-500';
  return 'text-red-500';
};

// Memoized sub-components
const StatBadge = memo(({ 
  icon: Icon, 
  value 
}: { 
  icon: React.ElementType; 
  value: number | string;
}) => (
  <motion.div 
    whileHover={{ scale: 1.1 }}
    className="flex items-center space-x-1 text-gray-400"
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm">{value}</span>
  </motion.div>
));

StatBadge.displayName = 'StatBadge';

const TagBadge = memo(({ tag }: { tag: string }) => (
  <motion.span
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="px-2 py-1 bg-dark-3 text-gray-400 rounded-full text-sm"
  >
    #{tag}
  </motion.span>
));

TagBadge.displayName = 'TagBadge';

const StatsPanel = memo(({ list }: { list: IList }) => (
  <div className="p-4 grid grid-cols-3 gap-4">
    <div className="text-center">
      <div className="text-sm text-gray-400">Engagement</div>
      <div className={`text-lg font-semibold ${getEngagementColor(list.engagementScore || 0)}`}>
        {list.engagementScore || 0}%
      </div>
    </div>
    
    <div className="text-center">
      <div className="text-sm text-gray-400">Ranking Change</div>
      <div className={`text-lg font-semibold ${
        list.rankingChange > 0 ? 'text-green-500' : 'text-red-500'
      }`}>
        {list.rankingChange > 0 ? '+' : ''}{list.rankingChange}
      </div>
    </div>

    <div className="text-center">
      <div className="text-sm text-gray-400">Quality Score</div>
      <div className="text-lg font-semibold text-blue-500">
        {list.qualityScore || 0}/10
      </div>
    </div>
  </div>
));

StatsPanel.displayName = 'StatsPanel';

// Main Component
const AnimatedListCard: React.FC<AnimatedListCardProps> = memo(({
  list,
  index,
  showStats = true,
  isInteractive = true,
  onListUpdated
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const { mutate: trackEngagement } = useTrackEngagement();
  const { mutate: likeList } = useLikeList();
  const { mutate: bookmarkList } = useBookmarkList();

  // Animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: ANIMATION_DURATION,
        delay: index * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: "easeInOut"
      }
    }
  };

  // Event Handlers
  const handleCardClick = useCallback(() => {
    if (!isInteractive) return;

    trackEngagement({
      action: 'click',
      listId: list.$id,
      userId: list.creator.$id,
      metadata: {
        source: 'list_card',
        timestamp: new Date().toISOString(),
        engagementScore: list.engagementScore,
        qualityScore: list.qualityScore
      }
    });

    navigate(`/lists/${list.$id}`);
  }, [list, isInteractive, trackEngagement, navigate]);

  const handleShare = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const shareData = {
        title: list.Title,
        text: list.Description,
        url: `${window.location.origin}/lists/${list.$id}`
      };

      if (navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
      }

      trackEngagement({
        action: 'share',
        listId: list.$id,
        userId: list.creator.$id,
        metadata: {
          method: navigator.canShare ? 'native_share' : 'clipboard',
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Shared successfully!",
        description: navigator.canShare ? 
          "The list has been shared." : 
          "The list link has been copied to your clipboard.",
        variant: "success"
      });
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error sharing",
        description: "Unable to share the list. Please try again.",
        variant: "destructive"
      });
    }
  }, [list, trackEngagement, toast]);

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    likeList({
      listId: list.$id,
      userId: list.creator.$id
    }, {
      onSuccess: (updatedList) => {
        trackEngagement({
          action: 'like',
          listId: list.$id,
          userId: list.creator.$id,
          metadata: {
            timestamp: new Date().toISOString()
          }
        });
        onListUpdated?.(updatedList);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Unable to like the list. Please try again.",
          variant: "destructive"
        });
      }
    });
  }, [list, likeList, trackEngagement, onListUpdated, toast]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    bookmarkList(
      { listId: list.$id, userId: list.creator.$id },
      {
        onSuccess: () => {
          trackEngagement({
            action: 'bookmark',
            listId: list.$id,
            userId: list.creator.$id,
            metadata: { timestamp: new Date().toISOString() }
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Unable to update bookmark. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={isInteractive ? "hover" : undefined}
      whileTap={isInteractive ? "tap" : undefined}
      onClick={handleCardClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative bg-dark-2 rounded-xl overflow-hidden shadow-lg ${
        isInteractive ? 'cursor-pointer' : ''
      }`}
    >
      {/* Trending Indicator */}
      {list.trending && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 z-10"
        >
          <div className="flex items-center space-x-1 bg-orange-500/10 text-orange-500 px-2 py-1 rounded-full">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">Trending</span>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={list.creator.imageUrl}
              alt={list.creator.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-dark-4"
            />
            <div>
              <h3 className="text-lg font-semibold text-white line-clamp-1">
                {list.Title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-400">
                  by {list.creator.name}
                </span>
                {list.creator.verified && (
                  <Award className="w-4 h-4 text-blue-500" />
                )}
              </div>
            </div>
          </div>

          {list.rankingPosition && (
            <div className="flex items-center space-x-1 bg-dark-3 px-2 py-1 rounded-full">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-white">#{list.rankingPosition}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-300 line-clamp-2 mb-4">
          {list.Description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {list.Tags?.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-4">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                list.likes?.includes(list.creator.$id) 
                  ? 'text-primary-500' 
                  : 'text-gray-400 hover:text-primary-500'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">{list.likes?.length || 0}</span>
            </motion.button>

            <StatBadge icon={MessageSquare} value={list.comments?.length || 0} />
            <StatBadge icon={Eye} value={list.views || 0} />
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="p-2 hover:bg-dark-3 rounded-full transition-colors"
            >
              <Share2 className="w-4 h-4 text-gray-400" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleBookmark}
              className="p-2 hover:bg-dark-3 rounded-full transition-colors"
            >
              <Bookmark className={`w-4 h-4 ${
                list.bookmarked ? 'text-primary-500 fill-current' : 'text-gray-400'
              }`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Expanded Stats Panel */}
      <AnimatePresence>
        {isExpanded && showStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-dark-4 bg-dark-3"
          >
            <StatsPanel list={list} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Toggle */}
      {showStats && (
        <motion.button
          initial={false}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="absolute bottom-2 right-2 p-2 hover:bg-dark-3 rounded-full transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </motion.button>
      )}

      {/* Hover Overlay */}
      <AnimatePresence>
        {isHovered && isInteractive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-dark-1/80 to-transparent"
          >
            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg 
                  hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <span>View Details</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

AnimatedListCard.displayName = 'AnimatedListCard';

export default memo(AnimatedListCard);