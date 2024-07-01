import { NavLink } from 'react-router-dom';
import { rightSidebarLinks } from '@/constants';

const RightSidebar = () => {
  return (
    <aside className="rightsidebar hidden md:flex flex-col gap-6 min-w-[16rem] lg:w-64 h-screen p-6 bg-dark-2 border-l border-dark-4 overflow-auto">
      <h2 className="text-xl font-bold text-light-1 mb-4">Quick Links</h2>
      <nav className="flex flex-col gap-4">
        {rightSidebarLinks.map((link) => (
          <NavLink
            key={link.label}
            to={link.route}
            className={({ isActive }) =>
              `flex items-center gap-4 p-2 rounded-lg transition-colors duration-200 ${
                isActive ? "bg-primary-500 text-light-1" : "text-light-2 hover:bg-dark-4"
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

export default RightSidebar;