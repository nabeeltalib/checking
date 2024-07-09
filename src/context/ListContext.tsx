import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IList, IListItem } from '@/types';
import { getRecentLists } from '@/lib/appwrite/api';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

interface ListContextProps {
  lists: IList[];
  isLoading: boolean;
  refetch: () => void;
  addList: (list: IList) => void;
  updateList: (id: string, updatedList: Partial<IList>) => void;
  deleteList: (id: string) => void;
}

const ListContext = createContext<ListContextProps | undefined>(undefined);

export const useListContext = (): ListContextProps => {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error('useListContext must be used within a ListProvider');
  }
  return context;
};

export const ListProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, refetch } = useQuery<{ documents: IList[] }>([QUERY_KEYS.GET_RECENT_LISTS], getRecentLists, {
    refetchOnWindowFocus: false,
  });

  const [localLists, setLocalLists] = useState<IList[]>([]);

  const lists = useMemo(() => {
    const apiLists = data?.documents?.map(list => ({
      ...list,
      items: list.items?.map((item: string | IListItem) => {
        if (typeof item === 'string') {
          const [content, isVisible] = item.split('|');
          return { content, isVisible: isVisible === 'true' };
        }
        return item;
      })
    })) || [];
    return [...apiLists, ...localLists];
  }, [data, localLists]);

  const addList = useCallback((list: IList) => {
    setLocalLists(prev => [...prev, list]);
  }, []);

  const updateList = useCallback((id: string, updatedList: Partial<IList>) => {
    setLocalLists(prev => prev.map(list => list.id === id ? { ...list, ...updatedList } : list));
  }, []);

  const deleteList = useCallback((id: string) => {
    setLocalLists(prev => prev.filter(list => list.id !== id));
  }, []);

  const value = useMemo(
    () => ({ lists, isLoading, refetch, addList, updateList, deleteList }),
    [lists, isLoading, refetch, addList, updateList, deleteList]
  );

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};