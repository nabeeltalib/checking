import { UserCard } from '@/components/shared';
import { getUsers } from '@/lib/appwrite/config';
import { useEffect, useState } from 'react';

const Userlist = () => {

  const [users, setUsers] = useState<any>([]);

  useEffect(() => {
    const getUserData = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
      console.log(users)
    };

    getUserData();
  }, []);
    console.log(users)
  return (
    <div>
      {users === undefined ? (
        <p>Loading...</p>
      ) : users === null ? (
        <p>No users found.</p>
      ) : (
        <div className='flex gap-5 flex-col'>
          {users.map((user:any, index:number) => (
            <UserCard user={user} key={index} listId=''/>
          ))}
        </div>
      )}
    </div>
  );
};

export default Userlist;
