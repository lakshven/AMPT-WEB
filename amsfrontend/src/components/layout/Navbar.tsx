import React, { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../utils/normalizeRole";
import { getManualForRole } from "../../utils/manualPaths";
import { getHomeRoute } from "../../utils/getHomeRoute";
import { FaLongArrowAltLeft } from "react-icons/fa";
interface AuthUser {
  username?: string;
  role?: string;
  [key: string]: any;
}

interface NavbarProps {
  mode?: "landing" | "default";
}

const Navbar: React.FC<NavbarProps> = ({ mode = "default" }) => {
  const { user, logout } = useAuth() as {
    user: AuthUser | null;
    logout: () => void;
  };

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const normalizedRole = useMemo(() => {
    return user ? normalizeRole(user.role || user.role_id) : null;
  }, [user]);

  const isAdmin =
    normalizedRole === "app_admin" || normalizedRole === "company_admin";

  const manualUrl = useMemo(() => {
    return normalizedRole ? getManualForRole(normalizedRole) : null;
  }, [normalizedRole]);

  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "px-3 py-1 rounded-md font-semibold bg-[#549E39] text-white text-[20px]"
      : "px-3 py-1 rounded-md text-white hover:bg-[#098B91]/70 transition text-[20px]";

  return (
    <header className="bg-[#0989B1] text-white shadow-md overflow-x-auto whitespace-nowrap">
      <div className="max-w-7xl mx-auto pr-4">
        {/* TOP BAR */}
        <div className="flex justify-between items-center h-20">

          {/* LEFT: Arrow + Logo */}
          <div className="flex items-center gap-4 ">
              {/* ⭐ EXTREME-LEFT BACK ARROW BUTTON */}
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-white hover:text-gray-300 transition"
            >
             <FaLongArrowAltLeft size={28} /> 
            </button>
              <img
              src="/images/AMPT5.png"
              alt="AMPT Logo"
              className="w-32 md:w-48"
            />
          </div>

          {/* HAMBURGER (Mobile Only) */}
          <button
            className="md:hidden text-white"
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2"
                viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-8 flex-shrink min-w-0">
            {/* ⭐ UPDATED HOME BUTTON USING getHomeRoute */}
            <button
              onClick={() => navigate(getHomeRoute(normalizedRole))}
              className="px-3 py-1 rounded-md text-white hover:bg-[#098B91]/70 transition text-[20px]"
            >
              Home
            </button>

            {mode === "landing" && (
              <>
                <NavLink
                  to="/login"
                  className="px-3 py-1 rounded-md bg-[#549E39] hover:bg-[#447f2f] transition font-semibold text-[20px]"
                >
                  Sign In
                </NavLink>
       {/* // we reset back this button in future
                <NavLink
                  to="/signup"
                  className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition font-semibold text-[20px]"
                >
                  Sign Up
                </NavLink> */}
              </>
            )}

            {mode === "default" && user && (
              <>
                {manualUrl && (
                  <a
                    href={manualUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gray text-[20px]"
                  >
                    Help / Manual
                  </a>
                )}

                <NavLink to="/issues" className={navLinkClasses}>
                  Issues
                </NavLink>

                {isAdmin && (
                  <NavLink to="/users" className={navLinkClasses}>
                    Users
                  </NavLink>
                )}
                {/* ONLY APP ADMIN CAN CREATE USERS */}
                {normalizedRole === "app_admin" && (
                  <NavLink to="/signup" className={navLinkClasses}>
                    Signup
                  </NavLink>
                )}
                {normalizedRole === "app_admin" && (
                  <NavLink to="/admin/client-groups" className={navLinkClasses}>
                    Client Groups
                  </NavLink>
                )}
              </>
            )}

            {user && (
              <span className="font-medium text-[20px]">
                {user.username} ({normalizedRole})
              </span>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="px-4 py-1 rounded-md bg-[#549E39] hover:bg-[#447f2f] transition font-semibold text-[20px]"
              >
                Logout
              </button>
            )}

            {!user && mode === "default" && (
              <>
                <NavLink
                  to="/login"
                  className="px-3 py-1 rounded-md bg-[#549E39] hover:bg-[#447f2f] transition font-semibold text-[20px]"
                >
                  Login
                </NavLink>
              {/* //once we reset back in future
                <NavLink
                  to="/signup"
                  className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition font-semibold text-[20px]"
                >
                  Signup
                </NavLink> */}
              </>
            )}
          </nav>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-[#0A6F8A] px-6 py-4 space-y-4">
          <NavLink to="/startup" className={navLinkClasses}>
            Home
          </NavLink>
           {/* ⭐ MOBILE BACK ARROW */}
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-white hover:text-gray-300 transition"
          >
            <FaLongArrowAltLeft size={28} /> Back
          </button>
          {mode === "landing" && (
            <>
              <NavLink
                to="/login"
                className="block px-3 py-2 rounded-md bg-[#549E39] text-[20px]"
              >
                Sign In
              </NavLink>
        {/* //we rest back this button in future
              <NavLink
                to="/signup"
                className="block px-3 py-2 rounded-md bg-white/20 text-[20px]"
              >
                Sign Up
              </NavLink> */}
            </>
          )}

          {mode === "default" && user && (
            <>
              {manualUrl && (
                <a
                  href={manualUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 text-[20px]"
                >
                  Help / Manual
                </a>
              )}

              <NavLink to="/issues" className={navLinkClasses}>
                Issues
              </NavLink>

              {isAdmin && (
                <NavLink to="/users" className={navLinkClasses}>
                  Users
                </NavLink>
              )}

              {normalizedRole === "app_admin" && (
                <NavLink to="/admin/client-groups" className={navLinkClasses}>
                  Client Groups
                </NavLink>
              )}

              <span className="block font-medium text-[20px]">
                {user.username} ({normalizedRole})
              </span>

              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 rounded-md bg-[#549E39] text-[20px]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
