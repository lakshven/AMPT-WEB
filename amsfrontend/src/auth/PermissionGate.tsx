import React, { ReactNode } from "react";
import { usePermissions } from "./PermissionProvider";

/**
 * PermissionGate component
 * Supports both single and multiple permissions.
 *
 * Usage examples:
 *   <PermissionGate permission="admin">
 *     <AdminPanel />
 *   </PermissionGate>
 *
 *   <PermissionGate allowed={['editor', 'admin']}>
 *     <EditButton />
 *   </PermissionGate>
 */

interface PermissionGateProps {
  permission?: string;
  allowed?: string[];
  children: ReactNode;
}

const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  allowed = [],
  children,
}) => {
  const { permissions } = usePermissions() as { permissions: string[] };

  // Normalize: if "permission" prop is passed, treat it as a single-item array
  const required: string[] = permission ? [permission] : allowed;

  // Check if user has at least one of the required permissions
  const hasAccess = required.some((perm) => permissions.includes(perm));

  if (!hasAccess) {
    return null; // or return a fallback UI like <p>Access denied</p>
  }

  return <>{children}</>;
};

export default PermissionGate;