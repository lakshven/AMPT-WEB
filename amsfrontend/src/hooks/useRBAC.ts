// frontend/src/hooks/useRBAC.ts

import { useAuth } from "../context/AuthContext";
import { getRoleFlags } from "../utils/rbac";

export function useRBAC() {
  const { role } = useAuth();
 console.log("ROLE FROM BACKEND:", role);
console.log("NORMALIZED ROLE:", (role || "").toLowerCase());

  // Get all RBAC flags from unified RBAC engine
  const flags = getRoleFlags({ role });

  return {
    ...flags,
  };
}