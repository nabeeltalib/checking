import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IList, IListItem } from '@/types';
import { getRecentLists } from '@/lib/appwrite/api';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

interface ListContextProps {
  lists: IList[];
  isLoading: boolean;
  refetch: () => void;
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

  const lists = useMemo(() => {
    return data?.documents.map(list => ({
      ...list,
      items: list.items.map((item: string | IListItem) => {
        if (typeof item === 'string') {
          const [content, isVisible] = item.split('|');
          return { content, isVisible: isVisible === 'true' };
        }
        return item;
      })
    })) || [];
  }, [data]);

  const value = useMemo(
    () => ({ lists, isLoading, refetch }),
    [lists, isLoading, refetch]
  );

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};