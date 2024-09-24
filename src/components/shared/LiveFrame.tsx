import { MessageCircle, Heart, Share2, Info, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListById } from "@/lib/appwrite/config";
import { VoteOnItem } from "@/lib/appwrite/api";
import { Button } from "../ui";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";

const LiveFrame = () => {
  const { id } = useParams();
  const [list, setList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const [isVoting, setIsVoting] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getListById(id);
      setList(data);
    };

    fetchData();
  }, [refreshData, id]);

  function addToLocalStorageArray(newString: string) {
    let array = JSON.parse(localStorage.getItem('myArray') || '[]');
    array.push(newString);
    localStorage.setItem('myArray', JSON.stringify(array));
  }

  const items = list?.item;
  let hasVoted = localStorage.getItem('myArray');

  const handleVote = async (id: any) => {
    setIsVoting(id);
    const UniqueId = () => {
      const timestamp = new Date().toISOString().replace(/[-:.T]/g, '');
      const random = Math.floor(Math.random() * 1000);
      return `user${timestamp}:${random}`;
    };
    let UId = UniqueId();
    addToLocalStorageArray(id);
    await VoteOnItem(UId, id);
    setRefreshData((prevState) => !prevState);
    setIsVoting(null);
  };

  const handleCTAClick = () => navigate("/");

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 text-black shadow-md overflow-hidden">
      {list && (
        <div className="p-6">
          <div className="text-slate-300 text-center text-xl sm:text-xl font-thin px-4 rounded-t-lg mb-4"
               style={{ fontFamily: "'Racing Sans One', sans-serif" }}>
            Ranking For
          </div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-indigo-800">{list.Title}</h2>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Share2 size={20} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowInfo(!showInfo)}
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Info size={20} />
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white p-4 rounded-lg mb-4 text-sm text-gray-700"
              >
                <p>Created by: {list.creator ? list.creator.Name : 'Unknown'}</p>
                <p>Date: {new Date(list.$createdAt).toLocaleDateString()}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="space-y-3">
            {items.map((item: any, index: number) => {
              let isDisabled = hasVoted?.includes(item.$id);
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-xl ${index === 0 ? "text-yellow-500" : "text-indigo-600"}`}>
                      {index + 1}
                      {index === 0 && <Crown size={16} className="inline ml-1" />}
                    </span>
                    <span className="text-pretty text-indigo-900">{item.content}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-semibold text-indigo-600">{item.vote.length * 5 || 0} pts</span>
                    <Button
                      onClick={() => handleVote(item.$id)}
                      className="p-1 rounded-full bg-pink-100 hover:bg-pink-200"
                      disabled={isDisabled || isVoting === item.$id}
                    >
                      {isVoting === item.$id ? <Loader /> : <Heart size={16} color={isDisabled ? 'hotpink' : 'gray'} />}
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </ul>

          <div className="mt-6 flex justify-between items-center">
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <Button
                onClick={handleCTAClick}
                className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600 transition-colors flex items-center space-x-1"
              >
                <MessageCircle size={16} />
                <span>Join Discussion</span>
              </Button>
              {showTooltip && (
                <div className="absolute left-0 w-48 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg mt-2">
                  Join the discussion on Topfived
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="bg-indigo-50 px-6 py-3 flex justify-between items-center fixed bottom-0 w-full">
        <button
          onClick={handleCTAClick}
          className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center text-sm font-medium"
        >
          Powered by Topfived <Crown size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default LiveFrame;