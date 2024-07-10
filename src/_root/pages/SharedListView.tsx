import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { databases, appwriteConfig } from '@/lib/appwrite/config';
import { Loader } from '@/components/shared';
import { IList, IListItem } from '@/types';
import { AppwriteException } from 'appwrite';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';

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
        const sharedLink = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.sharedLinksCollectionId,
          sharedId
        );
        
        if (new Date(sharedLink.expiresAt) < new Date()) {
          throw new Error('This shared link has expired');
        }

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: list?.title || 'Shared List',
          text: 'Check out this list!',
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!list) return <div className="text-light-1 p-4 text-center">List not found</div>;

  return (
    <motion.div 
      className="shared-list-view p-6 max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-light-1">{list.title}</h1>
        <button 
          onClick={handleShare}
          className="bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors"
        >
          <Share2 size={20} />
        </button>
      </div>
      {list.description && (
        <p className="mb-6 text-light-2">{list.description}</p>
      )}
      <ul className="space-y-4">
        {list.items.map((item: IListItem, index: number) => (
          item.isVisible && (
            <motion.li 
              key={index} 
              className="flex items-start bg-dark-3 p-4 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="mr-2 text-primary-500 font-bold">{index + 1}.</span>
              <span className="text-light-1">{item.content}</span>
            </motion.li>
          )
        ))}
      </ul>
    </motion.div>
  );
};

export default SharedListView;