import { useParams } from 'react-router-dom';
import ListCard2 from '@/components/shared/ListCard2';
import { useEffect, useState } from 'react';
import { getUserById } from '@/lib/appwrite/config';
import { IList } from '@/types'; // Assuming you have an IList type defined

const ManageList = () => {
  const { id } = useParams<{ id: string }>();
  const [userLists, setUserLists] = useState<IList[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await getUserById(id);
        if (resp?.lists) {
          setUserLists(resp.lists);
        } else {
          setError("No lists found for this user.");
        }
      } catch (error) {
        console.error("Error fetching user lists:", error);
        setError("Failed to fetch user lists.");
      }
    };

    fetchData();
  }, [id]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {userLists.length > 0 ? (
        userLists.map((list: IList) => (
          <ListCard2 list={list} key={list.$id} manageList={true} />
        ))
      ) : (
        <p className="text-light-2">No lists to display.</p>
      )}
    </div>
  );
};

export default ManageList;
