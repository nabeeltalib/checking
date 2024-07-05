import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { sidebarLinks } from '@/constants';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext, INITIAL_USER } from '@/context/AuthContext';

const LeftSidebar = () => {
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
    <aside className="leftsidebar hidden md:flex flex-col justify-between lg:w-64 h-screen p-6 bg-dark-2 border-r border-dark-4 overflow-auto">
      <div className="flex flex-col gap-8">
        {sidebarLinks.map(link => (
          <NavLink
            key={link.label}
            to={link.route}
            className={({ isActive }) =>
              `flex items-center gap-4 p-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-500 text-light-1'
                  : 'text-light-2 hover:bg-dark-4'
              }`
            }>
            <img
              src={link.icon}
              alt={link.label}
              className={`w-6 h-6 ${link.route === pathname && 'invert'}`}
            />
            <span className="hidden lg:inline">{link.label}</span>
          </NavLink>
        ))}
      </div>
      <Button
        onClick={handleSignOut}
        variant="destructive"
        className="w-full mt-6">
        Sign Out
      </Button>
    </aside>
  );
};

export default LeftSidebar;
