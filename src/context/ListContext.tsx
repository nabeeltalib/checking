// src/context/ListContext.tsx

import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IList } from '@/types';
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
  const { data: lists = [], isLoading, refetch } = useQuery([QUERY_KEYS.GET_RECENT_LISTS], getRecentLists, {
    refetchOnWindowFocus: false,
  });

  const value = useMemo(
    () => ({ lists, isLoading, refetch }),
    [lists, isLoading, refetch]
  );

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
};
