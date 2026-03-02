import React from "react";
import { useAuth } from "../../context/AuthContext";

interface RoleGuardProps {
  allowed: string[];
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowed, children }) => {
  const { role } = useAuth();

  if (!role || !allowed.includes(role)) {
    return null;
  }

  return <>{children}</>;
};

export default RoleGuard;