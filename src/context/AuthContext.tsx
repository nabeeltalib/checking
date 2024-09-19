import { getCurrentUser, getUserLists, signInWithGoogle } from "@/lib/appwrite/api";
import { account } from "@/lib/appwrite/config";
import { IUser } from "@/types";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  setUser: React.Dispatch<React.SetStateAction<any>>;
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
          isAdmin: currentAccount.isAdmin,
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error checking auth user:", error);
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
      // The user will be redirected to Google's sign-in page.
      // After successful sign-in, they'll be redirected back to our app.
    } catch (error) {
      console.error("Error initiating Google sign-in:", error);
    }
  };  

  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await account.getSession("current");
        if (session) {
          await checkAuthUser();
        } else {
          const isCallbackUrl = location.search.includes("userId");
          if (!isCallbackUrl && location.pathname !== '/sign-up' && location.pathname !== '/sign-in') {
            navigate("/sign-in");
          }
        }
      } catch (error) {
        // to not through errors on guest users
        if (error.code === 401) {
          return null;
        }
        console.log("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [navigate, location]);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');

      if (userId) {
        // Clear the URL parametersw
        window.history.replaceState({}, document.title, window.location.pathname);

        // Check if the user is authenticated
        const isLoggedIn = await checkAuthUser();
        if (isLoggedIn) {
          navigate('/'); // or wherever you want to redirect after successful login
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