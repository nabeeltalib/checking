import { Loader2 } from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/appwrite/api";
import { useCreateUserAccount, useSignInAccount, useSignInWithGoogle } from "@/lib/react-query/queries";
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";

const initialData = {
  name: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  categories: [],
};

const OnboardingScreens = () => {
  const [step, setStep] = useState(1);
  const [user, setUser] = useState(initialData);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isLoading: isSigningInUser } = useSignInAccount();
  const { mutateAsync: signInWithGoogle, isLoading: isGoogleLoading } = useSignInWithGoogle();
  const { checkAuthUser, isLoading: isUserLoading, user: sessionUser } = useUserContext();

  const handleSignup = async () => {
    try {
      const newUser = await createUserAccount(user);

      if (!newUser) {
        toast({ title: "Sign up failed. Please try again." });
        return;
      }

      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });

      if (!session) {
        toast({ title: "Something went wrong. Please login your new account" });
        navigate("/sign-in");
        return;
      }

      const isLoggedIn = await checkAuthUser();
      const currentAccount = await getCurrentUser();



      if (isLoggedIn) {
        setUser(initialData);
        navigate(currentAccount?.$id ? `/update-profile/${currentAccount.$id}` : `/profile/profile`);
      } else {
        toast({ title: "Login failed. Please try again." });
      }
    } catch (error) {
      console.log({ error });
      toast({ title: "An error occurred during sign up." });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSignup();
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
    // Note: This will redirect the user, so no need for further handling here
  };

  const inputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900";
  const readOnlyInputClassName = "w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600";

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <img src="/assets/images/logo.svg" alt="logo" />

            <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12 mb-4">New to Topfived? </h2>
            <p className=" pt-5 sm:pt-12 mb-4">Create your own lists, Discover trusted recommendations, Join discussions </p>



            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="email">
                Enter email address*
              </label>
              <input
                type="email"
                id="email"
                className={inputClassName}
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required
              />
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">Now, let's create a password.</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <input
                  type="email"
                  id="email"
                  className={readOnlyInputClassName}
                  value={user.email}
                  readOnly
                />
                <button
                  type="button"
                  className="text-green-500 font-medium"
                  onClick={() => setStep(1)}
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={inputClassName}
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <a href="#" className="text-green-500 hover:underline text-sm">
                Forgot password?
              </a>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">Lastly, create your unique username.</h2>
            <div className="mb-4">
              <input
                type="email"
                className={readOnlyInputClassName}
                value={user.email}
                readOnly
              />
            </div>
            <div className="mb-4">
              <input
                type="password"
                className={readOnlyInputClassName}
                value="••••••••"
                readOnly
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
                Username*
              </label>
              <input
                type="text"
                id="username"
                className={inputClassName}
                value={user.username}
                onChange={(e) => setUser({ ...user, username: e.target.value })}
                required
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-black rounded-lg shadow-lg">
      <form onSubmit={handleSubmit}>
        {renderStep()}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        >
          {step === 3 ? (
            isCreatingAccount || isSigningInUser || isUserLoading ? (
              <div className="flex justify-center items-center gap-2">
                <Loader2 /> Loading...
              </div>
            ) : (
              "Sign Up"
            )
          ) : (
            "Continue"
          )}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <span className="text-gray-300">
          {step === 1 ? "Already have an account? " : "Already have an account? "}
        </span>
        <Link
          to={step === 1 ? "/sign-in" : "/sign-in"}
          className="text-green-500 hover:underline font-medium"
        >
          {step === 1 ? "Sign in" : "Log in"}
        </Link>
      </div>
      <div className="mt-4 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-600">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <button
        type="button"
        className="w-full mt-4 flex items-center justify-center bg-blue-950 border border-gray-700 rounded-md py-2 px-4 text-sm font-medium text-white hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <div className="flex-center gap-2">
            <Loader2 /> Loading...
          </div>
        ) : (
          <>
            <img src="/assets/icons/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
            Continue with Google
          </>
        )}
      </button>
    </div>
  );
};

export default OnboardingScreens;