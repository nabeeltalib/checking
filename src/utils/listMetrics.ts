export const calculateEngagementScore = (list: IList): number => {
    const now = Date.now();
    const createdAt = new Date(list.$createdAt).getTime();
    const age = (now - createdAt) / (1000 * 60 * 60); // Hours
  
    // Base engagement metrics
    const viewScore = (list.views || 0) * 1;
    const likeScore = (list.likes?.length || 0) * 2;
    const commentScore = (list.comments?.length || 0) * 3;
    const shareScore = (list.sharesCount || 0) * 4;
    const bookmarkScore = (list.bookmarkCount || 0) * 2;
  
    // Time decay factor (24-hour half-life)
    const decay = Math.pow(0.5, age / 24);
  
    // Calculate final score
    const rawScore = (viewScore + likeScore + commentScore + shareScore + bookmarkScore) * decay;
    
    // Normalize to 0-100 range
    return Math.min(Math.round(rawScore * 100 / 1000), 100);
  };
  
  export const getQualityIndicators = (list: IList) => {
    const hasDescription = !!list.Description && list.Description.length > 50;
    const hasTags = list.Tags && list.Tags.length >= 3;
    const hasGoodEngagement = calculateEngagementScore(list) > 60;
    const hasRecentActivity = isRecentlyActive(list);
  
    return {
      hasDescription,
      hasTags,
      hasGoodEngagement,
      hasRecentActivity,
      score: [hasDescription, hasTags, hasGoodEngagement, hasRecentActivity]
        .filter(Boolean).length * 2.5
    };
  };
  
  export const isRecentlyActive = (list: IList): boolean => {
    const lastActivity = Math.max(
      new Date(list.$updatedAt).getTime(),
      ...list.comments?.map(c => new Date(c.$createdAt).getTime()) || []
    );
    const hoursSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60);
    return hoursSinceActivity < 24;
  };
  
  export const calculateTrendingScore = (list: IList): number => {
    const now = Date.now();
    const timeWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    // Get recent interactions
    const recentLikes = list.likes?.filter(like => {
      const likeTime = new Date(like.$createdAt).getTime();
      return now - likeTime < timeWindow;
    }).length || 0;
  
    const recentComments = list.comments?.filter(comment => {
      const commentTime = new Date(comment.$createdAt).getTime();
      return now - commentTime < timeWindow;
    }).length || 0;
  
    // Calculate velocity
    const velocity = (recentLikes * 2 + recentComments * 3) / 7; // Daily average
  
    return Math.round(velocity * 10);
  };
  
  export const formatListStats = (list: IList) => {
    return {
      views: formatNumber(list.views),
      likes: formatNumber(list.likes?.length || 0),
      comments: formatNumber(list.comments?.length || 0),
      shares: formatNumber(list.sharesCount),
      engagement: `${calculateEngagementScore(list)}%`,
      quality: `${getQualityIndicators(list).score}/10`,
      trending: list.trending ? '🔥 Trending' : null
    };
  };
  
  // Helper function to format numbers
  export const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // Animation variants for Framer Motion
  export const cardAnimationVariants = {
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
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };
  
  export const contentAnimationVariants = {
    collapsed: {
      height: 0,
      opacity: 0
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          type: "spring",
          stiffness: 100,
          damping: 20
        },
        opacity: {
          duration: 0.2
        }
      }
    }
  };