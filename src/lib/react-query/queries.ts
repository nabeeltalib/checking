import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/queryKeys";
import {
  createUserAccount,
  signInAccount,
  getCurrentUser,
  signOutAccount,
  getUsers,
  createList,
  getListById,
  updateList,
  getUserLists,
  deleteList,
  likeList,
  getRecentLists,
  getInfiniteLists,
  searchLists,
  saveList,
  deleteSavedList,
  getUserById,
  createComment,
  getComments,
  createSuggestion,
  getSuggestions,
  updateSuggestion,
  createCollaboration,
  getCollaborations,
  updateCollaboration,
} from "@/lib/appwrite/api";
import { INewList, INewUser, IUpdateList, IUpdateUser } from "@/types";

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) => signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ============================================================
// LIST QUERIES
// ============================================================

export const useGetLists = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_LISTS],
    queryFn: getInfiniteLists as any,
    getNextPageParam: (lastPage: any) => {
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchLists = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_LISTS, searchTerm],
    queryFn: () => searchLists(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetInfiniteLists = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_LISTS],
    queryFn: ({ pageParam = 0 }) => getInfiniteLists({ pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage && lastPage.documents.length === 0) {
        return undefined;
      }
      return lastPage.documents[lastPage.documents.length - 1].$id;
    },
  });
};

export const useGetRecentLists = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
    queryFn: getRecentLists,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (list: INewList) => createList(list),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
      });
    },
  });
};

export const useGetListById = (listId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LIST_BY_ID, listId],
    queryFn: () => getListById(listId),
    enabled: !!listId,
  });
};

export const useGetUserLists = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_LISTS, userId],
    queryFn: () => getUserLists(userId),
    enabled: !!userId,
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (list: IUpdateList) => updateList(list),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LIST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listId?: string) => deleteList(listId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
      });
    },
  });
};

export const useLikeList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      listId,
      likesArray,
    }: {
      listId: string;
      likesArray: string[];
    }) => likeList(listId, likesArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LIST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LISTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useSaveList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, listId }: { userId: string; listId: string }) => saveList(userId, listId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LISTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeleteSavedList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedList(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LISTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

// ============================================================
// COMMENT QUERIES
// ============================================================

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: { listId: string; userId: string; content: string }) => createComment(comment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COMMENTS],
      });
    },
  });
};

export const useGetComments = (listId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COMMENTS, listId],
    queryFn: () => getComments(listId),
    enabled: !!listId,
  });
};

// ============================================================
// SUGGESTION QUERIES
// ============================================================

export const useCreateSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (suggestion: {
      listId: string;
      userId: string;
      suggestedTitle: string;
      suggestedDescription: string;
      suggestedItems: string[];
      status: string;
    }) => createSuggestion(suggestion),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SUGGESTIONS],
      });
    },
  });
};

export const useGetSuggestions = (listId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SUGGESTIONS, listId],
    queryFn: () => getSuggestions(listId),
    enabled: !!listId,
  });
};

export const useUpdateSuggestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ suggestionId, status }: { suggestionId: string; status: string }) => updateSuggestion(suggestionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_SUGGESTIONS],
      });
    },
  });
};

// ============================================================
// COLLABORATION QUERIES
// ============================================================

export const useCreateCollaboration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collaboration: { listId: string; userId: string; status: string }) => createCollaboration(collaboration),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COLLABORATIONS],
      });
    },
  });
};

export const useGetCollaborations = (listId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_COLLABORATIONS, listId],
    queryFn: () => getCollaborations(listId),
    enabled: !!listId,
  });
};

export const useUpdateCollaboration = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collaborationId, status }: { collaborationId: string; status: string }) => updateCollaboration(collaborationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COLLABORATIONS],
      });
    },
  });
};
