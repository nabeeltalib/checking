import { useUserContext } from "@/context/AuthContext";


export const sidebarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
    icon:"/assets/icons/home.svg"
  },
  //{
    //imgURL: "/assets/icons/discover.svg",
    //route: "/all-lists",
    //label: "Discover",
    //icon:"/assets/icons/discover.svg"
 // },
  {
    imgURL: "/assets/icons/explore.svg",
    route: "/explore",
    label: "Explore",
    icon:"/assets/icons/explore.svg"
  },
  {
    imgURL: "/assets/icons/trending.svg",
    route: "/trending",
    label: "Trending",
    icon:"/assets/icons/trending.svg"
  },
  //{
    //imgURL: "/assets/icons/tags.svg",
    //route: "/categories/no-value",
   // label: "Tags",
    //icon:"/assets/icons/tags.svg"
  //}, 
  
  {
    imgURL: "/assets/icons/list.svg",
    route: "/comprehensive-leaderboard",
    label: "LeaderBoard",
    icon:"/assets/icons/list.svg"
  },  
  {
    imgURL: "/assets/icons/list.svg",
    route: "/comprehensive-leaderboard",
    label: "Groups",
    icon:"/assets/icons/list.svg"
  },  
];

export const sidebarLinks2 = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
    icon:"/assets/icons/home.svg"
  },
  //{
   // imgURL: "/assets/icons/discover.svg",
   // route: "/discover",
   // label: "Discover",
  //  icon:"/assets/icons/discover.svg"
 // },
  {
    imgURL: "/assets/icons/explore.svg",
    route: "/explore2",
    label: "Explore",
    icon:"/assets/icons/explore.svg"
  },
  {
    imgURL: "/assets/icons/list.svg",
    route: "/comprehensive-leaderboard2",
    label: "LeaderBoard",
    icon:"/assets/icons/list.svg"
  }, 
];

export const bottombarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/explore.svg",
    route: "/explore",
    label: "Explore",
    icon:"/assets/icons/explore.svg"
  },
  {
    imgURL: "/assets/icons/list.svg",
    route: "/comprehensive-leaderboard",
    label: "Leaderboard",
  },
 
  // {
  //   imgURL: "/assets/icons/bookmark.svg",
  //   route: "/saved",
  //   label: "Saved",
  // },
  {
    imgURL: "/assets/icons/create.svg",
    route: "/create-list",
    label: "Create",
    icon:"/assets/icons/create.svg"
  },  
];

export const bottombarLinks2 = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Home",
  },  
  {
    imgURL: "/assets/icons/explore.svg",
    route: "/explore2",
    label: "Explore",
    icon:"/assets/icons/explore.svg"
  },
  {
    imgURL: "/assets/icons/list.svg",
    route: "/comprehensive-leaderboard2",
    label: "Leaderboard",
  },
  {
    imgURL: "/assets/icons/create.svg",
    route: "/create-list",
    label: "Create",
    icon:"/assets/icons/create.svg"
  }, 

];

const rightSidebarLinks = ()=>{
  const { user } = useUserContext();
  let value = user.isAdmin ? [
    {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Bookmarks",
    icon:"/assets/icons/bookmark.svg"
  },   
  // {
  //   imgURL: "/assets/icons/collabrative.svg",
  //   route: "/collaborations",
  //   label: "collaborative",
  //   icon:"/assets/icons/collabrative.svg"
  // },  
  {
    imgURL: "/assets/icons/people.svg",
    route: "/listfromfriends",
    label: "Friends",
    icon:"/assets/icons/people.svg"
  },  
  {
    imgURL: "/assets/icons/collab.svg",
    route: "/userlists",
    label: "Collaboration",
    icon:"/assets/icons/collab.svg"
  },  
  //{
  //  imgURL: "/assets/icons/recommended.svg",
  //  route: "/recommended",
  //  label: "Recommended",    
   // icon:"/assets/icons/recommended.svg"
  //},
  //{
  //  imgURL: "/assets/icons/activity.svg",
   // route: "/userActivity",
   // label: "Activity",
   // icon:"/assets/icons/activity.svg"
  //},
  {
    imgURL: "/assets/icons/profile.svg",
    route: "/profile/profile",
    label: "My Profile",
    icon:"/assets/icons/profile.svg"
  },
  {
    imgURL: "/assets/icons/admin.svg",
    route: "/admin-panel",
    label: "Admin Panel",
    icon:"/assets/icons/admin.svg"
  },
]

:

[
  {
  imgURL: "/assets/icons/bookmark.svg",
  route: "/saved",
  label: "Bookmarks",
  icon:"/assets/icons/bookmark.svg"
},   
// {
//   imgURL: "/assets/icons/collabrative.svg",
//   route: "/collaborations",
//   label: "collaborative",
//   icon:"/assets/icons/collabrative.svg"
// },  
{
  imgURL: "/assets/icons/people.svg",
  route: "/listfromfriends",
  label: "Friends",
  icon:"/assets/icons/people.svg"
},  
{
  imgURL: "/assets/icons/collab.svg",
  route: "/userlists",
  label: "Collaboration",
  icon:"/assets/icons/collab.svg"
},  
//{
//  imgURL: "/assets/icons/recommended.svg",
//  route: "/recommended",
//  label: "Recommended",    
 // icon:"/assets/icons/recommended.svg"
//},
//{
//  imgURL: "/assets/icons/activity.svg",
 // route: "/userActivity",
 // label: "Activity",
 // icon:"/assets/icons/activity.svg"
//},
{
  imgURL: "/assets/icons/profile.svg",
  route: "/profile/profile",
  label: "My Profile",
  icon:"/assets/icons/profile.svg"
},
];

return  value
}

export default rightSidebarLinks;

export const rightSidebarLinks2 = [
  {
    imgURL: "/assets/icons/trending.svg",
    route: "/trending",
    label: "Trending",
    icon:"/assets/icons/trending.svg"
  },
  {
    imgURL: "/assets/icons/collab.svg",
    route: "/sign-in",
    label: "Collaboration",
    icon: "/assets/icons/collab.svg",
    restricted: true,  // Restricted
  },
  {
    imgURL: "/assets/icons/people.svg",
    route: "/sign-in",
    label: "Friends",
    icon:"/assets/icons/people.svg",
    restricted: true,  // Restricted
  },  
];