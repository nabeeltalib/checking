import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { rightSidebarLinks } from '@/constants';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext, INITIAL_USER } from '@/context/AuthContext';

const RightSidebar = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const { pathname } = useLocation();

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate('/sign-in');
  };

  return (
    <aside className="rightsidebar hidden md:flex flex-col justify-between w-64 h-screen p-6 bg-black border-l border-dark-4 fixed right-0 top-20">
      <div className="flex flex-col gap-4 flex-grow">
        {rightSidebarLinks.map(link => (
          <NavLink
            key={link.label}
            to={link.route}
            className={({ isActive }) =>
              `flex items-center gap-4 p-2 rounded-lg transition-colors duration-200 ${
                isActive ? 'bg-primary-500 text-light-1' : 'text-light-2 hover:bg-dark-4'
              }`
            }
          >
            <img
              src={link.icon}
              alt={link.label}
              className={`w-6 h-6 ${pathname === link.route ? 'invert' : ''} filter brightness-0 invert`}
            />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-6 mb-24">
        <div className="text-xs text-gray-400 text-center mt-4">
          <NavLink to="/privacypolicy" className="hover:text-white">
            Privacy Policy
          </NavLink>
          <span className="mx-2">|</span>
          <NavLink to="/termsandconditions" className="hover:text-white">
            Terms & Conditions
          </NavLink>
          <p className="mt-2">&copy; 2024 Topfived. All rights reserved.</p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
