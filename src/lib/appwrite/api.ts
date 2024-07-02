import { ID, Client, Account, AppwriteException, Databases, Storage, Avatars, Functions, Query } from "appwrite";
import { IUpdateList, INewList, IList, INewUser, IUpdateUser, IListItem, ICategoryItem } from "@/types";
import { appwriteConfig, databases, storage, functions, account } from '@/lib/appwrite/config';
import { getAISuggestions, generateListIdea, analyzeSentiment, enhanceListDescription } from '@/lib/appwrite/aiService';

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
  'VITE_APPWRITE_TYPESENSE_OPERATIONS_FUNCTION_ID',
];

const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing Appwrite environment variables: ${missingEnvVars.join(', ')}`);
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
  suggestionCollectionId: import.meta.env.VITE_APPWRITE_SUGGESTION_COLLECTION_ID,
  collaborationCollectionId: import.meta.env.VITE_APPWRITE_COLLABORATION_COLLECTION_ID,
  categoryCollectionId: import.meta.env.VITE_APPWRITE_CATEGORY_COLLECTION_ID,
  sharedLinksCollectionId: import.meta.env.VITE_APPWRITE_SHARED_LINKS_COLLECTION_ID,
  aiSuggestionsFunctionId: import.meta.env.VITE_APPWRITE_AI_SUGGESTIONS_FUNCTION_ID,
  generateListIdeaFunctionId: import.meta.env.VITE_APPWRITE_GENERATE_LIST_IDEA_FUNCTION_ID,
  analyzeSentimentFunctionId: import.meta.env.VITE_APPWRITE_ANALYZE_SENTIMENT_FUNCTION_ID,
  enhanceDescriptionFunctionId: import.meta.env.VITE_APPWRITE_ENHANCE_DESCRIPTION_FUNCTION_ID,
  typesenseOperationsFunctionId: import.meta.env.VITE_APPWRITE_TYPESENSE_OPERATIONS_FUNCTION_ID,
};

const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

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

    if (!newAccount) throw new Error("Failed to create account");

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user account:", error);
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
      user
    );

    return newUser;
  } catch (error) {
    console.error("Error saving user to database:", error);
    return null;
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailPasswordSession(user.email, user.password);
    return session;
  } catch (error) {
    console.error("Error signing in account:", error);
    return null;
  }
}

export async function getAccount() {
  try {
    const currentAccount = await account.get();
    return currentAccount;
  } catch (error) {
    console.error("Error getting account:", error);
    return null;
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
      const newUser = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        {
          accountId: currentAccount.$id,
          email: currentAccount.email,
          name: currentAccount.name, // Make sure to include the name
          username: currentAccount.name, // You might want to generate a username
        }
      );
      return newUser;
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error getting current user:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    throw error;
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return session;
  } catch (error) {
    console.error("Error signing out account:", error);
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
    console.error("Error uploading file:", error);
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
      "top",
      100
    );

    if (!fileUrl) throw new Error("Failed to get file preview");

    return fileUrl;
  } catch (error) {
    console.error("Error getting file preview:", error);
    return null;
  }
}

export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.error("Error deleting file:", error);
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
      [Query.orderDesc('$createdAt'), Query.limit(10)]  // Remove tagsCount if it doesn't exist
    );
    return tags.documents.map(doc => doc.tags).flat().slice(0, 10);
  } catch (error) {
    console.error("Error fetching trending tags:", error);
    throw error;
  }
}

export async function getPopularCategories() {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoryCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(10)]  // Remove usageCount if it doesn't exist
    );
    return categories.documents;
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    throw error;
  }
}

export async function getRecentLists(pageParam?: string) {
  const queries = [
    Query.orderDesc('$createdAt'),
    Query.limit(10)
  ];
  
  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam));
  }

  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      queries
    );
    return lists;
  } catch (error) {
    console.error("Error fetching recent lists:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    // Return an empty list instead of throwing
    return { documents: [], total: 0 };
  }
}

export async function createList(list: INewList): Promise<IList> {
  try {
    const newList = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      ID.unique(),
      {
        userId: list.userId,
        title: list.title,
        description: list.description,
        items: list.items,
        tags: list.tags,
        aiScore: list.aiScore || 0,
      }
    );
    return newList as IList;
  } catch (error) {
    console.error("Error creating list:", error);
    throw error;
  }
}

export async function getInfiniteLists({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      queries
    );

    if (!lists) throw new Error("No lists found");

    return lists;
  } catch (error) {
    console.error("Error getting infinite lists:", error);
    return null;
  }
}

export async function getListById(listId: string): Promise<IList> {
  try {
    const list = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId
    );
    return list as IList;
  } catch (error) {
    console.error("Error fetching list:", error);
    throw error;
  }
}

export async function updateList(list: IUpdateList) {
  try {
    const updatedList = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      list.listId,
      {
        title: list.title,
        description: list.description,
        items: list.items,  // Now we can pass the array directly
        tags: list.tags,
      }
    );

    if (!updatedList) {
      throw new Error("Failed to update list");
    }

    // Re-index the updated list in Typesense
    await indexList(updatedList as IList);

    return updatedList;
  } catch (error) {
    console.error("Error updating list:", error);
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

    if (!statusCode) throw new Error("Failed to delete list");

    // Delete the list index from Typesense
    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'delete', data: { listId } }),
      false
    );

    return { status: "Ok" };
  } catch (error) {
    console.error("Error deleting list:", error);
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
        likes: likesArray,
      }
    );

    if (!updatedList) throw new Error("Failed to like list");

    return updatedList;
  } catch (error) {
    console.error("Error liking list:", error);
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
        list: listId,
      }
    );

    if (!updatedList) throw new Error("Failed to save list");

    return updatedList;
  } catch (error) {
    console.error("Error saving list:", error);
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

    if (!statusCode) throw new Error("Failed to delete saved list");

    return { status: "Ok" };
  } catch (error) {
    console.error("Error deleting saved list:", error);
    return null;
  }
}

export async function getUserLists(userId?: string) {
  if (!userId) return;

  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!lists) throw new Error("No lists found for user");

    return lists;
  } catch (error) {
    console.error("Error getting user lists:", error);
    return null;
  }
}



export async function getCuratedList(userId: string): Promise<IListItem[]> {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!lists) throw new Error("No curated list found for user");

    const curatedList = lists.documents.map((list) => ({
      id: list.$id,
      title: list.title,
      description: list.description,
    }));

    return curatedList;
  } catch (error) {
    console.error("Error fetching curated list:", error);
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
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw new Error("No users found");

    return users;
  } catch (error) {
    console.error("Error getting users:", error);
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

    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw new Error("Failed to upload file");

      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Failed to get file URL");
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
        imageId: image.imageId,
      }
    );

    if (!updatedUser) {
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      throw new Error("Failed to update user");
    }

    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

// ============================================================
// COMMENTS
// ============================================================

export async function createComment(comment: {
  listId: string;
  userId: string;
  content: string;
}) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      ID.unique(),
      {
        listId: comment.listId,
        userId: comment.userId,
        content: comment.content,
        createdAt: new Date().toISOString(),
      }
    );

    if (!newComment) {
      throw new Error("Failed to create comment");
    }

    return newComment;
  } catch (error) {
    console.error("Error creating comment:", error);
    return null;
  }
}

export async function getComments(listId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      [Query.equal("listId", listId), Query.orderDesc("$createdAt")]
    );

    if (!comments) throw new Error("No comments found");

    return comments;
  } catch (error) {
    console.error("Error getting comments:", error);
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
        status: suggestion.status,
      }
    );

    if (!newSuggestion) {
      throw new Error("Failed to create suggestion");
    }

    return newSuggestion;
  } catch (error) {
    console.error("Error creating suggestion:", error);
    return null;
  }
}

export async function getSuggestions(listId: string) {
  try {
    const suggestions = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.suggestionCollectionId,
      [Query.equal("listId", listId), Query.orderDesc("$createdAt")]
    );

    if (!suggestions) throw new Error("No suggestions found");

    return suggestions;
  } catch (error) {
    console.error("Error getting suggestions:", error);
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
      throw new Error("Failed to update suggestion");
    }

    return updatedSuggestion;
  } catch (error) {
    console.error("Error updating suggestion:", error);
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
        status: collaboration.status,
      }
    );

    if (!newCollaboration) {
      throw new Error("Failed to create collaboration");
    }

    return newCollaboration;
  } catch (error) {
    console.error("Error creating collaboration:", error);
    return null;
  }
}

export async function getCollaborations(listId: string) {
  try {
    const collaborations = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.collaborationCollectionId,
      [Query.equal("listId", listId), Query.orderDesc("$createdAt")]
    );

    if (!collaborations) throw new Error("No collaborations found");

    return collaborations;
  } catch (error) {
    console.error("Error getting collaborations:", error);
    return null;
  }
}

export async function updateCollaboration(collaborationId: string, status: string) {
  try {
    const updatedCollaboration = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.collaborationCollectionId,
      collaborationId,
      { status: status }
    );

    if (!updatedCollaboration) {
      throw new Error("Failed to update collaboration");
    }

    return updatedCollaboration;
  } catch (error) {
    console.error("Error updating collaboration:", error);
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
    console.error("Error fetching categories:", error);
    return [];
  }
}
export async function searchLists(query: string): Promise<IList[]> {
  try {
    const response = await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'search', data: { query } }),
      false
    );

    const results = JSON.parse(response.response);
    return results.hits.map((hit: any) => ({
      $id: hit.document.id,
      $createdAt: new Date(hit.document.created_at).toISOString(),
      $updatedAt: new Date(hit.document.created_at).toISOString(),
      title: hit.document.title,
      description: hit.document.description,
      items: hit.document.items,
      tags: hit.document.tags,
      creator: hit.document.creator,
      likes: [],
      comments: [],
      bookmarkCount: 0,
      sharesCount: 0,
      views: 0,
    } as IList));
  } catch (error) {
    console.error("Error searching lists:", error);
    return [];
  }
}

export const shareList = async (listId: string): Promise<string> => {
  try {
    // Check if a shared link already exists for this list
    const existingLinks = await databases.listDocuments(
      "your_database_id",
      "shared_links",
      [
        databases.Query.equal("listId", listId),
        databases.Query.greaterThan("expiresAt", new Date().toISOString())
      ]
    );

    if (existingLinks.documents.length > 0) {
      // If a valid shared link exists, return it
      return `https://yourapp.com/shared/${existingLinks.documents[0].$id}`;
    }

    // If no valid shared link exists, create a new one
    const sharedLink = await databases.createDocument(
      "your_database_id",
      "shared_links",
      ID.unique(),
      {
        listId: listId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
      }
    );

    return `https://yourapp.com/shared/${sharedLink.$id}`;
  } catch (error) {
    console.error("Error creating shared link:", error);
    throw new Error("Failed to create shared link");
  }
};
// Fetch user's friends
export const getUserFriends = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.VITE_APPWRITE_DATABASE_ID,
      appwriteConfig.VITE_APPWRITE_FRIENDS_COLLECTION_ID,
      [
        Query.equal('userId', userId),
        Query.equal('status', 'accepted') // Assuming you have a status field for friend requests
      ]
    );

    return response.documents.map(doc => doc.friendId);
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
      appwriteConfig.VITE_APPWRITE_DATABASE_ID,
      appwriteConfig.VITE_APPWRITE_LIST_COLLECTION_ID,
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
// Function to send a friend request
export const sendFriendRequest = async (userId: string, friendId: string) => {
  try {
    const result = await databases.createDocument(
      appwriteConfig.VITE_APPWRITE_DATABASE_ID,
      appwriteConfig.VITE_APPWRITE_FRIENDS_COLLECTION_ID,
      ID.unique(),
      {
        userId: userId,
        friendId: friendId,
        status: 'pending'
      }
    );
    return result;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

// Function to accept a friend request
export const acceptFriendRequest = async (requestId: string) => {
  try {
    const result = await databases.updateDocument(
      appwriteConfig.VITE_APPWRITE_DATABASE_ID,
      appwriteConfig.VITE_APPWRITE_FRIENDS_COLLECTION_ID,
      requestId,
      { status: 'accepted' }
    );
    return result;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (requestId: string) => {
  try {
    const result = await databases.deleteDocument(
      appwriteConfig.VITE_APPWRITE_DATABASE_ID,
      appwriteConfig.VITE_APPWRITE_FRIENDS_COLLECTION_ID,
      requestId
    );
    return result;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

// Function to get all friend requests for a user
export const getFriendRequests = async (userId: string) => {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.VITE_APPWRITE_DATABASE_ID,
      appwriteConfig.VITE_APPWRITE_FRIENDS_COLLECTION_ID,
      [
        Query.equal('friendId', userId),
        Query.equal('status', 'pending')
      ]
    );
    return result.documents;
  } catch (error) {
    console.error('Error getting friend requests:', error);
    throw error;
  }
};

// Function to get all friends of a user
export const getFriends = async (userId: string) => {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.VITE_APPWRITE_DATABASE_ID,
      appwriteConfig.VITE_APPWRITE_FRIENDS_COLLECTION_ID,
      [
        Query.equal('status', 'accepted'),
        Query.search('userId', userId)
      ]
    );
    return result.documents.map(doc => doc.friendId);
  } catch (error) {
    console.error('Error getting friends:', error);
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

export async function indexList(list: IList) {
  try {
    const document = {
      id: list.$id,
      title: list.title,
      description: list.description,
      items: list.items.map(item => item.content),  // Only index the content
      tags: list.tags,
      creator: list.creator.$id,
      created_at: new Date(list.$createdAt).getTime()
    };

    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: 'index', data: { document } }),
      false
    );
  } catch (error) {
    console.error("Error indexing list:", error);
    throw error;
  }
}
