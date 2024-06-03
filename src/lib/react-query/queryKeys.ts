export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = "createUserAccount",

  // USER KEYS
  GET_CURRENT_USER = "getCurrentUser",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",

  // POST KEYS
  GET_POSTS = "getPosts",
  GET_INFINITE_POSTS = "getInfinitePosts",
  GET_RECENT_POSTS = "getRecentPosts",
  GET_POST_BY_ID = "getPostById",
  GET_USER_POSTS = "getUserPosts",
  GET_FILE_PREVIEW = "getFilePreview",

  // LIST KEYS
  GET_LISTS = "getLists",
  GET_INFINITE_LISTS = "getInfiniteLists",
  GET_RECENT_LISTS = "getRecentLists",
  GET_LIST_BY_ID = "getListById",
  GET_USER_LISTS = "getUserLists",

  // SEARCH KEYS
  SEARCH_POSTS = "searchPosts",
  SEARCH_LISTS = "searchLists",
}