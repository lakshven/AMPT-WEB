import React from "react";
import { usePermissions } from "../../auth/PermissionProvider"
interface PermissionGuardProps {
  required: string | string[];
  children: React.ReactNode;
}
const PermissionGuard: React.FC<PermissionGuardProps> = ({ required, children }) => {
  const { permissions } = usePermissions();

  const requiredList = Array.isArray(required) ? required : [required];
  const hasAccess = requiredList.some((perm) => permissions.includes(perm));

  if (!hasAccess) return null;

  return <>{children}</>;
};

export default PermissionGuard;