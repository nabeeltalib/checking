import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="flex h-screen">
          {/* Left Section with Form or Content */}
          <section className="flex-1 flex justify-center items-center flex-col py-10 bg-gray-900">
            <Outlet />
          </section>

          {/* Right Section with Image */}
          <div className="hidden xl:flex flex-1">
            <img
              src="/assets/images/side-img2.png"
              alt="logo"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}
    </>
  );
}
