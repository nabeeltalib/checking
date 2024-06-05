import {
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";


import { LikedLists } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { Loader } from "@/components/shared"
import GridListList from "@/components/shared/GridListList";


// ... (rest of the code remains the same)

const Profile = () => {
  // ... (rest of the code remains the same)
  const {user , isLoading} = useUserContext();
  const { id } = useParams();
  const { pathname } = useLocation();
  if(!id) return null;
  const { data: currentUser } = useGetUserById(id);

  if(isLoading) {
    return <Loader />
  }
  
  if (!currentUser) {
    return <div>User not found</div>;
  }
  return (
    <div className="flex flex-col gap-6 w-full p-6 mx-auto ">
      {/* ... (rest of the JSX remains the same) */}

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/home.svg"}
              alt="lists"
              width={20}
              height={20}
            />
            Lists
          </Link>
          <Link
            to={`/profile/${id}/liked-lists`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-lists` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Liked Lists
          </Link>
        </div>
      )}
      <Outlet />

      {pathname === `/profile/${id}/liked-lists` ? (
        <LikedLists />
      ) : (
        <GridListList lists={currentUser.lists} showUser={false} />
      )}

  

    </div>
  );
};

export default Profile;