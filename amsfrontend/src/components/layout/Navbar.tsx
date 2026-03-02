import React, { useMemo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole } from "../../utils/normalizeRole";
import { getManualForRole } from "../../utils/manualPaths";

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
      ? "px-3 py-1 rounded-md font-semibold bg-[#549E39] text-white  text-[20px]"
      : "px-3 py-1 rounded-md text-white hover:bg-[#098B91]/70 transition  text-[20px]";

  return (
    <header className="flex justify-between items-center px-10 py-0 bg-[#0989B1] text-white shadow-md">
      {/* LEFT SIDE: Logo + Navigation */}
      <div className="flex items-center gap-14">

      <img
         src="/images/AMPT5.png"
         alt="AMPT Logo"
         className="mx-auto mb-6 w-60 opacity-90"
        /> 
      <NavLink to="/startup" className={(props) => navLinkClasses(props)}>
        Home
      </NavLink>
      
      {mode === "landing" && (
        <>
          <NavLink
            to="/login"
            className="px-3 py-1 rounded-md bg-[#549E39] hover:bg-[#447f2f] transition font-semibold text-base text-[20px]"
          >
            Sign In
          </NavLink>

          <NavLink
            to="/signup"
            className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition font-semibold text-base text-[20px]"
          >
            Sign Up
          </NavLink>

          {user && (
          <button
            onClick={handleLogout}
            className="px-4 py-1 rounded-md bg-[#549E39] hover:bg-[#447f2f] transition font-semibold text-[20px]"
          >
            Logout
          </button>
        )}
        </>
      )}
     </div>
     {/* RIGHT SIDE: User + Role-Based Links + Logout */}
     <div className="flex items-center gap-14">
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

          <NavLink to="/issues" className={(props) => navLinkClasses(props)}>
            Issues
          </NavLink>

          {isAdmin && (
            <NavLink to="/users" className={(props) => navLinkClasses(props)}>
              Users
            </NavLink>
          )}         

          {normalizedRole === "app_admin" && (
            <NavLink to="/admin/client-groups" className={(props) => navLinkClasses(props)}>
              Client Groups
            </NavLink>
          )}
        </>
      )}
        {/* Username + Role */}    
        {user && (

          <span className="font-medium  text-[20px]">
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
       {/* Login / Signup when logged out */} 
      {!user && mode === "default" && (
        <>
          <NavLink
            to="/login"
            className="px-3 py-1 rounded-md bg-[#549E39] hover:bg-[#447f2f] transition font-semibold text-[20px]"
          >
            Login
          </NavLink>

          <NavLink
            to="/signup"
            className="px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition font-semibold text-base text-[20px]"
          >
            Signup
          </NavLink>
        </>
      )}
      </div>
    </header>
  );
};

export default Navbar;