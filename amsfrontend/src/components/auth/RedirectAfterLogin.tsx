import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RedirectAfterLogin: React.FC = () => {
  const { loading, isAuthenticated, role } = useAuth();

  console.log("RedirectAfterLogin:", {
    loading,
    isAuthenticated,
    role
  });

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case "single_user":
      return <Navigate to="/startup" replace />;

    case "viewer":
    case "editor":
      return <Navigate to="/dashboard" replace />;

    // ⭐ FIXED: handle BOTH company roles
    case "company":
    case "company_admin":
      return <Navigate to="/company-admin" replace />;

    case "app_admin":
      return <Navigate to="/admin" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
};

export default RedirectAfterLogin;