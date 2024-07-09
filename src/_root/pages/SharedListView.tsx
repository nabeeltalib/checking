import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Loader } from '@/components/shared';
import { IList, IListItem } from '@/types';
import { AppwriteException } from 'appwrite';

const SharedListView: React.FC = () => {
  const { sharedId } = useParams<{ sharedId: string }>();
  const [list, setList] = useState<IList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedList = async () => {
      if (!sharedId) {
        setError('No shared ID provided');
        setLoading(false);
        return;
      }
      
      try {
        // Fetch the shared link document
        const sharedLink = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.sharedLinksCollectionId,
          sharedId
        );
        
        // Check if the link has expired
        if (new Date(sharedLink.expiresAt) < new Date()) {
          throw new Error('This shared link has expired');
        }

        // Fetch the actual list data
        const listData = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.listCollectionId,
          sharedLink.listId
        );
        setList(listData as IList);
      } catch (err) {
        console.error('Error fetching shared list:', err);
        if (err instanceof AppwriteException) {
          setError(`Appwrite error: ${err.message}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSharedList();
  }, [sharedId, navigate]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!list) return <div className="text-light-1 p-4 text-center">List not found</div>;

  return (
    <div className="shared-list-view p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-light-1">{list.title}</h1>
      {list.description && <p className="mb-6 text-light-2">{list.description}</p>}
      <ul className="space-y-4">
        {list.items.map((item: IListItem, index: number) => (
          item.isVisible && (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-primary-500">{index + 1}.</span>
              <span className="text-light-1">{item.content}</span>
            </li>
          )
        ))}
      </ul>
    </div>
  );
};

export default SharedListView;