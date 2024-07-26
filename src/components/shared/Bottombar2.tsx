import { Link, useLocation } from "react-router-dom";
import { bottombarLinks2 } from "@/constants";

const Bottombar2 = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-bar flex justify-around items-center bg-dark-2 py-2 shadow-md fixed bottom-0 left-0 right-0 w-full z-50">
      {bottombarLinks2.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`flex-center flex-col gap-1 p-2 transition-all duration-300 ${
              isActive ? "bg-primary-500 rounded-[10px] text-light-1" : "text-light-2 hover:bg-dark-4"
            }`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              width={20}
              height={20}
              className={`${isActive ? "invert brightness-0" : ""}`}
            />
            <p className={`tiny-medium ${isActive ? "text-light-1" : "text-light-2"}`}>
              {link.label}
            </p>
          </Link>
        );
      })}
    </nav>
  );
};

export default Bottombar2;