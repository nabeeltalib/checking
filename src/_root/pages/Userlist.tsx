import { getUsers } from '@/lib/appwrite/config';
import { Models } from 'appwrite';
import React, { useEffect, useState } from 'react';

const Userlist = () => {
  type UserDocumentList = Models.DocumentList<Models.Document> | null;

  const [users, setUsers] = useState<UserDocumentList | undefined>(undefined);

  useEffect(() => {
    const getUserData = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
    };

    getUserData();
  }, []);

  return (
    <div>
      Userlist:
      {users === undefined ? (
        <p>Loading...</p>
      ) : users === null ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.documents.map((user) => (
            <li key={user.$id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Userlist;
