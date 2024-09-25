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
  views: number;
  aiScore?: number;
  suggestions?: ISuggestion[];
  Public: boolean;
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
