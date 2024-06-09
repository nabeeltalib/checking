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
        <h3 className="list-title text-xl font-bold mb-2 text-white">
          {list.title}
        </h3>
        <p className="list-description text-light-3 mb-4">
          {list.description}
        </p>
        <ul className="list-items mb-4">
          {list.items.map((item: string, index: number) => (
            <li key={index} className="list-item text-light-1 mb-1">
              {item}
            </li>
          ))}
        </ul>
        <div className="list-tags flex flex-wrap gap-2">
          {list.tags.map((tag: string) => (
            <span
              key={tag}
              className="list-tag bg-dark-4 text-light-3 rounded-full px-2 py-1 text-xs"
            >
              #{tag}
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default ListCard;
