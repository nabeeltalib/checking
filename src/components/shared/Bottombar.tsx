import { Link, useLocation } from "react-router-dom";
import { bottombarLinks } from "@/constants";

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <section className="bottom-bar flex justify-around items-center bg-dark-3 py-2 shadow-md fixed bottom-0 w-full z-50">
      {bottombarLinks.map((link) => {
        const isActive = pathname === link.route;
        return (
          <Link
            key={`bottombar-${link.label}`}
            to={link.route}
            className={`flex-center flex-col gap-1 p-2 transition ${
              isActive ? "bg-primary-500 rounded-[10px] text-white" : "text-light-2"
            }`}
          >
            <img
              src={link.imgURL}
              alt={link.label}
              width={16}
              height={16}
              className={`${isActive && "invert"}`}
            />
            <p className={`tiny-medium ${isActive ? "text-white" : "text-light-2"}`}>
              {link.label}
            </p>
          </Link>
        );
      })}
    </section>
  );
};

export default Bottombar;