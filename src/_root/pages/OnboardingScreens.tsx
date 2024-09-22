import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, EyeIcon, EyeOffIcon, ArrowLeft } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { getCurrentUser } from "@/lib/appwrite/api";
import { useCreateUserAccount, useSignInAccount, useSignInWithGoogle } from "@/lib/react-query/queries";
import { Loader2 } from "@/components/shared/Loader";

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
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

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
        toast({ title: "Something went wrong. Please login to your new account" });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSignup();
    }
  };

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  const inputClassName = "w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const readOnlyInputClassName = "w-full px-4 py-3 bg-gray-700 text-gray-400 border border-gray-600 rounded-lg";

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <img src="/assets/images/logo.svg" alt="logo" className="mx-auto mb-8" />
            <h2 className="text-3xl font-bold mb-6 text-center text-white">New to Topfived?</h2>
            <p className="text-center text-gray-300 mb-8">Create your own lists, Discover trusted recommendations, Join discussions</p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="email">
                Enter email address*
              </label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
                <input
                  type="email"
                  id="email"
                  className={`${inputClassName} pl-10`}
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Create a password</h2>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <input
                  type="email"
                  className={readOnlyInputClassName}
                  value={user.email}
                  readOnly
                />
                <button
                  type="button"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={() => setStep(1)}
                >
                  Edit
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="password">
                Password*
              </label>
              <div className="relative">
                <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`${inputClassName} pl-10`}
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Create your username</h2>
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="username">
                Username*
              </label>
              <div className="relative">
                <User className="absolute top-3 left-3 text-gray-400" size={20} />
                <input
                  type="text"
                  id="username"
                  className={`${inputClassName} pl-10`}
                  value={user.username}
                  onChange={(e) => setUser({ ...user, username: e.target.value })}
                  required
                />
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          className="bg-gray-800 p-8 rounded-2xl shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
            <motion.button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">
              {step === 1 ? "Already have an account? " : "Already have an account? "}
            </span>
            <Link
              to="/sign-in"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              {step === 1 ? "Sign in" : "Log in"}
            </Link>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-400">OR</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>
          <motion.button
            type="button"
            className="w-full mt-6 flex items-center justify-center bg-white text-gray-900 rounded-lg py-3 px-4 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isGoogleLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 /> Loading...
              </div>
            ) : (
              <>
                <img src="/assets/icons/google.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                Continue with Google
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingScreens;