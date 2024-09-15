import { ExternalLink, MessageCircle} from "lucide-react";
import { useEffect, useState } from "react";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { checkIsLiked } from "@/lib/utils";
import { getListById, likeList } from "@/lib/appwrite/config";

const StaticFrame = () => {
  const { id } = useParams();
  const [list, setList] = useState<any>(null);
  const [refreshData, setRefreshData] = useState(false);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getListById(id);
      setList(data);
    };

    fetchData();
  }, [refreshData, id]);

  const [embedType] = useState("top5");

  const items = embedType === "top5" ? list?.item : list?.item;

  const [showTooltip, setShowTooltip] = useState(false);
  const userId = user.id;

  const navigate = useNavigate();
  const handleCTAClick = () => {
    navigate("/");
  };

  const handleLikeList = async (list: any) => {
    let likes = list.Likes;
    let newLikes = likes.includes(userId)
      ? likes.filter((Id: any) => Id !== userId)
      : [...likes, userId];
    await likeList(list.$id, newLikes);
    setRefreshData((prevState: any) => !prevState);
  };

  return (
    <div className="w-full h-screen bg-white text-black">
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
            <ol className="list-decimal list-inside">
              {items.map((item: any, index: number) => {
                return (
                  <div key={index} className="mb-2 flex justify-between">
                    <span>
                      {index + 1}. {item.content}
                    </span>
                  </div>
                );
              })}
              <div className="flex mt-5 justify-end">
                <span className="bg-zinc-950 p-2 rounded-lg">
                  <img
                    src={
                      checkIsLiked(list.Likes, userId)
                        ? "/assets/icons/liked.svg"
                        : "/assets/icons/like.svg"
                    }
                    alt="like"
                    width={20}
                    height={20}
                    onClick={() => handleLikeList(list)}
                    className="cursor-pointer"
                  />
                </span>
              </div>
            </ol>
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

export default StaticFrame;