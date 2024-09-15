import * as z from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries"; // Removed useSignInWithGoogle
import { SignupValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { account } from "@/lib/appwrite/config"; // Import account

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

  // Queries
  const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isLoading: isSigningInUser } = useSignInAccount();
  // Removed useSignInWithGoogle and isGoogleLoading

  // Handler
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
        // Navigation is handled in useEffect based on isAuthenticated and user.profileCompleted
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
      `${import.meta.env.VITE_APP_URL}`, // Success URL
      `${import.meta.env.VITE_APP_URL}/sign-up` // Failure URL
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
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">
          Create a new account
        </h2>
        <p className="text-light-3 small-medium md:base-regular mt-2">
          To use Snapgram, please enter your details
        </p>

        <form
          onSubmit={form.handleSubmit(handleSignup)}
          className="flex flex-col gap-5 w-full mt-4">
          {/* ...Form Fields... */}

          <Button type="submit" className="shad-button_primary">
            {isCreatingAccount || isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>

          <div className="flex-center">
            <span className="text-small-regular text-light-2">or</span>
          </div>

          <Button 
            type="button" 
            className="shad-button_google"
            onClick={handleGoogleSignUp}
          >
            <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>

          <p className="text-small-regular text-light-2 text-center mt-2">
            Already have an account?
            <Link
              to="/sign-in"
              className="text-primary-500 text-small-semibold ml-1">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;
