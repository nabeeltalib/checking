import { Models } from "appwrite";
import { Link } from "react-router-dom";

type ListCardProps = {
  list: Models.Document;
};

const ListCard = ({ list }: ListCardProps) => {
  return (
    <div className="list-card">
      <Link to={`/lists/${list.$id}`}>
        <h3 className="list-title">{list.title}</h3>
        <p className="list-description">{list.description}</p>
        <ul className="list-items">
          {list.items.map((item:any, index:number) => (
            <li key={index} className="list-item">
              {item}
            </li>
          ))}
        </ul>
        <div className="list-tags">
          {list.tags.map((tag:any) => (
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