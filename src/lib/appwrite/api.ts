import {
  ID,
  Client,
  Account,
  AppwriteException,
  Databases,
  Storage,
  Avatars,
  Functions,
  Query
} from 'appwrite';
import {
  IUpdateList,
  INewList,
  IList,
  INewUser,
  IUpdateUser,
  IListItem,
  ICategoryItem
} from '@/types';
import { account, databases, storage, avatars, appwriteConfig } from "./config";
import Categories from '@/_root/pages/Categories';

// Ensure environment variables are defined
const requiredEnvVars = [
  'VITE_APPWRITE_URL',
  'VITE_APPWRITE_PROJECT_ID',
  'VITE_APPWRITE_DATABASE_ID',
  'VITE_APPWRITE_STORAGE_ID',
  'VITE_APPWRITE_USER_COLLECTION_ID',
  'VITE_APPWRITE_LIST_COLLECTION_ID',
  'VITE_APPWRITE_SAVES_COLLECTION_ID',
  'VITE_APPWRITE_COMMENT_COLLECTION_ID',
  'VITE_APPWRITE_SUGGESTION_COLLECTION_ID',
  'VITE_APPWRITE_COLLABORATION_COLLECTION_ID',
  'VITE_APPWRITE_CATEGORY_COLLECTION_ID',
  'VITE_APPWRITE_SHARED_LINKS_COLLECTION_ID',
  'VITE_APPWRITE_AI_SUGGESTIONS_FUNCTION_ID',
  'VITE_APPWRITE_GENERATE_LIST_IDEA_FUNCTION_ID',
  'VITE_APPWRITE_ANALYZE_SENTIMENT_FUNCTION_ID',
  'VITE_APPWRITE_ENHANCE_DESCRIPTION_FUNCTION_ID',
  'VITE_APPWRITE_TYPESENSE_OPERATIONS_FUNCTION_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing Appwrite environment variables: ${missingEnvVars.join(', ')}`
  );
}

export const appwriteConfig = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  listCollectionId: import.meta.env.VITE_APPWRITE_LIST_COLLECTION_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  commentCollectionId: import.meta.env.VITE_APPWRITE_COMMENT_COLLECTION_ID,
  generateListItemFunctionId: import.meta.env.VITE_APPWRITE_GENERATE_LIST_ITEMS_FUNCTION_ID,
  suggestionCollectionId: import.meta.env
    .VITE_APPWRITE_SUGGESTION_COLLECTION_ID,
  collaborationCollectionId: import.meta.env
    .VITE_APPWRITE_COLLABORATION_COLLECTION_ID,
  categoryCollectionId: import.meta.env.VITE_APPWRITE_CATEGORY_COLLECTION_ID,
  sharedLinksCollectionId: import.meta.env
    .VITE_APPWRITE_SHARED_LINKS_COLLECTION_ID,
  aiSuggestionsFunctionId: import.meta.env
    .VITE_APPWRITE_AI_SUGGESTIONS_FUNCTION_ID,
  generateListIdeaFunctionId: import.meta.env
    .VITE_APPWRITE_GENERATE_LIST_IDEA_FUNCTION_ID,
  analyzeSentimentFunctionId: import.meta.env
    .VITE_APPWRITE_ANALYZE_SENTIMENT_FUNCTION_ID,
  enhanceDescriptionFunctionId: import.meta.env
    .VITE_APPWRITE_ENHANCE_DESCRIPTION_FUNCTION_ID,
  typesenseOperationsFunctionId: import.meta.env
    .VITE_APPWRITE_TYPESENSE_OPERATIONS_FUNCTION_ID,
  friendsCollectionId: import.meta.env.VITE_APPWRITE_FRIENDS_COLLECTION_ID
};

const client = new Client();

client.setEndpoint(appwriteConfig.url).setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const functions = new Functions(client);

// ============================================================
// AUTH
// ============================================================

export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );
    console.log({ newAccount });
    if (!newAccount) throw new Error('Failed to create account');

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl
    });

    return newUser;
  } catch (error: any) {
    console.error('Error creating user account:', error.message);
    return null;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: user.accountId,
        Email: user.email,
        Name: user.name,
        ImageUrl: user.imageUrl,
        Username: user.username || user.name
      }
    );

    return newUser;
  } catch (error) {
    console.error('Error saving user to database:', error);
    return error;
  }
}
export async function signInWithGoogle() {
  try {
    const session = await account.createOAuth2Session('google');
    return session;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error("Not authenticated");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.total === 0) {
      // User document doesn't exist, create it
      const avatarUrl = avatars.getInitials(currentAccount.name);
      const newUser = await saveUserToDB({
        accountId: currentAccount.$id,
        name: currentAccount.name,
        email: currentAccount.email,
        username: currentAccount.name, // You might want to generate a unique username
        imageUrl: avatarUrl,
      });
      return newUser;
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );
    console.log('asasgsag ', await account.get());
    console.log({ session });
    return session;
  } catch (error) {
    console.error('Error signing in account:', error);
    return null;
  }
}

export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession('current');
    return session;
  } catch (error) {
    console.error('Error signing out account:', error);
    return null;
  }
}

export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      'top',
      100
    );

    if (!fileUrl) throw new Error('Failed to get file preview');

    return fileUrl;
  } catch (error) {
    console.error('Error getting file preview:', error);
    return null;
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: 'ok' };
  } catch (error) {
    console.error('Error deleting file:', error);
    return null;
  }
}

// ============================================================
// LISTS
// ============================================================

export async function getTrendingTags() {
  try {
    const tags = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(10)] // Remove tagsCount if it doesn't exist
    );
    return tags.documents
      .map(doc => doc.tags)
      .flat()
      .slice(0, 10);
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    throw error;
  }
}

export async function getPopularCategories() {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoryCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(10)] // Remove usageCount if it doesn't exist
    );
    return categories.documents;
  } catch (error) {
    console.error('Error fetching popular categories:', error);
    throw error;
  }
}

export async function getRecentLists() {

  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(10)]
    );
    return lists.documents;
  } catch (error: any) {
    console.log('Error fetching recent lists:', error.message);
    if (error instanceof AppwriteException) {
      console.log('Appwrite error details:', error.message, error.code);
    }
    // Instead of throwing, return an empty result
    return { documents: [], total: 0 };
  }
}

export async function getEmbededLists() {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      import.meta.env.VITE_EMBED_LIST_COLLECTION_ID,
      [Query.orderDesc('$createdAt'), Query.limit(5)]
    );
    return lists.documents;
  } catch (error: any) {
    console.log('Error fetching recent lists:', error.message);
    if (error instanceof AppwriteException) {
      console.log('Appwrite error details:', error.message, error.code);
    }
    // Instead of throwing, return an empty result
    return { documents: [], total: 0 };
  }
}

export async function getEmbededList(listId:any) {
  try {
    const lists = await databases.getDocument(
      appwriteConfig.databaseId,
      import.meta.env.VITE_EMBED_LIST_COLLECTION_ID,
      listId
    );
    return lists;
  } catch (error: any) {
    console.log('Error fetching recent lists:', error.message);
    if (error instanceof AppwriteException) {
      console.log('Appwrite error details:', error.message, error.code);
    }
    // Instead of throwing, return an empty result
    return { documents: [], total: 0 };
  }
}

export async function createItem(content:string,userId:string){
  try {
    const newItem = await databases.createDocument(
      appwriteConfig.databaseId,
      "66ab99e100295497dab9",
      ID.unique(),
      {
        content: content,
        creator: userId
      }
    );

    return newItem;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
}

export async function createList(list:any,userId:string): Promise<IList> {
  try {
    let items = list.items.map((v:{content:string})=>v.content)
    let itemArray = [];

    for(let item of items)
    {
      let resp = await createItem(item,userId)
      itemArray.push(resp.$id)
    }

    const newList = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      ID.unique(),
      {
        userId: userId,
        Title: list.Title,
        Description: list.Description,
        items: items,
        item: itemArray,
        Tags: list.Tags,
        Categories: list.Categories,
        locations: list.locations,
        timespans: list.timespans,
        Public: list.Public,
        aiScore: list.aiScore || 0,
        CreatedAt: list.CreatedAt,
        UpdatedAt: list.UpdatedAt,
        creator:userId
      }
    );
    console.log({ newList });
    return newList as IList;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
}


export async function createEmbedList(listId:any,type:string){
  try {
    const newList = await databases.createDocument(
      appwriteConfig.databaseId,
      import.meta.env.VITE_EMBED_LIST_COLLECTION_ID,
      ID.unique(),
      {
       list:listId,
       type:type,
      }
    );
    console.log("embed List: ",newList.document);
    return newList.documents;
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
}

export async function getInfiniteLists({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      queries
    );

    if (!lists) throw new Error('No lists found');

    return lists;
  } catch (error) {
    console.error('Error getting infinite lists:', error);
    return null;
  }
}

export async function getListById(listId: any): Promise<IList> {
  try {
    const list = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId
    );

    return list as IList;
  } catch (error) {
    console.error('Error fetching list:', error);
    throw error;
  }
}

export async function getItemById(itemId: any){
  try {
    const item = await databases.getDocument(
      appwriteConfig.databaseId,
      "66ab99e100295497dab9",
      itemId
    );
    return item;
  } catch (error) {
    console.error('Error fetching list:', error);
    throw error;
  }
}

export async function updateItem(item: any){
  try {
    const resp = await databases.updateDocument(
      appwriteConfig.databaseId,
      "66ab99e100295497dab9",
      item.id,
      {
        content: item.content,
        creator: item.creator,
      }
    );
    return resp;
  } catch (error) {
    console.error('Error fetching list:', error);
    throw error;
  }
}

export async function updateList(list: any) {
  try {

    let updatedItems = []
    for(let i of list.item)
    {
      const resp = await updateItem(i);
      updatedItems.push(resp.$id)
    }


    const updatedList = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      list.listId,
      {
        Title: list.Title,
        Description: list.Description,
        Categories: list?.Categories || [],
        timespans: list?.timespans || [],
        locations: list?.locations || [],
        Public: list.Public,
        items: list.items.map((v:{content:string})=>v.content),
        item: updatedItems, 
        Tags: list.Tags
      }
    );

    if (!updatedList) {
      throw new Error('Failed to update list');
    }

    // Re-index the updated list in Typesense
    await indexList(updatedList as IList);
    return updatedList;
  } catch (error) {
    console.error('Error updating list:', error);
    return null;
  }
}

export async function deleteList(listId?: string) {
  if (!listId) return;
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId
    );

    if (!statusCode) throw new Error('Failed to delete list');

    // Delete the list index from Typesense
    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'delete', data: { listId } }),
      false
    );

    return { status: 'Ok' };
  } catch (error) {
    console.error('Error deleting list:', error);
    return null;
  }
}

export async function likeList(listId: string, likesArray: string[]) {
  try {
    const updatedList = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId,
      {
        Likes: likesArray
      }
    );

    if (!updatedList) throw new Error('Failed to like list');

    return updatedList;
  } catch (error) {
    console.error('Error liking list:', error);
    return null;
  }
}

export async function saveList(userId: string, listId: string) {
  try {
    const updatedList = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        list: listId
      }
    );

    if (!updatedList) throw new Error('Failed to save list');

    return updatedList;
  } catch (error) {
    console.error('Error saving list:', error);
    return null;
  }
}

export async function deleteSavedList(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw new Error('Failed to delete saved list');

    return { status: 'Ok' };
  } catch (error) {
    console.error('Error deleting saved list:', error);
    return null;
  }
}

export async function getUserLists(userId?: string) {
  if (!userId) return;

  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
    );

    if (!lists) throw new Error('No lists found for user');

    return lists.documents;
  } catch (error) {
    console.error('Error getting user lists:', error);
    return null;
  }
}

export async function getCuratedList(userId: string): Promise<IListItem[]> {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
    );

    if (!lists) throw new Error('No curated list found for user');

    const curatedList = lists.documents.map(list => ({
      id: list.$id,
      title: list.title,
      description: list.description
    }));

    return curatedList;
  } catch (error) {
    console.error('Error fetching curated list:', error);
    return [];
  }
}

// ============================================================
// CATEGORY
// ============================================================

// ============================================================
// USER
// ============================================================

export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc('$createdAt')];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw new Error('No users found');

    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return null;
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw new Error('User not found');

    return user;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

export async function updateUser(user: any) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw new Error('Failed to upload file');

      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error('Failed to get file URL');
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw new Error('Failed to update user');
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// ============================================================
// COMMENTS
// ============================================================

export async function createComment(comment: {
  listId: string;
  userId: string;
  Content: string;
}) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      ID.unique(),
      {
        list: comment.listId,
        user: comment.userId,
        Content: comment.Content,
        CreatedAt: new Date().toISOString()
      }
    );

    if (!newComment) {
      throw new Error('Failed to create comment');
    }

    return newComment;
  } catch (error) {
    console.error('Error creating comment:', error);
    return null;
  }
}

export async function createReply(reply : any) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      "66b22bc7003828cf45ab",
      ID.unique(),
      {
        userId: reply.userId,
        Content: reply.Content,
      }
    );

    if (!newComment) {
      throw new Error('Failed to create reply');
    }

    return newComment;
  } catch (error) {
    console.error('Error creating reply:', error);
    return null;
  }
}

export async function getComments(listId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      [Query.equal('list', listId), Query.orderDesc('$createdAt')]
    );

    if (!comments) throw new Error('No comments found');

    return comments.documents;
  } catch (error) {
    console.error('Error getting comments:', error);
    return null;
  }
}


export async function getCommentbyId(commentId: string) {
  try {
    const comment = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      commentId
    );
    
    return comment;
  } catch (error) {
    console.error('Error getting comments:', error);
    return null;
  }
}


export async function UpdateCommentReply(comment:any) {
  try {

    let reply = await createReply(comment);
    let oldcomment = await getCommentbyId(comment.commentId);
    
    let updatedReply = Array.isArray(oldcomment?.Reply) ? [...oldcomment.Reply, reply?.$id] : [reply?.$id];

    const commentResp = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      comment.commentId,
      {
        Reply:updatedReply
      }
    );

    return commentResp;
  } catch (error) {
    console.error('Error getting comments:', error);
    return null;
  }
}

// ============================================================
// SUGGESTIONS
// ============================================================

export async function createSuggestion(suggestion: {
  listId: string;
  userId: string;
  suggestedTitle: string;
  suggestedDescription: string;
  suggestedItems: string[];
  status: string;
}) {
  try {
    const newSuggestion = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.suggestionCollectionId,
      ID.unique(),
      {
        listId: suggestion.listId,
        userId: suggestion.userId,
        suggestedTitle: suggestion.suggestedTitle,
        suggestedDescription: suggestion.suggestedDescription,
        suggestedItems: suggestion.suggestedItems,
        status: suggestion.status
      }
    );

    if (!newSuggestion) {
      throw new Error('Failed to create suggestion');
    }

    return newSuggestion;
  } catch (error) {
    console.error('Error creating suggestion:', error);
    return null;
  }
}

export async function getSuggestions(listId: string) {
  try {
    const suggestions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.suggestionCollectionId,
      [Query.equal('listId', listId), Query.orderDesc('$createdAt')]
    );

    if (!suggestions) throw new Error('No suggestions found');

    return suggestions;
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return null;
  }
}

export async function updateSuggestion(suggestionId: string, status: string) {
  try {
    const updatedSuggestion = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.suggestionCollectionId,
      suggestionId,
      { status: status }
    );

    if (!updatedSuggestion) {
      throw new Error('Failed to update suggestion');
    }

    return updatedSuggestion;
  } catch (error) {
    console.error('Error updating suggestion:', error);
    return null;
  }
}

// ============================================================
// COLLABORATIONS
// ============================================================

export async function createCollaboration(collaboration: {
  listId: string;
  userId: string;
  status: string;
}) {
  try {
    const newCollaboration = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collaborationCollectionId,
      ID.unique(),
      {
        listId: collaboration.listId,
        userId: collaboration.userId,
        status: collaboration.status
      }
    );

    if (!newCollaboration) {
      throw new Error('Failed to create collaboration');
    }

    return newCollaboration;
  } catch (error) {
    console.error('Error creating collaboration:', error);
    return null;
  }
}

export async function getCollaborations(listId: string) {
  try {
    const collaborations = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collaborationCollectionId,
      [Query.equal('listId', listId), Query.orderDesc('$createdAt')]
    );

    if (!collaborations) throw new Error('No collaborations found');

    return collaborations.documents;
  } catch (error) {
    console.error('Error getting collaborations:', error);
    return null;
  }
}

export async function updateCollaboration(
  collaborationId: string,
  status: string
) {
  try {
    const updatedCollaboration = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collaborationCollectionId,
      collaborationId,
      { status: status }
    );

    if (!updatedCollaboration) {
      throw new Error('Failed to update collaboration');
    }

    return updatedCollaboration;
  } catch (error) {
    console.error('Error updating collaboration:', error);
    return null;
  }
}

export async function getCategories(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoryCollectionId
    );
    return response.documents.map(doc => ({
      id: doc.$id,
      name: doc.name
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}
export async function searchLists(
  query: string,
  userId: string
): Promise<any[]> {
  const queries = [Query.search('Title',query),Query.orderDesc('$createdAt'), Query.limit(10)];

  // if (pageParam) {
  //   queries.push(Query.cursorAfter(pageParam));
  // }

  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      queries
    );
  
    const response = await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'search', data: { query, userId } }),
      false
    );

    const results = JSON.parse(response.responseBody);
    console.log('Results: ', {results})
    return results?.hits?.map(
      (hit: any) =>
        ({
          id: hit.document.id,
          createdAt: new Date(hit.document.created_at).toISOString(),
          Title: hit.document.Title,
          Description: hit.document.Description,
          items: hit.document.items,
          Tags: hit.document.Tags,
          creator: hit.document.creator,
          likes: [],
          comments: [],
          bookmarkCount: 0,
          sharesCount: 0,
          views: 0
        }) 
    );
  } catch (error) {
    console.error('Error searching lists:', error);
    return [];
  }
}

export const shareList = async (listId: any): Promise<string> => {
  try {
    

    
      return `${import.meta.env.VITE_APP_DOMAIN}/lists/${listId}`;
    

    // const sharedLink = await databases.createDocument(
    //   appwriteConfig.databaseId,
    //   appwriteConfig.sharedLinksCollectionId,
    //   ID.unique(),
    //   {
    //     listId: listId,
    //     createdAt: new Date().toISOString(),
    //     expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    //   }
    // );
    
    // return `${appwriteConfig.url}/shared/${sharedLink.$id}`;
  } catch (error) {
    console.error('Error creating shared link:', error);
    throw new Error('Failed to create shared link');
  }
};

// Fetch user's friends
export const getUserFriends = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [
        Query.equal('userId', userId),
        Query.equal('status', 'accepted') 
      ]
    );

    return response.documents;
  } catch (error) {
    console.error('Error fetching user friends:', error);
    throw error;
  }
};


// Fetch lists created by user's friends
export const getFriendsLists = async (userId: string) => {
  try {
    // First, get the user's friends
    const friendIds = await getUserFriends(userId);

    // Then, fetch lists created by these friends
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [
        Query.equal('creator.$id', friendIds),
        Query.orderDesc('$createdAt'),
        Query.limit(20) // Adjust this number as needed
      ]
    );

    return response.documents;
  } catch (error) {
    console.error('Error fetching friends lists:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (requestId: string) => {
  try {
    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      requestId
    );
    return result;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

// Function to get mutual friends
export const getMutualFriends = async (userId: string, otherUserId: string) => {
  try {
    const userFriends = await getFriends(userId);
    const otherUserFriends = await getFriends(otherUserId);

    const mutualFriends = userFriends.filter(friendId =>
      otherUserFriends.includes(friendId)
    );

    return mutualFriends;
  } catch (error) {
    console.error('Error getting mutual friends:', error);
    throw error;
  }
};

export async function indexList(list: any) {
  try {
    const document = {
      id: list.$id,
      Title: list.Title,
      Description: list.Description,
      items: list.items.map((item : any) => item.content), // Only index the content
      Tags: list.Tags,
      creator: list.creator.$id,
      created_at: new Date(list.$createdAt).getTime()
    };

    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'index', data: { document } }),
      false
    );
  } catch (error) {
    console.error('Error indexing list:', error);
    throw error;
  }
}
// New functions for friends
export async function sendFriendRequest(userId: string, friendId: string) {
  try {
    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      ID.unique(),
      {
        userId: userId,
        friendId: friendId,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    );
    return result;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      requestId,
      { status: 'accepted' }
    );
    return result;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
}

export async function VoteOnItem(userId: any, itemId: any) {
  try {
    const resp = await getItemById(itemId)
    
    const updatedVotes = Array.isArray(resp.vote) ? [...resp.vote, userId] : [userId];
    const updatedUserId = Array.isArray(resp.userId) ? [...resp.userId, userId] : [userId];

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      "66ab99e100295497dab9",
      itemId,
      { 
        vote: updatedVotes,
        userId: updatedUserId
      }
    );

    return result;
  } catch (error) {
    console.error('Error voting on embed list:', error);
    throw error;
  }
}

export async function getFriendRequests(userId: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [Query.equal('friendId', userId), Query.equal('status', 'pending')]
    );
    return result.documents;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
}

export async function getSentRequests() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      []
    );
    return result.documents;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
}

export async function getFriends(userId: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [Query.equal('status', 'accepted'), Query.equal('userId', userId)]
    );
    return result.documents;
  } catch (error) {
    console.error('Error getting friends:', error);
    throw error;
  }
}

// New functions for public lists
export async function getPublicLists() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.equal('Public', true), Query.orderDesc('$createdAt')]
    );
    return result.documents;
  } catch (error) {
    console.error('Error getting public lists:', error);
    throw error;
  }
}

export async function getPopularLists() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.greaterThan('Views', 0),Query.orderDesc('Views'), Query.limit(10)]
    );
    return result.documents;
  } catch (error) {
    console.error('Error getting popular lists:', error);
    throw error;
  }
}

export async function getAllLists() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      []
    );
    return result.documents;
  } catch (error) {
    console.error('Error getting All lists:', error);
    throw error;
  }
}

export async function createNotification(notification: {
  userId: string;
  type: 'friend_request' | 'list_like' | 'list_comment' | 'friend_list';
  message: string;
}) {
  try {
    const newNotification = await databases.createDocument(
      appwriteConfig.databaseId,
      import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
      ID.unique(),
      {
        userId: notification.userId,
        type: notification.type,
        message: notification.message,
        read: false,
        createdAt: new Date().toISOString(),
      }
    );
    return newNotification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

export async function getNotifications(userId:string) {
  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(50) 
      ]
    );
    return notifications.documents;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const updatedNotification = await databases.updateDocument(
      appwriteConfig.databaseId,
      import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
      notificationId,
      { read: true }
    );
    return updatedNotification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
      notificationId
    );
    return { success: true };
  } catch (error) {
    console.error("Error deleting notification:", error);
    return { success: false };
  }
}
export async function getRelatedLists(listId: string, limit: number = 5) {
  try {
    const currentList = await getListById(listId);
    if (!currentList) {
      throw new Error('List not found');
    }

    const queries = [
      Query.notEqual('$id', listId),
      Query.limit(limit),
    ];

    // If the list has tags, use them to find related lists
    if (currentList.tags && currentList.tags.length > 0) {
      queries.push(Query.search('tags', currentList.tags.join(' ')));
    }

    const relatedLists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      queries
    );

    return relatedLists.documents;
  } catch (error) {
    console.error('Error fetching related lists:', error);
    return [];
  }
}