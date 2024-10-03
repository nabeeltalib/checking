// src/App.tsx

import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import {
  Home,
  Explore,
  Explore2,
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
  HelpFAQPage,
  ContactPage,
  PrivacyPolicy,
  TermsAndConditions,
  CookiePolicy,
  SharedListView,
  PreviewMode,
  Categories,
  Userlist,
  Trending,
  Recomended,
  UserActivity,
  ManageList,
  ListFromFriends,
  SegmentedLeaderboardPage,
  ProfileScreen,
  ComprehensiveLeaderboard,
  ComprehensiveLeaderboard2,
  OnboardingScreens,
  AdminPanel,
} from "@/_root/pages";
import RemixList from "@/components/shared/list/RemixList";
import AuthLayout from "@/_auth/AuthLayout";
import RootLayout from "@/_root/RootLayout";
import RootLayout2 from "./_root/pages/RootLayout2";
import SigninForm from "@/_auth/forms/SigninForm";
import { OnboardingPage, EmbedPreview, EmbedSelector } from "@/components/shared";
import Notifications from "./components/shared/Notifications";
import AuthCallback from './_root/pages/AuthCallback';
import NotFound from "./_root/pages/NotFound"; // Ensure you have a NotFound component
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

import StaticFrame from "./components/shared/StaticFrame";
import LiveFrame from "./components/shared/LiveFrame";

import { useUserContext } from "./context/AuthContext";
import { ShareDialogProvider } from './components/shared/ShareDialogContext';
import ShareDialog from './components/shared/ShareDialog';

interface AppProps {
  isInitialLoading: boolean;
}

const App: React.FC<AppProps> = ({ isInitialLoading }) => {
  const { user, checkAuthUser } = useUserContext();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      await checkAuthUser();
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  if (isInitialLoading || isCheckingAuth) {
    return null; // or return a loading spinner if you want
  }

  return (
    <main className="flex">
    <ShareDialogProvider>

      <Routes>
        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
          <Route path="/sign-up" element={<OnboardingScreens />} />        
        </Route>
        <Route path="/staticframe/:id" element={<StaticFrame />} />
        <Route path="/liveframe/:id" element={<LiveFrame />} />
        
        {/* Authenticated Routes */}
        {user.id ? (
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/embed" element={<EmbedSelector />} />
            <Route path="/embedpreview/:id" element={<EmbedPreview />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/categories/:value" element={<Categories />} />
            <Route path="/collaborations" element={<Collaborations />} />
            <Route path="/listfromfriends" element={<ListFromFriends />} />
            <Route path="/userlists" element={<Userlist />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/recommended" element={<Recomended />} />
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
            <Route path="/remix/:id" element={<RemixList />} /> {/* New route */}
            <Route path="/manage-list/:id" element={<ManageList />} /> {/* New route */}
            <Route path="/segment-leaderboard" element={<SegmentedLeaderboardPage />} /> {/* New route */}
            <Route path="/profile-screen" element={<ProfileScreen />} /> {/* New route */}
            <Route path="/helpfaqpage" element={<HelpFAQPage />} />
            <Route path="/contactpage" element={<ContactPage />} />          
            <Route path="/comprehensive-leaderboard" element={<ComprehensiveLeaderboard />} /> {/* New route */}
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsandconditions" element={<TermsAndConditions />} />
            <Route path="/cookiepolicy" element={<CookiePolicy />} />
            <Route path="/explore2" element={<Explore2 />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
            {/* Shared Route within Authenticated Layout */}
            <Route path="/shared/:sharedId" element={<SharedListView />} />
          </Route>
        ) : (
          /* Unauthenticated Routes */
          <Route element={<RootLayout2 />}>
            <Route path="/" element={<PreviewMode />} />
            <Route path="/home" element={<Home />} />
            <Route path="/explore2" element={<Explore2 />} />
            <Route path="/discover" element={<AllLists />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/recommended" element={<Recomended />} />
            <Route path="/onboarding" element={<OnboardingScreens />} /> 
            <Route path="/onboarding-page" element={<OnboardingPage />} /> {/* New route */}
            <Route path="/helpfaqpage" element={<HelpFAQPage />} />
            <Route path="/contactpage" element={<ContactPage />} />          
            <Route path="/comprehensive-leaderboard2" element={<ComprehensiveLeaderboard2 />} /> {/* New route */}
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/termsandconditions" element={<TermsAndConditions />} />
            <Route path="/cookiepolicy" element={<CookiePolicy />} />
            {/* Shared routes for unauthenticated users */}
            <Route path="/shared/:sharedId" element={<SharedListView />} />
          </Route>
        )}

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ShareDialog />
      <Toaster />      
    </ShareDialogProvider>
    </main>
  );
};

export default App;
