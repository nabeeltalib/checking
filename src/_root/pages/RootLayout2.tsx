import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import Topbar2 from "@/components/shared/TopBar2";
import LeftSidebar2 from "@/components/shared/LeftSidebar2";
import RightSidebar2 from "@/components/shared/RightSidebar2";
import Bottombar2 from "@/components/shared/Bottombar2";
import { useSignInWithGoogle } from "@/lib/react-query/queries";
import { Button } from "@/components/ui/button";
import FAB from "@/components/shared/FAB";

const RootLayout2: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { mutateAsync: signInWithGoogle } = useSignInWithGoogle();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      setIsDialogOpen(false); // Close dialog on successful sign-in
    } catch (error) {
      console.error("Google Sign-In failed", error);
      // Optionally, you can set an error message or trigger a toast
    }
  };

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  return (
    <div className="flex flex-col min-h-screen bg-dark-1">
      <Topbar2 />

      <div className="flex flex-1 pt-16">
        {!isMobile && (
          <aside className="hidden md:block w-1/5 min-w-[200px] max-w-[300px]">
            <LeftSidebar2 />
          </aside>
        )}

        <main className="flex-1 w-full p-4 pb-20 md:pb-4">
          <Outlet />
        </main>

        {!isMobile && (
          <aside className="hidden md:block w-1/5 min-w-[200px] max-w-[300px]">
            <RightSidebar2 />
          </aside>
        )}
      </div>

      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-dark-2">
          <Bottombar2 />
        </div>
      )}

      <FAB className="fixed right-4 bottom-20 md:bottom-4 z-50" />

      {isDialogOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50 p-4 sm:p-8">
          <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md md:max-w-lg">
            <button
              onClick={closeDialog}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Unlock Full Access!</h3>
              <p className="text-sm text-gray-600 mb-6">
                Sign up now to like, comment, save, and remix lists. Create your own rankings and join the community!
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <Button
                type="button"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out"
                onClick={() => navigate("/sign-up")}
              >
                Sign Up
              </Button>
              <Button
                className="flex items-center justify-center bg-white text-gray-700 border border-gray-300 px-4 sm:px-6 py-3 rounded-full font-semibold transition duration-300 ease-in-out hover:bg-gray-100"
                onClick={handleGoogleSignIn}
              >
                <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                Sign In with Google
              </Button>
              <Button
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
                onClick={() => navigate("/sign-in")}
              >
                Sign In with Email
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootLayout2;