import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { Button } from "@/components/ui";
import { LikedLists } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { GridListList, Loader } from "@/components/shared";

// ... (rest of the code remains the same)

const Profile = () => {
  // ... (rest of the code remains the same)

  return (
    <div className="profile-container">
      {/* ... (rest of the JSX remains the same) */}

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/lists.svg"}
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

      <Routes>
        <Route
          index
          element={<GridListList lists={currentUser.lists} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-lists" element={<LikedLists />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;