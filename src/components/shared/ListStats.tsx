import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { checkIsLiked } from "@/lib/utils";
import {
  useLikeList,
  useSaveList,
  useDeleteSavedList,
  useGetCurrentUser,
} from "@/lib/react-query/queries";

type ListStatsProps = {
  list: Models.Document;
  userId: string;
};

const ListStats = ({ list, userId }: ListStatsProps) => {
  const location = useLocation();
  const likesList = list.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likeList } = useLikeList();
  const { mutate: saveList } = useSaveList();
  const { mutate: deleteSaveList } = useDeleteSavedList();

  const { data: currentUser } = useGetCurrentUser();

  const savedListRecord = currentUser?.savedLists.find(
    (record: Models.Document) => record.list.$id === list.$id
  );

  useEffect(() => {
    setIsSaved(!!savedListRecord);
  }, [currentUser]);

  const handleLikeList = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    let likesArray = [...likes];

    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likeList({ listId: list.$id, likesArray });
  };

  const handleSaveList = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (savedListRecord) {
      setIsSaved(false);
      return deleteSaveList(savedListRecord.$id);
    }

    saveList({ userId: userId, listId: list.$id });
    setIsSaved(true);
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div
      className={`flex justify-between items-center z-20 ${containerStyles}`}>
      <div className="flex gap-2 mr-5">
        <img
          src={`${
            checkIsLiked(likes, userId)
              ? "/assets/icons/liked.svg"
              : "/assets/icons/like.svg"
          }`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikeList(e)}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      <div className="flex gap-2">
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSaveList(e)}
        />
      </div>
    </div>
  );
};

export default ListStats;