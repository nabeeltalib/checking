import { Models } from "appwrite";

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

export type INewList = {
  userId: string;
  title: string;
  description: string;
  items: string[];
  tags?: string[];
};

export type IUpdateList = {
  listId: string;
  title: string;
  description: string;
  items: string[];
  tags?: string[];
};

export interface IList extends Models.Document {
  title: string;
  description: string;
  items: string[];
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

export type IListItem = {
  id: string;
  title: string;
  description: string;
  // Add other properties specific to list items
};

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
};

export interface AISuggestion {
  id: string;
  suggestion: string;
};

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
