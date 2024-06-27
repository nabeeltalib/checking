import { Client, Account, Databases, Storage, Avatars } from "appwrite";

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
  !VITE_APPWRITE_COLLABORATION_COLLECTION_ID
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
};

const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
