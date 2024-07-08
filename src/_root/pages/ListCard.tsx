import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useEnhanceListDescription } from "@/lib/react-query/queries";
import { shareList } from "@/lib/appwrite/api";
import { IList, IListItem } from "@/types";

type ListCardProps = {
  list: IList;
};

const deserializeItem = (item: string | IListItem): IListItem => {
  if (typeof item === 'string') {
    const [content, isVisible] = item?.split('|');
    return { content, isVisible: isVisible === 'true' };
  }
  return item;
};

const ListCard: React.FC<ListCardProps> = ({ list }) => {
  console.log({list})
  // const parsedItems = useMemo(() => list?.items?.map(deserializeItem), [list?.items]);
  // const [items] = useState<IListItem[]>(parsedItems);
  const visibleItems = list?.items;//?.filter(item => item.isVisible).slice(0, 5);
  const { mutate: enhanceDescription, isLoading: isEnhancing } = useEnhanceListDescription();
  const [enhancedDescription, setEnhancedDescription] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const handleEnhanceDescription = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    enhanceDescription(
      { listId: list?.$id, description: list?.Description },
      {
        onSuccess: (enhanced) => setEnhancedDescription(enhanced),
        onError: (error) => {
          console.error('Error enhancing description:', error);
          // TODO: Implement user-friendly error message
        }
      }
    );
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSharing(true);
    try {
      const shareableLink = await shareList(list.$id);
      console.log('Shareable link:', shareableLink);
      // TODO: Implement a proper way to show this link to the user, e.g., modal or toast
      alert(`Shareable link: ${shareableLink}`);
    } catch (error) {
      console.error('Error sharing list:', error);
      // TODO: Implement user-friendly error message
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="list-card bg-dark-3 p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <h3 className="list-title text-xl font-bold mb-2 text-white line-clamp-2">
        {list.Title}
      </h3>
      <p className="list-description text-light-3 mb-4 line-clamp-3">
        {enhancedDescription || list.Description}
      </p>
      
      <div className="flex justify-between items-center mt-2">
        <button
          onClick={handleEnhanceDescription}
          className="bg-primary-500 text-light-1 px-2 py-1 rounded-md text-xs"
          disabled={isEnhancing}
        >
          {isEnhancing ? "Enhancing..." : "Enhance Description"}
        </button>
        <button
          onClick={handleShare}
          className="bg-primary-500 text-light-1 px-2 py-1 rounded-md text-xs"
          disabled={isSharing}
        >
          {isSharing ? "Sharing..." : "Share"}
        </button>
      </div>

      <Link to={`/lists/${list.$id}`} className="block mt-4">
        <ul className="list-items mb-4">
          {visibleItems?.map((item, index) => (
            <li key={index} className="list-item text-light-1 mb-1 line-clamp-1">
              {item?.content||item}
            </li>
          ))}
          {/* {items?.length > 5 && (
            <li className="list-item text-light-1 mb-1">
              and {items?.length - 5} more...
            </li>
          )} */}
        </ul>
        {/* <div className="list-tags flex flex-wrap gap-2">
          {list?.tags?.map((tag: string) => (
            <span
              key={tag}
              className="list-tag bg-dark-4 text-light-3 rounded-full px-2 py-1 text-xs"
            >
              #{tag}
            </span>
          ))}
        </div> */}
      </Link>
      
      <Link to={`/lists/${list.$id}`} className="mt-2 inline-block text-primary-500">
        View List
      </Link>
    </div>
  );
};

export default ListCard;