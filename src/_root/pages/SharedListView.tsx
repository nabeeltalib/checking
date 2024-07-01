import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { databases } from '@/lib/appwrite/config'; // Update this import path
import { Loader } from '@/components/shared';
import { IList } from '@/types'; // Assuming you have a type for your list

const SharedListView: React.FC = () => {
  const { sharedId } = useParams<{ sharedId: string }>();
  const [list, setList] = useState<IList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedList = async () => {
      if (!sharedId) return;
      
      try {
        // Fetch the shared link document
        const sharedLink = await databases.getDocument(
            appwriteConfig.databaseId,
          import.meta.env.VITE_APPWRITE_SHARED_LINKS_COLLECTION_ID,
          sharedId
        );
        
        // Check if the link has expired
        if (new Date(sharedLink.expiresAt) < new Date()) {
          throw new Error('This shared link has expired');
        }

        // Fetch the actual list data
        const listData = await databases.getDocument(
          appwriteConfig.databaseId,
          import.meta.env.VITE_APPWRITE_LIST_COLLECTION_ID,
          sharedLink.listId
        );
        setList(listData as IList);
      } catch (err) {
        console.error('Error fetching shared list:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedList();
  }, [sharedId]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!list) return <div>List not found</div>;

  return (
    <div className="shared-list-view">
      <h1 className="text-2xl font-bold mb-4">{list.title}</h1>
      <p className="mb-4">{list.description}</p>
      <ul className="list-disc pl-5">
        {list.items.map((item: string, index: number) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default SharedListView;