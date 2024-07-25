import { NavLink } from 'react-router-dom';
import { rightSidebarLinks2 } from '@/constants';

const RightSidebar2 = () => {
  return (
    <aside className="rightsidebar hidden lg:flex flex-col gap-6 w-64 h-screen p-6 bg-dark-2 border-l border-dark-4 overflow-y-auto fixed right-0 top-13">
      <h2 className="text-xl font-bold text-light-1 mb-4">Quick Links</h2>
      <nav className="flex flex-col gap-4">
        {rightSidebarLinks2.map((link) => (
          <NavLink
            key={link.label}
            to={link.route}
            className={({ isActive }) =>
              `flex items-center gap-4 p-2 rounded-lg transition-colors duration-200 ${
                isActive ? "text-light-1" : "text-light-2 hover:bg-dark-4"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default RightSidebar2;