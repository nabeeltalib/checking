import React from 'react'
import {rightSidebarLinks} from '@/constants'
import {INavLink} from '@/types'
import {Button} from '@/components/ui/button'
import {NavLink} from 'react-router-dom'

const RightSidebar = () => {
  return (
    <div className="flex fixed flex-col gap-6 md:w-64 w-0 p-6  h-full border-l-2 border-dark-4/80 z-10 bg-black">
      <div className="flex flex-col gap-8">
        {rightSidebarLinks.map((link: INavLink, index: number) => (
          <NavLink
            key={index}
            to={link.route}
            className="text-light-3 text-white flex items-center gap-4 text-xl">
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default RightSidebar