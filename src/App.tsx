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
import Notifications from "./components/shared/Notifications";
import Categories from "./_root/pages/Categories";
import Collaborative from "./_root/pages/Collaborative";
import Userlist from "./_root/pages/Userlist";
import { getCurrentUser, getUserLists } from "./lib/appwrite/config";
import { INITIAL_USER, useUserContext } from "./context/AuthContext";

const App = () => {

  const [user, setUser] = useState(INITIAL_USER)
  const { checkAuthUser } = useUserContext();
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
  const fetchUser = async ()=>{
    const currentAccount = await getCurrentUser();
    const isLoggedIn = await checkAuthUser();
    setIsLoggedIn(isLoggedIn);

    if(currentAccount)
    {const curatedList = await getUserLists(currentAccount.$id);
    setUser({
      id: currentAccount.$id,
      name: currentAccount.name,
      username: currentAccount.username,
      email: currentAccount.email,
      imageUrl: currentAccount.imageUrl,
      bio: currentAccount.bio,
      curatedList:curatedList,
    });
  }

  }  

  fetchUser();
  }, [])

  const userId = user.$id;

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

    {(user.$id || isLoggedIn ) ?
    <main className="flex h-screen">
      <Routes>
        {/* Public Routes */}
        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications userId={userId} />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/collaborations" element={<Collaborations />} />
          <Route path="/userlists" element={<Userlist />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-lists" element={<AllLists />} />
          <Route path="/create-list" element={<CreateList />} />
          <Route path="/update-list/:id" element={<EditList />} />
          <Route path="/lists/:id" element={<ListDetails />} />
          <Route path="/profile" element={<Profile id={user.$id} />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
          <Route path="/lists/:id/comments" element={<Comments />} />
          <Route path="/lists/:id/suggestions" element={<Suggestions />} />
          <Route path="/lists/:id/collaborations" element={<Collaborations />} />
          <Route path="/shared/:sharedId" element={<SharedListView />} />
          <Route path="/remix/:id" element={<RemixList />} /> {/* New route */}
        </Route>
      </Routes>

      <Toaster />
    </main> 
    : 
    <div>
    <Routes>
    <Route path="/" element={<PreviewMode />} />
    </Routes>
    </div>}
    </>);
};

export default App;