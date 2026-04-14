import { ROLE_PERMISSIONS } from "./permissions/rolePermissions";
export type Role = keyof typeof ROLE_PERMISSIONS;
export type Permission = keyof (typeof ROLE_PERMISSIONS)[Role];

export function can(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}