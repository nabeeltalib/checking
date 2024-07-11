import React from "react";
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

const App = () => {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<SignupForm />} />
        </Route>

        {/* Private Routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/all-lists" element={<AllLists />} />
          <Route path="/create-list" element={<CreateList />} />
          <Route path="/update-list/:id" element={<EditList />} />
          <Route path="/lists/:id" element={<ListDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
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
  );
};

export default App;