import  {useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import {
  Home,
  Explore,
  Saved,
  CreateList,
  Profile,
  EditList,
  ListDetails,
  UpdateProfile,
  AllLists,
  Comments,
  Suggestions,
  Collaborations,
  SharedListView,
} from "@/_root/pages";
import RemixList from "@/components/shared/list/RemixList"; // New import
import AuthLayout from "@/_auth/AuthLayout";
import RootLayout from "@/_root/RootLayout";
import SignupForm from "@/_auth/forms/SignupForm";
import SigninForm from "@/_auth/forms/SigninForm";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import PreviewMode from "./_root/pages/PreviewMode";
import Categories from "./_root/pages/Categories";
import Userlist from "./_root/pages/Userlist";
import { useUserContext } from "./context/AuthContext";
import Notifications from "./components/shared/Notifications";
import Trending from "./_root/pages/Trending";
import Recomended from "./_root/pages/Recomended";
import UserActivity from "./_root/pages/UserActivity";
import ManageList from "./_root/pages/ManageList";
import FAB from "./components/shared/FAB";
import ListFromFriends from "./_root/pages/listFromFriends";
import RootLayout2 from "./_root/pages/RootLayout2";
import EmbedSelector from "./components/shared/EmbedSelector";
import EmbedPreview from "./components/shared/EmbedPreview";


const App = () => {

  const { user } = useUserContext();
  const { checkAuthUser } = useUserContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
  const fetchUser = async ()=>{
    const isLoggedIn = await checkAuthUser();
    setIsLoggedIn(isLoggedIn);
  }  

  fetchUser();
  }, [])

  return (
   <>
    <>
    <main className="flex">
    <Routes>
       <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>
    </Routes>
    </main>
    </>

    {(user.id || isLoggedIn ) ?
    <main className="flex h-screen">
      <Routes>
        {/* Public Routes */}
        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/embed" element={<EmbedSelector />} />
          <Route path="/embedpreview/:id" element={<EmbedPreview />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/collaborations" element={<Collaborations />} />
          <Route path="/listfromfriends" element={<ListFromFriends />} />
          <Route path="/userlists" element={<Userlist />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/recomended" element={<Recomended />} />
          <Route path="/userActivity" element={<UserActivity />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-lists" element={<AllLists />} />
          <Route path="/create-list" element={<CreateList />} />
          <Route path="/update-list/:id" element={<EditList />} />
          <Route path="/lists/:id" element={<ListDetails />} />
          <Route path="/profile/:profile" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
          <Route path="/lists/:id/comments" element={<Comments />} />
          <Route path="/lists/:id/suggestions" element={<Suggestions />} />
          <Route path="/shared/:sharedId" element={<SharedListView />} />
          <Route path="/remix/:id" element={<RemixList />} /> {/* New route */}
          <Route path="/manage-list/:id" element={<ManageList />} /> {/* New route */}
        </Route>
      </Routes>
      <FAB />
      <Toaster />
    </main> 
    : 
    <div>
    <Routes>
    <Route element={<RootLayout2 />}>
    <Route path="/" element={<PreviewMode />} />
    <Route path="/home" element={<Home />} />
    <Route path="/explore" element={<Explore />} />
    <Route path="/discover" element={<AllLists />} />
    <Route path="/trending" element={<Trending />} />
    <Route path="/recomended" element={<Recomended />} />
    </Route>
    </Routes>
    </div>}
    </>);
};

export default App;