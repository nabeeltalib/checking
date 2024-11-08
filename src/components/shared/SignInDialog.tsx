import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSignInWithGoogle } from "@/lib/react-query/queries"; // Import Google Sign-in logic
import { useToast } from "@/components/ui/use-toast"; // Optional for showing success/failure messages

interface SignInDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInDialog: React.FC<SignInDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { mutateAsync: signInWithGoogle, isLoading: isGoogleLoading } = useSignInWithGoogle(); // Using the hook
  const { toast } = useToast(); // Optional: for showing success/failure messages

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(); // Trigger Google sign-in
      toast({ title: "Signed in successfully with Google!" }); // Show success toast (optional)
    } catch (error) {
      console.error("Google sign-in failed", error);
      toast({ title: "Google sign-in failed", description: "Please try again.", variant: "error" }); // Show error toast (optional)
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        onClick={onClose} // Close dialog when clicking outside
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md mx-auto"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside the dialog from closing it
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <h2 className="text-xl sm:text-3xl font-light text-center mb-4 sm:mb-6 text-gray-800 dark:text-white">
            What's In Your Top Five?
          </h2>
          <h3 className="text-md sm:text-lg font-semibold text-center text-gray-700 dark:text-white">
            Join for full access. It's free!
          </h3>
          <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
            Where your world's opinions get organized and challenged. Find Your Tribe: Follow Fellow Rankers
          </p>

          <div className="space-y-3 sm:space-y-4">
            <Button
              onClick={() => navigate("/sign-up")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold transition duration-300"
            >
              Sign Up
            </Button>

            <Button
              onClick={() => navigate("/sign-in")}
              className="w-full bg-white hover:bg-gray-100 text-blue-600 border-2 border-blue-600 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold transition duration-300"
            >
              Log In
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleSignIn} // Handle Google Sign-In
              className="w-full flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold transition duration-300"
              disabled={isGoogleLoading} // Disable button when loading
            >
              {isGoogleLoading ? (
                <span>Loading...</span>
              ) : (
                <>
                  <img src="/assets/icons/google.svg" alt="Google" className="mr-2 h-5 w-5" />
                  Google
                </>
              )}
            </Button>
          </div>

          <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            By signing up, you agree to our{' '}
            <a href="/termsandconditions" className="text-blue-600 hover:underline">Terms</a> and{' '}
            <a href="/privacypolicy" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SignInDialog;
