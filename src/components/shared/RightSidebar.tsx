import { NavLink } from 'react-router-dom';
import { rightSidebarLinks } from '@/constants';
import { INavLink } from '@/types';

const RightSidebar = () => {
  return (
    <div className="fixed top-0 right-0 flex flex-col gap-6 md:w-64 w-full md:w-64 p-6 h-full border-l-2 border-dark-4/80 z-10 bg-black overflow-y-auto">
      <div className="flex flex-col gap-8">
        {rightSidebarLinks.map((link: INavLink, index: number) => (
          <NavLink
            key={index}
            to={link.route}
            className="text-light-3 text-white flex items-center gap-4 text-xl hover:text-primary-500 transition-colors duration-200"
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default RightSidebar;
