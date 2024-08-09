import { Outlet, useNavigate } from "react-router-dom";
import Topbar from "@/components/shared/Topbar";
import { useSignInWithGoogle } from "@/lib/react-query/queries";
import { useState } from "react";
import LeftSidebar2 from "@/components/shared/LeftSidebar2";
import RightSidebar2 from "@/components/shared/RightSidebar2";
import Topbar2 from "@/components/shared/TopBar2";
import Bottombar2 from "@/components/shared/Bottombar2";

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
        <div className="fixed top-4 right-4 bg-white p-4 rounded shadow-lg z-50">
          <h4 onClick={()=>setIsDialogOpen(false)} style={{cursor:"pointer", fontWeight:"bolder"}} className="text-black flex justify-end">X</h4>
          <h3 className="text-xl font-bold mb-4 text-black">Please Sign In to perform further operations</h3>
          <div className="flex flex-col gap-4">
            <form>
            <button    
               className="bg-slate-800 flex w-full justify-center text-white px-4 py-2 rounded"
               onClick={handleGoogleSignIn}
            >
              <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
              Sign in with Google
            </button>
            </form>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={()=> navigate("/sign-in")}
            >
              Sign in / Sign up
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RootLayout2;