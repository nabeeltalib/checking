import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { useState } from "react";

export default function AuthLayout() {
  const { isAuthenticated, isLoading, error } = useUserContext(); // Assuming these states are available
  const [retry, setRetry] = useState(false);

  const handleRetry = () => {
    setRetry(true);
    // Logic to retry authentication check, like re-calling the authentication function
  };

  if (isLoading) {
    return (
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-4 text-lg font-semibold">Authenticating...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        <p className="text-red-600 text-lg font-semibold">
          Error: {error.message || "Something went wrong. Please try again."}
        </p>
        <button
          onClick={handleRetry}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </section>
    );
  }

  return isAuthenticated ? (
    <Navigate to="/" />
  ) : (
    <div className="flex h-screen">
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        <Outlet />
      </section>
      <div className="hidden xl:block w-1/2 h-full">
        <img
          src="/assets/images/side-img2.png"
          alt="Authentication"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}

