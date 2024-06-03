import { Link } from "react-router-dom";
import { Models } from "appwrite";

interface GridListListProps {
  lists: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
}

const GridListList = ({ lists, showUser = true, showStats = true }: GridListListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {lists.map((list) => (
        <div key={list.$id} className="bg-dark-4 rounded-lg shadow-md">
          <Link to={`/lists/${list.$id}`}>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{list.title}</h3>
              <p className="text-light-3 mb-4">{list.description}</p>
              <ul className="list-disc list-inside mb-4">
                {list.items.map((item, index) => (
                  <li key={index} className="text-light-1">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                {list.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-dark-3 text-light-4 rounded-full px-2 py-1 text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
          {showUser && (
            <div className="px-4 py-2 bg-dark-3 rounded-b-lg flex items-center">
              <img
                src={list.creator.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="Creator"
                className="w-8 h-8 rounded-full mr-2"
              />
              <p className="text-light-1">{list.creator.name}</p>
            </div>
          )}
          {showStats && (
            <div className="px-4 py-2 bg-dark-3 rounded-b-lg flex justify-between">
              <div className="flex items-center">
                <img src="/assets/icons/like.svg" alt="Likes" className="w-4 h-4 mr-1" />
                <p className="text-light-1">{list.likes}</p>
              </div>
              <div className="flex items-center">
                <img src="/assets/icons/comment.svg" alt="Comments" className="w-4 h-4 mr-1" />
                <p className="text-light-1">{list.comments}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GridListList;