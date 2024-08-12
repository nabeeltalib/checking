import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignInWithGoogle, useSignOutAccount } from "@/lib/react-query/queries";
import { Input } from "@/components/ui/input";
import { useSearchLists } from "@/lib/react-query/queries";
import { Loader } from "lucide-react";


const Topbar2 = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, refetch: searchLists } = useSearchLists(
    searchQuery,
    user.id
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isOffCanvasOpen, setIsOffCanvasOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };
  const { mutateAsync: signInWithGoogle, isLoading: isGoogleLoading } = useSignInWithGoogle();

  const handleGoogleSignIn = () => {
    signInWithGoogle();
    // Note: This will redirect the user, so no need for further handling here
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleOffCanvas = () => {
    setIsOffCanvasOpen(!isOffCanvasOpen);
  };

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  const handleSearch = (e:any) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchLists();
    }
  };

  const handleCreateList = () => {
    navigate("/create-list");
  };

  return (
    <section className="fixed top-0 left-0 right-0 z-50 bg-dark-1 shadow-md w-full">
      <div className="container mx-auto flex p-5 gap-8 w-full">
      <Link to="/" className="items-center gap-3 w-full hidden md:flex ">
          <img
            src="/assets/images/logo.svg"
            alt="Topfived logo"
            width={130}
            height={32}
            className="object-contain"
          />
        </Link>
        <Link to="/" className="items-center gap-3  flex md:hidden ">
          <img
            src="/assets/images/mobile.png"
            alt="Topfived logo"
            width={40}
            className="object-contain"
          />
        </Link>

        <form onSubmit={handleSearch} className="flex-grow max-w-md mx-auto w-full">
          <div className="flex justify-center items-center gap-3">
            <Input
              type="text"
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-dark-4 text-light-1 border-none focus:ring-2 focus:ring-primary-500  ${isSearch ? "visible" : "hidden"}`}
            />

            <button onClick={() => { setIsSearch(true); }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
          </div>

          <ul>
           {searchResults &&
           searchResults?.pages.map((item:any)=>(
            item.map((list:any, index:number)=>(
              <div key={index} className="flex flex-col ml-1">
              <span className="mt-2 cursor-pointer" onClick={handleDialogOpen} >Query Matches with list: "{list.Title}"</span>
              <hr style={{width:"26vw"}}/>
              </div>
            ))
           ))}
          </ul>
        </form>

        <button className="md:hidden" onClick={toggleOffCanvas}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 7.5h16.5m-16.5 7.5h16.5" />
          </svg>
        </button>

        <div id="side-icons" className="hidden md:flex w-full items-center justify-evenly">

          <div className="relative">
            <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="Profile"
              />
              &nbsp;&nbsp; Guest User
            </div>
          </div>
        </div>

        {/* Off-canvas menu */}
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-50 transform ${isOffCanvasOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out md:hidden`}>
          <div className="absolute right-0 bg-dark-1 w-64 h-full p-5">
            <button className="mb-5" onClick={toggleOffCanvas}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative">
              <div className="flex items-center cursor-pointer" onClick={toggleDropdown}>
                <img
                  className="w-8 h-8 rounded-full object-cover mx-2"
                  src={"/assets/icons/profile-placeholder.svg"}
                  alt="Profile"
                />
                <span>Guest User</span>
                </div>

            </div>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded shadow-lg z-50">
          <h4 onClick={()=>setIsDialogOpen(false)} style={{cursor:"pointer", fontWeight:"bolder"}} className="text-black flex justify-end">X</h4>
          <h3 className="text-xl font-bold mb-4 text-black">Please Sign In to perform further operations</h3>
          <div className="flex flex-col gap-4">
            <form>
            <Button 
            type="button" 
            className="shad-button_google w-full"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              <>
                <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                Sign in with Google
              </>
            )}
          </Button>
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
    </section>
  );
};

export default Topbar2;
