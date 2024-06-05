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
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type INewList = {
  userId: string;
  title: string;
  description: string;
  items: string;
  tags?: string;
};

export type IUpdateList = {
  listId: string;
  title: string;
  description: string;
  items: string;
  tags?: string;
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