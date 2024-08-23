import { UserCard } from "@/components/shared";
import { getUsers } from "@/lib/appwrite/config";
import { useEffect, useState } from "react";
import { Loader } from "@/components/shared"; // Assuming you have a Loader component

const Userlist = () => {
  const [users, setUsers] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers(null);
      } finally {
        setIsLoading(false);
      }
    };

    getUserData();
  }, []);

  return (
    <div className="flex flex-col items-center p-6">
      {isLoading ? (
        <Loader />
      ) : users === null ? (
        <p className="text-red-500">Failed to load users. Please try again later.</p>
      ) : users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {users.map((user: any, index: number) => (
            <UserCard user={user} key={index} listId="" />
          ))}
        </div>
      )}
    </div>
  );
};

export default Userlist;
