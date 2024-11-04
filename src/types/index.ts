import { Models } from 'appwrite';

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
  icon?: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
  Public: boolean;
  socialLinks?: string[];
};

export type INewList = Omit<
  IList,
  '$id' | '$createdAt' | '$updatedAt' | 'userId'
> & {
  userId: string;
  qualityScore?: number;
};

export type IUpdateList = Pick<
  IList,
  'title' | 'description' | 'items' | 'tags'
> & {
  listId: string;
};

export interface IList extends Models.Document {
  userId: string;
  title: string;
  description: string;
  items: IListItem[];
  tags: string[];
  creator: {
    $id: string;
    name: string;
    imageUrl: string;
  };
  likes: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
  bookmarkCount: number;
  sharesCount: number;
  Categories: string[];
  locations?: string[];
  timespans?: string[];
  users: string[];
  views: number;
  aiScore?: number;
  suggestions?: ISuggestion[];
  Public: boolean;
  Dislikes?: string[];
  DislikesCount: number; // Add this line
  engagementScore: number;    // Required, Double
  trendingScore: number;      // Required, Double
  qualityScore: number;       // Required, Double
  rankingPosition: number;    // Required, Integer
  lastActiveTimestamp: Date;  // Required, DateTime
  rankingChange: number;      // Required, Integer
  trending: boolean;          // Required, Boolean
  debateCount: number;        // Required, Integer
  Views: number;  // Changed from viewCount to Views
  Title: string;             // Required, String
  Description: string;       // Required, String

  debates?: {
    total: number;
    active: number;
    trending?: ITrendingDebate[];
  };
  debateSettings?: {
    allowDebates: boolean;
    moderationLevel: 'low' | 'medium' | 'high';
    requiredReputation?: number;
    allowAnonymous?: boolean;
  };
}

export interface ISocialLinks {
  twitter?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  // Add more platforms as needed
}

export interface IUser extends Models.Document {
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  curatedList: string[];
  save?: { list: IList }[];
  $id: string;  
  Public: boolean;
  socialLinks?: string[]; // Adjusted to be a string array
}

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export interface IListItem {
  id: string;
  title: string;
  description: string;
}

export type ICategoryItem = {
  id: string;
  name: string;
  // Add other properties specific to list items if needed
};

export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  friends: IFriendRequest[];
  setFriends: React.Dispatch<React.SetStateAction<IFriendRequest[]>>;
  notifications: INotification[];
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
};

export type INewComment = Omit<IComment, 'id' | 'createdAt'>;

export type IComment = {
  id: string;
  listId: string;
  userId: string;
  content: string;
  createdAt: Date;
  Content: string;         // Required
  CreatedAt: string;       // Required
  UpdatedAt?: string;      // Optional
  user: string;            // Relationship
  list: string;            // Relationship
  Reply?: string[];        // Relationship
  Likes?: string[];        // String array
  groupId?: string;        // Optional string
  Reactions?: string[];    // String array
  debateActivity?: any;    // Relationship
  quality: number;         // Required integer
  impact: number;          // Required integer
  verified: boolean;       // Required boolean
  sourceUrls?: string[];   // String array
};

export type ISuggestion = {
  id: string;
  listId: string;
  userId: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedItems: string[];
  status: string;
};
export type INewSuggestion = Omit<ISuggestion, 'id'>;

export type CollaborationStatus = 'pending' | 'accepted' | 'rejected';
export type FriendStatus = 'pending' | 'accepted' | 'rejected';

export type ICollaboration = {
  id: string;
  listId: string;
  userId: string;
  status: CollaborationStatus;
};

export type INewCollaboration = Omit<ICollaboration, 'id'>;

export interface AICategory {
  id: string;
  name: string;
}

export interface AISuggestion {
  id: string;
  suggestion: string;
}

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentAnalysisResult {
  sentiment: Sentiment;
}

export interface IFriendRequest {
  $id: string;
  userId: string;
  friendId: string;
  status: FriendStatus;
}

export interface INotification {
  $id: string;
  userId: string;
  type: 'friend_request' | 'list_like' | 'list_comment';
  message: string;
  read: boolean;
  createdAt: Date;
}
// Add to types/index.ts

export interface ITrendingDebate {
  id: string;
  listId: string;              // Add this
  listTitle: string;           // Add this
  debateType: DebateType;      // Add this
  title: string;
  description: string;
  category: DebateCategory;
  isHot: boolean;
  comments: number;
  participants: number;
  lastActive: string;
  trend: number;
  topArguments: IDebateArgument[];
  engagementScore: number;
  imageUrl?: string;
  creator: {
    id: string;
    name: string;
    imageUrl: string;
    reputation: number;
  };
  stats: {
    views: number;
    shares: number;
    bookmarks: number;
    quality: number;
  };
  metadata: {
    startedAt: string;
    endAt?: string;
    rules?: string[];
    tags: string[];
    sources?: string[];
    listItems?: string[];      // Add this - specific items being debated
    itemPositions?: number[];  // Add this - for ranking debates
  };
}

export type DebateType = 
  | 'ranking'        // Debating the overall ranking
  | 'inclusion'      // Debating which items should be included
  | 'order'          // Debating the order of items
  | 'general';       // General discussion about the list

  export interface IDebateArgument {
    id: string;
    content: string;
    votes: number;
    type: 'support' | 'against' | 'suggestion';
    listItemIndex?: number;      // Add this - reference to specific item
    suggestedItem?: string;      // Add this - for inclusion debates
    suggestedPosition?: number;  // Add this - for order debates
    author: {
      id: string;
      name: string;
      imageUrl: string;
      isVerified: boolean;
      reputation: number;
    };
    createdAt: string;
    updatedAt: string;
    quality: number;
    sourceLinks?: string[];
    reactions: {
      type: string;
      count: number;
      users: string[];
    }[];
    replies?: IDebateArgument[];
  }

export type DebateCategory =
  | 'technology'
  | 'movies'
  | 'music'
  | 'sports'
  | 'food'
  | 'politics'
  | 'science'
  | 'gaming'
  | 'books'
  | 'other';

export interface IDebateEngagement {
  userId: string;
  debateId: string;
  type: 'view' | 'vote' | 'comment' | 'share' | 'bookmark';
  timestamp: string;
  metadata?: {
    duration?: number;
    platform?: string;
    referrer?: string;
    device?: string;
  };
}

export interface IDebateStats {
  totalViews: number;
  uniqueParticipants: number;
  totalVotes: number;
  totalComments: number;
  avgQuality: number;
  engagementRate: number;
  trendingScore: number;
  peakActivity: {
    timestamp: string;
    participantCount: number;
    action: string;
  };
  categoryRanking: number;
  controversyScore?: number; // Add this line

}

export interface IListStats {
  engagementScore: number;
  qualityScore: number;
  rankingPosition: number;
  rankingChange: number;
  trending: boolean;
  views: number;
  shares: number;
  bookmarks: number;
}

export interface IListEngagement {
  likes: string[];
  comments: number;
  saves: number;
  views: number;
  shareCount: number;
  lastInteraction: string;
}

export interface IListMetrics {
  engagement: number;
  quality: number;
  trending: number;
  velocity: number;
}

export interface IUserStats {
  totalLists: number;
  totalComments: number;
  totalLikes: number;
  totalViews: number;
  topList: IList | null;
  recentActivity: {
    lists: IList[];
    comments: IComment[];
  };
  engagementScore: number;
  rankingPositions: {
    listId: string;
    position: number;
    category: string;
  }[];
}