import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ListProvider } from "@/context/ListContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { CommentProvider } from "@/context/CommentContext";
import { SuggestionProvider } from "@/context/SuggestionContext";
import { CollaborationProvider } from "@/context/CollaborationContext";

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
import AuthLayout from "@/_auth/AuthLayout";
import RootLayout from "@/_root/RootLayout";
import SignupForm from "@/_auth/forms/SignupForm";
import SigninForm from "@/_auth/forms/SigninForm";
import { Toaster } from "@/components/ui/toaster";
import { createTypesenseSchema } from './lib/createTypesenseSchema';
import { indexExistingLists } from './lib/indexExistingLists';

import "./globals.css";

const App = () => {
  useEffect(() => {
    createTypesenseSchema();
    indexExistingLists();
  }, []);

  return (
    <BrowserRouter>
      <main className="flex h-screen">
        <QueryProvider>
          <AuthProvider>
            <ListProvider>
              <CommentProvider>
                <SuggestionProvider>
                  <CollaborationProvider>
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
                        <Route path="/all-users" element={<AllLists />} />
                        <Route path="/create-list" element={<CreateList />} />
                        <Route path="/update-list/:id" element={<EditList />} />
                        <Route path="/lists/:id" element={<ListDetails />} />
                        <Route path="/profile/:id/*" element={<Profile />} />
                        <Route path="/update-profile/:id" element={<UpdateProfile />} />
                        <Route path="/lists/:id/comments" element={<Comments />} />
                        <Route path="/lists/:id/suggestions" element={<Suggestions />} />
                        <Route path="/lists/:id/collaborations" element={<Collaborations />} />
                        <Route path="/shared/:sharedId" element={<SharedListView />} />
                      </Route>
                    </Routes>
                  </CollaborationProvider>
                </SuggestionProvider>
              </CommentProvider>
            </ListProvider>
          </AuthProvider>
        </QueryProvider>

        <Toaster />
      </main>
    </BrowserRouter>
  );
};

export default App;