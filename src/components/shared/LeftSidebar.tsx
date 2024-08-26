import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { sidebarLinks } from '@/constants';
import { Button } from '@/components/ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext, INITIAL_USER } from '@/context/AuthContext';
import { useState } from 'react';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { setUser, setIsAuthenticated, user } = useUserContext();
  const { mutate: signOut } = useSignOutAccount();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate('/sign-in');
  };

  return (
    <aside
      className={`leftsidebar flex flex-col justify-between h-screen p-4 pb-8 bg-gradient-to-r from-purple-600 to-indigo-600 border-r border-dark-4 overflow-y-auto fixed left-0 top-16 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        {!isCollapsed && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-dark-4">
            <img
              src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
              alt="User Profile"
              className="w-10 h-10 rounded-full object-cover shadow-md"
            />
            <div>
              <p className="text-light-1 font-semibold">{user.username || 'User'}</p>
              <NavLink to="/profile/profile" className="text-light-2 text-sm hover:text-light-1">
                View Profile
              </NavLink>
            </div>
          </div>
        )}
        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-white p-2 rounded-md hover:bg-dark-3"
        >
          {isCollapsed ? '▶' : '◀'}
        </button>
      </div>

      <div className="flex-grow flex flex-col gap-4">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.route}
            className={({ isActive }) =>
              `flex items-center hover:shadow-lg hover:scale-105 gap-4 p-2 rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'text-white hover:bg-primary-400'
              }`
            }
          >
            <img
              src={link.icon}
              alt={link.label}
              className={`w-6 h-6 ${pathname === link.route ? 'invert brightness-0' : 'filter invert brightness-0'}`}
            />
            {!isCollapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </div>

      <Button
        onClick={handleSignOut}
        variant="destructive"
        className="w-full mt-4 flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 shadow-lg mb-9"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        {!isCollapsed && 'Sign Out'}
      </Button>
    </aside>
  );
};

export default LeftSidebar;
