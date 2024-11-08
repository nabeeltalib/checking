import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ShareDialogProvider } from '@/components/shared/ShareDialogContext';
import ShareDialog from '@/components/shared/ShareDialog';

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
  MyRankings,
  SharedListView,
} from "@/_root/pages";
import RemixList from "@/components/shared/list/RemixList";
import AuthLayout from "@/_auth/AuthLayout";
import RootLayout from "@/_root/RootLayout";
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
import ListFromFriends from "./_root/pages/listFromFriends";
import RootLayout2 from "./_root/pages/RootLayout2";
import EmbedSelector from "./components/shared/EmbedSelector";
import EmbedPreview from "./components/shared/EmbedPreview";
import SegmentedLeaderboardPage from "./_root/pages/SegmentedLeaderboardPage";
import ProfileScreen from "./_root/pages/ProfileScreen";
import ComprehensiveLeaderboard from "./_root/pages/ComprehensiveLeaderboard";
import ComprehensiveLeaderboard2 from "./_root/pages/ComprehensiveLeaderboard2";
import OnboardingPage from "./components/shared/OnboardingPage";
import AdminPanel from "./_root/pages/AdminPanel";
import StaticFrame from "./components/shared/StaticFrame";
import LiveFrame from "./components/shared/LiveFrame";
import OnboardingScreens from "./_root/pages/OnboardingScreens";
import AuthCallback from "./_root/pages/AuthCallback";
import NotFound from "./_root/pages/NotFound";
import CreateGroup from "./_root/pages/CreateGroup";
import Groups from "./_root/pages/Groups";
import YourGroups from "./_root/pages/YourGroups";
import GroupDetails from "./_root/pages/GroupDetails";
import EmbedGroupChallenge from "./_root/pages/EmbedGroupChallenge";

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
    return null;
  }

  return (
    <ShareDialogProvider>
      <>
        <Routes>
          {/* NotFound route */}
          <Route path="*" element={<NotFound />} />

          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SigninForm />} />
            <Route path="/sign-up" element={<OnboardingScreens />} />        
          </Route>

          <Route path="/staticframe/:id" element={<StaticFrame />} />
          <Route path="/liveframe/:id" element={<LiveFrame />} />
          <Route path="/embed-group/:groupId" element={<EmbedGroupChallenge />} />

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
              <Route path="/create-list/:title/:groupId" element={<CreateList />} />
              <Route path="/update-list/:id" element={<EditList />} />
              <Route path="/lists/:id" element={<ListDetails />} />
              <Route path="/profile/:profile" element={<Profile />} />
              <Route path="/update-profile/:id" element={<UpdateProfile />} />
              <Route path="/lists/:id/comments" element={<Comments />} />
              <Route path="/lists/:id/suggestions" element={<Suggestions />} />
              <Route path="/shared/:sharedId" element={<SharedListView />} />
              <Route path="/remix/:id" element={<RemixList />} />
              <Route path="/manage-list/:id" element={<ManageList />} />
              <Route path="/segment-leaderboard" element={<SegmentedLeaderboardPage />} />
              <Route path="/profile-screen" element={<ProfileScreen />} />
              <Route path="/helpfaqpage" element={<HelpFAQPage />} />
              <Route path="/contactpage" element={<ContactPage />} />          
              <Route path="/comprehensive-leaderboard" element={<ComprehensiveLeaderboard />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/termsandconditions" element={<TermsAndConditions />} />
              <Route path="/cookiepolicy" element={<CookiePolicy />} />
              <Route path="/explore2" element={<Explore2 />} />
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/my-rankings" element={<MyRankings />} />
              <Route path="/create-group" element={<CreateGroup />} />
              <Route path="/create-group/:groupId" element={<CreateGroup />} />
              <Route path="/your-groups" element={<YourGroups />} />
              <Route path="/group/:groupId" element={<GroupDetails />} />
              <Route path="/groups" element={<Groups />} />
            </Route>
          ) : (
            <Route element={<RootLayout2 />}>
              <Route path="/" element={<PreviewMode />} />
              <Route path="/home" element={<Home />} />
              <Route path="/explore2" element={<Explore2 />} />
              <Route path="/discover" element={<AllLists />} />
              <Route path="/trending" element={<Trending />} />
              <Route path="/recommended" element={<Recomended />} />
              <Route path="/onboarding" element={<OnboardingScreens />} /> 
              <Route path="/onboarding-page" element={<OnboardingPage />} />
              <Route path="/helpfaqpage" element={<HelpFAQPage />} />
              <Route path="/contactpage" element={<ContactPage />} />          
              <Route path="/comprehensive-leaderboard2" element={<ComprehensiveLeaderboard2 />} />
              <Route path="/privacypolicy" element={<PrivacyPolicy />} />
              <Route path="/termsandconditions" element={<TermsAndConditions />} />
              <Route path="/cookiepolicy" element={<CookiePolicy />} />
              <Route path="/shared/:sharedId" element={<SharedListView />} />
            </Route>
          )}
        </Routes>

        <Toaster />
        <ShareDialog />
      </>
    </ShareDialogProvider>

  );
};

export default App;