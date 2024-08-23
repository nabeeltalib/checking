import { Outlet, useNavigate } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";
import { useSignInWithGoogle } from "@/lib/react-query/queries";
import { useState } from "react";
import LeftSidebar2 from "@/components/shared/LeftSidebar2";
import RightSidebar2 from "@/components/shared/RightSidebar2";
import Topbar2 from "@/components/shared/TopBar2";
import Bottombar2 from "@/components/shared/Bottombar2";
import { Button } from "@/components/ui/button";

const RootLayout2 = () => {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const navigate = useNavigate();



  const { mutateAsync: signInWithGoogle} = useSignInWithGoogle()
  
  const handleGoogleSignIn = () => {
    signInWithGoogle();
    // Note: This will redirect the user, so no need for further handling here
  };


  return (
    <div className="flex flex-col md:flex-row w-full pt-16">
      <Topbar2 />
      <div className="flex flex-1 pt-16">
        <div className="hidden md:flex lg:w-[25%] md:w-[15%]">
          <LeftSidebar2 />
        </div>
        <div className="flex-1 w-full p-4 pb-16 md:pb-4">
          <Outlet />
        </div>
        <div className="hidden md:flex lg:w-[25%] md:w-[15%]">
          <RightSidebar2 />
        </div>
        <div className="fixed bottom-0 left-0 right-0 md:hidden">
        <Bottombar2 />
      </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8">
          <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="text-gray-500 hover:text-gray-700 absolute top-4 right-4"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">Sign in to continue and access all features.</p>
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
                onClick={() => navigate("/sign-in")}
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