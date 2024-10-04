import React, { useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries";
import { SignupValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { account } from "@/lib/appwrite/config";

const SignupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading, isAuthenticated, user } = useUserContext();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isLoading: isSigningInUser } = useSignInAccount();

  const handleSignup = async (userData: z.infer<typeof SignupValidation>) => {
    try {
      const newUser = await createUserAccount(userData);

      if (!newUser) {
        toast({ title: "Sign up failed. Please try again." });
        return;
      }

      const session = await signInAccount({
        email: userData.email,
        password: userData.password,
      });

      if (!session) {
        toast({ title: "Something went wrong. Please log in to your new account" });
        navigate("/sign-in");
        return;
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
      } else {
        toast({ title: "Login failed. Please try again." });
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const handleGoogleSignUp = () => {
    account.createOAuth2Session(
      'google',
      `${import.meta.env.VITE_APP_URL}`,
      `${import.meta.env.VITE_APP_URL}/sign-up`
    );
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (!user.profileCompleted) {
        navigate(`/update-profile/${user.id}`);
      } else {
        navigate("/");
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-2xl max-w-md w-full"
      >
        <motion.img
          src="/assets/images/logo3.svg"
          alt="Topfived logo"
          className="mx-auto mb-8"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <h2 className="text-3xl font-bold text-white text-center mb-6">Create a new account</h2>
        <p className="text-gray-300 text-center mb-8">To use Topfived, please enter your details</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute top-3 left-3 text-gray-400" size={20} />
                      <Input
                        type="text"
                        placeholder="Name"
                        {...field}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute top-3 left-3 text-gray-400" size={20} />
                      <Input
                        type="text"
                        placeholder="Username"
                        {...field}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute top-3 left-3 text-gray-400" size={20} />
                      <Input
                        type="email"
                        placeholder="Email"
                        {...field}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute top-3 left-3 text-gray-400" size={20} />
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                        className="w-full bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
              disabled={isCreatingAccount || isSigningInUser || isUserLoading}
            >
              {isCreatingAccount || isSigningInUser || isUserLoading ? (
                <div className="flex items-center justify-center">
                  <Loader /> <span className="ml-2">Loading...</span>
                </div>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">or</p>
          <Button
            type="button"
            onClick={handleGoogleSignUp}
            className="mt-4 w-full bg-white text-gray-800 font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center"
          >
            <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>
        </div>

        <p className="text-gray-400 text-center mt-8">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-purple-400 hover:text-purple-300 transition duration-300">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupForm;