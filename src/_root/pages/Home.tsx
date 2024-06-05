import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

import {useGetRecentLists} from "@/lib/react-query/queries";
type ListCardProps = {
  list: Models.Document;
};

const ListCard = ({ list }: ListCardProps) => {
  if (!list) {
    return null;
  }
  console.log(list);
  return (
    <div className="flex flex-col border border-gray-200 p-4 rounded-lg w-full mx-auto">
      {/* creator img,name */}
      <div className="flex flex-row items-center gap-2 mb-2">
        <img
          src={list.creator.imageUrl}
          alt={list.creator.name}
          className="rounded-full w-8 h-8"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-500 font-light">
            {" "}
            {list.creator.name}
          </p>
          <p className="text-xs text-gray-400 font-light"> 
           {new Date(list.$createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Link to={`/lists/${list.$id}`}>
        <h3 className="list-title">{list.title}</h3>
        <p className="list-description">{list.description}</p>
        <ul className="flex md:flex-row flex-col gap-2 list-none p-0">
          {list.items.map((item: any, index: number) => (
            <li key={index} className="list-item">
              {item}
            </li>
          ))}
        </ul>
        <div className="list-tags my-2">
          {list.tags.map((tag: any) => (
            <span key={tag} className="list-tag">
              #{tag}
            </span>
          ))}
        </div>
      </Link>
    </div>
  );
};

const Home = () => {
  const { user, isLoading } = useUserContext();
  const { data: recentLists } = useGetRecentLists();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!recentLists) {
    return <div>No lists found</div>;
  }
  return (
    <div className="flex flex-col gap-4 p-4 w-full items-center">
      <h1>Home</h1>
      <p>Welcome, {user.name}</p>
      <div className="flex flex-col gap-4 max-w-5xl w-full gap-4">
        {recentLists.documents.map((list: any) => (
          <ListCard key={list.$id} list={list} />
        ))}
      </div>
    </div>
  );
};
export default Home;