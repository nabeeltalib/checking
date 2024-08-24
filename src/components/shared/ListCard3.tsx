import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { shareList } from "@/lib/appwrite/api";
import { Share2 } from "lucide-react";
import { useDeleteSavedList, useGetComments, useGetCurrentUser, useLikeList, useSaveList } from "@/lib/react-query/queries";
import Comment from "./Comment";
import { Models } from "appwrite";
import { useUserContext } from "@/context/AuthContext";
import { checkIsLiked } from "@/lib/utils";

const ListCard3: React.FC<any> = ({ list }) => {
  const [isSharing, setIsSharing] = useState(false);
  const { data: comments } = useGetComments(list.$id);
  const { user } = useUserContext();
  const { id } = user;
  const { data: currentUser } = useGetCurrentUser();
  const { mutate: deleteSaveList } = useDeleteSavedList();
  const { mutate: saveList } = useSaveList();
  const { mutate: likeList } = useLikeList();
  const navigate = useNavigate();

  const checkIsSaved = currentUser?.save?.some((saved: any) => saved.list.$id === list.$id);
  const [isSaved, setIsSaved] = useState(checkIsSaved);

  const likesList = list?.Likes || [];
  const [likes, setLikes] = useState<any[]>(likesList);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      if (navigator.share) {
        await navigator.share({
          title: list.title,
          text: `Check out this list: ${list.title}`,
          url: shareableLink,
        });
      } else {
        await navigator.clipboard.writeText(shareableLink);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing list:", error);
      alert("Failed to share list. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveList = (e: any) => {
    e.stopPropagation();
    if (isSaved) {
      const savedListRecord = currentUser?.save?.find(
        (record: Models.Document) => record.list.$id === list.$id
      );
      if (savedListRecord) {
        deleteSaveList(savedListRecord.$id);
      }
    } else {
      saveList({ userId: id, listId: list.$id });
    }
    setIsSaved(!isSaved);
  };

  const handleLikeList = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    e.stopPropagation();
    const newLikes = likes.includes(id)
      ? likes.filter((likeId) => likeId !== id)
      : [...likes, id];
    setLikes(newLikes);
    likeList({ listId: list.$id, likesArray: newLikes });
  };

  const renderListItems = () => {
    let items: Array<string | { content: string }> = [];

    if (Array.isArray(list.items)) {
      items = list.items;
    } else if (typeof list.items === "string") {
      items = list.split("\n");
    } else if (typeof list === "object" && list !== null) {
      items = Object.values(list);
    }

    return items.slice(0, 5).map((item, index) => (
      <li key={index} className="flex items-center mb-2">
        <span className="flex-shrink-0 w-8 h-8 text-light-1 bg-gray-800 rounded-full flex items-center justify-center font-bold mr-3">
          {index + 1}
        </span>
        <span className="text-light-2 truncate">
          {typeof item === "string" ? item : item.content || ""}
        </span>
      </li>
    ));
  };

  return (
    <>
      <motion.div
        className="bg-dark-2 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6">
          <h2 className="text-3xl font-bold mb-6 text-primary-500">
            {list.Title}
          </h2>
          {list.Description ? (
            <h4 className="text-sm font-thin mb-6 text-gray-100">
              {list.Description}
            </h4>
          ) : null}

          <div className="flex justify-end items-end mb-4">
            <button
              onClick={handleShare}
              className="text-light-2 hover:text-primary-500 transition-colors p-2 rounded-full hover:bg-dark-3"
              disabled={isSharing}
            >
              <Share2 size={24} />
            </button>
          </div>

          <Link to={`/lists/${list.$id}`} className="block">
            <ol className="list-none mb-6 space-y-3">
              {renderListItems()}
            </ol>

            {Array.isArray(list.items) && list.items.length > 5 && (
              <p className="text-primary-500 font-semibold text-sm mb-4">
                + {list.items.length - 5} more items
              </p>
            )}

            {list.tags && list.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {list.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {list.tags.length > 3 && (
                  <span className="bg-dark-4 text-light-2 px-3 py-1 rounded-full text-xs">
                    +{list.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            {list?.Tags?.map((tag: string, index: number) => (
              <span
                key={`${tag}${index}`}
                onClick={() => navigate(`/categories/${tag}`)}
                className="text-primary-500 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>

          {list.locations.length > 0 && (
            <div className="text-blue-500">
              {list.locations.map((location: any, index: number) => (
                <span key={index}>{location}</span>
              ))}
            </div>
          )}

          {list.timespans.length > 0 && (
            <div className="text-blue-500">
              {list.timespans.map((timespan: any, index: number) => (
                <span key={index}>{timespan}</span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-dark-3 px-6 py-3 flex justify-between text-light-2 text-sm">
          <span className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg">
            <img
              src={
                checkIsLiked(likes, id)
                  ? "/assets/icons/liked.svg"
                  : "/assets/icons/like.svg"
              }
              alt="like"
              width={20}
              height={20}
              onClick={handleLikeList}
              className="cursor-pointer"
            />
            <p className="small-medium lg:base-medium">{likes.length} Likes</p>
          </span>

          <span
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleSaveList}
          >
            <img
              src={
                isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"
              }
              alt="save"
              width={20}
              height={20}
            />
            <p className="small-medium lg:base-medium">
              {isSaved ? "Saved" : "Save"}
            </p>
          </span>

          <span
            onClick={() => navigate(`/lists/${list.$id}`)}
            className="flex items-center cursor-pointer"
          >
            <img
              src="/assets/icons/comment.svg"
              alt="Comments"
              className="w-5 h-5 mr-2"
            />
            {comments?.length || 0} Comments
          </span>
        </div>

        <div className="w-full mt-4 p-4 border-t border-gray-300">
          <h3 className="text-lg font-semibold">Comments</h3>
          {comments && comments.length > 0 ? (
            <ul>
              <div className="mt-1 flex flex-col gap-2">
                {comments.slice(0, 2).map((comment: any, index: number) => (
                  <Comment comment={comment} key={index} />
                ))}
              </div>
            </ul>
          ) : (
            <p className="text-sm text-gray-500">Be the first to comment!</p>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default ListCard3;
