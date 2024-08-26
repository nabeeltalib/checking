import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IUser } from "@/types";
import { getCurrentUser, getUserLists, signInWithGoogle } from "@/lib/appwrite/api";
import { account } from "@/lib/appwrite/config";

export const INITIAL_USER: IUser = {
  id: "",
  name: "",
  username: "",
  email: "",
  imageUrl: "",
  bio: "",
  curatedList: [],
};

interface IAuthContext {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthUser = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const currentAccount = await getCurrentUser();

      if (currentAccount) {
        const curatedList = await getUserLists(currentAccount.$id);
        setUser({
          id: currentAccount.$id,
          name: currentAccount.Name,
          username: currentAccount.Username,
          email: currentAccount.Email,
          imageUrl: currentAccount.ImageUrl,
          bio: currentAccount.Bio,
          curatedList: curatedList,
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking auth user:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession("current");
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      navigate("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Google sign-in will handle redirection
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const session = await account.getSession("current");
        if (session) {
          await checkAuthUser();
        } else if (
          !location.search.includes("userId") &&
          !["/sign-up", "/sign-in"].includes(location.pathname)
        ) {
          navigate("/sign-in");
        }
      } catch (error) {
        if (error.code !== 401) {
          console.error("Error initializing auth:", error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [navigate, location]);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get("userId");

      if (userId) {
        window.history.replaceState({}, document.title, window.location.pathname);

        const isLoggedIn = await checkAuthUser();
        if (isLoggedIn) {
          navigate("/");
        }
      }
    };

    handleAuthRedirect();
  }, [navigate]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      isLoading,
      isAuthenticated,
      setIsAuthenticated,
      checkAuthUser,
      signOut,
      signInWithGoogle: handleGoogleSignIn,
    }),
    [user, isLoading, isAuthenticated]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUserContext = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserContext must be used within an AuthProvider");
  }
  return context;
};
