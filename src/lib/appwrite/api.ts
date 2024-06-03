import { ID, Query } from "appwrite";
import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdateList, INewList, INewUser, IUpdateUser } from "@/types";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
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
    console.log(error);
    return null;
  }
}

// ============================== SAVE USER TO DB
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
    console.log(error);
    return null;
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET USER
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
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================================================
// LISTS
// ============================================================

// ============================== CREATE LIST

export async function createList(list: INewList) {
  try {
    // Convert tags into array
    const tags = list.tags?.replace(/ /g, "").split(",") || [];

    // Create list
    const newList = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      ID.unique(),
      {
        creator: list.userId,
        title: list.title,
        description: list.description,
        items: list.items,
        tags: tags,
      }
    );

    if (!newList) {
      throw new Error("Failed to create list");
    }

    return newList;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET LISTS
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
    console.log(error);
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
    console.log(error);
    return null;
  }
}

// ============================== GET LIST BY ID
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
    console.log(error);
    return null;
  }
}

// ============================== UPDATE LIST
export async function updateList(list: IUpdateList) {
  try {
    // Convert tags into array
    const tags = list.tags?.replace(/ /g, "").split(",") || [];

    //  Update list
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
    console.log(error);
    return null;
  }
}

// ============================== DELETE LIST
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
    console.log(error);
    return null;
  }
}

// ============================== LIKE / UNLIKE LIST
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
    console.log(error);
    return null;
  }
}

// ============================== SAVE LIST
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
    console.log(error);
    return null;
  }
}

// ============================== DELETE SAVED LIST
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
    console.log(error);
    return null;
  }
}

// ============================== GET USER'S LISTS
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
    console.log(error);
    return null;
  }
}

// ============================== GET RECENT LISTS
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
    console.log(error);
    return null;
  }
}
// ============================================================
// USER
// ============================================================

// ============================== GET USERS
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
    console.log(error);
    return null;
  }
}

// ============================== GET USER BY ID
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
    console.log(error);
    return null;
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw new Error("Failed to upload file");

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Failed to get file URL");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
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

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw new Error("Failed to update user");
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}
