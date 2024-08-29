import { useEffect, useState } from 'react';
import { List, BarChart } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { TopfivedEmbed } from './TopfivedEmbed';
import { getListById, VoteOnItem } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';

const EmbedPreview = () => {
  const { id } = useParams();
  const [embedList, setEmbedList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const { user } = useUserContext();

  const [embedType, setEmbedType] = useState('top5');
  const [customTitle, setCustomTitle] = useState('List Items');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getListById(id);
        setEmbedList(data);
        if (data) {
          setCustomTitle(data.Title || 'List Items');
        }
      } catch (error) {
        console.error('Error fetching list:', error);
      }
    };

    fetchData();
  }, [refreshData, id]);

  const items = embedList?.item || [];

  const handleVote = async (itemId: string) => {
    try {
      await VoteOnItem(user.id, itemId);
      setRefreshData((prevState) => !prevState);
    } catch (error) {
      console.error('Error voting on item:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Embed Preview</h2>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setEmbedType('top5')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            embedType === 'top5'
              ? 'bg-primary-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
          }`}
        >
          <List className="inline-block mr-2" /> Top 5 List
        </button>
        <button
          onClick={() => setEmbedType('leaderboard')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            embedType === 'leaderboard'
              ? 'bg-primary-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
          }`}
        >
          <BarChart className="inline-block mr-2" /> Live Leaderboard
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          Custom Title
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white"
        />
      </div>

      <TopfivedEmbed
        type={embedType}
        title={customTitle}
        items={items}
        handleVote={handleVote}
      />
    </div>
  );
};

export default EmbedPreview;
