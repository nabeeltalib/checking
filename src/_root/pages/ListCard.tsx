import { Models } from "appwrite";
import { Link } from "react-router-dom";

type ListCardProps = {
  list: Models.Document & {
    title: string;
    description: string;
    items: string[];
    tags: string[];
  };
};

const ListCard = ({ list }: ListCardProps) => {
  return (
    <div className="list-card bg-dark-3 p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
      <Link to={`/lists/${list.$id}`} className="block">
        <h3 className="list-title text-xl font-bold mb-2 text-white line-clamp-2">
          {list.title}
        </h3>
        <p className="list-description text-light-3 mb-4 line-clamp-3">
          {list.description}
        </p>
        <ul className="list-items mb-4">
          {list.items.slice(0, 5).map((item: string, index: number) => (
            <li key={index} className="list-item text-light-1 mb-1 line-clamp-1">
              {item}
            </li>
          ))}
          {list.items.length > 5 && (
            <li className="list-item text-light-1 mb-1">
              and {list.items.length - 5} more...
            </li>
          )}
        </ul>
        <div className="list-tags flex flex-wrap gap-2">
          {list.tags.map((tag: string) => (
            <Link
              key={tag}
              to={`/tags/${tag}`}
              className="list-tag bg-dark-4 text-light-3 rounded-full px-2 py-1 text-xs"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default ListCard;