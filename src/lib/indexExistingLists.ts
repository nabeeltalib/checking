// indexExistingLists.ts
import { Query } from "appwrite";
import { databases, functions, appwriteConfig } from '@/lib/appwrite/config';

export async function indexExistingLists() {
    try {
      const lists = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.listCollectionId,
        [Query.limit(100)] // Adjust as needed
      );
  
      for (const list of lists.documents) {
        await functions.createExecution(
          appwriteConfig.typesenseOperationsFunctionId,
          JSON.stringify({ operation: 'index', data: { list } }),
          false
        );
      }
  
      console.log('Existing lists indexed successfully');
    } catch (error) {
      console.error('Error indexing existing lists:', error);
    }
  }