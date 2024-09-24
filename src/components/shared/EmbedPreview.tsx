import { useEffect, useState } from 'react';
import { MessageSquareHeart, RadioTower, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopfivedEmbed } from './TopfivedEmbed';
import { getListById, VoteOnItem } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const EmbedPreview = () => {
  const { id } = useParams();
  const [embedList, setEmbedList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const { user } = useUserContext();
  const [embedType, setEmbedType] = useState('top5');
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getListById(id);
      setEmbedList(data);
    };

    fetchData();
  }, [refreshData, id]);

  const items = embedList?.item;

  const handleVote = async (id: string) => {
    setIsVoting(id);
    await VoteOnItem(user.id, id);
    setRefreshData((prevState) => !prevState);
    setIsVoting(null);
  };

  const navigate = useNavigate();

  const embedInfo = {
    top5: {
      title: "Top 5 List",
      description: "A static display of your curated top 5 items. Perfect for showcasing your final selections or recommendations. It's simple, clean, and doesn't change unless you update it."
    },
    leaderboard: {
      title: "Live Leaderboard",
      description: "An interactive, real-time ranking of items that viewers can vote on. Great for engaging your audience and getting their opinions. The order can change based on votes, making it dynamic and interactive."
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg shadow-md">
      <div className="sticky top-0 z-10 rounded-t-lg flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-500 font-bold text-lg">
          &larr; Back
        </button>
      </div>
      <h2 className="text-3xl font-bold mb-4 text-center">Embed Preview</h2>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setEmbedType('top5')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            embedType === 'top5'
              ? 'bg-primary-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
          }`}
        >
          <MessageSquareHeart className="inline-block mr-2" /> Top 5 List
        </button>
        <button
          onClick={() => setEmbedType('leaderboard')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            embedType === 'leaderboard'
              ? 'bg-primary-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
          }`}
        >
          <RadioTower className="inline-block mr-2" /> Live Leaderboard
        </button>
      </div>

      {embedList && (
        <TopfivedEmbed
          type={embedType}
          items={items || []}
          handleVote={handleVote}
          isVoting={isVoting}
          setRefresh={setRefreshData}
          list={embedList}
        />
      )}

      {/* New interactive info section */}
      <div className="mt-8 relative">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="absolute top-0 right-0 text-primary-500 hover:text-primary-600 transition-colors"
        >
          <Info size={24} />
        </button>
        <AnimatePresence mode="wait">
          {showInfo && (
            <motion.div
              key={embedType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-primary-50 dark:bg-primary-900 border-l-4 border-primary-500 p-4 rounded-md"
            >
              <h3 className="font-bold text-primary-700 dark:text-primary-300">
                {embedInfo[embedType as keyof typeof embedInfo].title}
              </h3>
              <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
                {embedInfo[embedType as keyof typeof embedInfo].description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EmbedPreview;