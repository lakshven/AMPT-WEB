import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      username: string;
      email?: string;
      role?: string | number | null; // optional
      roleId: number | null;
      permissions: string[];
      accountType: "single" | "company" | "admin" | string;
      clientGroupId: number | null;
      companyId: number | null; // optional
    };
    userContext?: {
      actorUserId: number;
      performedBy: string;
      clientGroupId: number | null;
      ipAddress?: string;
      userAgent?: string;
      role?: string;
    };
  }
}