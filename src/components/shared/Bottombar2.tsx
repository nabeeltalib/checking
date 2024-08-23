import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { bottombarLinks2 } from "@/constants";
import { Button } from "@/components/ui/button";

const Bottombar2 = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogOpen = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <nav className="bottom-bar flex justify-around items-center bg-dark-2 py-2 shadow-md fixed bottom-0 left-0 right-0 w-full z-50">
        {bottombarLinks2.map((link) => {
          const isActive = pathname === link.route;
          return link.label === "Create" ? (
            <button
              key={`bottombar-${link.label}`}
              onClick={handleDialogOpen}
              className={`flex-center flex-col gap-1 p-2 transition-all duration-300 ${
                isActive
                  ? "bg-primary-500 rounded-[10px] text-light-1"
                  : "text-light-2 hover:bg-dark-4"
              }`}
            >
              <img
                src={link.imgURL}
                alt={link.label}
                width={20}
                height={20}
                className="filter brightness-0 invert"
              />
              <p className={`tiny-medium ${isActive ? "text-light-1" : "text-light-2"}`}>
                {link.label}
              </p>
            </button>
          ) : (
            <Link
              key={`bottombar-${link.label}`}
              to={link.route}
              className={`flex-center flex-col gap-1 p-2 transition-all duration-300 ${
                isActive
                  ? "bg-primary-500 rounded-[10px] text-light-1"
                  : "text-light-2 hover:bg-dark-4"
              }`}
            >
              <img
                src={link.imgURL}
                alt={link.label}
                width={20}
                height={20}
                className="filter brightness-0 invert"
              />
              <p className={`tiny-medium ${isActive ? "text-light-1" : "text-light-2"}`}>
                {link.label}
              </p>
            </Link>
          );
        })}
      </nav>

      {isDialogOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-60 z-50 p-4 sm:p-8">
          <div className="relative bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md md:max-w-lg">
            <button
              onClick={handleDialogClose}
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
    </>
  );
};

export default Bottombar2;
