import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <section className="fixed top-0 left-0 right-0 z-50 bg-dark-1 shadow-md">
      <div className="container mx-auto flex justify-between items-center py-4 px-5">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/images/logo.svg"
            alt="Topfived logo"
            width={130}
            height={325}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="shad-button_ghost p-2"
            onClick={() => signOut()}
            aria-label="Sign out"
          >
            <img src="/assets/icons/logout.svg" alt="Sign out" className="h-6 w-6" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex items-center gap-3">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt={`${user.name}'s profile`}
              className="h-8 w-8 rounded-full object-cover"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;