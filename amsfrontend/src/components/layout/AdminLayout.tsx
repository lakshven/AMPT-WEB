import { Outlet } from "react-router-dom";
import AdminSidebar from "../Admin/AdminSidebar";
import CompanyAdminSidebar from "../CompanyAdmin/CompanyAdminSidebar";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { role } = useAuth();

  // Decide which sidebar to show
  const Sidebar =
    role === "company_admin" || role === "company"
      ? CompanyAdminSidebar
      : AdminSidebar;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
    </div>
  );
}