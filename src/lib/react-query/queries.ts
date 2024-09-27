import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import {
  getAISuggestions,
  generateListIdea,
  analyzeSentiment,
  generateListItems,
  enhanceListDescription,
} from '@/lib/appwrite/aiService';
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
  getUserFriends,
  getFriendsLists,
  sendFriendRequest,
  getFriends,
  getNotifications,
  getPublicLists,
  getPopularLists,
  searchLists,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  saveList,
  deleteSavedList,
  createNotification,
  markNotificationAsRead,
  deleteNotification,
  getUserById,
  createComment,
  getComments,       
  createSuggestion,
  getSuggestions,
  updateSuggestion,
  createCollaboration,
  getCollaborations,
  signInWithGoogle,
  updateCollaboration,
  getRelatedLists,
} from '@/lib/appwrite/api';
import { INewList, INewUser, IUpdateList, IUpdateUser } from '@/types';
import { useNavigate } from 'react-router-dom';
import { generateListItem } from '@/routes/ai';
import { updateUser } from '../appwrite/config';
// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
    onError: (error) => {
      console.error('Error creating user account:', error);
      // Handle error (e.g., show a toast notification)
    },
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
    onError: (error) => {
      console.error('Error signing in:', error);
      // Handle error (e.g., show a toast notification)
    },
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
    onError: (error) => {
      console.error('Error signing out:', error);
      // Handle error (e.g., show a toast notification)
    },
  });
};

export const useSignInWithGoogle = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: (data) => {
      console.log("Success sigin in with google: ", data)
      navigate("http://localhost:3000");
    },
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
      if (lastPage && lastPage?.documents?.length === 0) {
        return null;
      }
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
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
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
    queryFn: () => getRecentLists(),
    onError: (error) => {
      console.error('Error fetching recent lists:', error);
      // You could also show a toast notification here
    },
  });
};

export const useCreateList = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (list: INewList) => createList(list, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_LISTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_INFINITE_LISTS],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_LISTS] });
    },
    onError: (error) => {
      console.error('Error creating list:', error);
      // Handle error (e.g., show a toast notification)
    },
  });
};

export const useGetListById = (listId: string, userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LIST_BY_ID, listId, userId],
    queryFn: () => getListById(listId, userId),
    enabled: !!listId && !!userId,
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
    mutationFn: ({ userId, listId }: { userId: string; listId: string }) =>
      saveList(userId, listId),
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

export const useGetRelatedLists = (listId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RELATED_LISTS, listId],
    queryFn: () => getRelatedLists(listId),
    enabled: !!listId,
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
    onError: (error) => {
      console.error('Error fetching current user:', error);
      // Handle error (e.g., show a toast notification)
    },
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
    mutationFn: (comment: {
      listId: string;
      userId: string;
      content: string;
    }) => createComment(comment),
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
    mutationFn: ({
      suggestionId,
      status,
    }: {
      suggestionId: string;
      status: string;
    }) => updateSuggestion(suggestionId, status),
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
    mutationFn: (collaboration: {
      listId: string;
      userId: string;
      status: string;
    }) => createCollaboration(collaboration),
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
    mutationFn: ({
      collaborationId,
      status,
    }: {
      collaborationId: string;
      status: string;
    }) => updateCollaboration(collaborationId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_COLLABORATIONS],
      });
    },
  });
};

// ============================================================
// FRIEND & NOTIFICATION QUERIES
// ============================================================

export const useTrendingTags = () => {
  return useQuery({
    queryKey: ['trendingTags'],
    queryFn: getTrendingTags,
  });
};

export const usePopularCategories = () => {
  return useQuery({
    queryKey: ['popularCategories'],
    queryFn: getPopularCategories,
  });
};

export const useRecentLists = () => {
  return useInfiniteQuery({
    queryKey: ['recentLists'],
    queryFn: ({ pageParam }) => getRecentLists(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.documents.length === 0) return undefined;
      return lastPage.documents[lastPage.documents.length - 1].$id;
    },
  });
};

export const useSearchLists = (searchTerm: string, userId: string) => {
  return useInfiniteQuery({
    queryKey: ['searchLists', searchTerm],
    queryFn: () => searchLists(searchTerm, userId),
    getNextPageParam: (lastPage) =>
      lastPage?.documents?.[lastPage?.documents?.length - 1]?.$id,
    enabled: searchTerm.length > 0,
  });
};

export const useGetAISuggestions = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_AI_SUGGESTIONS, userId],
    queryFn: () => getAISuggestions(userId),
  });
};

export const useGenerateListIdea = (userId: string) => {
  return useMutation({
    mutationFn: (prompt: string) => generateListIdea(prompt, userId),
  });
};

export const useEnhanceListDescription = () => {
  return useMutation({
    mutationFn: ({
      listId,
      description,
    }: {
      listId: string;
      description: string;
    }) => enhanceListDescription(listId, description),
  });
};

export const useAnalyzeSentiment = () => {
  return useMutation({
    mutationFn: (text: string) => analyzeSentiment(text),
  });
};

export const useGetUserFriends = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_FRIENDS, userId],
    queryFn: () => getUserFriends(userId),
    enabled: !!userId,
  });
};

export const useGetFriendsLists = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FRIENDS_LISTS, userId],
    queryFn: () => getFriendsLists(userId),
    enabled: !!userId,
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => rejectFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['friendRequests']);
    },
  });
};

export const useGenerateListItems = () => {
  return useMutation({
    mutationFn: (title: object) => generateListItems(title),
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, friendId }: { userId: string; friendId: string }) =>
      sendFriendRequest(userId, friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FRIEND_REQUESTS],
      });
    },
  });
};

export const useGetPublicLists = () => {
  return useInfiniteQuery(
    [QUERY_KEYS.GET_PUBLIC_LISTS],
    async ({ pageParam = 0 }) => {
      const start = pageParam * 10;  // Assuming page size is 10
      const end = start + 10;
      return await getPublicLists(start, end);  // Call the randomizing getPublicLists function
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 10 ? allPages.length : undefined;
      },
    }
  );
};

export const useGetPopularLists = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POPULAR_LISTS],
    queryFn: getPopularLists,
  });
};

export const useGetNotifications = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_NOTIFICATIONS, userId],
    queryFn: () => getNotifications(userId),
    enabled: !!userId,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.GET_NOTIFICATIONS]);
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.GET_NOTIFICATIONS]);
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries([QUERY_KEYS.GET_NOTIFICATIONS]);
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => acceptFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FRIEND_REQUESTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_FRIENDS],
      });
    },
  });
};

export const useGetFriendRequests = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FRIEND_REQUESTS, userId],
    queryFn: () => getFriendRequests(userId),
    enabled: !!userId,
  });
};

export const useGetFriends = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_FRIENDS, userId],
    queryFn: () => getFriends(userId),
    enabled: !!userId,
  });
};