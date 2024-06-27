import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

  const savedListRecord = currentUser?.save.find(
    (record: Models.Document) => record.list.$id === list.$id
  );

  useEffect(() => {
    setIsSaved(!!savedListRecord);
  }, [savedListRecord]);

  const handleLikeList = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
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

  const handleSaveList = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();

    if (savedListRecord) {
      setIsSaved(false);
      return deleteSaveList(savedListRecord.$id);
    }

    saveList({ userId: userId, listId: list.$id });
    setIsSaved(true);
  };

  const containerStyles = location.pathname.startsWith("/profile") ? "w-full" : "";

  return (
    <div className={`flex flex-row flex-wrap w-full items-center z-20 gap-3 ${containerStyles}`}>
      <Button className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg">
        <img
          src={checkIsLiked(likes, userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          alt="like"
          width={20}
          height={20}
          onClick={handleLikeList}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length} Likes</p>
      </Button>
      <Button
        className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg"
        onClick={handleSaveList}
      >
        <img
          src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
          alt="save"
          width={20}
          height={20}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">
          {isSaved ? "Saved" : "Save"}
        </p>
      </Button>
      <Button className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg">
        <img src="/assets/icons/chat.svg" alt="comment" width={20} height={20} />
        <p className="small-medium lg:base-medium">Comment</p>
      </Button>
      <Button className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg">
        <img src="/assets/icons/lightbulb.svg" alt="suggest" width={20} height={20} />
        <p className="small-medium lg:base-medium">Suggest</p>
      </Button>
      <Button className="bg-dark-3 text-white flex items-center gap-2 py-2 px-4 rounded-lg">
        <img src="/assets/icons/people.svg" alt="collaborate" width={20} height={20} />
        <p className="small-medium lg:base-medium">Collaborate</p>
      </Button>
    </div>
  );
};

export default ListStats;