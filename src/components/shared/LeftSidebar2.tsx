import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { sidebarLinks2 } from '@/constants';
import { Button } from '@/components/ui/button';

const LeftSidebar2 = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleSignOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate('/sign-in');
  };

  return (
    <aside className="leftsidebar hidden md:flex flex-col justify-between w-64 h-screen p-6 bg-dark-2 border-r border-dark-4 overflow-y-auto fixed left-0 top-10">
      <div className="flex flex-col gap-8">
        {sidebarLinks2.map(link => (
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
              className={`w-6 h-6 ${pathname === link.route ? 'invert' : ''}`}
            />
            <span className="hidden lg:inline">{link.label}</span>
          </NavLink>
        ))}
      </div>
      <Button
        onClick={handleSignOut}
        variant="destructive"
        className="w-full mt-6">
        Sign In
      </Button>
    </aside>
  );
};

export default LeftSidebar2;
