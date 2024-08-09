import { Link } from "react-router-dom";

interface GridListListProps {
  lists: any;
  showUser?: boolean;
  showStats?: boolean;
}

const GridListList: React.FC<GridListListProps> = ({ lists, showUser = true, showStats = true }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {lists?.map((list:any) => (
        <div key={list.$id} className="bg-dark-4 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
          <Link to={`/lists/${list.$id}`} className="block p-4">
            <h3 className="text-xl font-bold text-light-1 mb-2">{list.Title}</h3>
            <ul className="list-decimal list-inside mb-4 text-light-1">
              {list.items?.slice(0, 5).map((item: any, index: number) => (
                <li key={index} className="line-clamp-1">{item}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              {list.Tags && list.Tags.slice(0, 3).map((tag: string, index: number) => (
                <span key={index} className="bg-dark-3 text-light-4 rounded-full px-2 py-1 text-xs">
                  #{tag}
                </span>
              ))}
              {list.Tags && list.Tags.length > 3 && <span className="bg-dark-3 text-light-4 rounded-full px-2 py-1 text-xs">+{list.Tags.length - 3}</span>}
            </div>
          </Link>
          {showUser && list.creator && (
            <Link to={`/profile/${list.creator.$id}`} className="px-4 py-2 bg-dark-3 flex items-center z-50">
            <img
              src={list.creator.ImageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${list.creator.Name}'s profile`}
              className="w-8 h-8 rounded-full mr-2 object-cover"
            />
            <p className="text-light-1 truncate">{list.creator.Name}</p>
          </Link>
          )}
          {showStats && (
           <div className="px-4 py-2 bg-dark-3 flex justify-between items-center z-50">
           <span className="flex items-center">
             <img src="/assets/icons/like.svg" alt="Likes" className="w-4 h-4 mr-1" />
             <p className="text-light-1">{list.Likes?.length || 0}</p>
           </span>
           <span className="flex items-center">
             <img src="/assets/icons/comment.svg" alt="Comments" className="w-4 h-4 mr-1" />
             <p className="text-light-1">{list.comments?.length || 0}</p>
           </span>
         </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GridListList;