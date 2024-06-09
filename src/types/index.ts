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

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
  location?: string;
  tags?: string;
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

export type IList = {
  id: string;
  title: string;
  description: string;
  items: string[];
  tags?: string[];
  creator: {
    id: string;
    name: string;
    imageUrl: string;
  };
  likes: string[];
  comments: IComment[];
  createdAt: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  curatedList: string[];
};

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

export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

// New types for Comments, Suggestions, and Collaborations

export type INewComment = {
  listId: string;
  userId: string;
  content: string;
};

export type IComment = {
  id: string;
  listId: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type INewSuggestion = {
  listId: string;
  userId: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedItems: string[];
  status: string;
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

export type INewCollaboration = {
  listId: string;
  userId: string;
  status: string;
};

export type ICollaboration = {
  id: string;
  listId: string;
  userId: string;
  status: string;
};

export interface AICategory {
  id: string;
  name: string;
};

export interface AISuggestion {
  id: string;
  suggestion: string;
};
