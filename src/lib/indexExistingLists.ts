import { databases, functions, appwriteConfig } from '@/lib/appwrite/config';
import { IListItem } from '@/types';

export async function indexExistingLists() {
  try {
    const lists = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.listCollectionId,
      [] // Add filters or queries as needed
    );

    if (!lists.documents || lists.documents.length === 0) {
      console.log('No lists found to index.');
      return;
    }

    for (const list of lists.documents) {
      try {
        // Transform items to ensure they're in the correct format
        const transformedItems = list.items.map((item: string | IListItem) => {
          if (typeof item === 'string') {
            const [content, isVisible] = item.split('|');
            return { content, isVisible: isVisible === 'true' };
          }
          return item;
        });

        const transformedList = {
          ...list,
          items: transformedItems,
        };

        await functions.createExecution(
          appwriteConfig.typesenseOperationsFunctionId,
          JSON.stringify({ operation: 'index', data: { list: transformedList } }),
          false
        );
      } catch (innerError) {
        console.error(`Error indexing list with ID ${list.$id}:`, innerError);
      }
    }

    console.log('Existing lists indexed successfully');
  } catch (error) {
    console.error('Error indexing existing lists:', error);
  }
}
