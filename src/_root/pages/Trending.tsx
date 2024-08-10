import { ListCard } from "@/components/shared";
import ListCard2 from "@/components/shared/ListCard2";
import { useUserContext } from "@/context/AuthContext";
import { getMostLikedLists } from "@/lib/appwrite/api";
import { useEffect, useState } from "react";

const Trending = () => {
  const [trending, setTrending] = useState<any>([]);

  const { user } = useUserContext();

  useEffect(() => {
    const fetchData = async () => {
      const data = await getMostLikedLists();
      setTrending(data);
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl">Trending List's</h1>
      <div className="mt-5 flex flex-col">
        {user.id
          ? trending.map((list: any, index: number) => (
              <ListCard2 list={list} key={index} />
            ))
          : trending.map((list: any, index: number) => (
              <ListCard list={list} key={index} />
            ))}
      </div>
    </div>
  );
};

export default Trending;
