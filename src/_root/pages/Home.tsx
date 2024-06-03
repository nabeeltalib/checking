import { Models } from "appwrite";
import { Link } from "react-router-dom";

type ListCardProps = {
  list: Models.Document;
};

const ListCard = ({ list }: ListCardProps) => {
  if (!list) {
    return null;
  }
  return (
    <div className="list-card">
      <Link to={`/lists/${list.$id}`}>
        <h3 className="list-title">{list.title}</h3>
        <p className="list-description">{list.description}</p>
        <ul className="list-items">
          {list.items.map((item, index) => (
            <li key={index} className="list-item">
              {item}
            </li>
          ))}
        </ul>
        <div className="list-tags">
          {list.tags.map((tag) => (
            <span key={tag} className="list-tag">
              #{tag}
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
};

export default ListCard;