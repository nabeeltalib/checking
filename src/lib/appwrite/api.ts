import { IList, IListItem } from "@/types";
import {
  Account,
  AppwriteException,
  Avatars,
  Client,
  Databases,
  Functions,
  ID,
  OAuthProvider,
  Query,
  Storage,
} from "appwrite";
import { account, appwriteConfig, avatars, databases, storage } from "./config";

// Ensure environment variables are defined
const requiredEnvVars = [
  "VITE_APPWRITE_URL",
  "VITE_APPWRITE_PROJECT_ID",
  "VITE_APPWRITE_DATABASE_ID",
  "VITE_APPWRITE_STORAGE_ID",
  "VITE_APPWRITE_USER_COLLECTION_ID",
  "VITE_APPWRITE_LIST_COLLECTION_ID",
  "VITE_APPWRITE_SAVES_COLLECTION_ID",
  "VITE_APPWRITE_COMMENT_COLLECTION_ID",
  "VITE_APPWRITE_SUGGESTION_COLLECTION_ID",
  "VITE_APPWRITE_COLLABORATION_COLLECTION_ID",
  "VITE_APPWRITE_CATEGORY_COLLECTION_ID",
  "VITE_APPWRITE_SHARED_LINKS_COLLECTION_ID",
  "VITE_APPWRITE_AI_SUGGESTIONS_FUNCTION_ID",
  "VITE_APPWRITE_GENERATE_LIST_IDEA_FUNCTION_ID",
  "VITE_APPWRITE_ANALYZE_SENTIMENT_FUNCTION_ID",
  "VITE_APPWRITE_ENHANCE_DESCRIPTION_FUNCTION_ID",
  "VITE_APPWRITE_TYPESENSE_OPERATIONS_FUNCTION_ID",
  "VITE_ITEM_COLLECTION_ID",
  "VITE_APPWRITE_COMMENT_REPLY_COLLECTION_ID",
  "VITE_APPWRITE_REPORTED_COMMENTS_COLLECTION_ID",
  "VITE_APPWRITE_CONNECTIONS_COLLECTION_ID",
  "VITE_APPWRITE_REPORTED_LISTS_COLLECTION_ID",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing Appwrite environment variables: ${missingEnvVars.join(", ")}`
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
  generateListItemFunctionId: import.meta.env
    .VITE_APPWRITE_GENERATE_LIST_ITEMS_FUNCTION_ID,
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
  friendsCollectionId: import.meta.env.VITE_APPWRITE_FRIENDS_COLLECTION_ID,
  itemCollectionId: import.meta.env.VITE_ITEM_COLLECTION_ID,
  commentReplyCollectionId: import.meta.env.VITE_APPWRITE_COMMENT_REPLY_COLLECTION_ID,
  reportedCommentsCollectionId: import.meta.env.VITE_APPWRITE_REPORTED_COMMENTS_COLLECTION_ID,
  connectionsCollectionId: import.meta.env.VITE_APPWRITE_CONNECTIONS_COLLECTION_ID,
  reportedListsCollectionId: import.meta.env.VITE_APPWRITE_REPORTED_LISTS_COLLECTION_ID,
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

export async function createUserAccount(user: any) {
  const name = user.name == "" ? user?.email.split("@")[0] : user.name;
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      name
    );

    if (!newAccount) throw new Error("Failed to create account");

    const avatarUrl = avatars.getInitials(name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
      categories: user.categories,
      bio: user.bio,
    });

    return newUser;
  } catch (error: any) {
    console.error("Error creating user account:", error.message);
    return null;
  }
}

export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
  bio?: string;
  categories: string[];
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
        Username: user.username || user.name,
        Categories: user.categories || [],
        Bio: user.bio || "",
      }
    );

    return newUser;
  } catch (error) {
    console.error("Error saving user to database:", error);
    return error;
  }
}

export async function signInWithGoogle() {
  try {
    const session = await account.createOAuth2Session(
      OAuthProvider.Google,
      `${import.meta.env.VITE_APP_URL}/auth/callback`, 
      `${import.meta.env.VITE_APP_URL}/signin`,  
      [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid",
      ]
    );
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
    console.log({ currentAccount });
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
    if (error.code === 401) {
      return null;
    }
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
    console.log("asasgsag ", await account.get());
    console.log({ session });
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
      [Query.orderDesc("$createdAt"), Query.limit(10)] // Remove tagsCount if it doesn't exist
    );
    return tags.documents
      .map((doc) => doc.Tags)
      .flat()
      .slice(0, 10);
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
      [
        Query.orderDesc("usageCount"), // Order by the usageCount in descending order
        Query.limit(10) // Limit the result to the top 10 categories
      ]
    );
    return categories.documents;
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    throw error;
  }
}
export async function updateCategoryUsageCount(categoryName: string, increment: number) {
  try {
    const category = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoryCollectionId,
      [Query.equal("name", categoryName)]
    );

    if (category.documents.length > 0) {
      const categoryId = category.documents[0].$id;
      const currentUsageCount = category.documents[0].usageCount || 0;

      // Increment the usage count
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoryCollectionId,
        categoryId,
        {
          usageCount: currentUsageCount + increment,
        }
      );
    }
  } catch (error) {
    console.error("Error updating category usage count:", error);
  }
}

export async function getRecentLists() {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(10)]
    );
    return lists.documents;
  } catch (error: any) {
    console.log("Error fetching recent lists:", error.message);
    if (error instanceof AppwriteException) {
      console.log("Appwrite error details:", error.message, error.code);
    }
    // Instead of throwing, return an empty result
    return { documents: [], total: 0 };
  }
}

export async function getUserLikedLists(userId:string) {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.search('Likes', userId),Query.orderDesc('$createdAt'), Query.limit(10)]
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
      [Query.orderDesc("$createdAt"), Query.limit(5)]
    );
    return lists.documents;
  } catch (error: any) {
    console.log("Error fetching recent lists:", error.message);
    if (error instanceof AppwriteException) {
      console.log("Appwrite error details:", error.message, error.code);
    }
    // Instead of throwing, return an empty result
    return { documents: [], total: 0 };
  }
}

export async function getEmbededList(listId: any) {
  try {
    const lists = await databases.getDocument(
      appwriteConfig.databaseId,
      import.meta.env.VITE_EMBED_LIST_COLLECTION_ID,
      listId
    );
    return lists;
  } catch (error: any) {
    console.log("Error fetching recent lists:", error.message);
    if (error instanceof AppwriteException) {
      console.log("Appwrite error details:", error.message, error.code);
    }
    // Instead of throwing, return an empty result
    return { documents: [], total: 0 };
  }
}

export async function createItem(content: string, userId: string) {
  try {
    const newItem = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.itemCollectionId,
      ID.unique(),
      {
        content: content,
        creator: userId,
      }
    );

    return newItem;
  } catch (error) {
    console.error("Error creating list:", error);
    throw error;
  }
}

export async function createList(list: any, userId: string): Promise<IList> {
  try {
    let items = list.items.map((v: { content: string }) => v.content);
    let itemArray = [];

    for (let item of items) {
      let resp = await createItem(item, userId);
      itemArray.push(resp.$id);
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
        CreatedAt: list.CreatedAt || new Date().toISOString(),
        UpdatedAt: list.UpdatedAt || new Date().toISOString(),
        creator: userId,
        users: [userId],
      }
    );

    return newList as IList;
  } catch (error) {
    console.error("Error creating list:", error);
    throw error;
  }
}

export async function createEmbedList(listId: any, type: string) {
  try {
    const newList = await databases.createDocument(
      appwriteConfig.databaseId,
      import.meta.env.VITE_EMBED_LIST_COLLECTION_ID,
      ID.unique(),
      {
        list: listId,
        type: type,
      }
    );
    console.log("embed List: ", newList.document);
    return newList.documents;
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

export async function getListById(listId: string, userId: string): Promise<IList> {
  try {
    const list = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId
    ) as IList;

    // Check if the user requesting the list is the creator
    if (list.creator.$id !== userId) {
      // If not the creator, remove the DislikesCount property
      delete list.DislikesCount;
    }

    return list;
  } catch (error) {
    console.error("Error fetching list:", error);
    throw error;
  }
}

export async function getItemById(itemId: any) {
  try {
    const item = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.itemCollectionId,
      itemId
    );
    return item;
  } catch (error) {
    console.error("Error fetching list:", error);
    throw error;
  }
}

export async function updateItem(item: any) {
  try {
    const resp = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.itemCollectionId,
      item.id,
      {
        content: item.content,
        creator: item.creator,
      }
    );
    return resp;
  } catch (error) {
    console.error("Error fetching list:", error);
    throw error;
  }
}

export async function dislikeList(listId: string, userId: string) {
  try {
    const list = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId
    );
    
    let newLikes = list.Likes || [];
    let newDislikesCount = list.DislikesCount || 0;

    if (newLikes.includes(userId)) {
      // If the user previously liked the list, remove the like and add a dislike
      newLikes = newLikes.filter((id: string) => id !== userId);
      newDislikesCount++;
    } else {
      // Toggle dislike
      newDislikesCount = newDislikesCount > 0 ? newDislikesCount - 1 : newDislikesCount + 1;
    }

    const updatedList = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId,
      {
        Likes: newLikes,
        DislikesCount: newDislikesCount
      }
    );

    return updatedList;
  } catch (error) {
    console.error("Error disliking list:", error);
    throw error;
  }
}

export async function CollaborateOnList(listId: string, userId: string) {
  try {
    let user = await getUserById(userId);
    let updatedLists = Array.isArray(user?.lists)
      ? [...user.lists, listId]
      : [listId];

    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        lists: updatedLists,
      }
    );

    return updatedUser;
  } catch (error) {
    console.error("Error updating list:", error);
    return null;
  }
}

export async function updateList(list: any) {
  try {
    let updatedItems = [];
    for (let i of list.item) {
      if (!i.id) {
        let resp = await createItem(i.content, list.userId);
        updatedItems.push(resp.$id);
        continue;
      }
      const resp = await updateItem(i);
      updatedItems.push(resp.$id);
    }

    //Remove item first so that sorting is done correctly
    const resp = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      list.listId,
      {
        item: [],
      }
    );

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
        items: list.items.map((v: { content: string }) => v.content),
        item: updatedItems.map((item) => item),
        Tags: list.Tags,
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
      JSON.stringify({ operation: "delete", data: { listId } }),
      false
    );

    return { status: "Ok" };
  } catch (error) {
    console.error("Error deleting list:", error);
    return null;
  }
}

export async function likeList(
  listId: string,
  data: { Likes: string[]; Dislikes: string[] }
) {
  try {
    const updatedList = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId,
      data
    );
    return updatedList;
  } catch (error) {
    console.error("Error updating list reactions:", error);
    throw error;
  }
}

export async function likeComment(commentId: string, likesArray: string[]) {
  try {
    const updatedComment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      commentId,
      {
        Likes: likesArray
      }
    );

    if (!updatedComment) throw new Error('Failed to like comment');

    return updatedComment;
  } catch (error) {
    console.error('Error liking list:', error);
    return null;
  }
}
export async function ReplyLike(commentId: string, likesArray: string[]) {
  try {
    const updatedComment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentReplyCollectionId,
      commentId,
      {
        Likes: likesArray
      }
    );
    if (!updatedComment) throw new Error('Failed to like comment');
    return updatedComment;
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

    return lists.documents;
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
  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(100)] // Fetch more users initially
    );

    if (!users) throw new Error("No users found");

    const usersWithDetails = await Promise.all(users.documents.map(async (user) => {
      const userLists = await getUserLists(user.$id);
      const totalLikes = userLists?.reduce((acc, list) => acc + (list.Likes?.length || 0), 0) || 0;
      const listsCreated = userLists?.length || 0;

      return {
        ...user,
        totalLikes,
        listsCreated
      };
    }));

    // Sort users by total likes in descending order, then by lists created
    usersWithDetails.sort((a, b) => {
      if (b.totalLikes !== a.totalLikes) {
        return b.totalLikes - a.totalLikes;
      }
      return b.listsCreated - a.listsCreated;
    });

    // Remove duplicate users based on $id
    const uniqueUsers = usersWithDetails.filter((user, index, self) =>
      index === self.findIndex((t) => t.$id === user.$id)
    );

    return limit ? uniqueUsers.slice(0, limit) : uniqueUsers;
  } catch (error) {
    console.error("Error getting users:", error);
    return null;
  }
}
export async function getTotalUsers() {
  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(1)]
    );
    return users.total;
  } catch (error) {
    console.error('Error fetching total users:', error);
    throw error;
  }
}

export async function getTotalLists() {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId, // Make sure this is "1141" or the correct ID
      [Query.limit(1)]
    );
    return lists.total;
  } catch (error) {
    console.error('Error fetching total lists:', error);
    throw error;
  }
}

export async function getReportedCommentsCount() {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reportedCommentsCollectionId, // Make sure this is "66dc4454001a27643f2d" or the correct ID
      [Query.limit(1)]
    );
    return comments.total;
  } catch (error) {
    console.error('Error fetching reported comments count:', error);
    throw error;
  }
}

export async function getActiveUsersCount() {
  try {
    // Instead of querying for 'lastActivity', we'll just get the total number of users
    // You may want to adjust this based on your specific definition of an "active" user
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(1)]
    );
    return users.total;
  } catch (error) {
    console.error('Error fetching active users count:', error);
    throw error;
  }
}

export async function getUserById(userId: any) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );
    console.log('Fetched User:', user); // Check if socialLinks is present
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
        Name: user.Name,
        Bio: user.Bio,
        ImageUrl: image.imageUrl,
        ImageId: image.imageId,
        Public: user.Public,
        socialLinks: user.socialLinks, // Ensure this field is included
      }
    );
    console.log("Updating user with data:", {
      Name: user.Name,
      Bio: user.Bio,
      ImageUrl: image.imageUrl,
      ImageId: image.imageId,
      Public: user.Public,
      socialLinks: user.socialLinks, // Ensure this field is included
    });

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
  Content: string;  // Note the capital 'C' in Content
}) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      ID.unique(),
      {
        Content: comment.Content,
        user: comment.userId,
        list: comment.listId,
        CreatedAt: new Date().toISOString(),
        Likes: [],  // Initialize with an empty array
        Reply: []   // Initialize with an empty array
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

export async function createReply(reply: {
  userId: string;
  Content: string;
  commentId?: string;
  parentReplyId?: string;
}) {
  try {
    const documentData: any = {
      userId: reply.userId,
      Content: reply.Content,
      Likes: [],
      Reply: [],
      CreatedAt: new Date().toISOString(),
    };

    if (reply.commentId) {
      documentData.commentId = reply.commentId;
    }

    if (reply.parentReplyId) {
      documentData.parentReplyId = reply.parentReplyId;
    }

    const newReply = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentReplyCollectionId,
      ID.unique(),
      documentData
    );

    if (!newReply) {
      throw new Error('Failed to create reply');
    }

    return newReply;
  } catch (error) {
    console.error('Error creating reply:', error);
    throw error;
  }
}

export async function updateCommentWithReply(commentId: string, replyId: string) {
  try {
    const comment = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      commentId
    );

    const updatedReplies = comment.Reply ? [...comment.Reply, replyId] : [replyId];

    const updatedComment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      commentId,
      {
        Reply: updatedReplies,
      }
    );

    return updatedComment;
  } catch (error) {
    console.error("Error updating comment with reply:", error);
    throw error;
  }
}

export async function updateReplyWithReply(replyId: string, newReplyId: string) {
  try {
    const reply = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentReplyCollectionId,
      replyId
    );

    const updatedReplies = reply.Reply ? [...reply.Reply, newReplyId] : [newReplyId];

    const updatedReply = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentReplyCollectionId,
      replyId,
      {
        Reply: updatedReplies,
      }
    );

    return updatedReply;
  } catch (error) {
    console.error('Error updating reply with nested reply:', error);
    throw error;
  }
}

export async function getComments(listId: string) {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      [Query.equal("list", listId), Query.orderDesc("$createdAt")]
    );

    if (!comments) throw new Error("No comments found");

    return comments.documents;
  } catch (error) {
    console.error("Error getting comments:", error);
    return null;
  }
}

export async function reportList(listId: string, reportedBy: string, listTitle: string, reason: string) {
  try {
    const reportedList = await databases.createDocument(
      appwriteConfig.databaseId,
      "6710ff2b000b2ae127fc", // Use the actual collection ID for ReportedLists
      ID.unique(),
      {
        listId: listId,
        listTitle: listTitle,
        reportedBy: reportedBy,
        reason: reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      }
    );

    if (!reportedList) {
      throw new Error('Failed to report list');
    }

    return reportedList;
  } catch (error) {
    console.error('Error reporting list:', error);
    if (error instanceof AppwriteException) {
      if (error.code === 401) {
        throw new Error('You are not authorized to report lists. Please check your account permissions.');
      } else {
        throw new Error(`An error occurred while reporting the list: ${error.message}`);
      }
    }
    throw error;
  }
}

export async function updateListStatus(reportId: string, status: string) {
  // Validate the status
  if (!["pending", "reviewed", "deleted"].includes(status)) {
    throw new Error("Invalid status. Must be 'pending', 'reviewed', or 'deleted'.");
  }

  try {
    const updatedReport = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reportedListsCollectionId, 
      reportId,
      { status: status }
    );

    if (!updatedReport) throw new Error('Failed to update list status');

    return updatedReport;
  } catch (error) {
    console.error('Error updating list status:', error);
    return null;
  }
}
export async function getReportedLists() {
  try {
    const reportedLists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reportedListsCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    if (!reportedLists) {
      throw new Error('No reported lists found');
    }

    return reportedLists.documents;
  } catch (error) {
    console.error('Error fetching reported lists:', error);
    if (error instanceof AppwriteException) {
      if (error.code === 401) {
        throw new Error('You are not authorized to view reported lists. Please check your account permissions.');
      } else {
        throw new Error(`An error occurred while fetching reported lists: ${error.message}`);
      }
    }
    throw error;
  }
}
export async function reportComment(comment:any) {
  try {
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reportedCommentsCollectionId,
      ID.unique(),
      {
        commentContent: comment.Content,
        commentId: comment.id,
        commentedBy: comment.User,
        ReportedBy: comment.Reporter
      }
    );

    if (!newComment) {
      throw new Error('Failed to Report comment');
    }

    return newComment;
  } catch (error) {
    console.error('Error reporting comment:', error);
    return null;
  }
}

export async function reportReply(reply: any) {
  try {
    const data = {
      replyContent: reply.Content,
      replyId: reply.id,
      repliedBy: reply.User,
      ReportedBy: reply.Reporter,
    };

    console.log('Data being sent to createDocument:', data);

    const newReport = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reportedCommentsCollectionId,
      ID.unique(),
      data
    );

    if (!newReport) {
      throw new Error('Failed to report reply');
    }

    return newReport;
  } catch (error) {
    console.error('Error reporting reply:', error);
    return null;
  }
}

export async function getReportedComments() {
  try {
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reportedCommentsCollectionId,
      [Query.orderDesc('$createdAt')]
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
    console.error("Error getting comments:", error);
    return null;
  }
}

export async function deleteComment(commentId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      commentId
    );

    if (!statusCode) throw new Error('Failed to delete comment');

    return { status: 'Ok' };
  } catch (error) {
    console.error('Error getting comments:', error);
    return null;
  }
}


export async function deleteReportedComment(commentId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reportedCommentsCollectionId,
      commentId
    );
    
    if (!statusCode) throw new Error('Failed to delete comment');

    return { status: 'Ok' };
  } catch (error) {
    console.error('Error getting comments:', error);
    return null;
  }
}

export async function UpdateCommentReply(comment: any) {
  try {
    let reply = await createReply(comment);
    let oldcomment = await getCommentbyId(comment.commentId);

    let updatedReply = Array.isArray(oldcomment?.Reply)
      ? [...oldcomment.Reply, reply?.$id]
      : [reply?.$id];

    const commentResp = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentCollectionId,
      comment.commentId,
      {
        Reply: updatedReply,
      }
    );

    return commentResp;
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

    return collaborations.documents;
  } catch (error) {
    console.error("Error getting collaborations:", error);
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
    return response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
    }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
export async function searchLists(
  query: string,
  userId: string
): Promise<any[]> {
  const queries = [
    Query.search("Title", query),
    Query.equal('parentReplyId', parentReplyId),
    Query.orderDesc("$createdAt"),
    Query.limit(10),
  ];

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
      JSON.stringify({ operation: "search", data: { query, userId } }),
      false
    );

    const results = JSON.parse(response.responseBody);
    console.log("Results: ", { results });
    return results?.hits?.map((hit: any) => ({
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
      views: 0,
    }));
  } catch (error) {
    console.error("Error searching lists:", error);
    return [];
  }
}

export const shareList = async (listId: string): Promise<string> => {
  try {
    // Check if a shared link already exists for this list
    const existingLinks = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.sharedLinksCollectionId,
      [
        Query.equal("listId", listId),
        Query.greaterThan("expiresAt", new Date().toISOString())
      ]
    );

    let sharedLinkId;
    if (existingLinks.documents.length > 0) {
      sharedLinkId = existingLinks.documents[0].$id;
    } else {
      // No valid shared link, create a new one
      const newSharedLink = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.sharedLinksCollectionId,
        ID.unique(),
        {
          listId: listId,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
        }
      );
      sharedLinkId = newSharedLink.$id;
    }

    // Use the VITE_APP_DOMAIN environment variable for the domain
    const appDomain = import.meta.env.VITE_APP_DOMAIN || 'http://localhost:3000';
    return `${appDomain}/shared/${sharedLinkId}`;
  } catch (error) {
    console.error("Error creating shared link:", error);
    throw new Error("Failed to create or retrieve shared link");
  }
};


// Fetch user's friends
export const getUserFriends = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [Query.equal("userId", userId), Query.equal("status", "accepted")]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching user friends:", error);
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
        Query.equal("creator.$id", friendIds),
        Query.orderDesc("$createdAt"),
        Query.limit(20), // Adjust this number as needed
      ]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching friends lists:", error);
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
    console.error("Error rejecting friend request:", error);
    throw error;
  }
};

// Function to get mutual friends
export const getMutualFriends = async (userId: string, otherUserId: string) => {
  try {
    const userFriends = await getFriends(userId);
    const otherUserFriends = await getFriends(otherUserId);

    const mutualFriends = userFriends.filter((friendId) =>
      otherUserFriends.includes(friendId)
    );

    return mutualFriends;
  } catch (error) {
    console.error("Error getting mutual friends:", error);
    throw error;
  }
};

export async function indexList(list: any) {
  try {
    const document = {
      id: list.$id,
      Title: list.Title,
      Description: list.Description,
      items: list.items.map((item: any) => item.content), // Only index the content
      Tags: list.Tags,
      creator: list.creator.$id,
      created_at: new Date(list.$createdAt).getTime(),
    };

    await functions.createExecution(
      appwriteConfig.typesenseOperationsFunctionId,
      JSON.stringify({ operation: "index", data: { document } }),
      false
    );
  } catch (error) {
    console.error("Error indexing list:", error);
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
        status: "pending",
        createdAt: new Date().toISOString(),
      }
    );
    return result;
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      requestId,
      { status: "accepted" }
    );
    return result;
  } catch (error) {
    console.error("Error accepting friend request:", error);
    throw error;
  }
}

export async function VoteOnItem(userId: any, itemId: any) {
  try {
    const resp = await getItemById(itemId);

    const updatedVotes = Array.isArray(resp.vote)
      ? [...resp.vote, userId]
      : [userId];
    const updatedUserId = Array.isArray(resp.userId)
      ? [...resp.userId, userId]
      : [userId];

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.itemCollectionId,
      itemId,
      {
        vote: updatedVotes,
        userId: updatedUserId,
      }
    );

    return result;
  } catch (error) {
    console.error("Error voting on embed list:", error);
    throw error;
  }
}

export async function getFriendRequests(userId: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [Query.equal("friendId", userId), Query.equal("status", "pending")]
    );
    return result.documents;
  } catch (error) {
    console.error("Error getting friend requests:", error);
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
    console.error("Error getting friend requests:", error);
    throw error;
  }
}

export async function getFriends(userId: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.friendsCollectionId,
      [Query.equal("status", "accepted"), Query.equal("userId", userId)]
    );
    return result.documents;
  } catch (error) {
    console.error("Error getting friends:", error);
    throw error;
  }
}

export async function getConnection(userId: string) {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.connectionsCollectionId,
      [Query.equal("userId", userId)]
    );
    return result.documents;
  } catch (error) {
    console.error("Error getting friends:", error);
    throw error;
  }
}

export async function createConnection(userId: string) {
  try {
    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.connectionsCollectionId,
      ID.unique(),
      {
        userId: userId,
      }
    );
    return result;
  } catch (error) {
    console.error("Error getting friends:", error);
    throw error;
  }
}

export async function updateConnection(
  connectionId: string,
  follower: string[],
  following: string[]
) {
  try {
    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.connectionsCollectionId,
      connectionId,
      {
        follower: follower,
        following: following,
      }
    );
    return result;
  } catch (error) {
    console.error("Error getting friends:", error);
    throw error;
  }
}

export async function followUser(userId: string, followingId: string) {
  try {
    let findUser = await getConnection(userId);
    if (findUser.length > 0) {
      let updatedFollowing = Array.isArray(findUser[0].following)
        ? [...findUser[0].following, followingId]
        : [followingId];
      let updatedFollower =
        findUser[0].follower.length > 0
          ? findUser[0].follower.map((user: any) => user.$id)
          : [];
      await updateConnection(
        findUser[0].$id,
        updatedFollower,
        updatedFollowing
      );
      let followingUser = await getConnection(followingId);
      if (followingUser.length > 0) {
        let updatedFollower = Array.isArray(followingUser[0].follower)
          ? [...followingUser[0].follower.map((item: any) => item.$id), userId]
          : [userId];
        await updateConnection(
          followingUser[0].$id,
          updatedFollower,
          followingUser[0].following
        );
      } else {
        let followingUser = await createConnection(followingId);
        await updateConnection(followingUser.$id, [userId], []);
      }
    } else {
      let userFollow = await createConnection(userId);
      await updateConnection(userFollow.$id, [], [followingId]);

      let followingUser = await getConnection(followingId);
      if (followingUser.length > 0) {
        let updatedFollower = Array.isArray(followingUser[0].follower)
          ? [...followingUser[0].follower.map((item: any) => item.$id), userId]
          : [userId];
        await updateConnection(
          followingUser[0].$id,
          updatedFollower,
          followingUser[0].following
        );
      } else {
        let followingUser = await createConnection(followingId);
        await updateConnection(followingUser.$id, [userId], []);
      }
    }
  } catch (error) {
    console.error("Error getting friends:", error);
    throw error;
  }
}

export async function UnFollow(userId: string, followingId: string) {
  try {
    let User = await getConnection(userId);
    let Other = await getConnection(followingId);

    let UserFollowing = await User[0].following.filter(
      (follow: any) => follow !== followingId
    );
    let updatedOther = await Other[0].follower.filter(
      (follow: any) => follow.$id !== userId
    );

    let UserFollower = User[0].follower.map((item: any) => item.$id);
    let OtherFollower = updatedOther.map((item: any) => item.$id);

    await updateConnection(User[0].$id, UserFollower, UserFollowing);
    await updateConnection(Other[0].$id, OtherFollower, Other[0].following);
  } catch (error) {
    console.error("Error getting friends:", error);
    throw error;
  }
}

// Function to shuffle an array (Fisher-Yates Shuffle)
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export async function getPublicLists(start: number, end: number) {
  try {
    // Fetch the documents with pagination
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [
        Query.limit(end - start),  // Limit the number of documents returned
        Query.offset(start),       // Start fetching documents from this index
      ]
    );

    // Randomize the fetched lists
    const randomizedLists = shuffleArray(result.documents);

    return randomizedLists;
  } catch (error) {
    console.error("Error getting public lists:", error);
    throw error;
  }
}

export async function getPopularLists() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.greaterThan("Views", 0), Query.orderDesc("Views"), Query.limit(10)]
    );
    return result.documents;
  } catch (error) {
    console.error("Error getting popular lists:", error);
    throw error;
  }
}

export async function getMostLikedLists() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.orderDesc("Likes"), Query.limit(10)]
    );
    return result.documents;
  } catch (error) {
    console.error("Error getting popular lists:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    // Return an empty array instead of throwing
    return [];
  }
}

export const likeReply = async (replyId: string, likesArray: string[]) => {
  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentReplyCollectionId,
      replyId,
      { Likes: likesArray }
    );
  } catch (error) {
    console.error('Error liking reply:', error);
    throw error;
  }
};
export const getReplies = async (commentId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentReplyCollectionId, // CommentReply collection ID
      [
        Query.equal('commentId', ),
        Query.orderDesc('$createdAt')
      ]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching replies:', error);
    throw error;
  }
};

export const getNestedReplies = async (parentReplyId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentReplyCollectionId,
      [
        Query.equal('parentReplyId', parentReplyId), // Pass as string
        Query.orderDesc('$createdAt'),
      ]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching nested replies:', error);
    return [];
  }
};

export async function getAllLists() {
  try {
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      []
    );
    return result.documents;
  } catch (error) {
    console.error("Error getting All lists:", error);
    throw error;
  }
}

export async function createNotification(notification: {
  userId: string;
  type: "friend_request" | "list_like" | "list_comment" | "friend_list";
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

export async function getNotifications(userId: string) {
  try {
    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      import.meta.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID,
      [
        Query.equal("userId", userId),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
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
      throw new Error("List not found");
    }

    const queries = [Query.notEqual("$id", listId), Query.limit(limit)];

    // If the list has tags, use them to find related lists
    if (currentList.tags && currentList.tags.length > 0) {
      queries.push(Query.search("tags", currentList.tags.join(" ")));
    }

    const relatedLists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      queries
    );

    return relatedLists.documents;
  } catch (error) {
    console.error("Error fetching related lists:", error);
    return [];
  }
}