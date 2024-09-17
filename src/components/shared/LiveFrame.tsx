import { ExternalLink, MessageCircle, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getListById } from "@/lib/appwrite/config";
import { VoteOnItem } from "@/lib/appwrite/api";
import { Button } from "../ui";
import Loader from "./Loader";

const LiveFrame = () => {
  const { id } = useParams();
  const [list, setList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const [isVoting, setIsVoting] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getListById(id);
      setList(data);
    };

    fetchData();
  }, [refreshData, id]);

  function addToLocalStorageArray(newString:string) {
    let array = JSON.parse(localStorage.getItem('myArray')) || [];
    array.push(newString);
    localStorage.setItem('myArray', JSON.stringify(array));
  }


  const [embedType] = useState("top5");

  const items = embedType === "top5" ? list?.item : list?.item;
  let hasVoted = localStorage.getItem('myArray');

  const handleVote = async (id: any) => {
    setIsVoting(id)
      const UniqueId = () => {
        const timestamp = new Date().toISOString().replace(/[-:.T]/g, '');
        const random = Math.floor(Math.random() * 1000);
        return `user${timestamp}:${random}`;
      };
      let UId = UniqueId();
      addToLocalStorageArray(id);
      await VoteOnItem(UniqueId, id)
      console.log("asdad",UId)

    setRefreshData((prevState) => !prevState);
    setIsVoting(null)
  };
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();
  const handleCTAClick = () => {
    navigate("/");
  };

  return (
    <div className="w-full min-h-screen bg-white text-black shadow-md overflow-hidden">
      {list && (
        <div>
          <div className="p-6 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{list.Title}</h2>
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
            <ul>
            {items.map((item: any, index: number) => {
              let isDisabled = hasVoted?.includes(item.$id);
              return (
                <li
                  key={index}
                  className="flex justify-between items-center mb-2">
                  <span>
                    {index + 1}. {item.content}
                  </span>
                  <span className="flex gap-2 items-center">
                    <span className="font-semibold">
                      {item.vote.length * 5 || 0} pts
                    </span>
                    <span>
                      <Button
                        onClick={() => handleVote(item.$id)}
                        disabled={isDisabled}>
                        {isVoting === item.$id ? <Loader /> : <Heart size={20} />}
                      </Button>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          </div>
          <div className="fixed w-full bottom-0">
            <div className="bg-gray-100 px-6 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">Powered by Topfived</span>
              <button
                onClick={handleCTAClick}
                className="text-blue-500 hover:text-blue-600 transition-colors flex items-center text-sm">
                View on Topfived <ExternalLink size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveFrame;