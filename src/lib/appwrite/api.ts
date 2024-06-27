import { Client, Account, Databases, Storage, Avatars, ID, Query } from "appwrite";
import { IUpdateList, INewList, INewUser, IUpdateUser, IListItem, ICategoryItem } from "@/types";

// Ensure environment variables are defined
const {
  VITE_APPWRITE_URL,
  VITE_APPWRITE_PROJECT_ID,
  VITE_APPWRITE_DATABASE_ID,
  VITE_APPWRITE_STORAGE_ID,
  VITE_APPWRITE_USER_COLLECTION_ID,
  VITE_APPWRITE_LIST_COLLECTION_ID,
  VITE_APPWRITE_SAVES_COLLECTION_ID,
  VITE_APPWRITE_COMMENT_COLLECTION_ID,
  VITE_APPWRITE_SUGGESTION_COLLECTION_ID,
  VITE_APPWRITE_COLLABORATION_COLLECTION_ID,
  VITE_APPWRITE_CATEGORY_COLLECTION_ID,
} = import.meta.env;

if (
  !VITE_APPWRITE_URL ||
  !VITE_APPWRITE_PROJECT_ID ||
  !VITE_APPWRITE_DATABASE_ID ||
  !VITE_APPWRITE_STORAGE_ID ||
  !VITE_APPWRITE_USER_COLLECTION_ID ||
  !VITE_APPWRITE_LIST_COLLECTION_ID ||
  !VITE_APPWRITE_SAVES_COLLECTION_ID ||
  !VITE_APPWRITE_COMMENT_COLLECTION_ID ||
  !VITE_APPWRITE_SUGGESTION_COLLECTION_ID ||
  !VITE_APPWRITE_COLLABORATION_COLLECTION_ID ||
  !VITE_APPWRITE_CATEGORY_COLLECTION_ID
) {
  throw new Error("Missing Appwrite environment variables");
}

export const appwriteConfig = {
  url: VITE_APPWRITE_URL,
  projectId: VITE_APPWRITE_PROJECT_ID,
  databaseId: VITE_APPWRITE_DATABASE_ID,
  storageId: VITE_APPWRITE_STORAGE_ID,
  userCollectionId: VITE_APPWRITE_USER_COLLECTION_ID,
  listCollectionId: VITE_APPWRITE_LIST_COLLECTION_ID,
  savesCollectionId: VITE_APPWRITE_SAVES_COLLECTION_ID,
  commentCollectionId: VITE_APPWRITE_COMMENT_COLLECTION_ID,
  suggestionCollectionId: VITE_APPWRITE_SUGGESTION_COLLECTION_ID,
  collaborationCollectionId: VITE_APPWRITE_COLLABORATION_COLLECTION_ID,
  categoryCollectionId: VITE_APPWRITE_CATEGORY_COLLECTION_ID,
};

const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

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
    const currentAccount = await getAccount();

    if (!currentAccount) throw new Error("Failed to get current account");

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.total === 0) throw new Error("User not found");

    return currentUser.documents[0];
  } catch (error) {
    console.error("Error getting current user:", error);
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

export async function createList(list: INewList) {
  try {
    console.log(list.tags);
    const tags = list.tags || [];
    const items = list.items || [];
    
    const newList = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      ID.unique(),
      {
        creator: list.userId,
        title: list.title,
        description: list.description,
        items: items,
        tags: tags,
        bookmark_count: 0,
        shares_count: 0,
        views: 0,
      }
    );

    if (!newList) {
      throw new Error("Failed to create list");
    }

    return newList;
  } catch (error) {
    console.error("Error creating list:", error);
    return null;
  }
}

export async function searchLists(searchTerm: string) {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.search("title", searchTerm)]
    );

    if (!lists) throw new Error("No lists found");

    return lists;
  } catch (error) {
    console.error("Error searching lists:", error);
    return null;
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

export async function getListById(listId?: string) {
  if (!listId) throw new Error("List ID is required");

  try {
    const list = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      listId
    );

    if (!list) throw new Error("List not found");

    return list;
  } catch (error) {
    console.error("Error getting list by ID:", error);
    return null;
  }
}

export async function updateList(list: IUpdateList) {
  try {
    const tags = list.tags?.replace(/ /g, "").split(",") || [];

    const updatedList = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      list.listId,
      {
        title: list.title,
        description: list.description,
        items: list.items,
        tags: tags,
      }
    );

    if (!updatedList) {
      throw new Error("Failed to update list");
    }

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

export async function getRecentLists() {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!lists) throw new Error("No recent lists found");

    return lists;
  } catch (error) {
    console.error("Error getting recent lists:", error);
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

export async function getCategories(): Promise<ICategoryItem[]> {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoryCollectionId,
    );

    if (!lists) throw new Error("No category list found");

    const categories = lists.documents.map((list) => ({
      id: list.$id,
      name: list.name,
    }));

    return categories;
  } catch (error) {
    console.error("Error fetching category list:", error);
    return [];
  }
}



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
