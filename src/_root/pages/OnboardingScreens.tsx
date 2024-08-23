import { useState } from "react";
import { SkipForward, HelpCircle } from "lucide-react";
import {
  useCreateUserAccount,
  useSignInAccount,
  useSignInWithGoogle,
} from "@/lib/react-query/queries";
import { Loader } from "@/components/shared";
import { Button, toast } from "@/components/ui";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
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

  const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } =
    useCreateUserAccount();
  const { mutateAsync: signInAccount, isLoading: isSigningInUser } = useSignInAccount();
  const { mutateAsync: signInWithGoogle, isLoading: isGoogleLoading } = useSignInWithGoogle();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  const handleSignup = async (user: any) => {
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

      if (isLoggedIn) {
        setUser(initialData);
        if(createList)
        {
          navigate("/create-list");
        }
        else{
          navigate("/");
        }
      } else {
        toast({ title: "Login failed. Please try again." });
      }
    } catch (error) {
      console.log({ error });
    }
  };

  const screens = [
    {
      title: "Sign Up",
      component: (
        <SignUpScreen
          email={email}
          password={password}
          setUser={setUser}
          user={user}
        />
      ),
    },
    {
      title: "Quick Interests",
      component: (
        <QuickInterestsScreen
          setShowTooltip={setShowTooltip}
          showTooltip={showTooltip}
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          categories={categories}
          setUser={setUser}
          user={user}
        />
      ),
    },
    {
      title: "Profile Basics",
      component: (
        <ProfileBasicsScreen
          name={name}
          username={username}
          bio={bio}
          setUser={setUser}
          user={user}
        />
      ),
    },
    {
      title: "Welcome",
      component: (
        <WelcomeScreen
          handleSignup={handleSignup}
          isUserLoading={isUserLoading}
          isSigningInUser={isSigningInUser}
          isCreatingAccount={isCreatingAccount}
          user={user}
        />
      ),
    },
    {
      title: "First-Time Homepage",
      component: (
        <FirstTimeHomepage
          setShowTooltip={setShowTooltip}
          showTooltip={showTooltip}
        />
      ),
    },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between mb-6">
        {screens.map((screen, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${index <= currentScreen ? "text-blue-500" : "text-gray-400"}`}>
            <div
              className={`w-10 h-10 flex text-white items-center justify-center rounded-full ${index <= currentScreen ? "bg-blue-500" : "bg-gray-500"}`}>
              {index + 1}
            </div>
            <span className="text-xs mt-1">{screen.title}</span>
          </div>
        ))}
      </div>
      {screens[currentScreen].component}
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setCurrentScreen(Math.max(0, currentScreen - 1))}
          className="text-blue-500 hover:text-blue-700"
          disabled={currentScreen === 0}>
          Back
        </button>
        <button
          onClick={() =>{
            currentScreen === screens.length -1 ? handleSignup(user)  : setCurrentScreen(Math.min(screens.length - 1, currentScreen + 1))
          }
          }
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          {currentScreen === screens.length - 1 ?
          (isCreatingAccount || isSigningInUser || isUserLoading ? (
            <div className="flex-center gap-2">
              <Loader2 />
            </div>
          ) : (
            "Finish"
          ))
           : "Next"}
        </button>
      </div>
    </div>
  );
};

const SignUpScreen = ({ email, password, user, setUser }: any) => {
  const { mutateAsync: signInWithGoogle, isLoading: isGoogleLoading } =
    useSignInWithGoogle();

  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    signInWithGoogle();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Join Topfived</h2>
      <form>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            name="email"
            value={email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
        </div>
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            placeholder="********"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
        </div>
        <div className="flex gap-2 text-black">
         already have an account? <Link className="text-blue-600" to={"/sign-in"}>Login</Link> 
        </div>
      </form>
    </div>
  );
};

const QuickInterestsScreen = ({
  showTooltip,
  setShowTooltip,
  currentScreen,
  setCurrentScreen,
  user,
  setUser,
  categories,
}: any) => (
  <div className="text-black">
    <h2 className="text-2xl font-bold mb-4">What are you into?</h2>
    <p className="mb-4">Select a few topics you're interested in:</p>
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[
        "Movies",
        "Technology",
        "Food",
        "Travel",
        "Books",
        "Music",
        "Sports",
        "Art",
      ].map((topic) => (
        <button
          key={topic}
          onClick={() =>
            setUser({ ...user, categories: [...categories, topic] })
          }
          className="bg-gray-200 hover:bg-blue-500 hover:text-white text-gray-800 font-bold py-2 px-4 rounded">
          {topic}
        </button>
      ))}
    </div>
    <div className="flex justify-between items-center">
      <button
        className="text-blue-500 hover:text-blue-700 flex items-center"
        onClick={() => setCurrentScreen(currentScreen + 1)}>
        <SkipForward size={16} className="mr-1" /> Skip for now
      </button>
      <div className="relative">
        <HelpCircle
          size={20}
          className="text-gray-500 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <div className="absolute right-0 w-48 p-2 mt-1 text-sm bg-gray-800 text-white rounded shadow-lg">
            Selecting interests helps us personalize your experience!
          </div>
        )}
      </div>
    </div>
  </div>
);

const ProfileBasicsScreen = ({ name, username, bio, user, setUser }: any) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
    <form>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="username">
          Name
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          placeholder="Name"
          name="name"
          value={name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="username">
          Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="username"
          type="text"
          placeholder="Username"
          name="username"
          value={username}
          onChange={(e) => setUser({ ...user, username: e.target.value })}
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-gray-700 text-sm font-bold mb-2"
          htmlFor="bio">
          Bio (optional)
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="bio"
          placeholder="Tell us a bit about yourself"
          name="bio"
          value={bio}
          onChange={(e) =>
            setUser({ ...user, bio: e.target.value })
          }></textarea>
      </div>
      <div className="flex justify-between items-center">
        {/* <button className="text-blue-500 hover:text-blue-700 flex items-center">
          <SkipForward size={16} className="mr-1" /> Complete later
        </button> */}
        <div className="text-sm text-gray-500">Profile completion: 2/3</div>
      </div>
    </form>
  </div>
);

const WelcomeScreen = ({
  handleSignup,
  isUserLoading,
  isSigningInUser,
  isCreatingAccount,
  user
}: any) => (
  <div className="text-black">
    <h2 className="text-2xl font-bold mb-4">Welcome to Topfived!</h2>
    <p className="mb-4">You're all set! Here's what you can do now:</p>
    <ul className="list-disc list-inside mb-6">
      <li>Browse popular lists</li>
      <li>Create your first list</li>
      <li>Follow other list makers</li>
    </ul>
    <div
      className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4"
      role="alert">
      <p className="font-bold">Tip:</p>
      <p>Creating your first list unlocks the "Newcomer" badge!</p>
    </div>
    <button
      onClick={() => handleSignup(user)}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
      {isCreatingAccount || isSigningInUser || isUserLoading ? (
        <div className="flex justify-center items-center gap-2">
          <Loader2 /> Loading...
        </div>
      ) : (
        "Start Exploring"
      )}
    </button>
  </div>
);

const FirstTimeHomepage = ({ showTooltip, setShowTooltip }: any) => {
  const navigate = useNavigate();

  return (
    <div className="text-black">
      <h2 className="text-2xl font-bold mb-4">Discover Top 5 Lists</h2>
      <div className="mb-4">
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          type="text"
          placeholder="Search for lists..."
        />
      </div>
      <div className="mt-4 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-600">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <button
        onClick={() => navigate("/create-list")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
        Create Your First List
      </button>
      <div className="relative mt-3 flex justify-end">
        <HelpCircle
          size={20}
          className="text-gray-500 cursor-pointer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <div className="absolute right-0 mt-5 w-48 p-2 text-sm bg-gray-800 text-white rounded shadow-lg">
            Selecting interests helps us personalize your experience!
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