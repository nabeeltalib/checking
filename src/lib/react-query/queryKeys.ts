export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",

  // LIST KEYS
  GET_LISTS = "getLists",
  GET_INFINITE_LISTS = "getInfiniteLists",
  GET_RECENT_LISTS = "getRecentLists",
  GET_LIST_BY_ID = "getListById",
  GET_USER_LISTS = "getUserLists",
  GET_PUBLIC_LISTS = "getPublicLists",
  GET_POPULAR_LISTS = "getPopularLists",

  // SEARCH KEYS
  SEARCH_LISTS = "searchLists",

  // COMMENT KEYS
  GET_COMMENTS = "getComments",

  // SUGGESTION KEYS
  GET_SUGGESTIONS = "getSuggestions",

  // COLLABORATION KEYS
  GET_COLLABORATIONS = "getCollaborations",
  
  // ... existing keys
  GET_USER_FRIENDS = "getUserFriends",
  GET_FRIENDS_LISTS = "getFriendsLists",
  
  // AI KEYS
  GET_AI_SUGGESTIONS = "getAISuggestions",
  GENERATE_LIST_IDEA = "generateListIdea",
  ENHANCE_LIST_DESCRIPTION = "enhanceListDescription", 
  ANALYZE_SENTIMENT = "analyzeSentiment",
  
  GET_NOTIFICATIONS = "getNotifications",
  GET_FRIEND_REQUESTS = "getFriendRequests",
  GET_FRIENDS = "getFriends",
}
