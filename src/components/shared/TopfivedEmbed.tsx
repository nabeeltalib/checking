import { ExternalLink, MessageCircle, Heart } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui";
import { useUserContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { checkIsLiked } from "@/lib/utils";
import { likeList } from "@/lib/appwrite/config";

export const TopfivedEmbed = ({
  type,
  items,
  handleVote,
  setRefresh,
  list,
}: any) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { user } = useUserContext();
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
    setRefresh((prevState: any) => !prevState);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
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

        {type === "top5" ? (
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
        ) : (
          <ul>
            {items.map((item: any, index: number) => {
              let isDisabled = item.vote.some((i: any) => i.$id === user.id);
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
                        <Heart size={20} />{" "}
                      </Button>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
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
  );
};