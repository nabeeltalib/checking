import { Link } from "react-router-dom";
import { IList, IListItem } from "@/types";

interface GridListListProps {
  lists: any[];
  showUser?: boolean;
  showStats?: boolean;
}

const GridListList: React.FC<GridListListProps> = ({ lists, showUser = true, showStats = true }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {lists?.map((list) => (
        <div key={list.$id} className="bg-dark-4 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
          <Link to={`/lists/${list.$id}`} className="block p-4">
            <h3 className="text-xl font-bold text-light-1 mb-2">{list.title}</h3>
            <ul className="list-decimal list-inside mb-4 text-light-1">
              {list.items?.slice(0, 5).map((item: IListItem, index: number) => (
                <li key={index} className="line-clamp-1">{item.content}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {list.tags && list.tags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="bg-dark-3 text-light-4 rounded-full px-2 py-1 text-xs">
                  #{tag}
                </span>
              ))}
              {list.tags && list.tags.length > 3 && <span className="bg-dark-3 text-light-4 rounded-full px-2 py-1 text-xs">+{list.tags.length - 3}</span>}
            </div>
          </Link>
          {showUser && list.creator && (
            <Link to={`/profile/${list.creator.$id}`} className="px-4 py-2 bg-dark-3 flex items-center hover:bg-dark-2">
              <img
                src={list.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt={`${list.creator.name}'s profile`}
                className="w-8 h-8 rounded-full mr-2 object-cover"
              />
              <p className="text-light-1 truncate">{list.creator.name}</p>
            </Link>
          )}
          {showStats && (
            <div className="px-4 py-2 bg-dark-3 flex justify-between items-center">
              <Link to={`/lists/${list.$id}/likes`} className="flex items-center hover:text-primary-500">
                <img src="/assets/icons/like.svg" alt="Likes" className="w-4 h-4 mr-1" />
                <p className="text-light-1">{list.likes?.length || 0}</p>
              </Link>
              <Link to={`/lists/${list.$id}/comments`} className="flex items-center hover:text-primary-500">
                <img src="/assets/icons/comment.svg" alt="Comments" className="w-4 h-4 mr-1" />
                <p className="text-light-1">{list.comments?.length || 0}</p>
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GridListList;