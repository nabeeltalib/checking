import { useEffect, useState } from 'react';
import { List, BarChart, ExternalLink, MessageCircle, Heart } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { getListById, VoteOnItem, likeList } from '@/lib/appwrite/api';
import { useUserContext } from '@/context/AuthContext';
import { Button } from '../ui/button';
import Loader from './Loader';
import { checkIsLiked } from '@/lib/utils';

const EmbedPreview = () => {
  const { id } = useParams();
  const [embedList, setEmbedList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const { user } = useUserContext();
  const [embedType, setEmbedType] = useState('static');
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getListById(id);
      setEmbedList(data);
    };

    fetchData();
  }, [refreshData, id]);

  const items = embedList?.item || [];

  const handleVote = async (itemId: string) => {
    if (embedType === 'live') {
      setIsVoting(itemId);
      const UniqueId = () => {
        const timestamp = new Date().toISOString().replace(/[-:.T]/g, '');
        const random = Math.floor(Math.random() * 1000);
        return `user${timestamp}:${random}`;
      };
      let UId = UniqueId();
      await VoteOnItem(UId, itemId);
      setRefreshData((prevState) => !prevState);
      setIsVoting(null);
    } else {
      alert("In order to vote, please visit https://topfived.com");
    }
  };

  const handleLikeList = async () => {
    if (embedType === 'static') {
      alert("In order to Like, please visit https://topfived.com");
    } else {
      setIsLiking(true);
      let likes = embedList.Likes;
      let newLikes = likes.includes(user.id)
        ? likes.filter((Id: string) => Id !== user.id)
        : [...likes, user.id];
      await likeList(embedList.$id, newLikes);
      setRefreshData((prevState) => !prevState);
      setIsLiking(false);
    }
  };

  const handleCTAClick = () => {
    navigate("/");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-zinc-900 text-black dark:text-white rounded-lg shadow-md">
      <div className="sticky top-0 z-10 rounded-t-lg flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-primary-500 font-bold text-lg">
          &larr; Back
        </button>
      </div>
      <h2 className="text-3xl font-bold mb-4 text-center">Embed Preview</h2>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setEmbedType('static')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            embedType === 'static'
              ? 'bg-primary-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
          }`}
        >
          <List className="inline-block mr-2" /> Static Frame
        </button>
        <button
          onClick={() => setEmbedType('live')}
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${
            embedType === 'live'
              ? 'bg-primary-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white'
          }`}
        >
          <BarChart className="inline-block mr-2" /> Live Frame
        </button>
      </div>

      {embedList && (
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{embedList.Title}</h2>
              <div
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}>
                <button
                  onClick={handleCTAClick}
                  className="text-blue-500 hover:text-blue-600 transition-colors">
                  <MessageCircle size={24} />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 w-48 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg">
                    Join the discussion on Topfived
                  </div>
                )}
              </div>
            </div>

            <ol className="list-decimal list-inside">
              {items.map((item: any, index: number) => (
                <li key={index} className="mb-2 flex justify-between">
                  <span>
                    {index + 1}. {item.content}
                  </span>
                  {embedType === 'live' && (
                    <span className="flex gap-2 items-center">
                      <span className="font-semibold">
                        {item.vote.length * 5 || 0} pts
                      </span>
                      <Button
                        onClick={() => handleVote(item.$id)}
                        disabled={isVoting === item.$id}
                      >
                        {isVoting === item.$id ? <Loader /> : <Heart size={20} />}
                      </Button>
                    </span>
                  )}
                </li>
              ))}
            </ol>

            <div className="flex mt-5 justify-end">
              <div className="flex flex-col items-center">
                <span className="bg-zinc-950 p-2 rounded-lg">
                  {isLiking ? (
                    <Loader />
                  ) : (
                    <img
                      src={
                        checkIsLiked(embedList.Likes, user.id)
                          ? "/assets/icons/liked.svg"
                          : "/assets/icons/like.svg"
                      }
                      alt="like"
                      width={20}
                      height={20}
                      onClick={handleLikeList}
                      className="cursor-pointer"
                    />
                  )}
                </span>
                <p className="font-bold">{embedList.Likes.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 px-6 py-3 flex justify-between items-center">
            <span className="text-sm text-gray-600">Powered by Topfived</span>
            <button
              onClick={handleCTAClick}
              className="text-blue-500 hover:text-blue-600 transition-colors flex items-center text-sm">
              View on Topfived <ExternalLink size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbedPreview;