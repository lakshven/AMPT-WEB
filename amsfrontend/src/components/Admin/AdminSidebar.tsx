import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { adminSections } from "../../config/adminSections";

export default function AdminSidebar() {
  const { user } = useAuth();
  const [openClientGroupMenu, setOpenClientGroupMenu] = useState(false);

  return (
    <div className="w-64 p-6 space-y-4"
    style={{ backgroundColor: "#0989B1", color: "white" }}>

      <h2 className="text-lg font-bold mb-4 text-white" >Admin Panel</h2>

      <NavLink to="/admin" end className={({ isActive }) =>
        `block px-2 py-1 rounded ${
          isActive ?  "font-semibold" : "hover:opacity-80"
        }`
      }
      style={({ isActive }) => ({
      backgroundColor: isActive ? "#549E39" : "transparent",
      color: isActive ? "#066A6F" : "white"
    })}
    >
        Dashboard
      </NavLink>
      {/* ⭐ Show only for App Admin + Company Admin */}
      {(user?.role === "app_admin" || user?.role === "company_admin") && (
        <div className="mt-4">
          <button
            onClick={() => setOpenClientGroupMenu(prev => !prev)}
            className="flex items-center justify-between w-full px-2 py-1 rounded text-white"
           >
            <span className="text-sm font-semibold">
              Client Group Management
            </span>
            <span>{openClientGroupMenu ? "▾" : "▸"}</span>
          </button>

          {openClientGroupMenu && (
            <div className="ml-4 mt-2 space-y-1">

              <NavLink to="/admin/client-groups/create" className={({ isActive }) =>
                `block px-2 py-1 rounded ${
                  isActive ? " font-semibold" : "hover:opacity-80"
                }`
              }
              style={({ isActive }) => ({
              backgroundColor: isActive ? "#549E39" : "transparent",
              color: isActive ? "#066A6F" : "white"
            })}
            >
                Create Group
              </NavLink>

              <NavLink to="/admin/client-groups/list" className={({ isActive }) =>
                `block px-2 py-1 rounded ${
                  isActive ? " font-semibold" : "hover:opacity-80"
                }`
              }
              style={({ isActive }) => ({
              backgroundColor: isActive ? "#549E39" : "transparent",
              color: isActive ? "#066A6F" : "white"
            })}
            >
                Existing Groups
              </NavLink>

              <NavLink to="/admin/client-groups/manage-new" className={({ isActive }) =>
                `block px-2 py-1 rounded ${
                  isActive ? "font-semibold" : "hover:opacity-80"
                }`
              }
              style={({ isActive }) => ({
              backgroundColor: isActive ? "#549E39" : "transparent",
              color: isActive ? "#066A6F" : "white"
            })}
            >
                New Invite Flow
              </NavLink>
            </div>
          )}
        </div>
      )}
      {/* Other Admin Sections */}
      { user?.role === "app_admin" &&
      adminSections.map(section => (
        <NavLink key={section.key} to={section.path} className={({ isActive }) =>
          `block px-2 py-1 rounded ${
            isActive ? "font-semibold" : "hover:opacity-80"
          }`
        }
        style={({ isActive }) => ({
          backgroundColor: isActive ? "#549E39" : "transparent",
          color: isActive ? "#066A6F" : "white"
        })}
        >
          {section.title}
        </NavLink>
      ))}
    </div>
  );
}