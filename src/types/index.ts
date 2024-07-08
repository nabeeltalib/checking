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
  comments: any[];
  createdAt: string;
  bookmarkCount: number;
  sharesCount: number;
  views: number;
  aiScore?: number;
  suggestions?: ISuggestion[];
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

export interface IUser extends Models.Document {
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  curatedList: string[];
}

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export interface IListItem {
  content: string;
  isVisible: boolean;
}

export type ICategoryItem = {
  id: string;
  name: string;
  // Add other properties specific to list items
};

export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

// New types for Comments, Suggestions, and Collaborations

export type INewComment = Omit<IComment, 'id' | 'createdAt'>;

export type IComment = {
  id: string;
  listId: string;
  userId: string;
  content: string;
  createdAt: string;
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
export interface IAICategory {
  id: string;
  name: string;
}

export interface IAISuggestion {
  id: string;
  suggestion: string;
}
