import { Models } from "appwrite";
import { Link } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useGetRecentLists } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";

type ListCardProps = {
  list: Models.Document;
};

const Home = ({ list }: ListCardProps) => {
  if (!list) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-4 w-full items-center common-container">
      <h1>Home</h1>
      {/* <p>Welcome, {user.name}</p>
      <div className="flex flex-col gap-4 max-w-5xl w-full">
        {recentLists.documents.map((list: any) => (
          <ListCard key={list.$id} list={list} />
        ))}
      </div> */}
    </div>
  );
};

export default Home;