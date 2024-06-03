// src/context/ListContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IList } from '@/types';
import { getRecentLists } from '@/lib/appwrite/api';

interface ListContextProps {
  lists: IList[];
  setLists: React.Dispatch<React.SetStateAction<IList[]>>;
  fetchLists: () => Promise<void>;
}

const ListContext = createContext<ListContextProps | undefined>(undefined);

export const useListContext = () => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useListContext must be used within a ListProvider');
  }
  return context;
};

export const ListProvider: React.FC = ({ children }) => {
  const [lists, setLists] = useState<IList[]>([]);

  const fetchLists = async () => {
    try {
      const fetchedLists = await getRecentLists();
      setLists(fetchedLists);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const value: ListContextProps = {
    lists,
    setLists,
    fetchLists,
  };

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};